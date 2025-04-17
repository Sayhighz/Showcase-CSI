/**
 * Service สำหรับการจัดการการอัพโหลด
 * ให้บริการฟังก์ชันเกี่ยวกับการอัพโหลดไฟล์, รูปภาพ, วิดีโอ เป็นต้น
 */
import { post, del, get, uploadFile } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { message } from 'antd';
import { formatFileSize, isAllowedFileType, isFileSizeValid } from '../utils/fileUtils';

/**
 * อัพโหลดรูปโปรไฟล์
 * @param {File} file - ไฟล์รูปภาพโปรไฟล์
 * @returns {Promise} - ผลลัพธ์จากการอัพโหลดรูปโปรไฟล์
 */
export const uploadProfileImage = async (file) => {
  try {
    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!isAllowedFileType(file, allowedTypes)) {
      message.error('ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WEBP)');
      return null;
    }
    
    // ตรวจสอบขนาดไฟล์
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!isFileSizeValid(file, maxSize)) {
      message.error(`ขนาดไฟล์เกินกำหนด (สูงสุด ${formatFileSize(maxSize)})`);
      return null;
    }
    
    // สร้าง FormData
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const response = await uploadFile(API_ENDPOINTS.UPLOAD.PROFILE_IMAGE, formData);
    
    if (response && response.success) {
      message.success('อัพโหลดรูปโปรไฟล์สำเร็จ');
      return response.data;
    } else {
      throw new Error('ไม่สามารถอัพโหลดรูปโปรไฟล์ได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปโปรไฟล์');
    console.error('เกิดข้อผิดพลาดในการอัพโหลดรูปโปรไฟล์:', error);
    throw error;
  }
};

/**
 * อัพโหลดไฟล์รูปภาพ
 * @param {File[]} files - ไฟล์รูปภาพที่ต้องการอัพโหลด
 * @returns {Promise} - ผลลัพธ์จากการอัพโหลดรูปภาพ
 */
export const uploadImages = async (files) => {
  try {
    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !isAllowedFileType(file, allowedTypes));
    
    if (invalidFiles.length > 0) {
      message.error('ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WEBP)');
      return null;
    }
    
    // ตรวจสอบขนาดไฟล์
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => !isFileSizeValid(file, maxSize));
    
    if (oversizedFiles.length > 0) {
      message.error(`ขนาดไฟล์เกินกำหนด (สูงสุด ${formatFileSize(maxSize)})`);
      return null;
    }
    
    // สร้าง FormData
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await uploadFile(API_ENDPOINTS.UPLOAD.IMAGES, formData);
    
    if (response && response.success) {
      message.success('อัพโหลดรูปภาพสำเร็จ');
      return response.data;
    } else {
      throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
    console.error('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ:', error);
    throw error;
  }
};

/**
 * อัพโหลดไฟล์วิดีโอ
 * @param {File} file - ไฟล์วิดีโอที่ต้องการอัพโหลด
 * @returns {Promise} - ผลลัพธ์จากการอัพโหลดวิดีโอ
 */
export const uploadVideo = async (file) => {
  try {
    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!isAllowedFileType(file, allowedTypes)) {
      message.error('ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะไฟล์วิดีโอ (MP4, WEBM, MOV)');
      return null;
    }
    
    // ตรวจสอบขนาดไฟล์
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (!isFileSizeValid(file, maxSize)) {
      message.error(`ขนาดไฟล์เกินกำหนด (สูงสุด ${formatFileSize(maxSize)})`);
      return null;
    }
    
    // สร้าง FormData
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await uploadFile(API_ENDPOINTS.UPLOAD.VIDEO, formData);
    
    if (response && response.success) {
      message.success('อัพโหลดวิดีโอสำเร็จ');
      return response.data;
    } else {
      throw new Error('ไม่สามารถอัพโหลดวิดีโอได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลดวิดีโอ');
    console.error('เกิดข้อผิดพลาดในการอัพโหลดวิดีโอ:', error);
    throw error;
  }
};

/**
 * อัพโหลดไฟล์เอกสาร
 * @param {File[]} files - ไฟล์เอกสารที่ต้องการอัพโหลด
 * @returns {Promise} - ผลลัพธ์จากการอัพโหลดเอกสาร
 */
export const uploadDocuments = async (files) => {
  try {
    // ตรวจสอบประเภทไฟล์
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    const invalidFiles = files.filter(file => !isAllowedFileType(file, allowedTypes));
    
    if (invalidFiles.length > 0) {
      message.error('ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะไฟล์เอกสาร (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)');
      return null;
    }
    
    // ตรวจสอบขนาดไฟล์
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => !isFileSizeValid(file, maxSize));
    
    if (oversizedFiles.length > 0) {
      message.error(`ขนาดไฟล์เกินกำหนด (สูงสุด ${formatFileSize(maxSize)})`);
      return null;
    }
    
    // สร้าง FormData
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });
    
    const response = await uploadFile(API_ENDPOINTS.UPLOAD.DOCUMENTS, formData);
    
    if (response && response.success) {
      message.success('อัพโหลดเอกสารสำเร็จ');
      return response.data;
    } else {
      throw new Error('ไม่สามารถอัพโหลดเอกสารได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลดเอกสาร');
    console.error('เกิดข้อผิดพลาดในการอัพโหลดเอกสาร:', error);
    throw error;
  }
};

/**
 * อัพโหลดไฟล์ทั่วไป
 * @param {File[]} files - ไฟล์ที่ต้องการอัพโหลด
 * @returns {Promise} - ผลลัพธ์จากการอัพโหลดไฟล์
 */
export const uploadFiles = async (files) => {
  try {
    // ตรวจสอบขนาดไฟล์
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => !isFileSizeValid(file, maxSize));
    
    if (oversizedFiles.length > 0) {
      message.error(`ขนาดไฟล์เกินกำหนด (สูงสุด ${formatFileSize(maxSize)})`);
      return null;
    }
    
    // สร้าง FormData
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await uploadFile(API_ENDPOINTS.UPLOAD.FILES, formData);
    
    if (response && response.success) {
      message.success('อัพโหลดไฟล์สำเร็จ');
      return response.data;
    } else {
      throw new Error('ไม่สามารถอัพโหลดไฟล์ได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
    console.error('เกิดข้อผิดพลาดในการอัพโหลดไฟล์:', error);
    throw error;
  }
};

/**
 * อัพโหลดไฟล์หลายประเภทในคราวเดียว
 * @param {Object} files - ไฟล์แยกตามประเภท
 * @param {File[]} files.images - ไฟล์รูปภาพ
 * @param {File} files.video - ไฟล์วิดีโอ
 * @param {File[]} files.documents - ไฟล์เอกสาร
 * @returns {Promise} - ผลลัพธ์จากการอัพโหลดไฟล์
 */
export const uploadMultiple = async (files) => {
  try {
    // ตรวจสอบว่ามีไฟล์ที่ต้องการอัพโหลดหรือไม่
    if (!files || Object.keys(files).length === 0) {
      message.error('ไม่พบไฟล์ที่ต้องการอัพโหลด');
      return null;
    }
    
    // สร้าง FormData
    const formData = new FormData();
    
    // เพิ่มไฟล์รูปภาพ
    if (files.images && files.images.length > 0) {
      files.images.forEach(file => {
        formData.append('images', file);
      });
    }
    
    // เพิ่มไฟล์วิดีโอ
    if (files.video) {
      formData.append('video', files.video);
    }
    
    // เพิ่มไฟล์เอกสาร
    if (files.documents && files.documents.length > 0) {
      files.documents.forEach(file => {
        formData.append('documents', file);
      });
    }
    
    const response = await uploadFile(API_ENDPOINTS.UPLOAD.MULTIPLE, formData);
    
    if (response && response.success) {
      message.success('อัพโหลดไฟล์สำเร็จ');
      return response.data;
    } else {
      throw new Error('ไม่สามารถอัพโหลดไฟล์ได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
    console.error('เกิดข้อผิดพลาดในการอัพโหลดไฟล์:', error);
    throw error;
  }
};

/**
 * ลบไฟล์ที่อัพโหลดไว้
 * @param {string} filePath - พาธของไฟล์ที่ต้องการลบ
 * @param {string} fileId - ID ของไฟล์ในฐานข้อมูล (ถ้ามี)
 * @returns {Promise} - ผลลัพธ์จากการลบไฟล์
 */
export const deleteFile = async (filePath, fileId = null) => {
  try {
    const data = {
      filePath,
    };
    
    // เพิ่ม file_id ถ้ามี
    if (fileId) {
      data.file_id = fileId;
    }
    
    const response = await del(API_ENDPOINTS.UPLOAD.DELETE, { data });
    
    if (response && response.success) {
      message.success('ลบไฟล์สำเร็จ');
      return response.data;
    } else {
      throw new Error('ไม่สามารถลบไฟล์ได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการลบไฟล์');
    console.error('เกิดข้อผิดพลาดในการลบไฟล์:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลสถานะพื้นที่จัดเก็บไฟล์
 * @returns {Promise} - ข้อมูลสถานะพื้นที่จัดเก็บไฟล์
 */
export const getStorageStatus = async () => {
  try {
    const response = await get(API_ENDPOINTS.UPLOAD.STORAGE_STATUS);
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถดึงข้อมูลสถานะพื้นที่จัดเก็บไฟล์ได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสถานะพื้นที่จัดเก็บไฟล์:', error);
    throw error;
  }
};

/**
 * ตรวจสอบไฟล์ก่อนอัพโหลด
 * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
 * @param {Array} allowedTypes - ประเภทไฟล์ที่อนุญาต
 * @param {number} maxSize - ขนาดไฟล์สูงสุดที่อนุญาต (ในไบต์)
 * @returns {boolean} - ผลการตรวจสอบ
 */
export const validateFile = (file, allowedTypes, maxSize) => {
  // ตรวจสอบประเภทไฟล์
  if (!isAllowedFileType(file, allowedTypes)) {
    message.error(`ประเภทไฟล์ไม่ถูกต้อง (${file.name})`);
    return false;
  }
  
  // ตรวจสอบขนาดไฟล์
  if (!isFileSizeValid(file, maxSize)) {
    message.error(`ขนาดไฟล์เกินกำหนด (${file.name}) สูงสุด ${formatFileSize(maxSize)}`);
    return false;
  }
  
  return true;
};

export default {
  uploadProfileImage,
  uploadImages,
  uploadVideo,
  uploadDocuments,
  uploadFiles,
  uploadMultiple,
  deleteFile,
  getStorageStatus,
  validateFile,
};