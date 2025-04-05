// utils/validationHelper.js

/**
 * ตรวจสอบว่าอีเมลถูกต้องตามรูปแบบหรือไม่
 * @param {string} email - อีเมลที่ต้องการตรวจสอบ
 * @returns {boolean} - ผลการตรวจสอบ
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * ตรวจสอบว่า username ถูกต้องตามรูปแบบหรือไม่
   * @param {string} username - username ที่ต้องการตรวจสอบ
   * @param {number} minLength - ความยาวขั้นต่ำ (default: 4)
   * @param {number} maxLength - ความยาวสูงสุด (default: 20)
   * @returns {boolean} - ผลการตรวจสอบ
   */
  export const isValidUsername = (username, minLength = 4, maxLength = 20) => {
    // ตรวจสอบความยาว
    if (username.length < minLength || username.length > maxLength) {
      return false;
    }
    
    // อนุญาตให้ใช้ตัวอักษร ตัวเลข และอักขระ _ เท่านั้น
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  };
  
  /**
   * ตรวจสอบว่าเป็นตัวเลขหรือไม่
   * @param {any} value - ค่าที่ต้องการตรวจสอบ
   * @returns {boolean} - ผลการตรวจสอบ
   */
  export const isNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };
  
  /**
   * ตรวจสอบว่าเป็นภาพหรือไม่
   * @param {string} mimetype - MIME type ของไฟล์
   * @returns {boolean} - ผลการตรวจสอบ
   */
  export const isImage = (mimetype) => {
    return mimetype.startsWith('image/');
  };
  
  /**
   * ตรวจสอบว่าเป็นไฟล์ PDF หรือไม่
   * @param {string} mimetype - MIME type ของไฟล์
   * @returns {boolean} - ผลการตรวจสอบ
   */
  export const isPDF = (mimetype) => {
    return mimetype === 'application/pdf';
  };
  
  /**
   * ตรวจสอบว่าเป็นไฟล์วิดีโอหรือไม่
   * @param {string} mimetype - MIME type ของไฟล์
   * @returns {boolean} - ผลการตรวจสอบ
   */
  export const isVideo = (mimetype) => {
    return mimetype.startsWith('video/');
  };
  
/**
 * ตรวจสอบว่ามีอักขระพิเศษหรือไม่
 * @param {string} str - ข้อความที่ต้องการตรวจสอบ
 * @returns {boolean} - ผลการตรวจสอบ
 */
export const hasSpecialCharacters = (str) => {
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharsRegex.test(str);
  };
  
  /**
   * ทำความสะอาดข้อความ HTML เพื่อป้องกัน XSS
   * @param {string} html - ข้อความ HTML ที่ต้องการทำความสะอาด
   * @returns {string} - ข้อความที่ทำความสะอาดแล้ว
   */
  export const sanitizeHTML = (html) => {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * ตรวจสอบว่าเป็น URL ที่ถูกต้องหรือไม่
   * @param {string} url - URL ที่ต้องการตรวจสอบ
   * @returns {boolean} - ผลการตรวจสอบ
   */
  export const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * ตรวจสอบว่าเป็นเบอร์โทรศัพท์ไทยที่ถูกต้องหรือไม่
   * @param {string} phone - เบอร์โทรศัพท์ที่ต้องการตรวจสอบ
   * @returns {boolean} - ผลการตรวจสอบ
   */
  export const isValidThaiPhoneNumber = (phone) => {
    // รูปแบบเบอร์โทรศัพท์ไทย: 0x-xxx-xxxx หรือ 0xxxxxxxxx (x คือตัวเลข)
    const phoneRegex = /^0[1-9][0-9]{8}$|^0[1-9]-[0-9]{3}-[0-9]{4}$/;
    return phoneRegex.test(phone);
  };
  
  /**
   * ตรวจสอบค่าว่างหรือ null หรือ undefined
   * @param {any} value - ค่าที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นค่าว่าง, false ถ้าไม่ใช่
   */
  export const isEmpty = (value) => {
    if (value === undefined || value === null) {
      return true;
    }
    
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    
    return false;
  };
  
  /**
   * ตรวจสอบประเภทของข้อมูล
   * @param {any} value - ค่าที่ต้องการตรวจสอบ
   * @param {string} type - ประเภทที่ต้องการตรวจสอบ (string, number, boolean, array, object, function)
   * @returns {boolean} - ผลการตรวจสอบ
   */
  export const isType = (value, type) => {
    switch (type.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && !Array.isArray(value) && value !== null;
      case 'function':
        return typeof value === 'function';
      default:
        return false;
    }
  };