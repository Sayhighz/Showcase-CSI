/**
 * ฟังก์ชันตรวจสอบข้อมูลสำหรับแอปพลิเคชัน
 */

/**
 * ตรวจสอบว่าค่าว่างหรือไม่
 * @param {*} value - ค่าที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าว่าง, false ถ้าไม่ว่าง
 */
export const isEmpty = (value) => {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  };
  
  /**
   * ตรวจสอบความถูกต้องของอีเมล
   * @param {string} email - อีเมลที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    
    // รูปแบบของอีเมลที่ถูกต้อง
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailRegex.test(email);
  };
  
  /**
   * ตรวจสอบความถูกต้องของชื่อผู้ใช้
   * @param {string} username - ชื่อผู้ใช้ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidUsername = (username) => {
    if (!username) return false;
    
    // ชื่อผู้ใช้ต้องมีความยาว 3-20 ตัวอักษร และประกอบด้วยตัวอักษร ตัวเลข _ - เท่านั้น
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    
    return usernameRegex.test(username);
  };
  
  /**
   * ตรวจสอบความถูกต้องของรหัสผ่าน
   * @param {string} password - รหัสผ่านที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidPassword = (password) => {
    if (!password) return false;
    
    // รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
    // ต้องมีตัวอักษรตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
    // ต้องมีตัวอักษรตัวพิมพ์เล็กอย่างน้อย 1 ตัว
    // ต้องมีตัวเลขอย่างน้อย 1 ตัว
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    return passwordRegex.test(password);
  };
  
  /**
   * ตรวจสอบความถูกต้องของเบอร์โทรศัพท์
   * @param {string} phone - เบอร์โทรศัพท์ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidPhone = (phone) => {
    if (!phone) return false;
    
    // เบอร์โทรศัพท์ต้องมีเฉพาะตัวเลข -, (, ), และช่องว่างเท่านั้น
    const phoneRegex = /^[0-9()\- ]+$/;
    
    // ความยาวต้องอยู่ระหว่าง 9-15 ตัวอักษร
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    return phoneRegex.test(phone) && cleanPhone.length >= 9 && cleanPhone.length <= 15;
  };
  
  /**
   * ตรวจสอบว่าค่าเป็นตัวเลขหรือไม่
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นตัวเลข, false ถ้าไม่ใช่
   */
  export const isNumber = (value) => {
    if (value === null || value === undefined || value === '') return false;
    
    return !isNaN(Number(value));
  };
  
  /**
   * ตรวจสอบว่าค่าเป็น URL ที่ถูกต้องหรือไม่
   * @param {string} url - URL ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็น URL ที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidUrl = (url) => {
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * ตรวจสอบว่าค่าเป็น URL ของวิดีโอที่รองรับหรือไม่
   * @param {string} url - URL ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็น URL ของวิดีโอที่รองรับ, false ถ้าไม่ใช่
   */
  export const isValidVideoUrl = (url) => {
    if (!isValidUrl(url)) return false;
    
    // รองรับ YouTube, Facebook, TikTok
    const supportedDomains = [
      'youtube.com',
      'youtu.be',
      'facebook.com',
      'fb.watch',
      'tiktok.com'
    ];
    
    try {
      const urlObj = new URL(url);
      return supportedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch (error) {
      return false;
    }
  };
  
  /**
   * ตรวจสอบว่าไฟล์มีประเภทที่อนุญาตหรือไม่
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @param {Array} allowedTypes - ประเภทไฟล์ที่อนุญาต (เช่น ['image/jpeg', 'image/png'])
   * @returns {boolean} - true ถ้าประเภทไฟล์ถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidFileType = (file, allowedTypes) => {
    if (!file || !allowedTypes || !Array.isArray(allowedTypes)) return false;
    
    return allowedTypes.includes(file.type);
  };
  
  /**
   * ตรวจสอบว่าไฟล์มีขนาดไม่เกินที่กำหนดหรือไม่
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @param {number} maxSize - ขนาดสูงสุดที่อนุญาต (ในไบต์)
   * @returns {boolean} - true ถ้าขนาดไฟล์ไม่เกิน, false ถ้าเกิน
   */
  export const isValidFileSize = (file, maxSize) => {
    if (!file || !maxSize || !isNumber(maxSize)) return false;
    
    return file.size <= maxSize;
  };
  
  /**
   * ตรวจสอบว่าข้อความตรงกับรูปแบบที่กำหนดหรือไม่
   * @param {string} text - ข้อความที่ต้องการตรวจสอบ
   * @param {RegExp} pattern - รูปแบบที่ต้องการ (regex)
   * @returns {boolean} - true ถ้าตรงกับรูปแบบ, false ถ้าไม่ตรง
   */
  export const matchesPattern = (text, pattern) => {
    if (!text || !pattern) return false;
    
    return pattern.test(text);
  };
  
  /**
   * ตรวจสอบว่าวันที่อยู่ในช่วงที่กำหนดหรือไม่
   * @param {Date} date - วันที่ที่ต้องการตรวจสอบ
   * @param {Date} minDate - วันที่ต่ำสุด
   * @param {Date} maxDate - วันที่สูงสุด
   * @returns {boolean} - true ถ้าอยู่ในช่วง, false ถ้าไม่อยู่ในช่วง
   */
  export const isDateInRange = (date, minDate, maxDate) => {
    if (!date) return false;
    
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) return false;
    
    // ตรวจสอบขอบเขตล่าง
    if (minDate) {
      const min = minDate instanceof Date ? minDate : new Date(minDate);
      if (isNaN(min.getTime()) || d < min) return false;
    }
    
    // ตรวจสอบขอบเขตบน
    if (maxDate) {
      const max = maxDate instanceof Date ? maxDate : new Date(maxDate);
      if (isNaN(max.getTime()) || d > max) return false;
    }
    
    return true;
  };
  
  /**
   * ตรวจสอบว่าตัวเลขอยู่ในช่วงที่กำหนดหรือไม่
   * @param {number} value - ค่าที่ต้องการตรวจสอบ
   * @param {number} min - ค่าต่ำสุด
   * @param {number} max - ค่าสูงสุด
   * @returns {boolean} - true ถ้าอยู่ในช่วง, false ถ้าไม่อยู่ในช่วง
   */
  export const isNumberInRange = (value, min, max) => {
    if (!isNumber(value)) return false;
    
    const num = Number(value);
    
    // ตรวจสอบขอบเขตล่าง
    if (min !== undefined && min !== null && num < min) return false;
    
    // ตรวจสอบขอบเขตบน
    if (max !== undefined && max !== null && num > max) return false;
    
    return true;
  };
  
  /**
   * ตรวจสอบความถูกต้องของรหัสนักศึกษา
   * @param {string} studentId - รหัสนักศึกษาที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidStudentId = (studentId) => {
    if (!studentId) return false;
    
    // รหัสนักศึกษาต้องเป็นตัวเลข 8-11 หลัก
    const studentIdRegex = /^\d{8,11}$/;
    
    return studentIdRegex.test(studentId);
  };
  
  /**
   * ตรวจสอบความถูกต้องของชื่อ-นามสกุล
   * @param {string} name - ชื่อที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidName = (name) => {
    if (!name) return false;
    
    // ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร และไม่มีตัวเลขหรืออักขระพิเศษ
    // รองรับภาษาไทยและภาษาอังกฤษ
    const nameRegex = /^[a-zA-Zก-๙\s.'-]+$/;
    
    return nameRegex.test(name) && name.trim().length >= 2;
  };
  
  export default {
    isEmpty,
    isValidEmail,
    isValidUsername,
    isValidPassword,
    isValidPhone,
    isNumber,
    isValidUrl,
    isValidVideoUrl,
    isValidFileType,
    isValidFileSize,
    matchesPattern,
    isDateInRange,
    isNumberInRange,
    isValidStudentId,
    isValidName
  };