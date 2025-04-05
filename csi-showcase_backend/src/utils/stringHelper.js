// utils/stringHelper.js

/**
 * แปลงข้อความให้เป็นรูปแบบที่ใช้ใน URL (slug)
 * @param {string} text - ข้อความที่ต้องการแปลง
 * @returns {string} - ข้อความในรูปแบบ slug
 */
export const slugify = (text) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };
  
  /**
   * ตัดข้อความให้เหลือตามความยาวที่กำหนดและเพิ่ม ... ถ้าข้อความถูกตัด
   * @param {string} text - ข้อความที่ต้องการตัด
   * @param {number} length - ความยาวสูงสุดที่ต้องการ
   * @returns {string} - ข้อความที่ถูกตัด
   */
  export const truncateText = (text, length = 100) => {
    if (!text || text.length <= length) {
      return text;
    }
    
    return text.substring(0, length) + '...';
  };
  
  /**
   * แปลงข้อความให้มีตัวอักษรตัวแรกเป็นตัวพิมพ์ใหญ่
   * @param {string} text - ข้อความที่ต้องการแปลง
   * @returns {string} - ข้อความที่ถูกแปลงแล้ว
   */
  export const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  /**
   * แปลงข้อความให้เป็นตัวพิมพ์ใหญ่ทุกตัวอักษรตัวแรกของแต่ละคำ
   * @param {string} text - ข้อความที่ต้องการแปลง
   * @returns {string} - ข้อความที่ถูกแปลงแล้ว
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
   * แปลงข้อความให้เป็นรูปแบบตัวแปรแบบ camelCase
   * @param {string} text - ข้อความที่ต้องการแปลง
   * @returns {string} - ข้อความที่ถูกแปลงแล้ว
   */
  export const toCamelCase = (text) => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '');
  };
  
  /**
   * แปลงข้อความให้เป็นรูปแบบตัวแปรแบบ snake_case
   * @param {string} text - ข้อความที่ต้องการแปลง
   * @returns {string} - ข้อความที่ถูกแปลงแล้ว
   */
  export const toSnakeCase = (text) => {
    return text
      .replace(/\s+/g, '_')
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/_+/g, '_');
  };
  
  /**
   * สร้าง UUID แบบ v4
   * @returns {string} - UUID
   */
  export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  /**
   * แปลงจำนวนเป็นรูปแบบที่มีเครื่องหมายคั่นพัน
   * @param {number} number - จำนวนที่ต้องการแปลง
   * @returns {string} - จำนวนในรูปแบบที่มีเครื่องหมายคั่นพัน
   */
  export const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };