// src/utils/dateUtils.js

/**
 * แปลงวันที่ให้อยู่ในรูปแบบภาษาไทย
 * @param {string|Date} date - วันที่ที่ต้องการแปลง
 * @param {Object} options - ตัวเลือกการจัดรูปแบบ
 * @returns {string} - วันที่ในรูปแบบภาษาไทย
 */
export const formatThaiDate = (date, options = {}) => {
    if (!date) return 'ไม่ระบุ';
    
    try {
      // แปลงเป็น Date object ถ้า date เป็น string
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // ตรวจสอบว่า dateObj เป็น valid Date
      if (isNaN(dateObj.getTime())) {
        return 'วันที่ไม่ถูกต้อง';
      }
      
      // แยกตัวเลือกเป็นตัวเลือกสำหรับวันที่และเวลา
      const { dateStyle, timeStyle, ...otherOptions } = options;
      
      // ถ้ามีทั้ง dateStyle และ timeStyle
      if (dateStyle && timeStyle) {
        return dateObj.toLocaleString('th-TH', { dateStyle, timeStyle });
      }
      
      // ถ้ามีแค่ timeStyle
      if (timeStyle) {
        const formattedDate = dateObj.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          ...otherOptions
        });
        const formattedTime = dateObj.toLocaleTimeString('th-TH', { timeStyle });
        return `${formattedDate} ${formattedTime}`;
      }
      
      // ถ้ามีแค่ dateStyle
      if (dateStyle) {
        return dateObj.toLocaleDateString('th-TH', { dateStyle });
      }
      
      // กรณีปกติ
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...otherOptions
      };
      
      return dateObj.toLocaleDateString('th-TH', defaultOptions);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'วันที่ไม่ถูกต้อง';
    }
  };
  
  /**
   * แปลงวันที่ให้อยู่ในรูปแบบ ISO string (YYYY-MM-DD)
   * @param {Date} date - วันที่ที่ต้องการแปลง
   * @returns {string} - วันที่ในรูปแบบ ISO string
   */
  export const formatISODate = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting ISO date:', error);
      return '';
    }
  };
  
  /**
   * แปลงชื่อเดือนเป็นภาษาไทย
   * @param {number} month - เลขเดือน (0-11)
   * @param {boolean} abbreviated - true ถ้าต้องการชื่อย่อ
   * @returns {string} - ชื่อเดือนภาษาไทย
   */
  export const getThaiMonth = (month, abbreviated = false) => {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const thaiMonthsAbbr = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    if (month < 0 || month > 11) {
      return '';
    }
    
    return abbreviated ? thaiMonthsAbbr[month] : thaiMonths[month];
  };
  
  /**
   * แปลงปี ค.ศ. เป็น พ.ศ.
   * @param {number} year - ปี ค.ศ.
   * @returns {number} - ปี พ.ศ.
   */
  export const toBuddhistYear = (year) => {
    if (!year || isNaN(parseInt(year))) {
      return '';
    }
    return parseInt(year) + 543;
  };
  
  /**
   * แปลงปี พ.ศ. เป็น ค.ศ.
   * @param {number} year - ปี พ.ศ.
   * @returns {number} - ปี ค.ศ.
   */
  export const toChristianYear = (year) => {
    if (!year || isNaN(parseInt(year))) {
      return '';
    }
    return parseInt(year) - 543;
  };
  
  /**
   * คำนวณความแตกต่างระหว่างวันที่ (วัน)
   * @param {Date|string} date1 - วันที่แรก
   * @param {Date|string} date2 - วันที่สอง (ถ้าไม่ระบุจะใช้วันที่ปัจจุบัน)
   * @returns {number} - จำนวนวันที่แตกต่าง
   */
  export const getDaysDifference = (date1, date2 = new Date()) => {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      // ตรวจสอบว่าวันที่ถูกต้อง
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return null;
      }
      
      // คำนวณความแตกต่าง
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Error calculating days difference:', error);
      return null;
    }
  };
  
  /**
   * ตรวจสอบว่าวันที่หมดอายุหรือไม่
   * @param {Date|string} expiryDate - วันหมดอายุ
   * @returns {boolean} - true ถ้าหมดอายุแล้ว, false ถ้ายังไม่หมดอายุ
   */
  export const isExpired = (expiryDate) => {
    try {
      const expiry = new Date(expiryDate);
      const now = new Date();
      
      // ตรวจสอบว่าวันที่ถูกต้อง
      if (isNaN(expiry.getTime())) {
        return true; // ถ้าวันที่ไม่ถูกต้อง ให้ถือว่าหมดอายุแล้ว
      }
      
      return now > expiry;
    } catch (error) {
      console.error('Error checking expiry:', error);
      return true; // ถ้าเกิดข้อผิดพลาด ให้ถือว่าหมดอายุแล้ว
    }
  };
  
  /**
   * คำนวณอายุจากวันเกิด
   * @param {Date|string} birthDate - วันเกิด
   * @returns {number|null} - อายุ หรือ null ถ้าวันที่ไม่ถูกต้อง
   */
  export const calculateAge = (birthDate) => {
    try {
      const birth = new Date(birthDate);
      const now = new Date();
      
      // ตรวจสอบว่าวันที่ถูกต้อง
      if (isNaN(birth.getTime())) {
        return null;
      }
      
      let age = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      
      // ถ้ายังไม่ถึงวันเกิดในปีนี้ ลดอายุลง 1 ปี
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };
  
  /**
   * แปลงเวลาให้อยู่ในรูปแบบ 12 ชั่วโมง
   * @param {Date|string} time - เวลาที่ต้องการแปลง
   * @returns {string} - เวลาในรูปแบบ 12 ชั่วโมง (เช่น 02:30 PM)
   */
  export const format12HourTime = (time) => {
    try {
      const date = typeof time === 'string' ? new Date(time) : time;
      
      // ตรวจสอบว่าวันที่ถูกต้อง
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting 12-hour time:', error);
      return '';
    }
  };
  
  /**
   * สร้างวันที่จากปี เดือน วัน ที่เป็นภาษาไทย
   * @param {number} day - วัน
   * @param {number} month - เดือน (1-12)
   * @param {number} year - ปี (พ.ศ.)
   * @returns {Date|null} - Date object หรือ null ถ้าข้อมูลไม่ถูกต้อง
   */
  export const createDateFromThaiDate = (day, month, year) => {
    try {
      // แปลงปี พ.ศ. เป็น ค.ศ.
      const christianYear = year - 543;
      
      // เดือนใน JavaScript เริ่มจาก 0-11
      const jsMonth = month - 1;
      
      const date = new Date(christianYear, jsMonth, day);
      
      // ตรวจสอบว่าวันที่ถูกต้อง
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return date;
    } catch (error) {
      console.error('Error creating date from Thai date:', error);
      return null;
    }
  };