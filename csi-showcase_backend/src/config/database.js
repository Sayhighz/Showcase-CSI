const mysql = require('mysql2');
const dotenv = require('dotenv');
const logger = require('./logger.js');

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
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // เพิ่มค่านี้เป็น 10 วินาที
  connectTimeout: 60000, // 60 วินาที timeout เมื่อพยายามเชื่อมต่อ
  acquireTimeout: 60000, // 60 วินาที timeout สำหรับการรอคิวการเชื่อมต่อ
  timeout: parseInt(process.env.DB_TIMEOUT) || 60000, // 60 วินาที timeout ทั่วไป
  maxIdle: 10, // จำนวนการเชื่อมต่อ idle สูงสุด
  idleTimeout: 60000 // 60 วินาที timeout สำหรับการเชื่อมต่อที่ไม่ได้ใช้งาน
};

logger.debug('Database configuration:', { ...dbConfig, password: '******' });

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
    if (err.code === 'ERDISC') {
      logger.error('Database connection was disconnected');
    }
    
    return;
  }
  
  logger.info(`Successfully connected to the database: ${process.env.DB_DATABASE}`);
  connection.release();
});

// ตรวจสอบการเชื่อมต่อฐานข้อมูลเป็นระยะๆ
const pingInterval = 30000; // ตรวจสอบทุก 30 วินาที (ปรับลดลงจาก 60 วินาที)
let pingTimer = setInterval(keepAliveConnection, pingInterval);
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

function keepAliveConnection() {
  pool.query('SELECT 1', (err) => {
    if (err) {
      logger.error('Database connection check failed:', err);
      
      // พยายามสร้างการเชื่อมต่อใหม่หากเกิดข้อผิดพลาด
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || 
          err.code === 'ECONNREFUSED' || 
          err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
          err.code === 'ETIMEDOUT' ||
          err.code === 'ERDISC') {
        
        reconnectAttempts++;
        logger.info(`Attempting to reconnect to database (attempt ${reconnectAttempts})...`);
        
        // หยุดการตรวจสอบชั่วคราว
        clearInterval(pingTimer);
        
        // รอสักครู่ก่อนลองเชื่อมต่อใหม่ (เพิ่มเวลารอตามจำนวนครั้งที่ลองใหม่)
        const backoffTime = Math.min(5000 * Math.pow(1.5, reconnectAttempts - 1), 60000);
        
        setTimeout(() => {
          // ทดสอบการเชื่อมต่อใหม่
          pool.getConnection((connErr, connection) => {
            if (connErr) {
              logger.error('Reconnection failed:', connErr);
              
              // ถ้าลองเชื่อมต่อใหม่เกินจำนวนครั้งที่กำหนด ให้เพิ่มระยะเวลารอ
              if (reconnectAttempts >= maxReconnectAttempts) {
                logger.warn(`Max reconnection attempts reached (${maxReconnectAttempts}). `+
                           `Increasing ping interval to prevent resource exhaustion.`);
                pingTimer = setInterval(keepAliveConnection, 300000); // เพิ่มเป็น 5 นาที
                reconnectAttempts = 0; // รีเซ็ตตัวนับ
              } else {
                // เริ่มการตรวจสอบอีกครั้ง
                pingTimer = setInterval(keepAliveConnection, pingInterval);
              }
            } else {
              logger.info('Database reconnection successful');
              connection.release();
              reconnectAttempts = 0; // รีเซ็ตตัวนับเมื่อเชื่อมต่อสำเร็จ
              
              // เริ่มการตรวจสอบอีกครั้งด้วยความถี่ปกติ
              pingTimer = setInterval(keepAliveConnection, pingInterval);
            }
          });
        }, backoffTime); // รอตามเวลา backoff
      }
    } else {
      // เชื่อมต่อสำเร็จ รีเซ็ตตัวนับ
      if (reconnectAttempts > 0) {
        reconnectAttempts = 0;
      }
    }
  });
}

// ฟังก์ชันสำหรับเริ่มต้น transaction
const beginTransaction = async () => {
  let connection;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      connection = await pool.promise().getConnection();
      await connection.beginTransaction();
      return connection;
    } catch (error) {
      attempts++;
      
      // ตรวจสอบว่าเป็นข้อผิดพลาดเกี่ยวกับการเชื่อมต่อหรือไม่
      const connectionErrors = [
        'PROTOCOL_CONNECTION_LOST',
        'ECONNREFUSED', 
        'ER_SERVER_SHUTDOWN',
        'ETIMEDOUT',
        'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
        'ERDISC'
      ];
      
      if (connectionErrors.includes(error.code) && attempts < maxAttempts) {
        logger.warn(`Database connection error during transaction start. Retrying (${attempts}/${maxAttempts})...`);
        // รอก่อนลองใหม่
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        continue;
      }
      
      logger.error('Error beginning transaction:', error);
      throw error;
    }
  }
};

// ฟังก์ชันสำหรับ commit transaction
const commitTransaction = async (connection) => {
  try {
    if (!connection) {
      throw new Error('Connection object is undefined or null');
    }
    await connection.commit();
    connection.release();
  } catch (error) {
    logger.error('Error committing transaction:', error);
    try {
      // พยายาม rollback หากการ commit ล้มเหลว
      if (connection) {
        await connection.rollback();
        connection.release();
      }
    } catch (rollbackError) {
      logger.error('Error during rollback after commit failure:', rollbackError);
    }
    throw error;
  }
};

// ฟังก์ชันสำหรับ rollback transaction
const rollbackTransaction = async (connection) => {
  try {
    if (!connection) {
      throw new Error('Connection object is undefined or null');
    }
    await connection.rollback();
    connection.release();
  } catch (error) {
    logger.error('Error rolling back transaction:', error);
    // พยายามปล่อยการเชื่อมต่อแม้ว่าการ rollback จะล้มเหลว
    try {
      if (connection) {
        connection.release();
      }
    } catch (releaseError) {
      logger.error('Error releasing connection after rollback failure:', releaseError);
    }
    throw error;
  }
};

// ฟังก์ชันสำหรับการ execute query ที่มีการลองใหม่อัตโนมัติ
const executeQueryWithRetry = async (query, params, maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await pool.promise().execute(query, params);
    } catch (error) {
      retries++;
      
      // ตรวจสอบว่าเป็นข้อผิดพลาดเกี่ยวกับการเชื่อมต่อหรือไม่
      const connectionErrors = [
        'PROTOCOL_CONNECTION_LOST',
        'ECONNREFUSED', 
        'ER_SERVER_SHUTDOWN',
        'ETIMEDOUT',
        'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
        'ERDISC'
      ];
      
      if (connectionErrors.includes(error.code) && retries < maxRetries) {
        logger.warn(`Database connection error during query execution. Retrying (${retries}/${maxRetries})...`);
        // รอก่อนลองใหม่ โดยใช้ exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
        continue;
      }
      
      // ถ้าไม่ใช่ข้อผิดพลาดเกี่ยวกับการเชื่อมต่อ หรือลองครบจำนวนแล้ว ให้โยนข้อผิดพลาด
      logger.error(`Database query failed after ${retries} retries:`, error);
      throw error;
    }
  }
};

// เพิ่มฟังก์ชันสำหรับการ query ทั่วไปที่มีการลองใหม่
const queryWithRetry = async (query, params = [], maxRetries = 3) => {
  return executeQueryWithRetry(query, params, maxRetries);
};

// Export functions และ default export
module.exports = pool.promise();
module.exports.beginTransaction = beginTransaction;
module.exports.commitTransaction = commitTransaction;
module.exports.rollbackTransaction = rollbackTransaction;
module.exports.executeQueryWithRetry = executeQueryWithRetry;
module.exports.queryWithRetry = queryWithRetry;