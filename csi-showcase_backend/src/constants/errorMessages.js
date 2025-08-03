// constants/errorMessages.js

/**
 * ข้อความแสดงข้อผิดพลาดมาตรฐานสำหรับแอปพลิเคชัน
 */
const ERROR_MESSAGES = {
  // ข้อผิดพลาดทั่วไป
  GENERIC_ERROR: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้ง',
  NOT_FOUND: 'ไม่พบทรัพยากรที่ร้องขอ',
  UNAUTHORIZED: 'คุณไม่มีสิทธิ์เข้าถึงทรัพยากรนี้',
  FORBIDDEN: 'คุณไม่ได้รับอนุญาตให้เข้าถึงทรัพยากรนี้',
  VALIDATION_ERROR: 'มีข้อผิดพลาดในการตรวจสอบข้อมูล',
  CONFLICT: 'มีความขัดแย้งกับทรัพยากรปัจจุบัน',
  
  // ข้อผิดพลาดเกี่ยวกับการยืนยันตัวตน
  AUTH: {
    INVALID_CREDENTIALS: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    TOKEN_EXPIRED: 'โทเค็นหมดอายุ โปรดเข้าสู่ระบบอีกครั้ง',
    TOKEN_INVALID: 'โทเค็นไม่ถูกต้อง',
    TOKEN_MISSING: 'จำเป็นต้องมีโทเค็นสำหรับการเข้าถึง',
    USER_NOT_FOUND: 'ไม่พบบัญชีผู้ใช้',
    LOGIN_REQUIRED: 'คุณต้องเข้าสู่ระบบก่อน',
    ADMIN_REQUIRED: 'ต้องมีสิทธิ์เป็นผู้ดูแลระบบ',
    PASSWORD_RESET_EXPIRED: 'ลิงก์รีเซ็ตรหัสผ่านหมดอายุ โปรดขอลิงก์ใหม่',
    PASSWORD_MISMATCH: 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน',
    CURRENT_PASSWORD_INCORRECT: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
    EMAIL_TAKEN: 'อีเมลนี้ถูกใช้งานแล้ว',
    USERNAME_TAKEN: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว'
  },
  
  // ข้อผิดพลาดเกี่ยวกับผู้ใช้
  USER: {
    NOT_FOUND: 'ไม่พบผู้ใช้',
    CREATE_FAILED: 'ไม่สามารถสร้างผู้ใช้ได้',
    UPDATE_FAILED: 'ไม่สามารถอัปเดตผู้ใช้ได้',
    DELETE_FAILED: 'ไม่สามารถลบผู้ใช้ได้',
    INVALID_ROLE: 'บทบาทไม่ถูกต้อง',
    DELETE_SELF_FORBIDDEN: 'ไม่สามารถลบบัญชีของตัวเองได้',
    INVALID_EMAIL: 'รูปแบบอีเมลไม่ถูกต้อง',
    INVALID_USERNAME: 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข หรือขีดล่างเท่านั้น และมีความยาว 4-20 ตัวอักษร',
    PASSWORD_TOO_SHORT: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
    REQUIRED_FIELDS_MISSING: 'โปรดกรอกข้อมูลที่จำเป็นทั้งหมด'
  },
  
  // ข้อผิดพลาดเกี่ยวกับโครงการ
  PROJECT: {
    NOT_FOUND: 'ไม่พบโครงการ',
    CREATE_FAILED: 'ไม่สามารถสร้างโครงการได้',
    UPDATE_FAILED: 'ไม่สามารถอัปเดตโครงการได้',
    DELETE_FAILED: 'ไม่สามารถลบโครงการได้',
    NOT_OWNER: 'คุณไม่ใช่เจ้าของโครงการนี้',
    INVALID_STATUS: 'สถานะโครงการไม่ถูกต้อง',
    INVALID_TYPE: 'ประเภทโครงการไม่ถูกต้อง',
    REQUIRED_FIELDS_MISSING: 'โปรดกรอกข้อมูลที่จำเป็นทั้งหมด',
    REVIEW_FAILED: 'ไม่สามารถตรวจสอบโครงการได้',
    ALREADY_REVIEWED: 'โครงการนี้ได้รับการตรวจสอบแล้ว',
    VISIBILITY_CHANGE_FAILED: 'ไม่สามารถเปลี่ยนการมองเห็นโครงการได้'
  },
  
  // ข้อผิดพลาดเกี่ยวกับไฟล์
  FILE: {
    UPLOAD_FAILED: 'การอัปโหลดไฟล์ล้มเหลว',
    DELETE_FAILED: 'ไม่สามารถลบไฟล์ได้',
    NOT_FOUND: 'ไม่พบไฟล์',
    TOO_LARGE: 'ขนาดไฟล์ใหญ่เกินไป',
    INVALID_TYPE: 'ประเภทไฟล์ไม่ได้รับอนุญาต',
    REQUIRED: 'จำเป็นต้องมีไฟล์',
    TOO_MANY: 'จำนวนไฟล์มากเกินไป',
    INVALID_NAME: 'ชื่อไฟล์ไม่ถูกต้อง',
    READ_FAILED: 'ไม่สามารถอ่านไฟล์ได้'
  },
  
  // ข้อผิดพลาดเกี่ยวกับฐานข้อมูล
  DATABASE: {
    CONNECTION_ERROR: 'การเชื่อมต่อฐานข้อมูลล้มเหลว',
    QUERY_FAILED: 'คำสั่ง SQL ล้มเหลว',
    TRANSACTION_FAILED: 'ไม่สามารถดำเนินการธุรกรรมฐานข้อมูลได้',
    DUPLICATE_ENTRY: 'มีข้อมูลซ้ำในฐานข้อมูล',
    FOREIGN_KEY_CONSTRAINT: 'การดำเนินการละเมิดข้อกำหนดคีย์นอก',
    DATA_INTEGRITY: 'เกิดปัญหาด้านความถูกต้องของข้อมูล'
  }
};

/**
 * ฟังก์ชันสำหรับการดึงข้อความแสดงข้อผิดพลาด
 * @param {string} errorCode - รหัสข้อผิดพลาด (dot notation, e.g. 'AUTH.TOKEN_EXPIRED')
 * @param {string} defaultMessage - ข้อความเริ่มต้นกรณีไม่พบรหัสข้อผิดพลาด
 * @returns {string} - ข้อความแสดงข้อผิดพลาด
 */
const getErrorMessage = (errorCode, defaultMessage = ERROR_MESSAGES.GENERIC_ERROR) => {
  if (!errorCode) return defaultMessage;
  
  // แยกรหัสข้อผิดพลาดตาม dot notation
  const parts = errorCode.split('.');
  
  // ลองดึงข้อความจาก ERROR_MESSAGES
  try {
    let message = ERROR_MESSAGES;
    for (const part of parts) {
      message = message[part];
      if (!message) return defaultMessage;
    }
    return message;
  } catch (error) {
    return defaultMessage;
  }
};

// Export functions และ constants
module.exports = {
  ERROR_MESSAGES,
  getErrorMessage
};