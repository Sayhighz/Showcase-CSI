/**
 * ฟังก์ชันจัดการไฟล์สำหรับแอปพลิเคชัน
 */

/**
 * ตรวจสอบประเภทของไฟล์จาก MIME type
 * @param {string} mimetype - MIME type ของไฟล์
 * @returns {string} - ประเภทของไฟล์ (image, video, pdf, document, other)
 */
export const getFileTypeFromMimetype = (mimetype) => {
    if (!mimetype) return 'unknown';
    
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'spreadsheet';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'presentation';
    
    return 'other';
  };
  
  /**
   * ขนาดไฟล์มากสุดที่อนุญาตให้อัปโหลด (ในไบต์)
   */
  export const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024,    // 5MB
    video: 50 * 1024 * 1024,   // 50MB
    pdf: 10 * 1024 * 1024,     // 10MB
    document: 10 * 1024 * 1024, // 10MB
    default: 10 * 1024 * 1024   // 10MB (สำหรับไฟล์ทั่วไป)
  };
  
  /**
   * ประเภทไฟล์ที่อนุญาตให้อัปโหลด
   */
  export const ALLOWED_FILE_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  };
  
  /**
   * ตรวจสอบว่าไฟล์มีประเภทที่อนุญาตหรือไม่
   * @param {File|Object} file - ไฟล์หรือออบเจกต์ที่มี mimetype
   * @param {Array} allowedTypes - ประเภท MIME ที่อนุญาต
   * @returns {boolean} - true ถ้าประเภทถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isAllowedFileType = (file, allowedTypes = null) => {
    if (!file || !file.type) return false;
    
    // ถ้าไม่ได้ระบุประเภทที่อนุญาต ให้ใช้ทุกประเภทจาก ALLOWED_FILE_TYPES
    const types = allowedTypes || Object.values(ALLOWED_FILE_TYPES).flat();
    
    return types.includes(file.type);
  };
  
  /**
   * ตรวจสอบว่าขนาดไฟล์ไม่เกินขีดจำกัด
   * @param {File|Object} file - ไฟล์หรือออบเจกต์ที่มี size
   * @param {number} maxSize - ขนาดสูงสุดที่อนุญาต (ในไบต์)
   * @returns {boolean} - true ถ้าขนาดไม่เกิน, false ถ้าเกิน
   */
  export const isFileSizeValid = (file, maxSize = null) => {
    if (!file || !file.size) return false;
    
    const fileType = file.type ? getFileTypeFromMimetype(file.type) : 'default';
    const limit = maxSize || FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.default;
    
    return file.size <= limit;
  };
  
  /**
   * แปลงขนาดไฟล์ให้อ่านง่าย (เช่น จาก byte เป็น KB, MB)
   * @param {number} sizeInBytes - ขนาดไฟล์ในไบต์
   * @returns {string} - ขนาดไฟล์ในรูปแบบที่อ่านง่าย
   */
  export const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes === 0) return '0 Bytes';
    if (!sizeInBytes) return 'Unknown';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
    
    return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * ดึงนามสกุลไฟล์จากชื่อไฟล์
   * @param {string} filename - ชื่อไฟล์
   * @returns {string} - นามสกุลไฟล์ (ไม่รวม .)
   */
  export const getFileExtension = (filename) => {
    if (!filename) return '';
    
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };
  
  /**
   * สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
   * @param {string} originalFilename - ชื่อไฟล์ต้นฉบับ
   * @returns {string} - ชื่อไฟล์ที่ไม่ซ้ำกัน
   */
  export const generateUniqueFilename = (originalFilename) => {
    if (!originalFilename) return '';
    
    const extension = getFileExtension(originalFilename);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    return `${timestamp}-${randomStr}.${extension}`;
  };
  
  /**
   * แปลง URL ของวิดีโอจาก YouTube, TikTok ให้เป็น embed URL
   * @param {string} url - URL ของวิดีโอ
   * @returns {string|null} - embed URL หรือ null ถ้าไม่ใช่ URL ที่รองรับ
   */
  export const getVideoEmbedUrl = (url) => {
    if (!url) return null;
  
    // YouTube
    if (url.includes('youtube.com/watch')) {
      return url.replace('watch?v=', 'embed/');
    }
    
    // YouTube (short)
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      // Convert to embed if normal URL
      if (!url.includes('/embed/')) {
        const videoId = url.split('/').pop();
        return `https://www.tiktok.com/embed/${videoId}`;
      }
      return url;
    }
    
    // Facebook
    if (url.includes('facebook.com/watch')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    }

    // Google Drive
    // Supported forms:
    // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // - https://drive.google.com/open?id=FILE_ID
    // - https://drive.google.com/uc?export=download&id=FILE_ID
    if (url.includes('drive.google.com')) {
      try {
        let fileId = null;

        // /file/d/FILE_ID/
        const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (matchFileD && matchFileD[1]) {
          fileId = matchFileD[1];
        }

        // open?id=FILE_ID or uc?export=download&id=FILE_ID
        if (!fileId) {
          const u = new URL(url);
          const idParam = u.searchParams.get('id');
          if (idParam) fileId = idParam;
        }

        if (fileId) {
          // Use preview endpoint for iframe embedding
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }
      } catch (_) {
        // fall through to return original url
      }
    }
    
    // Fallback to original URL
    return url;
  };
  
  /**
   * แปลง Data URL เป็น Blob
   * @param {string} dataUrl - Data URL
   * @returns {Blob} - Blob ของไฟล์
   */
  export const dataURLtoBlob = (dataUrl) => {
    if (!dataUrl) return null;
    
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };
  
  /**
   * แปลง Blob เป็น File
   * @param {Blob} blob - Blob ของไฟล์
   * @param {string} filename - ชื่อไฟล์
   * @returns {File} - ออบเจกต์ File
   */
  export const blobToFile = (blob, filename) => {
    if (!blob || !filename) return null;
    
    return new File([blob], filename, { type: blob.type });
  };
  
  export default {
    getFileTypeFromMimetype,
    FILE_SIZE_LIMITS,
    ALLOWED_FILE_TYPES,
    isAllowedFileType,
    isFileSizeValid,
    formatFileSize,
    getFileExtension,
    generateUniqueFilename,
    getVideoEmbedUrl,
    dataURLtoBlob,
    blobToFile
  };