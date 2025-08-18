const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'csi_showcase',
      multipleStatements: true
    });

    console.log('Connected to database successfully');

    // Define migration steps individually
    const migrationSteps = [
      {
        name: 'Add new columns to project_groups table',
        sql: `ALTER TABLE project_groups
              ADD COLUMN member_name VARCHAR(255) NULL COMMENT 'Name of external member (not in users table)',
              ADD COLUMN member_student_id VARCHAR(50) NULL COMMENT 'Student ID of external member',
              ADD COLUMN member_email VARCHAR(255) NULL COMMENT 'Email of external member',
              ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the member was added',
              ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When the member info was last updated'`
      },
      {
        name: 'Modify user_id to be nullable',
        sql: `ALTER TABLE project_groups
              MODIFY COLUMN user_id INT NULL COMMENT 'User ID from users table (NULL for external members)'`
      },
      {
        name: 'Add constraint for member info',
        sql: `ALTER TABLE project_groups
              ADD CONSTRAINT chk_member_info
              CHECK (
                (user_id IS NOT NULL AND member_name IS NULL) OR
                (user_id IS NULL AND member_name IS NOT NULL)
              )`
      },
      {
        name: 'Create index for member_name',
        sql: `CREATE INDEX idx_project_groups_member_name ON project_groups(member_name)`
      },
      {
        name: 'Create index for member_student_id',
        sql: `CREATE INDEX idx_project_groups_member_student_id ON project_groups(member_student_id)`
      },
      {
        name: 'Update project_id column comment',
        sql: `ALTER TABLE project_groups
              MODIFY COLUMN project_id INT NOT NULL COMMENT 'Project ID reference'`
      },
      {
        name: 'Update role column comment',
        sql: `ALTER TABLE project_groups
              MODIFY COLUMN role ENUM('owner', 'contributor', 'advisor') DEFAULT 'contributor' COMMENT 'Role of the member in the project'`
      }
    ];

    console.log('Running migration: 001_update_project_groups_flexible_members.sql');
    console.log(`Total steps: ${migrationSteps.length}`);

    // Execute each step individually
    for (let i = 0; i < migrationSteps.length; i++) {
      const step = migrationSteps[i];
      try {
        console.log(`\n${i + 1}. ${step.name}...`);
        await connection.execute(step.sql);
        console.log(`   ✅ Success`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`   ⚠️  Already exists, skipping: ${error.message}`);
        } else {
          console.error(`   ❌ Failed: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');

    // Verify the changes by checking the table structure
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'project_groups'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'csi_showcase']);

    console.log('\n📋 Updated project_groups table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

runMigration();