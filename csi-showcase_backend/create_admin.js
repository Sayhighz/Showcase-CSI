// create_admin.js - Script to create initial admin user
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminUser() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('Connected to database');

    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      'SELECT username FROM users WHERE username = ? OR email = ?',
      ['student', 'student@example.com']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const password = 'password123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    const [result] = await connection.execute(
      `INSERT INTO users (username, password_hash, full_name, email, role, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      ['student', hashedPassword, 'Student', 'student@example.com', 'student']
    );

    console.log(`Admin user created successfully with ID: ${result.insertId}`);
    console.log('Login credentials:');
    console.log('Username: admin');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

createAdminUser();