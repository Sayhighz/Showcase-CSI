const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Verbose migration runner for project_groups:
 * - Detects and logs MySQL version, PK/Indexes, SHOW CREATE TABLE
 * - Drops legacy PRIMARY KEY if blocks NULL user_id
 * - Adds surrogate PK (group_member_id) if missing
 * - Makes user_id NULL
 * - Adds UNIQUE(project_id,user_id) (allows multiple NULLS)
 * - Adds flexible member columns + supporting indexes
 * - Prints detailed SQL/errors for troubleshooting
 */

async function main() {
  const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'csi_showcase';
  const table = 'project_groups';

  let conn;

  const log = (msg) => console.log(msg);
  const warn = (msg) => console.log(`   ⚠️  ${msg}`);
  const ok = (msg) => console.log(`   ✅ ${msg}`);
  const fail = (msg) => console.error(`   ❌ ${msg}`);

  // -- Helpers ---------------------------------------------------------------

  async function runSQL(title, sql, params = [], ignorableCodes = new Set()) {
    log(`\n-- ${title}`);
    log(`SQL:\n${sql}\n`);
    try {
      const [res] = await conn.execute(sql, params);
      ok(`${title} OK`);
      return res;
    } catch (e) {
      const details = [
        `code=${e.code || ''}`,
        `errno=${e.errno || ''}`,
        `sqlState=${e.sqlState || ''}`,
        `sqlMessage=${e.sqlMessage || e.message || ''}`
      ].join(' | ');
      if (ignorableCodes.has(e.code)) {
        warn(`${title} skipped: ${details}`);
        return null;
      }
      fail(`${title} failed: ${details}`);
      throw e;
    }
  }

  async function getRows(sql, params = []) {
    const [rows] = await conn.execute(sql, params);
    return rows;
  }

  async function getOne(sql, params = []) {
    const rows = await getRows(sql, params);
    return rows[0];
  }

  async function tableExists(schema, t) {
    const row = await getOne(
      `SELECT COUNT(*) AS c
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [schema, t]
    );
    return row && row.c > 0;
  }

  async function columnExists(schema, t, col) {
    const row = await getOne(
      `SELECT COUNT(*) AS c
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [schema, t, col]
    );
    return row && row.c > 0;
  }

  async function indexExists(schema, t, indexName) {
    const row = await getOne(
      `SELECT COUNT(*) AS c
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [schema, t, indexName]
    );
    return row && row.c > 0;
  }

  // Check if there exists a non-PRIMARY index exactly on the given columns (order-sensitive)
  async function hasIndexOnColumns(schema, t, cols) {
    const rows = await getRows(
      `SELECT INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLS
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME <> 'PRIMARY'
       GROUP BY INDEX_NAME`,
      [schema, t]
    );
    const target = cols.join(',');
    return rows.some(r => (r.COLS || '') === target);
  }
 
  async function constraintExists(schema, t, constraintName) {
    const row = await getOne(
      `SELECT COUNT(*) AS c
       FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
      [schema, t, constraintName]
    );
    return row && row.c > 0;
  }

  async function getPrimaryKeyColumns(schema, t) {
    const rows = await getRows(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = ?
         AND CONSTRAINT_NAME = 'PRIMARY'
       ORDER BY ORDINAL_POSITION`,
      [schema, t]
    );
    return rows.map(r => r.COLUMN_NAME);
  }

  async function showState(label) {
    log(`\n================= STATE: ${label} =================`);
    const version = await getOne('SELECT VERSION() AS v');
    log(`MySQL VERSION(): ${version?.v || 'unknown'}`);

    const pkCols = await getPrimaryKeyColumns(dbName, table);
    log(`PRIMARY KEY columns: ${pkCols.length ? pkCols.join(', ') : '(none)'}`);

    const idxRows = await getRows(
      `SELECT INDEX_NAME, NON_UNIQUE, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLS
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       GROUP BY INDEX_NAME, NON_UNIQUE
       ORDER BY INDEX_NAME`,
      [dbName, table]
    );
    log('INDEXES:');
    idxRows.forEach(r => log(` - ${r.INDEX_NAME} (non_unique=${r.NON_UNIQUE}): ${r.COLS}`));

    try {
      const [showCreate] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
      const createSql = showCreate?.[0]?.['Create Table'] || '(not available)';
      log(`\nSHOW CREATE TABLE ${table}:\n${createSql}`);
    } catch (e) {
      warn(`SHOW CREATE TABLE failed: ${e.message || e.sqlMessage || e.code}`);
    }
    log('===================================================');
  }

  // -- Migration -------------------------------------------------------------

  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      multipleStatements: true
    });

    log('Connected to database successfully');

    if (!(await tableExists(dbName, table))) {
      throw new Error(`Table ${table} does not exist in schema ${dbName}`);
    }

    log('Running migration: 001_update_project_groups_flexible_members.sql');

    await showState('BEFORE');

    // Step A: Drop PRIMARY KEY if it exists (so user_id can be made NULL)
    const pkColsBefore = await getPrimaryKeyColumns(dbName, table);
    if (pkColsBefore.length > 0) {
      try {
        await runSQL(
          'A. Drop existing PRIMARY KEY (if present)',
          `ALTER TABLE \`${table}\` DROP PRIMARY KEY`,
          [],
          new Set(['ER_CANT_DROP_FIELD_OR_KEY', 'ER_MULTIPLE_PRI_KEY'])
        );
      } catch (e) {
        if (e.code === 'ER_DROP_INDEX_FK') {
          // MySQL requires an index on referencing columns for FKs.
          // The PRIMARY KEY currently provides the only index on project_id.
          // Create a standalone index on project_id, then retry dropping PRIMARY.
          const projIdxName = 'idx_project_groups_project_id';
          const hasProjIdx = await indexExists(dbName, table, projIdxName);
          if (!hasProjIdx) {
            await runSQL(
              'A.1 Create index on project_id to satisfy FK requirements',
              `CREATE INDEX ${projIdxName} ON \`${table}\` (project_id)`,
              [],
              new Set(['ER_DUP_KEYNAME'])
            );
          } else {
            log('A.1 Index on project_id already exists, skipping');
          }

          // Retry drop PRIMARY
          await runSQL(
            'A.2 Drop existing PRIMARY KEY (retry after creating project_id index)',
            `ALTER TABLE \`${table}\` DROP PRIMARY KEY`,
            [],
            new Set(['ER_CANT_DROP_FIELD_OR_KEY', 'ER_MULTIPLE_PRI_KEY'])
          );
        } else {
          throw e;
        }
      }
    } else {
      log('A. No PRIMARY KEY found, skipping drop');
    }

    // Step B: Add surrogate PK group_member_id if missing
    if (!(await columnExists(dbName, table, 'group_member_id'))) {
      await runSQL(
        'B. Add surrogate PK column group_member_id',
        `ALTER TABLE \`${table}\`
         ADD COLUMN group_member_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST`,
        [],
        new Set(['ER_MULTIPLE_PRI_KEY', 'ER_DUP_FIELDNAME'])
      );
    } else {
      log('B. Column group_member_id already exists (will assume it is primary or usable)');
    }

    // Step C: Ensure flexible member columns exist
    const addColumn = async (col, ddl) => {
      if (!(await columnExists(dbName, table, col))) {
        await runSQL(
          `C. Add column ${col}`,
          `ALTER TABLE \`${table}\` ADD COLUMN ${ddl}`,
          [],
          new Set(['ER_DUP_FIELDNAME'])
        );
      } else {
        log(`C. Column ${col} already exists, skipping`);
      }
    };

    await addColumn('member_name', `member_name VARCHAR(255) NULL COMMENT 'Name of external member (not in users table)'`);
    await addColumn('member_student_id', `member_student_id VARCHAR(50) NULL COMMENT 'Student ID of external member'`);
    await addColumn('member_email', `member_email VARCHAR(255) NULL COMMENT 'Email of external member'`);
    await addColumn('created_at', `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the member was added'`);
    await addColumn('updated_at', `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When the member info was last updated'`);

    // Step D: Make user_id nullable
    // If this fails with ER_PRIMARY_CANT_HAVE_NULL, attempt one more PK drop retry + reattempt
    let madeUserIdNull = false;
    try {
      await runSQL(
        'D. Modify user_id to be NULL (first attempt)',
        `ALTER TABLE \`${table}\`
         MODIFY COLUMN user_id INT NULL COMMENT 'User ID from users table (NULL for external members)'`
      );
      madeUserIdNull = true;
    } catch (e) {
      if (e.code === 'ER_PRIMARY_CANT_HAVE_NULL') {
        warn('user_id NULL failed due to PRIMARY KEY; retrying drop PK + modify...');

        // Retry: drop PK if still exists, then retry modify
        const pkColsNow = await getPrimaryKeyColumns(dbName, table);
        if (pkColsNow.length > 0) {
          await runSQL(
            'D.1 Drop PRIMARY KEY (retry)',
            `ALTER TABLE \`${table}\` DROP PRIMARY KEY`,
            [],
            new Set(['ER_CANT_DROP_FIELD_OR_KEY', 'ER_MULTIPLE_PRI_KEY'])
          );
        }

        await runSQL(
          'D.2 Modify user_id to be NULL (second attempt)',
          `ALTER TABLE \`${table}\`
           MODIFY COLUMN user_id INT NULL COMMENT 'User ID from users table (NULL for external members)'`
        );
        madeUserIdNull = true;
      } else {
        throw e;
      }
    }

    if (!madeUserIdNull) {
      throw new Error('Could not make user_id NULL');
    }

    // Step E: Ensure uniqueness of registered members (project_id,user_id)
    if (!(await indexExists(dbName, table, 'uniq_project_user'))) {
      await runSQL(
        'E. Create UNIQUE index uniq_project_user(project_id, user_id)',
        `CREATE UNIQUE INDEX uniq_project_user ON \`${table}\` (project_id, user_id)`,
        [],
        new Set(['ER_DUP_KEYNAME'])
      );
    } else {
      log('E. Unique index uniq_project_user already exists, skipping');
    }

    // Step F: CHECK constraint (informational; MySQL < 8.0.16 ignores)
    const checkName = 'chk_member_info';
    if (!(await constraintExists(dbName, table, checkName))) {
      await runSQL(
        'F. Add CHECK constraint (user_id XOR member_name)',
        `ALTER TABLE \`${table}\`
         ADD CONSTRAINT ${checkName}
         CHECK (
           (user_id IS NOT NULL AND member_name IS NULL) OR
           (user_id IS NULL AND member_name IS NOT NULL)
         )`,
        [],
        new Set(['ER_CHECK_CONSTRAINT_VIOLATED', 'ER_PARSE_ERROR'])
      );
    } else {
      log('F. CHECK constraint already exists, skipping');
    }

    // Step G: Indexes for external queries
    if (!(await indexExists(dbName, table, 'idx_project_groups_member_name'))) {
      await runSQL(
        'G. Create index idx_project_groups_member_name',
        `CREATE INDEX idx_project_groups_member_name ON \`${table}\` (member_name)`,
        [],
        new Set(['ER_DUP_KEYNAME'])
      );
    } else {
      log('G. Index idx_project_groups_member_name already exists, skipping');
    }

    if (!(await indexExists(dbName, table, 'idx_project_groups_member_student_id'))) {
      await runSQL(
        'G.1 Create index idx_project_groups_member_student_id',
        `CREATE INDEX idx_project_groups_member_student_id ON \`${table}\` (member_student_id)`,
        [],
        new Set(['ER_DUP_KEYNAME'])
      );
    } else {
      log('G.1 Index idx_project_groups_member_student_id already exists, skipping');
    }

    // Step H: Update comments on existing columns
    await runSQL(
      'H. Update column comments (project_id, role)',
      `ALTER TABLE \`${table}\`
       MODIFY COLUMN project_id INT NOT NULL COMMENT 'Project ID reference',
       MODIFY COLUMN role ENUM('owner', 'contributor', 'advisor') DEFAULT 'contributor' COMMENT 'Role of the member in the project'`,
      [],
      new Set()
    );

    await showState('AFTER');

    log('\n✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    try {
      await showState('ON ERROR');
    } catch (_) {}
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
      console.log('\nDatabase connection closed');
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});