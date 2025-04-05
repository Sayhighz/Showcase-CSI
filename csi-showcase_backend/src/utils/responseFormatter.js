// utils/responseFormatter.js

/**
 * สร้างรูปแบบการตอบกลับสำหรับการเรียก API ที่สำเร็จ
 * @param {any} data - ข้อมูลที่ต้องการส่งกลับ
 * @param {string} message - ข้อความอธิบาย (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} - รูปแบบการตอบกลับมาตรฐาน
 */
export const successResponse = (data, message = 'Operation successful', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data
  };
};

/**
 * สร้างรูปแบบการตอบกลับสำหรับการเรียก API ที่ล้มเหลว
 * @param {string} message - ข้อความอธิบายความผิดพลาด
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {any} errors - รายละเอียดข้อผิดพลาด (optional)
 * @returns {Object} - รูปแบบการตอบกลับมาตรฐาน
 */
export const errorResponse = (message = 'Operation failed', statusCode = 400, errors = null) => {
  return {
    success: false,
    statusCode,
    message,
    errors
  };
};

/**
 * ส่งการตอบกลับเมื่อมีข้อผิดพลาดจากเซิร์ฟเวอร์
 * @param {Object} res - Express response object
 * @param {Error} error - ข้อผิดพลาดที่เกิดขึ้น
 * @returns {Object} - HTTP response
 */
export const handleServerError = (res, error) => {
  console.error('Server Error:', error);
  
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'Internal server error',
    errors: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

/**
 * ส่งการตอบกลับเมื่อไม่พบทรัพยากรที่ร้องขอ
 * @param {Object} res - Express response object
 * @param {string} message - ข้อความระบุทรัพยากรที่ไม่พบ
 * @returns {Object} - HTTP response
 */
export const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    statusCode: 404,
    message
  });
};

/**
 * ส่งการตอบกลับเมื่อไม่มีสิทธิ์เข้าถึงทรัพยากร
 * @param {Object} res - Express response object
 * @param {string} message - ข้อความอธิบาย
 * @returns {Object} - HTTP response
 */
export const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    statusCode: 403,
    message
  });
};

/**
 * ส่งการตอบกลับเมื่อรูปแบบข้อมูลไม่ถูกต้อง
 * @param {Object} res - Express response object
 * @param {string} message - ข้อความอธิบาย
 * @param {any} errors - รายละเอียดข้อผิดพลาด
 * @returns {Object} - HTTP response
 */
export const validationErrorResponse = (res, message = 'Validation error', errors = null) => {
  return res.status(422).json({
    success: false,
    statusCode: 422,
    message,
    errors
  });
};