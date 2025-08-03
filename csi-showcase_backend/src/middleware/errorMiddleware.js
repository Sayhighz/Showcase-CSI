// middleware/errorMiddleware.js
const logger = require('../config/logger.js');

/**
 * Middleware จัดการข้อผิดพลาดทั้งหมด
 * @param {Error} err - ข้อผิดพลาดที่เกิดขึ้น
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorMiddleware = (err, req, res, next) => {
  // กำหนดรหัสสถานะเริ่มต้น
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // บันทึกข้อผิดพลาด (ล็อกได้แล้วใน errorLogger แต่อาจมีข้อมูลเพิ่มเติม)
  if (statusCode >= 500) {
    logger.error(`${err.name}: ${err.message}`);
  } else {
    logger.warn(`${err.name}: ${err.message}`);
  }
  
  // ตอบกลับข้อผิดพลาด
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Export function using CommonJS
module.exports = {
  errorMiddleware
};