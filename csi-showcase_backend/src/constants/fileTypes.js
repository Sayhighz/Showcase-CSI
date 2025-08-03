// constants/fileTypes.js

/**
 * ประเภทไฟล์ที่อนุญาตในระบบ
 */
const ALLOWED_FILE_TYPES = {
  // ประเภทรูปภาพ
  IMAGE: {
    MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    DESCRIPTION: 'รูปภาพ (JPG, PNG, GIF, WEBP)'
  },
  
  // ประเภทเอกสาร
  DOCUMENT: {
    MIME_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    EXTENSIONS: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
    MAX_SIZE: 20 * 1024 * 1024, // 20MB
    DESCRIPTION: 'เอกสาร (PDF, DOC, DOCX, PPT, PPTX)'
  },
  
  // ประเภทวิดีโอ
  VIDEO: {
    MIME_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
    EXTENSIONS: ['.mp4', '.webm', '.mov'],
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    DESCRIPTION: 'วิดีโอ (MP4, WEBM, MOV)'
  },
  
  // ประเภทรูปโปรไฟล์
  PROFILE_IMAGE: {
    MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif'],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    DESCRIPTION: 'รูปโปรไฟล์ (JPG, PNG, GIF)'
  },
  
  // ประเภทไฟล์อื่นๆ
  OTHER: {
    MIME_TYPES: ['application/zip', 'application/x-rar-compressed', 'application/octet-stream'],
    EXTENSIONS: ['.zip', '.rar'],
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    DESCRIPTION: 'ไฟล์อื่นๆ (ZIP, RAR)'
  }
};

/**
 * ตรวจสอบว่าไฟล์เป็นประเภทที่อนุญาตหรือไม่
 * @param {string} fileName - ชื่อไฟล์
 * @param {string} mimeType - MIME type ของไฟล์
 * @param {string} category - หมวดหมู่ของไฟล์ (IMAGE, DOCUMENT, VIDEO, PROFILE_IMAGE, OTHER)
 * @returns {boolean} - true ถ้าเป็นประเภทที่อนุญาต, false ถ้าไม่ใช่
 */
const isAllowedFileType = (fileName, mimeType, category) => {
  if (!ALLOWED_FILE_TYPES[category]) {
    return false;
  }
  
  const allowedMimeTypes = ALLOWED_FILE_TYPES[category].MIME_TYPES;
  
  // ตรวจสอบ MIME type
  if (!allowedMimeTypes.includes(mimeType)) {
    return false;
  }
  
  // ตรวจสอบนามสกุลไฟล์
  const fileExt = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  const allowedExtensions = ALLOWED_FILE_TYPES[category].EXTENSIONS;
  
  return allowedExtensions.includes(fileExt);
};

/**
 * ตรวจสอบขนาดไฟล์
 * @param {number} fileSize - ขนาดไฟล์ (bytes)
 * @param {string} category - หมวดหมู่ของไฟล์ (IMAGE, DOCUMENT, VIDEO, PROFILE_IMAGE, OTHER)
 * @returns {boolean} - true ถ้าขนาดไฟล์อยู่ในเกณฑ์ที่กำหนด, false ถ้าเกินเกณฑ์
 */
const isAllowedFileSize = (fileSize, category) => {
  if (!ALLOWED_FILE_TYPES[category]) {
    return false;
  }
  
  return fileSize <= ALLOWED_FILE_TYPES[category].MAX_SIZE;
};

/**
 * แปลงขนาดไฟล์เป็นหน่วยที่เหมาะสม
 * @param {number} bytes - ขนาดไฟล์ในหน่วย bytes
 * @returns {string} - ขนาดไฟล์พร้อมหน่วย
 */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

/**
 * ดึงประเภทไฟล์จาก MIME type
 * @param {string} mimeType - MIME type ของไฟล์
 * @returns {string} - ประเภทไฟล์ (image, document, video, other)
 */
const getFileTypeFromMimeType = (mimeType) => {
  if (ALLOWED_FILE_TYPES.IMAGE.MIME_TYPES.includes(mimeType)) return 'image';
  if (ALLOWED_FILE_TYPES.DOCUMENT.MIME_TYPES.includes(mimeType)) return 'document';
  if (ALLOWED_FILE_TYPES.VIDEO.MIME_TYPES.includes(mimeType)) return 'video';
  return 'other';
};

/**
 * ปรับแต่งชื่อไฟล์ให้ปลอดภัย
 * @param {string} fileName - ชื่อไฟล์ที่ต้องการปรับแต่ง
 * @returns {string} - ชื่อไฟล์ที่ปลอดภัย
 */
const sanitizeFileName = (fileName) => {
  // ลบตัวอักษรพิเศษที่อาจทำให้เกิดปัญหาในระบบไฟล์
  return fileName
    .replace(/[^\w.-]/g, '_')
    .replace(/__+/g, '_')
    .toLowerCase();
};

// Export functions และ constants
module.exports = {
  ALLOWED_FILE_TYPES,
  isAllowedFileType,
  isAllowedFileSize,
  formatFileSize,
  getFileTypeFromMimeType,
  sanitizeFileName
};