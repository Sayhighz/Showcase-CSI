// src/utils/validationUtils.js

/**
 * ตรวจสอบว่าข้อมูลเป็นค่าว่างหรือไม่
 * @param {any} value - ค่าที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็นค่าว่าง, false ถ้าไม่ใช่
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
   * ตรวจสอบว่าอีเมลถูกต้องตามรูปแบบหรือไม่
   * @param {string} email - อีเมลที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  /**
   * ตรวจสอบว่าเบอร์โทรศัพท์ถูกต้องตามรูปแบบหรือไม่
   * @param {string} phone - เบอร์โทรศัพท์ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidPhone = (phone) => {
    if (!phone) return false;
    
    // รูปแบบเบอร์โทรศัพท์ไทย: 0xxxxxxxxx, 0x-xxxx-xxxx, 0xx-xxx-xxxx
    const phoneRegex = /^0[0-9]{8,9}$|^0[0-9]{1,2}-[0-9]{3,4}-[0-9]{3,4}$/;
    return phoneRegex.test(phone);
  };
  
  /**
   * ตรวจสอบความยาวข้อความ
   * @param {string} text - ข้อความที่ต้องการตรวจสอบ
   * @param {number} minLength - ความยาวขั้นต่ำ
   * @param {number} maxLength - ความยาวสูงสุด
   * @returns {boolean} - true ถ้าความยาวอยู่ในช่วงที่กำหนด, false ถ้าไม่ใช่
   */
  export const isValidLength = (text, minLength = 0, maxLength = Number.MAX_SAFE_INTEGER) => {
    if (text === null || text === undefined) return false;
    
    const textLength = String(text).length;
    return textLength >= minLength && textLength <= maxLength;
  };
  
  /**
   * ตรวจสอบว่ารหัสผ่านมีความแข็งแรงเพียงพอหรือไม่
   * @param {string} password - รหัสผ่านที่ต้องการตรวจสอบ
   * @param {Object} options - ตัวเลือกการตรวจสอบ
   * @param {number} options.minLength - ความยาวขั้นต่ำ (default: 8)
   * @param {boolean} options.requireUppercase - ต้องมีตัวพิมพ์ใหญ่หรือไม่ (default: true)
   * @param {boolean} options.requireLowercase - ต้องมีตัวพิมพ์เล็กหรือไม่ (default: true)
   * @param {boolean} options.requireNumbers - ต้องมีตัวเลขหรือไม่ (default: true)
   * @param {boolean} options.requireSpecialChars - ต้องมีอักขระพิเศษหรือไม่ (default: false)
   * @returns {boolean} - true ถ้ารหัสผ่านมีความแข็งแรงเพียงพอ, false ถ้าไม่ใช่
   */
  export const isStrongPassword = (password, options = {}) => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = false
    } = options;
    
    if (!password || password.length < minLength) {
      return false;
    }
    
    // ตรวจสอบตัวพิมพ์ใหญ่
    if (requireUppercase && !/[A-Z]/.test(password)) {
      return false;
    }
    
    // ตรวจสอบตัวพิมพ์เล็ก
    if (requireLowercase && !/[a-z]/.test(password)) {
      return false;
    }
    
    // ตรวจสอบตัวเลข
    if (requireNumbers && !/[0-9]/.test(password)) {
      return false;
    }
    
    // ตรวจสอบอักขระพิเศษ
    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return false;
    }
    
    return true;
  };
  
  /**
   * ตรวจสอบว่าเลขบัตรประชาชนถูกต้องตามรูปแบบหรือไม่
   * @param {string} id - เลขบัตรประชาชนที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidThaiID = (id) => {
    if (!id || id.length !== 13 || !/^[0-9]{13}$/.test(id)) {
      return false;
    }
    
    // คำนวณตามสูตรการตรวจสอบเลขบัตรประชาชน
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(id.charAt(i)) * (13 - i);
    }
    
    const checkDigit = (11 - (sum % 11)) % 10;
    return parseInt(id.charAt(12)) === checkDigit;
  };
  
  /**
   * ตรวจสอบว่าเป็นเลขจำนวนเต็มหรือไม่
   * @param {any} value - ค่าที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นเลขจำนวนเต็ม, false ถ้าไม่ใช่
   */
  export const isInteger = (value) => {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    
    return Number.isInteger(Number(value));
  };
  
  /**
   * ตรวจสอบว่าเป็นเลขจำนวนเต็มบวกหรือไม่
   * @param {any} value - ค่าที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นเลขจำนวนเต็มบวก, false ถ้าไม่ใช่
   */
  export const isPositiveInteger = (value) => {
    if (!isInteger(value)) {
      return false;
    }
    
    return Number(value) > 0;
  };
  
  /**
   * ตรวจสอบว่าเป็นเลขจำนวนเต็มไม่ติดลบหรือไม่
   * @param {any} value - ค่าที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นเลขจำนวนเต็มไม่ติดลบ, false ถ้าไม่ใช่
   */
  export const isNonNegativeInteger = (value) => {
    if (!isInteger(value)) {
      return false;
    }
    
    return Number(value) >= 0;
  };
  
  /**
   * ตรวจสอบว่าเป็นวันที่ที่ถูกต้องหรือไม่
   * @param {string} dateStr - วันที่ในรูปแบบ string
   * @returns {boolean} - true ถ้าเป็นวันที่ที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidDate = (dateStr) => {
    if (!dateStr) {
      return false;
    }
    
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };
  
  /**
   * ตรวจสอบว่าเป็น URL ที่ถูกต้องหรือไม่
   * @param {string} url - URL ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็น URL ที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidURL = (url) => {
    if (!url) {
      return false;
    }
    
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * ตรวจสอบว่าเป็นรหัสไปรษณีย์ไทยที่ถูกต้องหรือไม่
   * @param {string} zipcode - รหัสไปรษณีย์ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นรหัสไปรษณีย์ไทยที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidThaiZipcode = (zipcode) => {
    if (!zipcode) {
      return false;
    }
    
    return /^[0-9]{5}$/.test(zipcode);
  };
  
  /**
   * ตรวจสอบว่าเป็นชื่อผู้ใช้ที่ถูกต้องหรือไม่
   * @param {string} username - ชื่อผู้ใช้ที่ต้องการตรวจสอบ
   * @param {number} minLength - ความยาวขั้นต่ำ (default: 3)
   * @param {number} maxLength - ความยาวสูงสุด (default: 20)
   * @returns {boolean} - true ถ้าเป็นชื่อผู้ใช้ที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidUsername = (username, minLength = 3, maxLength = 20) => {
    if (!username) {
      return false;
    }
    
    // ตรวจสอบความยาว
    if (username.length < minLength || username.length > maxLength) {
      return false;
    }
    
    // ตรวจสอบว่าเริ่มต้นด้วยตัวอักษรเท่านั้น
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
    return usernameRegex.test(username);
  };
  
  /**
   * ตรวจสอบความตรงกันของรหัสผ่าน
   * @param {string} password - รหัสผ่าน
   * @param {string} confirmPassword - ยืนยันรหัสผ่าน
   * @returns {boolean} - true ถ้าตรงกัน, false ถ้าไม่ตรงกัน
   */
  export const doPasswordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
  };
  
  /**
   * ตรวจสอบว่ามีค่าอยู่ในช่วงที่กำหนดหรือไม่
   * @param {number} value - ค่าที่ต้องการตรวจสอบ
   * @param {number} min - ค่าต่ำสุด
   * @param {number} max - ค่าสูงสุด
   * @returns {boolean} - true ถ้าค่าอยู่ในช่วงที่กำหนด, false ถ้าไม่ใช่
   */
  export const isInRange = (value, min, max) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return false;
    }
    
    const numValue = Number(value);
    return numValue >= min && numValue <= max;
  };
  
  /**
   * ตรวจสอบว่าเป็นวันที่ในอดีตหรือไม่
   * @param {Date|string} date - วันที่ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นวันที่ในอดีต, false ถ้าไม่ใช่
   */
  export const isPastDate = (date) => {
    if (!date) {
      return false;
    }
    
    const checkDate = new Date(date);
    if (isNaN(checkDate.getTime())) {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };
  
  /**
   * ตรวจสอบว่าเป็นวันที่ในอนาคตหรือไม่
   * @param {Date|string} date - วันที่ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นวันที่ในอนาคต, false ถ้าไม่ใช่
   */
  export const isFutureDate = (date) => {
    if (!date) {
      return false;
    }
    
    const checkDate = new Date(date);
    if (isNaN(checkDate.getTime())) {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate > today;
  };
  
  /**
   * ตรวจสอบว่าเป็นปีการศึกษาที่ถูกต้องหรือไม่
   * @param {number} year - ปีการศึกษาที่ต้องการตรวจสอบ (พ.ศ.)
   * @param {number} minYear - ปีการศึกษาต่ำสุด (default: 2500)
   * @param {number} maxYear - ปีการศึกษาสูงสุด (default: ปีปัจจุบัน + 5)
   * @returns {boolean} - true ถ้าเป็นปีการศึกษาที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidAcademicYear = (year, minYear = 2500, maxYear = new Date().getFullYear() + 543 + 5) => {
    if (!year || !isInteger(year)) {
      return false;
    }
    
    const numYear = Number(year);
    return numYear >= minYear && numYear <= maxYear;
  };