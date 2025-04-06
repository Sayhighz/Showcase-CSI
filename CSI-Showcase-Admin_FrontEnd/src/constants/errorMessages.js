// src/constants/errorMessages.js

/**
 * เก็บข้อความแสดงข้อผิดพลาดต่าง ๆ ในระบบ
 */

// ข้อผิดพลาดทั่วไป
export const GENERAL_ERRORS = {
    UNKNOWN: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง',
    CONNECTION: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อของคุณ',
    TIMEOUT: 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
    SERVER: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง',
    NOT_FOUND: 'ไม่พบข้อมูลที่คุณต้องการ',
    FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
    UNAUTHORIZED: 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ',
    SESSION_EXPIRED: 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่'
  };
  
  // ข้อผิดพลาดสำหรับการยืนยันตัวตน
  export const AUTH_ERRORS = {
    INVALID_CREDENTIALS: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    ACCOUNT_LOCKED: 'บัญชีถูกล็อค กรุณาลองอีกครั้งภายหลัง',
    ACCOUNT_DISABLED: 'บัญชีถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
    INVALID_TOKEN: 'โทเค็นไม่ถูกต้องหรือหมดอายุ',
    PASSWORD_RESET_EXPIRED: 'ลิงก์รีเซ็ตรหัสผ่านหมดอายุ กรุณาขอลิงก์ใหม่',
    PASSWORD_MISMATCH: 'รหัสผ่านไม่ตรงกัน',
    CURRENT_PASSWORD_INCORRECT: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
    TOO_MANY_ATTEMPTS: 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง',
    ADMIN_ONLY: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงหน้านี้ได้'
  };
  
  // ข้อผิดพลาดสำหรับการจัดการผู้ใช้
  export const USER_ERRORS = {
    USERNAME_EXISTS: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น',
    EMAIL_EXISTS: 'อีเมลนี้มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น',
    INVALID_USERNAME: 'ชื่อผู้ใช้ไม่ถูกต้อง ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย _ เท่านั้น',
    INVALID_EMAIL: 'อีเมลไม่ถูกต้อง',
    INVALID_PHONE: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
    CANNOT_DELETE_SELF: 'ไม่สามารถลบบัญชีของตัวเองได้',
    CANNOT_DELETE_SUPER_ADMIN: 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลักได้',
    USER_NOT_FOUND: 'ไม่พบบัญชีผู้ใช้นี้',
    CANNOT_CHANGE_ROLE: 'ไม่สามารถเปลี่ยนบทบาทของผู้ใช้นี้ได้'
  };
  
  // ข้อผิดพลาดสำหรับการจัดการโปรเจค
  export const PROJECT_ERRORS = {
    INVALID_TYPE: 'ประเภทโปรเจคไม่ถูกต้อง',
    INVALID_STATUS: 'สถานะโปรเจคไม่ถูกต้อง',
    DUPLICATE_TITLE: 'ชื่อโปรเจคซ้ำกับโปรเจคที่มีอยู่แล้ว',
    PROJECT_NOT_FOUND: 'ไม่พบข้อมูลโปรเจคนี้',
    ALREADY_REVIEWED: 'โปรเจคนี้ได้รับการตรวจสอบแล้ว',
    CANNOT_REVIEW_OWN: 'ไม่สามารถตรวจสอบโปรเจคของตัวเองได้',
    EMPTY_REVIEW_COMMENT: 'กรุณาระบุความคิดเห็นหรือเหตุผลที่ปฏิเสธ',
    MISSING_REQUIRED_FIELDS: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
    INVALID_YEAR: 'ปีการศึกษาไม่ถูกต้อง',
    INVALID_SEMESTER: 'ภาคการศึกษาไม่ถูกต้อง',
    INVALID_STUDY_YEAR: 'ชั้นปีไม่ถูกต้อง'
  };
  
  // ข้อผิดพลาดสำหรับการอัปโหลดไฟล์
  export const FILE_ERRORS = {
    FILE_TOO_LARGE: 'ขนาดไฟล์ใหญ่เกินไป',
    INVALID_FILE_TYPE: 'ประเภทไฟล์ไม่ได้รับอนุญาต',
    UPLOAD_FAILED: 'อัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่อีกครั้ง',
    FILE_NOT_FOUND: 'ไม่พบไฟล์ที่ต้องการ',
    STORAGE_FULL: 'พื้นที่จัดเก็บเต็ม กรุณาลบไฟล์เก่าก่อนอัปโหลดใหม่',
    CORRUPT_FILE: 'ไฟล์เสียหายหรือไม่สามารถอ่านได้',
    MAX_FILES_EXCEEDED: 'จำนวนไฟล์เกินกำหนด',
    EMPTY_FILE: 'ไฟล์ว่างเปล่า'
  };
  
  // ข้อผิดพลาดสำหรับฟอร์ม
  export const FORM_ERRORS = {
    REQUIRED: 'จำเป็นต้องกรอกข้อมูลนี้',
    MIN_LENGTH: (min) => `ต้องมีความยาวอย่างน้อย ${min} ตัวอักษร`,
    MAX_LENGTH: (max) => `ต้องมีความยาวไม่เกิน ${max} ตัวอักษร`,
    EMAIL_FORMAT: 'รูปแบบอีเมลไม่ถูกต้อง',
    PHONE_FORMAT: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
    PASSWORD_STRENGTH: 'รหัสผ่านไม่ปลอดภัยเพียงพอ',
    PASSWORD_MISMATCH: 'รหัสผ่านไม่ตรงกัน',
    INVALID_DATE: 'วันที่ไม่ถูกต้อง',
    NUMBER_ONLY: 'ต้องเป็นตัวเลขเท่านั้น',
    POSITIVE_NUMBER: 'ต้องเป็นตัวเลขที่มากกว่า 0',
    INTEGER_ONLY: 'ต้องเป็นจำนวนเต็มเท่านั้น',
    INVALID_URL: 'URL ไม่ถูกต้อง',
    THAI_ID_FORMAT: 'รูปแบบเลขบัตรประชาชนไม่ถูกต้อง',
    ZIPCODE_FORMAT: 'รูปแบบรหัสไปรษณีย์ไม่ถูกต้อง'
  };
  
  // ข้อผิดพลาดสำหรับการค้นหาและการกรอง
  export const SEARCH_ERRORS = {
    EMPTY_QUERY: 'กรุณาระบุคำค้นหา',
    NO_RESULTS: 'ไม่พบผลลัพธ์ที่ตรงกับคำค้นหา',
    INVALID_FILTER: 'ตัวกรองไม่ถูกต้อง',
    INVALID_DATE_RANGE: 'ช่วงวันที่ไม่ถูกต้อง',
    TOO_MANY_FILTERS: 'จำนวนตัวกรองมากเกินไป',
    FILTER_NOT_SUPPORTED: 'ไม่รองรับตัวกรองนี้'
  };
  
  // ข้อผิดพลาดสำหรับการแจ้งเตือน
  export const NOTIFICATION_ERRORS = {
    SEND_FAILED: 'ไม่สามารถส่งการแจ้งเตือนได้',
    NOTIFICATION_NOT_FOUND: 'ไม่พบการแจ้งเตือนนี้',
    MARK_READ_FAILED: 'ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้',
    DELETE_FAILED: 'ไม่สามารถลบการแจ้งเตือนได้'
  };
  
  // ข้อผิดพลาดสำหรับการรายงาน
  export const REPORT_ERRORS = {
    GENERATE_FAILED: 'ไม่สามารถสร้างรายงานได้',
    INVALID_DATE_RANGE: 'ช่วงวันที่สำหรับรายงานไม่ถูกต้อง',
    NO_DATA: 'ไม่มีข้อมูลสำหรับการสร้างรายงาน',
    EXPORT_FAILED: 'ไม่สามารถส่งออกรายงานได้'
  };
  
  // ข้อผิดพลาดเกี่ยวกับสิทธิ์และการเข้าถึง
  export const PERMISSION_ERRORS = {
    ACCESS_DENIED: 'การเข้าถึงถูกปฏิเสธ',
    INSUFFICIENT_PRIVILEGES: 'สิทธิ์ไม่เพียงพอสำหรับการดำเนินการนี้',
    ADMIN_REQUIRED: 'ต้องเป็นผู้ดูแลระบบเท่านั้น',
    OWNER_REQUIRED: 'ต้องเป็นเจ้าของเท่านั้น',
    ALREADY_LOGGED_IN: 'คุณเข้าสู่ระบบอยู่แล้ว',
    NOT_LOGGED_IN: 'คุณยังไม่ได้เข้าสู่ระบบ'
  };
  
  // ข้อผิดพลาดเกี่ยวกับฐานข้อมูล
  export const DATABASE_ERRORS = {
    CONNECTION_FAILED: 'การเชื่อมต่อฐานข้อมูลล้มเหลว',
    QUERY_FAILED: 'การค้นหาข้อมูลล้มเหลว',
    UPDATE_FAILED: 'การอัปเดตข้อมูลล้มเหลว',
    DELETE_FAILED: 'การลบข้อมูลล้มเหลว',
    INSERT_FAILED: 'การเพิ่มข้อมูลล้มเหลว',
    DUPLICATE_ENTRY: 'ข้อมูลซ้ำกับข้อมูลที่มีอยู่แล้ว',
    FOREIGN_KEY_CONSTRAINT: 'ไม่สามารถดำเนินการได้เนื่องจากมีการอ้างอิงจากข้อมูลอื่น'
  };
  
  // ข้อผิดพลาดเกี่ยวกับการตั้งค่า
  export const SETTINGS_ERRORS = {
    SAVE_FAILED: 'ไม่สามารถบันทึกการตั้งค่าได้',
    INVALID_SETTING: 'การตั้งค่าไม่ถูกต้อง',
    NOT_FOUND: 'ไม่พบการตั้งค่าที่ต้องการ',
    RESET_FAILED: 'ไม่สามารถรีเซ็ตการตั้งค่าได้'
  };
  
  // ฟังก์ชันแปลงรหัสข้อผิดพลาดเป็นข้อความ
  export const getErrorMessage = (code, params = {}) => {
    // แยกรหัสข้อผิดพลาดเป็นหมวดหมู่และรหัสย่อย
    const [category, subCode] = code.split('.');
    
    // ตรวจสอบหมวดหมู่ข้อผิดพลาด
    switch (category) {
      case 'GENERAL':
        return GENERAL_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'AUTH':
        return AUTH_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'USER':
        return USER_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'PROJECT':
        return PROJECT_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'FILE':
        return FILE_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'FORM':
        // สำหรับข้อผิดพลาดที่ต้องใส่พารามิเตอร์
        if (subCode === 'MIN_LENGTH' && params.min) {
          return FORM_ERRORS.MIN_LENGTH(params.min);
        }
        if (subCode === 'MAX_LENGTH' && params.max) {
          return FORM_ERRORS.MAX_LENGTH(params.max);
        }
        return FORM_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'SEARCH':
        return SEARCH_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'NOTIFICATION':
        return NOTIFICATION_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'REPORT':
        return REPORT_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'PERMISSION':
        return PERMISSION_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'DATABASE':
        return DATABASE_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      case 'SETTINGS':
        return SETTINGS_ERRORS[subCode] || GENERAL_ERRORS.UNKNOWN;
      default:
        return GENERAL_ERRORS.UNKNOWN;
    }
  };
  
  export default {
    GENERAL_ERRORS,
    AUTH_ERRORS,
    USER_ERRORS,
    PROJECT_ERRORS,
    FILE_ERRORS,
    FORM_ERRORS,
    SEARCH_ERRORS,
    NOTIFICATION_ERRORS,
    REPORT_ERRORS,
    PERMISSION_ERRORS,
    DATABASE_ERRORS,
    SETTINGS_ERRORS,
    getErrorMessage
  };