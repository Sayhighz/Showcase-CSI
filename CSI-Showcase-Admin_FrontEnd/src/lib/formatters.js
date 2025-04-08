// src/lib/formatters.js

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย
 * @param {string|Date} date - วันที่ที่ต้องการจัดรูปแบบ
 * @param {Object} options - ตัวเลือกการจัดรูปแบบ
 * @returns {string} - วันที่ในรูปแบบภาษาไทย
 */
export const formatThaiDate = (date, options = {}) => {
    if (!date) return 'ไม่ระบุ';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('th-TH', defaultOptions);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'วันที่ไม่ถูกต้อง';
    }
  };
  
  /**
   * จัดรูปแบบเวลาเป็นภาษาไทย
   * @param {string|Date} date - วันที่และเวลาที่ต้องการจัดรูปแบบ
   * @param {Object} options - ตัวเลือกการจัดรูปแบบ
   * @returns {string} - เวลาในรูปแบบภาษาไทย
   */
  export const formatThaiTime = (date, options = {}) => {
    if (!date) return 'ไม่ระบุ';
    
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleTimeString('th-TH', defaultOptions);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'เวลาไม่ถูกต้อง';
    }
  };
  
  /**
   * จัดรูปแบบวันที่และเวลาเป็นภาษาไทย
   * @param {string|Date} date - วันที่และเวลาที่ต้องการจัดรูปแบบ
   * @param {Object} options - ตัวเลือกการจัดรูปแบบ
   * @returns {string} - วันที่และเวลาในรูปแบบภาษาไทย
   */
  export const formatThaiDateTime = (date, options = {}) => {
    if (!date) return 'ไม่ระบุ';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleString('th-TH', defaultOptions);
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'วันที่และเวลาไม่ถูกต้อง';
    }
  };
  
  /**
   * จัดรูปแบบขนาดไฟล์ให้อ่านง่าย
   * @param {number} bytes - ขนาดไฟล์ในหน่วย bytes
   * @param {number} decimals - จำนวนตำแหน่งทศนิยม (default: 2)
   * @returns {string} - ขนาดไฟล์ในรูปแบบที่อ่านง่าย
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * จัดรูปแบบเลขหมู่ให้มีเครื่องหมายคั่นหลักพัน
   * @param {number} number - ตัวเลขที่ต้องการจัดรูปแบบ
   * @param {number} decimals - จำนวนตำแหน่งทศนิยม (default: 0)
   * @returns {string} - ตัวเลขที่จัดรูปแบบแล้ว
   */
  export const formatNumber = (number, decimals = 0) => {
    if (number === null || number === undefined || isNaN(number)) {
      return '0';
    }
    
    return Number(number).toLocaleString('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  /**
   * จัดรูปแบบชื่อย่อจากชื่อเต็ม (เช่น "John Doe" เป็น "JD")
   * @param {string} fullName - ชื่อเต็ม
   * @returns {string} - ชื่อย่อ
   */
  export const formatInitials = (fullName) => {
    if (!fullName) return '';
    
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
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
   * จัดรูปแบบสถานะการเข้าสู่ระบบเป็นภาษาไทย
   * @param {string} status - สถานะการเข้าสู่ระบบ
   * @returns {string} - สถานะการเข้าสู่ระบบภาษาไทย
   */
  export const formatLoginStatus = (status) => {
    switch (status) {
      case 'success':
        return 'สำเร็จ';
      case 'failed':
        return 'ล้มเหลว';
      default:
        return status;
    }
  };
  
  /**
   * จัดรูปแบบชื่อประเภทไฟล์เป็นภาษาไทย
   * @param {string} fileType - ประเภทไฟล์
   * @returns {string} - ชื่อประเภทไฟล์ภาษาไทย
   */
  export const formatFileType = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'เอกสาร PDF';
      case 'image':
        return 'รูปภาพ';
      case 'video':
        return 'วิดีโอ';
      case 'other':
        return 'ไฟล์อื่นๆ';
      default:
        return fileType;
    }
  };
  
  /**
   * จัดรูปแบบชื่อประเภทไฟล์จากนามสกุลไฟล์
   * @param {string} fileName - ชื่อไฟล์
   * @returns {string} - ชื่อประเภทไฟล์
   */
  export const getFileTypeFromName = (fileName) => {
    if (!fileName) return 'unknown';
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['mp4', 'mov', 'avi', 'wmv', 'mkv'].includes(extension)) {
      return 'video';
    } else {
      return 'other';
    }
  };
  
  export default {
    formatThaiDate,
    formatThaiTime,
    formatThaiDateTime,
    formatFileSize,
    formatNumber,
    formatInitials,
    truncateText,
    formatLoginStatus,
    formatFileType,
    getFileTypeFromName
  };