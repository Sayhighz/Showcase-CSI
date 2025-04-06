// src/utils/fileUtils.js

/**
 * ประเภทไฟล์ที่อนุญาต
 */
export const ALLOWED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    PDF: ['application/pdf'],
    VIDEO: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'],
    DOCUMENT: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    COMPRESSED: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
  };
  
  /**
   * ขนาดไฟล์สูงสุดที่อนุญาต (ในหน่วย bytes)
   */
  export const MAX_FILE_SIZES = {
    IMAGE: 5 * 1024 * 1024, // 5MB
    PDF: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    DOCUMENT: 20 * 1024 * 1024, // 20MB
    EXCEL: 10 * 1024 * 1024, // 10MB
    COMPRESSED: 50 * 1024 * 1024 // 50MB
  };
  
  /**
   * ตรวจสอบว่าไฟล์มีประเภทที่อนุญาตหรือไม่
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @param {Array} allowedTypes - ประเภทไฟล์ที่อนุญาต (default: ทุกประเภทที่อนุญาต)
   * @returns {boolean} - true ถ้าประเภทไฟล์ถูกอนุญาต, false ถ้าไม่ใช่
   */
  export const isAllowedFileType = (file, allowedTypes = null) => {
    if (!file || !file.type) return false;
    
    // ถ้าไม่ระบุประเภทที่อนุญาต ให้ตรวจสอบกับทุกประเภทที่อนุญาต
    if (!allowedTypes) {
      allowedTypes = [
        ...ALLOWED_FILE_TYPES.IMAGE,
        ...ALLOWED_FILE_TYPES.PDF,
        ...ALLOWED_FILE_TYPES.VIDEO,
        ...ALLOWED_FILE_TYPES.DOCUMENT,
        ...ALLOWED_FILE_TYPES.EXCEL,
        ...ALLOWED_FILE_TYPES.COMPRESSED
      ];
    }
    
    return allowedTypes.includes(file.type);
  };
  
  /**
   * ตรวจสอบว่าไฟล์มีขนาดไม่เกินที่กำหนดหรือไม่
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @param {number} maxSize - ขนาดสูงสุดที่อนุญาต (bytes)
   * @returns {boolean} - true ถ้าขนาดไฟล์ไม่เกินที่กำหนด, false ถ้าเกิน
   */
  export const isAllowedFileSize = (file, maxSize) => {
    if (!file) return false;
    
    return file.size <= maxSize;
  };
  
  /**
   * แปลงขนาดไฟล์ให้อยู่ในรูปแบบที่อ่านง่าย (KB, MB, GB)
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
   * ดึงนามสกุลของไฟล์
   * @param {string} filename - ชื่อไฟล์
   * @returns {string} - นามสกุลไฟล์ (ไม่รวม .)
   */
  export const getFileExtension = (filename) => {
    if (!filename) return '';
    
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };
  
  /**
   * ตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นรูปภาพ, false ถ้าไม่ใช่
   */
  export const isImageFile = (file) => {
    if (!file || !file.type) return false;
    
    return ALLOWED_FILE_TYPES.IMAGE.includes(file.type);
  };
  
  /**
   * ตรวจสอบว่าไฟล์เป็น PDF หรือไม่
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็น PDF, false ถ้าไม่ใช่
   */
  export const isPDFFile = (file) => {
    if (!file || !file.type) return false;
    
    return ALLOWED_FILE_TYPES.PDF.includes(file.type);
  };
  
  /**
   * ตรวจสอบว่าไฟล์เป็นวิดีโอหรือไม่
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นวิดีโอ, false ถ้าไม่ใช่
   */
  export const isVideoFile = (file) => {
    if (!file || !file.type) return false;
    
    return ALLOWED_FILE_TYPES.VIDEO.includes(file.type);
  };
  
  /**
   * สร้าง FormData สำหรับการอัปโหลดไฟล์
   * @param {File} file - ไฟล์ที่ต้องการอัปโหลด
   * @param {string} fieldName - ชื่อฟิลด์ (default: 'file')
   * @param {Object} additionalData - ข้อมูลเพิ่มเติมที่ต้องการส่งไปพร้อมกับไฟล์
   * @returns {FormData} - FormData สำหรับการอัปโหลด
   */
  export const createFileFormData = (file, fieldName = 'file', additionalData = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // เพิ่มข้อมูลเพิ่มเติม
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    return formData;
  };
  
  /**
   * สร้าง URL สำหรับการแสดงผลไฟล์
   * @param {File} file - ไฟล์ที่ต้องการสร้าง URL
   * @returns {string} - URL ของไฟล์
   */
  export const createFileObjectURL = (file) => {
    if (!file) return '';
    
    return URL.createObjectURL(file);
  };
  
  /**
   * Revoke URL ของไฟล์เพื่อป้องกันการรั่วไหลของหน่วยความจำ
   * @param {string} url - URL ที่ต้องการ revoke
   */
  export const revokeFileObjectURL = (url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  };
  
  /**
   * แบ่งชื่อไฟล์และนามสกุล
   * @param {string} filename - ชื่อไฟล์
   * @returns {Object} - { name: ชื่อไฟล์, extension: นามสกุล }
   */
  export const splitFileName = (filename) => {
    if (!filename) return { name: '', extension: '' };
    
    const lastDotIndex = filename.lastIndexOf('.');
    
    if (lastDotIndex === -1) {
      return { name: filename, extension: '' };
    }
    
    const name = filename.substring(0, lastDotIndex);
    const extension = filename.substring(lastDotIndex + 1);
    
    return { name, extension };
  };
  
  /**
   * สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
   * @param {string} filename - ชื่อไฟล์
   * @returns {string} - ชื่อไฟล์ที่ไม่ซ้ำกัน
   */
  export const generateUniqueFileName = (filename) => {
    if (!filename) return '';
    
    const { name, extension } = splitFileName(filename);
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    
    return `${name}_${timestamp}_${randomString}.${extension}`;
  };