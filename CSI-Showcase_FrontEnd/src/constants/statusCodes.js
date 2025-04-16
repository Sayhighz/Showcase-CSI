/**
 * คงค่ารหัสสถานะ HTTP ที่ใช้ในแอปพลิเคชัน
 * 
 * ไฟล์นี้รวบรวมรหัสสถานะ HTTP ทั้งหมดที่ใช้ในการสื่อสารกับ API
 * พร้อมคำอธิบายและข้อความผิดพลาดมาตรฐาน
 */

// ค่าคงที่สำหรับรหัสสถานะ HTTP
export const STATUS_CODES = {
    // Success responses
    OK: 200,                    // Request succeeded
    CREATED: 201,               // Resource created
    ACCEPTED: 202,              // Request accepted but not completed
    NO_CONTENT: 204,            // No content to send
  
    // Client error responses
    BAD_REQUEST: 400,           // Bad request syntax or invalid request message
    UNAUTHORIZED: 401,          // Authentication required
    FORBIDDEN: 403,             // No permission to access the resource
    NOT_FOUND: 404,             // Resource not found
    METHOD_NOT_ALLOWED: 405,    // Method not allowed
    CONFLICT: 409,              // Conflict with the current state of the resource
    UNPROCESSABLE_ENTITY: 422,  // Unable to process the contained instructions
    TOO_MANY_REQUESTS: 429,     // Too many requests in a given amount of time
  
    // Server error responses
    INTERNAL_SERVER_ERROR: 500, // Server encountered an unexpected condition
    NOT_IMPLEMENTED: 501,       // Not implemented
    BAD_GATEWAY: 502,           // Bad gateway
    SERVICE_UNAVAILABLE: 503,   // Service unavailable
    GATEWAY_TIMEOUT: 504,       // Gateway timeout
  };
  
  // คำอธิบายของรหัสสถานะ HTTP
  export const STATUS_MESSAGES = {
    [STATUS_CODES.OK]: 'สำเร็จ',
    [STATUS_CODES.CREATED]: 'สร้างแล้ว',
    [STATUS_CODES.ACCEPTED]: 'ได้รับคำขอแล้ว',
    [STATUS_CODES.NO_CONTENT]: 'ไม่มีเนื้อหา',
    
    [STATUS_CODES.BAD_REQUEST]: 'คำขอไม่ถูกต้อง',
    [STATUS_CODES.UNAUTHORIZED]: 'ไม่ได้รับอนุญาต',
    [STATUS_CODES.FORBIDDEN]: 'ถูกห้าม',
    [STATUS_CODES.NOT_FOUND]: 'ไม่พบข้อมูล',
    [STATUS_CODES.METHOD_NOT_ALLOWED]: 'วิธีที่ไม่ได้รับอนุญาต',
    [STATUS_CODES.CONFLICT]: 'ข้อมูลขัดแย้ง',
    [STATUS_CODES.UNPROCESSABLE_ENTITY]: 'ไม่สามารถประมวลผลได้',
    [STATUS_CODES.TOO_MANY_REQUESTS]: 'คำขอมากเกินไป',
    
    [STATUS_CODES.INTERNAL_SERVER_ERROR]: 'ข้อผิดพลาดภายในเซิร์ฟเวอร์',
    [STATUS_CODES.NOT_IMPLEMENTED]: 'ยังไม่ได้ดำเนินการ',
    [STATUS_CODES.BAD_GATEWAY]: 'เกตเวย์ไม่ถูกต้อง',
    [STATUS_CODES.SERVICE_UNAVAILABLE]: 'บริการไม่พร้อมใช้งาน',
    [STATUS_CODES.GATEWAY_TIMEOUT]: 'เกตเวย์หมดเวลา',
  };
  
  // ข้อความผิดพลาดมาตรฐานสำหรับแต่ละรหัสสถานะ
  export const ERROR_MESSAGES = {
    [STATUS_CODES.BAD_REQUEST]: 'คำขอไม่ถูกต้อง โปรดตรวจสอบข้อมูลของคุณแล้วลองอีกครั้ง',
    [STATUS_CODES.UNAUTHORIZED]: 'คุณไม่ได้เข้าสู่ระบบ โปรดเข้าสู่ระบบเพื่อดำเนินการต่อ',
    [STATUS_CODES.FORBIDDEN]: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
    [STATUS_CODES.NOT_FOUND]: 'ไม่พบข้อมูลที่คุณกำลังค้นหา',
    [STATUS_CODES.METHOD_NOT_ALLOWED]: 'วิธีการร้องขอนี้ไม่ได้รับอนุญาต',
    [STATUS_CODES.CONFLICT]: 'เกิดความขัดแย้งกับข้อมูลที่มีอยู่',
    [STATUS_CODES.UNPROCESSABLE_ENTITY]: 'ไม่สามารถประมวลผลข้อมูลที่ส่งมาได้',
    [STATUS_CODES.TOO_MANY_REQUESTS]: 'คุณส่งคำขอมากเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง',
    
    [STATUS_CODES.INTERNAL_SERVER_ERROR]: 'เกิดข้อผิดพลาดในระบบ โปรดลองอีกครั้งในภายหลัง',
    [STATUS_CODES.NOT_IMPLEMENTED]: 'ฟีเจอร์นี้ยังไม่พร้อมใช้งาน',
    [STATUS_CODES.BAD_GATEWAY]: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
    [STATUS_CODES.SERVICE_UNAVAILABLE]: 'บริการไม่พร้อมใช้งานในขณะนี้ โปรดลองอีกครั้งในภายหลัง',
    [STATUS_CODES.GATEWAY_TIMEOUT]: 'เซิร์ฟเวอร์ไม่ตอบสนอง โปรดลองอีกครั้งในภายหลัง',
  };
  
  // ฟังก์ชันสำหรับดึงข้อความผิดพลาดมาตรฐานจากรหัสสถานะ
  export const getErrorMessage = (statusCode) => {
    return ERROR_MESSAGES[statusCode] || 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง';
  };
  
  // ฟังก์ชันสำหรับตรวจสอบว่าเป็นรหัสสถานะที่แสดงความสำเร็จหรือไม่
  export const isSuccessStatus = (statusCode) => {
    return statusCode >= 200 && statusCode < 300;
  };
  
  // ฟังก์ชันสำหรับตรวจสอบว่าเป็นรหัสสถานะที่แสดงข้อผิดพลาดหรือไม่
  export const isErrorStatus = (statusCode) => {
    return statusCode >= 400;
  };
  
  // ฟังก์ชันสำหรับตรวจสอบว่าเป็นรหัสสถานะที่แสดงข้อผิดพลาดของไคลเอนต์หรือไม่
  export const isClientError = (statusCode) => {
    return statusCode >= 400 && statusCode < 500;
  };
  
  // ฟังก์ชันสำหรับตรวจสอบว่าเป็นรหัสสถานะที่แสดงข้อผิดพลาดของเซิร์ฟเวอร์หรือไม่
  export const isServerError = (statusCode) => {
    return statusCode >= 500;
  };
  
  // Export ทั้งหมดในออบเจกต์เดียว
  export default {
    STATUS_CODES,
    STATUS_MESSAGES,
    ERROR_MESSAGES,
    getErrorMessage,
    isSuccessStatus,
    isErrorStatus,
    isClientError,
    isServerError,
  };