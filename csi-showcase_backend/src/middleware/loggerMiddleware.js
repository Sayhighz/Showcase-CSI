// middleware/loggerMiddleware.js
import logger from '../config/logger.js';

/**
 * Middleware สำหรับบันทึกข้อมูล HTTP request
 */
export const requestLogger = (req, res, next) => {
  // บันทึกเวลาเริ่มต้น
  const start = Date.now();
  
  // บันทึกข้อมูลพื้นฐานของ request
  logger.info(`Incoming ${req.method} request to ${req.originalUrl} from ${req.ip}`);
  
  // บันทึก request body (ถ้ามี) ในโหมด development
  if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
    // ซ่อนข้อมูลที่ละเอียดอ่อน เช่น รหัสผ่าน
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '********';
    if (sanitizedBody.passwordConfirmation) sanitizedBody.passwordConfirmation = '********';
    if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '********';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '********';
    
    logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
  }
  
  // เก็บ original send method
  const originalSend = res.send;
  
  // แทนที่ send method เพื่อบันทึกข้อมูลการตอบกลับ
  res.send = function(body) {
    // คำนวณเวลาที่ใช้
    const responseTime = Date.now() - start;
    
    // บันทึกข้อมูล HTTP response
    logger.logHttpRequest(req, res, responseTime);
    
    // บันทึก response body ในโหมด development (เฉพาะกรณี JSON)
    if (process.env.NODE_ENV === 'development' && body) {
      try {
        // ถ้าเป็น JSON string ให้แปลงเป็น object ก่อน
        let responseBody = typeof body === 'string' ? JSON.parse(body) : body;
        
        // ข้อมูลอาจมีขนาดใหญ่ ให้ตัดเก็บแค่บางส่วน
        const truncatedBody = JSON.stringify(responseBody).substring(0, 1000);
        logger.debug(`Response body: ${truncatedBody}${truncatedBody.length >= 1000 ? '...(truncated)' : ''}`);
      } catch (e) {
        // ถ้าไม่ใช่ JSON ให้ข้ามไป
      }
    }
    
    // เรียก original send method
    originalSend.call(this, body);
    return this;
  };
  
  next();
};

/**
 * Middleware สำหรับจับและบันทึกข้อผิดพลาด
 */
export const errorLogger = (err, req, res, next) => {
  // บันทึกข้อผิดพลาด
  logger.error(`Error processing ${req.method} ${req.originalUrl}: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);
  
  // ส่งข้อผิดพลาดต่อไปยัง error handler ถัดไป
  next(err);
};

/**
 * Wrapper สำหรับล็อกข้อผิดพลาดในฟังก์ชัน async
 * @param {Function} fn - ฟังก์ชันที่ต้องการห่อหุ้ม
 * @returns {Function} - ฟังก์ชันที่ห่อหุ้มแล้ว
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    logger.error(`Async error in ${req.method} ${req.originalUrl}: ${err.message}`);
    logger.error(`Stack: ${err.stack}`);
    next(err);
  });
};