// constants/statusCodes.js

/**
 * รหัสสถานะ HTTP ที่ใช้ในแอปพลิเคชัน
 */
const STATUS_CODES = {
  // 2xx Success
  OK: 200,                    // การร้องขอสำเร็จ
  CREATED: 201,               // สร้างทรัพยากรสำเร็จ
  ACCEPTED: 202,              // ยอมรับคำขอแล้ว แต่ยังไม่เสร็จสมบูรณ์
  NO_CONTENT: 204,            // การร้องขอสำเร็จแต่ไม่มีเนื้อหาตอบกลับ
  
  // 3xx Redirection
  MOVED_PERMANENTLY: 301,     // ย้ายทรัพยากรไปยังที่อยู่ใหม่อย่างถาวร
  FOUND: 302,                 // พบทรัพยากรในที่อยู่อื่น
  
  // 4xx Client Error
  BAD_REQUEST: 400,           // คำขอไม่ถูกต้อง
  UNAUTHORIZED: 401,          // ไม่ได้รับอนุญาต (ยังไม่ได้ยืนยันตัวตน)
  FORBIDDEN: 403,             // ไม่มีสิทธิ์เข้าถึง (ยืนยันตัวตนแล้วแต่ไม่มีสิทธิ์)
  NOT_FOUND: 404,             // ไม่พบทรัพยากร
  METHOD_NOT_ALLOWED: 405,    // วิธีการร้องขอไม่ได้รับอนุญาต
  CONFLICT: 409,              // มีความขัดแย้งกับทรัพยากรปัจจุบัน
  UNPROCESSABLE_ENTITY: 422,  // ข้อมูลไม่ถูกต้องตามที่คาดหวัง
  TOO_MANY_REQUESTS: 429,     // มีการร้องขอมากเกินไป
  
  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500, // ข้อผิดพลาดในเซิร์ฟเวอร์
  NOT_IMPLEMENTED: 501,       // ยังไม่ได้พัฒนาฟีเจอร์นี้
  BAD_GATEWAY: 502,           // ได้รับการตอบกลับที่ไม่ถูกต้องจากเซิร์ฟเวอร์อื่น
  SERVICE_UNAVAILABLE: 503,   // บริการไม่พร้อมใช้งานชั่วคราว
  GATEWAY_TIMEOUT: 504        // หมดเวลาการตอบกลับจากเซิร์ฟเวอร์อื่น
};

/**
 * ฟังก์ชันตรวจสอบว่ารหัสสถานะเป็นข้อผิดพลาดหรือไม่
 * @param {number} statusCode - รหัสสถานะที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็นข้อผิดพลาด, false ถ้าไม่ใช่
 */
const isErrorStatus = (statusCode) => {
  return statusCode >= 400;
};

/**
 * ฟังก์ชันตรวจสอบว่ารหัสสถานะเป็นการเปลี่ยนเส้นทางหรือไม่
 * @param {number} statusCode - รหัสสถานะที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็นการเปลี่ยนเส้นทาง, false ถ้าไม่ใช่
 */
const isRedirectStatus = (statusCode) => {
  return statusCode >= 300 && statusCode < 400;
};

/**
 * ฟังก์ชันตรวจสอบว่ารหัสสถานะเป็นความสำเร็จหรือไม่
 * @param {number} statusCode - รหัสสถานะที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็นความสำเร็จ, false ถ้าไม่ใช่
 */
const isSuccessStatus = (statusCode) => {
  return statusCode >= 200 && statusCode < 300;
};

// Export constants และ functions
module.exports = {
  STATUS_CODES,
  isErrorStatus,
  isRedirectStatus,
  isSuccessStatus
};