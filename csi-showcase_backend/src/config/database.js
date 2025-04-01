// config/database.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

// โหลดค่าจากไฟล์ .env
dotenv.config();

// สร้าง connection pool สำหรับการเชื่อมต่อฐานข้อมูล
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'csi_showcase',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// ทดสอบการเชื่อมต่อฐานข้อมูลเมื่อเริ่มต้นแอปพลิเคชัน
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied to database');
    }
    
    return;
  }
  
  console.log('Successfully connected to the database');
  connection.release();
});

// ส่งออก pool ที่รองรับ Promises เพื่อให้สามารถใช้ async/await ได้
export default pool.promise();