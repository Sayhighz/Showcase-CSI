/**
 * Generic SQL migration runner
 * Usage:
 *   node run_sql_migration.js path/to/migration1.sql path/to/migration2.sql ...
 *
 * Reads DB credentials from .env (DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE|DB_NAME)
 * and executes each SQL file with multipleStatements enabled.
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

function log(msg) { console.log(msg); }
function ok(msg) { console.log(`✅ ${msg}`); }
function warn(msg) { console.warn(`⚠️  ${msg}`); }
function fail(msg) { console.error(`❌ ${msg}`); }

async function runSqlFile(conn, filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    warn(`File not found: ${abs}, skipping`);
    return;
  }
  const sql = fs.readFileSync(abs, 'utf8');
  log(`\n=== Running migration: ${abs} ===`);
  try {
    await conn.query(sql); // multipleStatements is enabled on the connection
    ok(`Executed: ${path.basename(abs)}`);
  } catch (e) {
    fail(`Error executing ${path.basename(abs)}: ${e.sqlMessage || e.message || e.code}`);
    throw e;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    fail('No SQL files provided.\nExample:\n  node run_sql_migration.js migrations/002_enhance_project_files_multi_image.sql migrations/003_courseworks_image_json_array.sql');
    process.exit(1);
  }

  const dbName = process.env.DB_DATABASE || process.env.DB_NAME;
  if (!dbName) {
    fail('Missing DB_DATABASE or DB_NAME in .env');
    process.exit(1);
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      multipleStatements: true
    });

    ok(`Connected to database: ${dbName}`);
    const [[{ v }]] = await conn.query('SELECT VERSION() AS v');
    log(`MySQL VERSION(): ${v}`);

    for (const fp of args) {
      await runSqlFile(conn, fp);
    }

    ok('All migrations executed successfully');
  } catch (e) {
    fail('Migration run failed');
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
      log('Database connection closed');
    }
  }
}

main().catch((e) => {
  fail(e?.message || String(e));
  process.exit(1);
});
