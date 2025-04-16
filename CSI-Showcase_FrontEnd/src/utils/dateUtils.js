/**
 * ฟังก์ชันจัดการวันที่สำหรับแอปพลิเคชัน
 */

/**
 * แปลงวันที่เป็นรูปแบบ ISO string เป็น Date object
 * @param {string} isoString - วันที่ในรูปแบบ ISO string
 * @returns {Date} - Date object
 */
export const parseISODate = (isoString) => {
    if (!isoString) return null;
    return new Date(isoString);
  };
  
  /**
   * แปลงวันที่เป็นรูปแบบ dd/mm/yyyy
   * @param {Date|string} date - วันที่ที่ต้องการแปลง
   * @param {string} separator - ตัวคั่นระหว่างวัน เดือน ปี (default: '/')
   * @returns {string} - วันที่ในรูปแบบ dd/mm/yyyy
   */
  export const formatDate = (date, separator = '/') => {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0
    const year = d.getFullYear();
    
    return `${day}${separator}${month}${separator}${year}`;
  };
  
  /**
   * แปลงวันที่เป็นรูปแบบ dd เดือนเต็ม ปี พ.ศ.
   * @param {Date|string} date - วันที่ที่ต้องการแปลง
   * @param {boolean} useThaiYear - ใช้ปี พ.ศ. หรือไม่
   * @returns {string} - วันที่ในรูปแบบ dd เดือนเต็ม ปี
   */
  export const formatThaiDate = (date, useThaiYear = true) => {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const day = d.getDate();
    const year = useThaiYear ? d.getFullYear() + 543 : d.getFullYear();
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const month = thaiMonths[d.getMonth()];
    
    return `${day} ${month} ${year}`;
  };
  
  /**
   * แปลงวันที่เป็นรูปแบบ yyyy-mm-dd
   * @param {Date|string} date - วันที่ที่ต้องการแปลง
   * @returns {string} - วันที่ในรูปแบบ yyyy-mm-dd
   */
  export const formatISODate = (date) => {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * แปลงวันที่และเวลาเป็นรูปแบบ dd/mm/yyyy hh:mm
   * @param {Date|string} date - วันที่ที่ต้องการแปลง
   * @returns {string} - วันที่และเวลาในรูปแบบ dd/mm/yyyy hh:mm
   */
  export const formatDateTime = (date) => {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  
  /**
   * คำนวณระยะเวลาที่ผ่านมาจากวันที่ที่กำหนด
   * @param {Date|string} date - วันที่ที่ต้องการคำนวณ
   * @returns {string} - ระยะเวลาที่ผ่านมา เช่น "2 นาทีที่แล้ว", "3 ชั่วโมงที่แล้ว"
   */
  export const getTimeAgo = (date) => {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - d) / 1000);
    
    // น้อยกว่า 1 นาที
    if (diffInSeconds < 60) {
      return 'เมื่อสักครู่';
    }
    
    // น้อยกว่า 1 ชั่วโมง
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} นาทีที่แล้ว`;
    }
    
    // น้อยกว่า 1 วัน
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    }
    
    // น้อยกว่า 1 เดือน
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} วันที่แล้ว`;
    }
    
    // น้อยกว่า 1 ปี
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} เดือนที่แล้ว`;
    }
    
    // มากกว่า 1 ปี
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ปีที่แล้ว`;
  };
  
  /**
   * คำนวณอายุจากวันเกิด
   * @param {Date|string} birthDate - วันเกิด
   * @returns {number} - อายุ
   */
  export const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    
    const d = birthDate instanceof Date ? birthDate : new Date(birthDate);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(d.getTime())) {
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    
    // ถ้าเดือนปัจจุบันน้อยกว่าเดือนเกิด หรือเดือนเดียวกันแต่วันปัจจุบันน้อยกว่าวันเกิด
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    
    return age;
  };
  
  /**
   * ตรวจสอบว่าวันที่อยู่ในช่วงที่กำหนดหรือไม่
   * @param {Date|string} date - วันที่ที่ต้องการตรวจสอบ
   * @param {Date|string} startDate - วันที่เริ่มต้น
   * @param {Date|string} endDate - วันที่สิ้นสุด
   * @returns {boolean} - true ถ้าอยู่ในช่วง, false ถ้าไม่อยู่ในช่วง
   */
  export const isDateInRange = (date, startDate, endDate) => {
    if (!date || !startDate || !endDate) return false;
    
    const d = date instanceof Date ? date : new Date(date);
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(d.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }
    
    return d >= start && d <= end;
  };
  
  export default {
    parseISODate,
    formatDate,
    formatThaiDate,
    formatISODate,
    formatDateTime,
    getTimeAgo,
    calculateAge,
    isDateInRange
  };