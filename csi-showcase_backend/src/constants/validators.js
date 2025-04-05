// constants/validators.js

/**
 * Regular expressions สำหรับการตรวจสอบข้อมูล
 */
export const VALIDATION_REGEX = {
    // อีเมล
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    // ชื่อผู้ใช้ (ตัวอักษร ตัวเลข หรือขีดล่างเท่านั้น)
    USERNAME: /^[a-zA-Z0-9_]{4,20}$/,
    
    // รหัสผ่าน (ตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ อย่างน้อย 1 ตัว)
    STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/,
    
    // เบอร์โทรศัพท์มือถือไทย
    THAI_MOBILE: /^0[689]\d{8}$/,
    
    // URL
    URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    
    // วันที่ในรูปแบบ YYYY-MM-DD
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    
    // รหัสไปรษณีย์ไทย
    THAI_ZIPCODE: /^\d{5}$/,
    
    // ชื่อไฟล์ที่ปลอดภัย
    SAFE_FILENAME: /^[a-zA-Z0-9_\-. ]+$/
  };
  
  /**
   * ข้อความแสดงข้อผิดพลาดในการตรวจสอบ
   */
  export const VALIDATION_MESSAGES = {
    REQUIRED: 'กรุณากรอกข้อมูลในช่องนี้',
    EMAIL: 'รูปแบบอีเมลไม่ถูกต้อง',
    USERNAME: 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข หรือขีดล่างเท่านั้น และมีความยาว 4-20 ตัวอักษร',
    PASSWORD: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    STRONG_PASSWORD: 'รหัสผ่านต้องประกอบด้วยตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษอย่างน้อย 1 ตัว',
    PASSWORD_CONFIRMATION: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน',
    CURRENT_PASSWORD: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
    MOBILE: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
    URL: 'รูปแบบ URL ไม่ถูกต้อง',
    DATE: 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)',
    FILE_REQUIRED: 'กรุณาเลือกไฟล์',
    FILE_TYPE: 'ประเภทไฟล์ไม่ได้รับอนุญาต',
    FILE_SIZE: 'ขนาดไฟล์ใหญ่เกินไป',
    ZIPCODE: 'รหัสไปรษณีย์ไม่ถูกต้อง',
    MAX_LENGTH: 'ความยาวเกิน {max} ตัวอักษร',
    MIN_LENGTH: 'ความยาวน้อยกว่า {min} ตัวอักษร',
    INVALID_ROLE: 'บทบาทไม่ถูกต้อง',
    INVALID_PROJECT_TYPE: 'ประเภทโครงการไม่ถูกต้อง',
    INVALID_PROJECT_STATUS: 'สถานะโครงการไม่ถูกต้อง',
    INVALID_SEMESTER: 'ภาคการศึกษาไม่ถูกต้อง',
    INVALID_COMPETITION_LEVEL: 'ระดับการแข่งขันไม่ถูกต้อง',
    INVALID_YEAR: 'ปีไม่ถูกต้อง',
    INVALID_STUDY_YEAR: 'ชั้นปีไม่ถูกต้อง'
  };
  
  /**
   * ฟังก์ชันสำหรับตรวจสอบอีเมล
   * @param {string} email - อีเมลที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าอีเมลถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidEmail = (email) => {
    return VALIDATION_REGEX.EMAIL.test(email);
  };
  
  /**
   * ฟังก์ชันสำหรับตรวจสอบชื่อผู้ใช้
   * @param {string} username - ชื่อผู้ใช้ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าชื่อผู้ใช้ถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidUsername = (username) => {
    return VALIDATION_REGEX.USERNAME.test(username);
  };
  
  /**
   * ฟังก์ชันสำหรับตรวจสอบรหัสผ่านแบบเข้มงวด
   * @param {string} password - รหัสผ่านที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้ารหัสผ่านถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isStrongPassword = (password) => {
    return VALIDATION_REGEX.STRONG_PASSWORD.test(password);
  };