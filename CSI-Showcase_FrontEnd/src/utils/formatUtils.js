/**
 * ฟังก์ชันจัดรูปแบบข้อมูลสำหรับแอปพลิเคชัน
 */

/**
 * แปลงข้อความให้มีตัวอักษรแรกเป็นตัวพิมพ์ใหญ่
 * @param {string} text - ข้อความที่ต้องการแปลง
 * @returns {string} - ข้อความที่แปลงแล้ว
 */
export const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  /**
   * แปลงข้อความให้มีตัวอักษรแรกของทุกคำเป็นตัวพิมพ์ใหญ่
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
   * แปลงข้อความให้เป็นรูปแบบ slug (สำหรับ URL)
   * @param {string} text - ข้อความที่ต้องการแปลง
   * @returns {string} - slug ที่สร้างจากข้อความ
   */
  export const slugify = (text) => {
    if (!text) return '';
    
    // แปลงเป็นตัวพิมพ์เล็ก แทนที่อักขระพิเศษด้วยช่องว่าง
    const slug = text.toLowerCase()
      .replace(/[^\w\sก-๙]/g, ' ')  // รองรับทั้งภาษาอังกฤษและภาษาไทย
      .trim()
      .replace(/\s+/g, '-');  // แทนที่ช่องว่างด้วย -
    
    return slug;
  };
  
  /**
   * ทำให้ข้อความสั้นลงและเพิ่ม ... ถ้าเกินความยาวที่กำหนด
   * @param {string} text - ข้อความที่ต้องการย่อ
   * @param {number} maxLength - ความยาวสูงสุดที่ต้องการ
   * @returns {string} - ข้อความที่ถูกย่อแล้ว
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.slice(0, maxLength) + '...';
  };
  
  /**
   * แปลงจำนวนให้อยู่ในรูปแบบสกุลเงินบาทไทย
   * @param {number} amount - จำนวนเงิน
   * @param {number} decimals - จำนวนตำแหน่งทศนิยม
   * @returns {string} - จำนวนเงินในรูปแบบที่จัดรูปแบบแล้ว
   */
  export const formatCurrency = (amount, decimals = 2) => {
    if (amount === null || amount === undefined) return '';
    
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  };
  
  /**
   * แปลงจำนวนให้อยู่ในรูปแบบที่อ่านง่าย (เช่น 1K, 1M)
   * @param {number} number - จำนวนที่ต้องการแปลง
   * @returns {string} - จำนวนในรูปแบบที่อ่านง่าย
   */
  export const formatNumber = (number) => {
    if (number === null || number === undefined) return '';
    
    return new Intl.NumberFormat('th-TH').format(number);
  };
  
  /**
   * แปลงจำนวนให้อยู่ในรูปแบบที่กระชับ (เช่น 1K, 1M)
   * @param {number} number - จำนวนที่ต้องการแปลง
   * @returns {string} - จำนวนในรูปแบบที่กระชับ
   */
  export const formatCompactNumber = (number) => {
    if (number === null || number === undefined) return '';
    
    const formatter = new Intl.NumberFormat('en', { notation: 'compact' });
    return formatter.format(number);
  };
  
  /**
   * แปลงชื่อประเภทโปรเจคเป็นชื่อที่แสดงผล
   * @param {string} type - ชื่อประเภทโปรเจค (เช่น 'academic', 'coursework', 'competition')
   * @returns {string} - ชื่อที่แสดงผล
   */
  export const formatProjectType = (type) => {
    if (!type) return '';
    
    const typeMap = {
      'academic': 'บทความวิชาการ',
      'coursework': 'งานในชั้นเรียน',
      'competition': 'การแข่งขัน'
    };
    
    return typeMap[type] || type;
  };
  
  /**
   * แปลงสถานะโปรเจคเป็นชื่อที่แสดงผล
   * @param {string} status - สถานะของโปรเจค (เช่น 'pending', 'approved', 'rejected')
   * @returns {string} - ชื่อที่แสดงผล
   */
  export const formatProjectStatus = (status) => {
    if (!status) return '';
    
    const statusMap = {
      'pending': 'รออนุมัติ',
      'approved': 'อนุมัติแล้ว',
      'rejected': 'ไม่อนุมัติ'
    };
    
    return statusMap[status] || status;
  };
  
  /**
   * แปลงระดับการศึกษาให้อยู่ในรูปแบบที่อ่านง่าย
   * @param {string|number} level - ระดับการศึกษา (เช่น '1', '2', '3', '4')
   * @returns {string} - ระดับการศึกษาในรูปแบบที่อ่านง่าย
   */
  export const formatStudyLevel = (level) => {
    if (!level) return '';
    
    return `ปี ${level}`;
  };
  
  /**
   * แปลงนามสกุลไฟล์เป็นประเภทที่อ่านง่าย
   * @param {string} filename - ชื่อไฟล์
   * @returns {string} - ประเภทไฟล์ที่อ่านง่าย
   */
  export const formatFileType = (filename) => {
    if (!filename) return '';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
      'pdf': 'เอกสาร PDF',
      'doc': 'เอกสาร Word',
      'docx': 'เอกสาร Word',
      'xls': 'เอกสาร Excel',
      'xlsx': 'เอกสาร Excel',
      'ppt': 'พรีเซนเทชัน PowerPoint',
      'pptx': 'พรีเซนเทชัน PowerPoint',
      'jpg': 'รูปภาพ',
      'jpeg': 'รูปภาพ',
      'png': 'รูปภาพ',
      'gif': 'รูปภาพ',
      'mp4': 'วิดีโอ',
      'webm': 'วิดีโอ',
      'mov': 'วิดีโอ'
    };
    
    return typeMap[extension] || `ไฟล์ .${extension}`;
  };
  
  /**
   * แปลงสีในรูปแบบ HEX เป็นรูปแบบ RGBA
   * @param {string} hex - รหัสสีในรูปแบบ HEX (เช่น #FF5E8C)
   * @param {number} alpha - ค่าความโปร่งใส (0-1)
   * @returns {string} - รหัสสีในรูปแบบ RGBA
   */
  export const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return '';
    
    // ลบ # หากมี
    const cleanHex = hex.replace('#', '');
    
    // แปลงเป็น RGB
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  /**
   * แปลงเส้นทาง URL ให้มี / นำหน้าเสมอ
   * @param {string} path - เส้นทาง URL
   * @returns {string} - เส้นทาง URL ที่มี / นำหน้า
   */
  export const formatPath = (path) => {
    if (!path) return '/';
    
    return path.startsWith('/') ? path : `/${path}`;
  };
  
  /**
   * แปลงชื่อเต็มเป็นชื่อย่อ (เช่น John Doe เป็น JD)
   * @param {string} name - ชื่อเต็ม
   * @returns {string} - ชื่อย่อ
   */
  export const getInitials = (name) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  /**
   * แปลงเวลาเป็นรูปแบบ 12 ชั่วโมง (เช่น 13:45 เป็น 1:45 PM)
   * @param {string} time - เวลาในรูปแบบ 24 ชั่วโมง (HH:MM)
   * @returns {string} - เวลาในรูปแบบ 12 ชั่วโมง
   */
  export const formatTime12Hour = (time) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return time;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  /**
   * แปลงแท็กให้เป็นอาร์เรย์
   * @param {string} tags - แท็กที่คั่นด้วยเครื่องหมายจุลภาค
   * @returns {Array} - อาร์เรย์ของแท็ก
   */
  export const parseTags = (tags) => {
    if (!tags) return [];
    
    return tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
  };
  
  export default {
    capitalizeFirstLetter,
    titleCase,
    slugify,
    truncateText,
    formatCurrency,
    formatNumber,
    formatCompactNumber,
    formatProjectType,
    formatProjectStatus,
    formatStudyLevel,
    formatFileType,
    hexToRgba,
    formatPath,
    getInitials,
    formatTime12Hour,
    parseTags
  };