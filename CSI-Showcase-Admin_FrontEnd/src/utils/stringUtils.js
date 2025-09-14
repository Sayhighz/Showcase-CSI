// src/utils/stringUtils.js

/**
 * ตัดข้อความให้มีความยาวตามที่กำหนดและเพิ่ม ... ท้ายข้อความ
 * @param {string} text - ข้อความที่ต้องการตัด
 * @param {number} maxLength - ความยาวสูงสุดที่ต้องการ
 * @param {string} suffix - ข้อความที่ต้องการเพิ่มท้าย (default: '...')
 * @returns {string} - ข้อความที่ถูกตัดแล้ว
 */
export const truncateText = (text, maxLength, suffix = '...') => {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength) + suffix;
  };
  
  /**
   * แปลงข้อความให้เป็น URL friendly (slug)
   * @param {string} text - ข้อความที่ต้องการแปลง
   * @returns {string} - ข้อความในรูปแบบ slug
   */
  export const slugify = (text) => {
    if (!text) return '';
    
    // ลบอักขระพิเศษและแทนที่ช่องว่างด้วย -
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\sก-๙]/g, '') // ลบอักขระพิเศษ (รองรับภาษาไทย)
      .replace(/\s+/g, '-') // แทนที่ช่องว่างด้วย -
      .replace(/--+/g, '-') // แทนที่ -- ด้วย -
      .replace(/^-+/, '') // ลบ - ที่อยู่ข้างหน้า
      .replace(/-+$/, ''); // ลบ - ที่อยู่ข้างหลัง
  };
  
  /**
   * แปลงตัวอักษรแรกของข้อความให้เป็นตัวพิมพ์ใหญ่
   * @param {string} text - ข้อความที่ต้องการแปลง
   * @returns {string} - ข้อความที่แปลงแล้ว
   */
  export const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  /**
   * แปลงตัวอักษรแรกของทุกคำให้เป็นตัวพิมพ์ใหญ่
   * @param {string} text - ข้อความที่ต้องการแปลง
   * @returns {string} - ข้อความที่แปลงแล้ว
   */
  export const titleCase = (text) => {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  /**
   * ลบช่องว่างหน้าและหลังข้อความ
   * @param {string} text - ข้อความที่ต้องการลบช่องว่าง
   * @returns {string} - ข้อความที่ลบช่องว่างแล้ว
   */
  export const trimWhiteSpace = (text) => {
    if (!text) return '';
    
    return text.trim();
  };
  
  /**
   * ลบอักขระพิเศษทั้งหมดออกจากข้อความ
   * @param {string} text - ข้อความที่ต้องการลบอักขระพิเศษ
   * @returns {string} - ข้อความที่ลบอักขระพิเศษแล้ว
   */
  export const removeSpecialCharacters = (text) => {
    if (!text) return '';
    
    return text.replace(/[^\w\sก-๙]/g, ''); // ลบอักขระพิเศษ (รองรับภาษาไทย)
  };
  
  /**
   * ตรวจสอบว่าข้อความเป็นอีเมลที่ถูกต้องหรือไม่
   * @param {string} email - อีเมลที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นอีเมลที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * ตรวจสอบว่าข้อความเป็นเบอร์โทรศัพท์ที่ถูกต้องในรูปแบบไทยหรือไม่
   * @param {string} phone - เบอร์โทรศัพท์ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นเบอร์โทรศัพท์ที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidThaiPhoneNumber = (phone) => {
    if (!phone) return false;
    
    // รูปแบบเบอร์โทรศัพท์ไทย: 0xxxxxxxx, 0x-xxxx-xxxx, 0xx-xxx-xxxx
    const phoneRegex = /^0[0-9]{8,9}$|^0[0-9]{1,2}-[0-9]{3,4}-[0-9]{3,4}$/;
    return phoneRegex.test(phone);
  };
  
  /**
   * แยกข้อความด้วยตัวคั่น
   * @param {string} text - ข้อความที่ต้องการแยก
   * @param {string} separator - ตัวคั่น (default: ',')
   * @returns {Array} - อาร์เรย์ของข้อความที่แยกแล้ว
   */
  export const splitText = (text, separator = ',') => {
    if (!text) return [];
    
    return text.split(separator).map(item => item.trim()).filter(item => item);
  };
  
  /**
   * เพิ่มช่องว่างระหว่างตัวอักษรภาษาไทยและภาษาอังกฤษ
   * @param {string} text - ข้อความที่ต้องการเพิ่มช่องว่าง
   * @returns {string} - ข้อความที่เพิ่มช่องว่างแล้ว
   */
  export const addSpaceBetweenThaiAndEnglish = (text) => {
    if (!text) return '';
    
    // เพิ่มช่องว่างระหว่างตัวอักษรไทยและอังกฤษ
    return text
      .replace(/([ก-๙])([\w])/g, '$1 $2') // เพิ่มช่องว่างระหว่างไทย->อังกฤษ
      .replace(/([\w])([ก-๙])/g, '$1 $2'); // เพิ่มช่องว่างระหว่างอังกฤษ->ไทย
  };
  
  /**
   * ตรวจสอบว่าข้อความมีอักขระที่ไม่ต้องการหรือไม่
   * @param {string} text - ข้อความที่ต้องการตรวจสอบ
   * @param {Array} blacklistChars - อาร์เรย์ของอักขระที่ไม่ต้องการ
   * @returns {boolean} - true ถ้ามีอักขระที่ไม่ต้องการ, false ถ้าไม่มี
   */
  export const containsBlacklistedCharacters = (text, blacklistChars = []) => {
    if (!text || !blacklistChars.length) return false;
    
    return blacklistChars.some(char => text.includes(char));
  };
  
  /**
   * จัดรูปแบบข้อความให้มีความยาวคงที่โดยเติมอักขระข้างหน้า
   * @param {string} text - ข้อความที่ต้องการจัดรูปแบบ
   * @param {number} length - ความยาวที่ต้องการ
   * @param {string} padChar - อักขระที่ใช้เติม (default: '0')
   * @returns {string} - ข้อความที่จัดรูปแบบแล้ว
   */
  export const padStart = (text, length, padChar = '0') => {
    if (text === null || text === undefined) return '';
    
    const textStr = String(text);
    const padLength = Math.max(0, length - textStr.length);
    
    if (padLength === 0) {
      return textStr;
    }
    
    return padChar.repeat(padLength) + textStr;
  };
  
  /**
   * จัดรูปแบบข้อความให้มีความยาวคงที่โดยเติมอักขระข้างหลัง
   * @param {string} text - ข้อความที่ต้องการจัดรูปแบบ
   * @param {number} length - ความยาวที่ต้องการ
   * @param {string} padChar - อักขระที่ใช้เติม (default: ' ')
   * @returns {string} - ข้อความที่จัดรูปแบบแล้ว
   */
  export const padEnd = (text, length, padChar = ' ') => {
    if (text === null || text === undefined) return '';
    
    const textStr = String(text);
    const padLength = Math.max(0, length - textStr.length);
    
    if (padLength === 0) {
      return textStr;
    }
    
    return textStr + padChar.repeat(padLength);
  };
  
  /**
   * เปลี่ยนข้อความให้อยู่ในรูปแบบ camelCase
   * @param {string} text - ข้อความที่ต้องการเปลี่ยน
   * @returns {string} - ข้อความในรูปแบบ camelCase
   */
  export const toCamelCase = (text) => {
    if (!text) return '';
    
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => 
        index === 0 ? letter.toLowerCase() : letter.toUpperCase()
      )
      .replace(/\s+/g, '');
  };
  
  /**
   * นับคำในข้อความ
   * @param {string} text - ข้อความที่ต้องการนับคำ
   * @returns {number} - จำนวนคำ
   */
  export const countWords = (text) => {
    if (!text) return 0;
    
    // แยกคำโดยใช้ช่องว่างและกรองคำที่ว่างเปล่า
    const words = text.trim().split(/\s+/).filter(word => word);
    return words.length;
  };
  
  /**
   * สร้างข้อความสุ่ม
   * @param {number} length - ความยาวของข้อความที่ต้องการ
   * @param {boolean} includeSpecialChars - รวมอักขระพิเศษหรือไม่
   * @returns {string} - ข้อความสุ่ม
   */
  export const generateRandomString = (length = 8, includeSpecialChars = false) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    const allChars = includeSpecialChars ? chars + specialChars : chars;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    return result;
  };
  
  /**
   * แทนที่คำในข้อความ
   * @param {string} text - ข้อความเดิม
   * @param {Object} replacements - ออบเจกต์ที่กำหนดคำที่ต้องการแทนที่
   *                              (key: คำที่ต้องการแทนที่, value: คำที่ใช้แทนที่)
   * @returns {string} - ข้อความที่แทนที่คำแล้ว
   */
  export const replaceWords = (text, replacements) => {
    if (!text || !replacements) return text || '';

    let result = text;

    Object.entries(replacements).forEach(([search, replace]) => {
      const regex = new RegExp(search, 'g');
      result = result.replace(regex, replace);
    });

    return result;
  };

  /**
   * ถอดรหัส HTML entities ในข้อความ
   * @param {string} text - ข้อความที่มี HTML entities
   * @returns {string} - ข้อความที่ถอดรหัสแล้ว
   */
  export const decodeHtmlEntities = (text) => {
    if (!text) return '';

    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };