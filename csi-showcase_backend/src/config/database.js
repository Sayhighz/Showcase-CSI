// config/database.js
import mysql from 'mysql2';
import dotenv from 'dotenv';
import logger from './logger.js';

// โหลดค่าจากไฟล์ .env
dotenv.config();

// กำหนดค่าสำหรับการเชื่อมต่อฐานข้อมูล
const dbConfig = {
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
};
// console.log(dbConfig)

// สร้าง connection pool สำหรับการเชื่อมต่อฐานข้อมูล
const pool = mysql.createPool(dbConfig);

// Override the execute method to add logging
const originalPoolPromiseExecute = pool.promise().execute;
pool.promise().execute = async function(query, params) {
  const startTime = Date.now();
  try {
    const result = await originalPoolPromiseExecute.call(this, query, params);
    const duration = Date.now() - startTime;
    logger.debug(`SQL Query (${duration}ms): ${query.replace(/\s+/g, ' ').trim()}`);
    if (params && params.length > 0) {
      logger.debug(`SQL Params: ${JSON.stringify(params)}`);
    }
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Database error in query (${duration}ms): ${query}`);
    logger.error(`Database error params: ${JSON.stringify(params)}`);
    logger.error(`Database error message: ${error.message}`);
    throw error;
  }
};

// ทดสอบการเชื่อมต่อฐานข้อมูลเมื่อเริ่มต้นแอปพลิเคชัน
pool.getConnection((err, connection) => {
  if (err) {
    logger.error('Database connection error:', err);
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      logger.error('Database connection was closed');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      logger.error('Database has too many connections');
    }
    if (err.code === 'ECONNREFUSED') {
      logger.error('Database connection was refused');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error('Access denied to database');
    }
    
    return;
  }
  
  logger.info(`Successfully connected to the database: ${process.env.DB_DATABASE}`);
  connection.release();
});

// ตรวจสอบการเชื่อมต่อฐานข้อมูลเป็นระยะๆ
setInterval(() => {
  pool.query('SELECT 1', (err) => {
    if (err) {
      logger.error('Database connection check failed:', err);
    }
  });
}, 60000); // ทุก 1 นาที

// ฟังก์ชันสำหรับเริ่มต้น transaction
export const beginTransaction = async () => {
  try {
    const connection = await pool.promise().getConnection();
    await connection.beginTransaction();
    return connection;
  } catch (error) {
    logger.error('Error beginning transaction:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับ commit transaction
export const commitTransaction = async (connection) => {
  try {
    await connection.commit();
    connection.release();
  } catch (error) {
    logger.error('Error committing transaction:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับ rollback transaction
export const rollbackTransaction = async (connection) => {
  try {
    await connection.rollback();
    connection.release();
  } catch (error) {
    logger.error('Error rolling back transaction:', error);
    throw error;
  }
};

// ส่งออก pool ที่รองรับ Promises เพื่อให้สามารถใช้ async/await ได้
export default pool.promise();