/**
 * Custom hook สำหรับจัดการการอัพโหลด
 * จัดการ state และฟังก์ชันที่เกี่ยวข้องกับการอัพโหลดไฟล์, รูปภาพ, วิดีโอ เป็นต้น
 */
import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';

// นำเข้า services ที่เกี่ยวข้อง
import {
  uploadProfileImage,
  uploadImages,
  uploadVideo,
  uploadDocuments,
  uploadFiles,
  uploadMultiple,
  deleteFile,
  getStorageStatus,
  validateFile
} from '../services/uploadService';

// นำเข้า utilities สำหรับการจัดการไฟล์
import {
  formatFileSize,
  isAllowedFileType,
  isFileSizeValid,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS
} from '../utils/fileUtils';

/**
 * Custom hook สำหรับจัดการการอัพโหลด
 * @returns {Object} - state และฟังก์ชันสำหรับจัดการการอัพโหลด
 */
const useUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [storageStatus, setStorageStatus] = useState({
    used: 0,
    total: 0,
    percentage: 0
  });

  /**
   * ดึงข้อมูลสถานะพื้นที่จัดเก็บไฟล์
   */
  const fetchStorageStatus = useCallback(async () => {
    try {
      const response = await getStorageStatus();
      
      if (response) {
        setStorageStatus({
          used: response.used || 0,
          total: response.total || 0,
          percentage: response.percentage || 0
        });
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสถานะพื้นที่จัดเก็บไฟล์:', err);
    }
  }, []);

  /**
   * ตรวจสอบไฟล์ก่อนอัพโหลด
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @param {Array} allowedTypes - ประเภทไฟล์ที่อนุญาต
   * @param {number} maxSize - ขนาดไฟล์สูงสุดที่อนุญาต (ในไบต์)
   * @returns {boolean} - ผลการตรวจสอบไฟล์
   */
  const validateUploadFile = useCallback((file, allowedTypes, maxSize) => {
    // ตรวจสอบประเภทไฟล์
    if (allowedTypes && !isAllowedFileType(file, allowedTypes)) {
      message.error(`ประเภทไฟล์ไม่ถูกต้อง (${file.name})`);
      return false;
    }
    
    // ตรวจสอบขนาดไฟล์
    if (maxSize && !isFileSizeValid(file, maxSize)) {
      message.error(`ขนาดไฟล์เกินกำหนด (${file.name}) สูงสุด ${formatFileSize(maxSize)}`);
      return false;
    }
    
    return true;
  }, []);

  /**
   * อัพโหลดรูปโปรไฟล์
   * @param {File} file - ไฟล์รูปภาพโปรไฟล์
   * @returns {Promise} - ผลลัพธ์จากการอัพโหลดรูปโปรไฟล์
   */
  const handleUploadProfileImage = useCallback(async (file) => {
    if (!file) {
      message.error('กรุณาเลือกรูปภาพโปรไฟล์');
      return null;
    }
    
    // ตรวจสอบไฟล์
    if (!validateUploadFile(file, ALLOWED_FILE_TYPES.image, FILE_SIZE_LIMITS.image)) {
      return null;
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // จำลองความก้าวหน้าของการอัพโหลด
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      const response = await uploadProfileImage(file);
      
      // หยุดการจำลองความก้าวหน้า
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response) {
        setUploadedFiles([response]);
        message.success('อัพโหลดรูปโปรไฟล์สำเร็จ');
        
        // อัปเดตข้อมูลการใช้พื้นที่จัดเก็บ
        fetchStorageStatus();
        
        return response;
      } else {
        throw new Error('ไม่สามารถอัพโหลดรูปโปรไฟล์ได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปโปรไฟล์');
      message.error(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปโปรไฟล์');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateUploadFile, fetchStorageStatus]);

  /**
   * อัพโหลดรูปภาพ
   * @param {File[]} files - ไฟล์รูปภาพที่ต้องการอัพโหลด
   * @returns {Promise} - ผลลัพธ์จากการอัพโหลดรูปภาพ
   */
  const handleUploadImages = useCallback(async (files) => {
    if (!files || files.length === 0) {
      message.error('กรุณาเลือกรูปภาพ');
      return null;
    }
    
    // ตรวจสอบไฟล์ทั้งหมด
    const invalidFiles = Array.from(files).filter(file => 
      !validateUploadFile(file, ALLOWED_FILE_TYPES.image, FILE_SIZE_LIMITS.image)
    );
    
    if (invalidFiles.length > 0) {
      return null;
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // จำลองความก้าวหน้าของการอัพโหลด
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      const response = await uploadImages(files);
      
      // หยุดการจำลองความก้าวหน้า
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response) {
        setUploadedFiles(response);
        message.success('อัพโหลดรูปภาพสำเร็จ');
        
        // อัปเดตข้อมูลการใช้พื้นที่จัดเก็บ
        fetchStorageStatus();
        
        return response;
      } else {
        throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
      message.error(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateUploadFile, fetchStorageStatus]);

  /**
   * อัพโหลดวิดีโอ
   * @param {File} file - ไฟล์วิดีโอที่ต้องการอัพโหลด
   * @returns {Promise} - ผลลัพธ์จากการอัพโหลดวิดีโอ
   */
  const handleUploadVideo = useCallback(async (file) => {
    if (!file) {
      message.error('กรุณาเลือกวิดีโอ');
      return null;
    }
    
    // ตรวจสอบไฟล์
    if (!validateUploadFile(file, ALLOWED_FILE_TYPES.video, FILE_SIZE_LIMITS.video)) {
      return null;
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // จำลองความก้าวหน้าของการอัพโหลด
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 2; // วิดีโอมีขนาดใหญ่กว่า ความก้าวหน้าจะช้ากว่า
        });
      }, 200);
      
      const response = await uploadVideo(file);
      
      // หยุดการจำลองความก้าวหน้า
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response) {
        setUploadedFiles([response]);
        message.success('อัพโหลดวิดีโอสำเร็จ');
        
        // อัปเดตข้อมูลการใช้พื้นที่จัดเก็บ
        fetchStorageStatus();
        
        return response;
      } else {
        throw new Error('ไม่สามารถอัพโหลดวิดีโอได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดวิดีโอ');
      message.error(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดวิดีโอ');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateUploadFile, fetchStorageStatus]);

  /**
   * อัพโหลดเอกสาร
   * @param {File[]} files - ไฟล์เอกสารที่ต้องการอัพโหลด
   * @returns {Promise} - ผลลัพธ์จากการอัพโหลดเอกสาร
   */
  const handleUploadDocuments = useCallback(async (files) => {
    if (!files || files.length === 0) {
      message.error('กรุณาเลือกเอกสาร');
      return null;
    }
    
    // ตรวจสอบไฟล์ทั้งหมด
    const invalidFiles = Array.from(files).filter(file => 
      !validateUploadFile(file, ALLOWED_FILE_TYPES.document, FILE_SIZE_LIMITS.document)
    );
    
    if (invalidFiles.length > 0) {
      return null;
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // จำลองความก้าวหน้าของการอัพโหลด
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 150);
      
      const response = await uploadDocuments(files);
      
      // หยุดการจำลองความก้าวหน้า
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response) {
        setUploadedFiles(response);
        message.success('อัพโหลดเอกสารสำเร็จ');
        
        // อัปเดตข้อมูลการใช้พื้นที่จัดเก็บ
        fetchStorageStatus();
        
        return response;
      } else {
        throw new Error('ไม่สามารถอัพโหลดเอกสารได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดเอกสาร');
      message.error(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดเอกสาร');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateUploadFile, fetchStorageStatus]);

  /**
   * อัพโหลดไฟล์หลายประเภทในคราวเดียว
   * @param {Object} files - ไฟล์แยกตามประเภท
   * @returns {Promise} - ผลลัพธ์จากการอัพโหลดไฟล์
   */
  const handleUploadMultiple = useCallback(async (files) => {
    if (!files || Object.keys(files).length === 0) {
      message.error('กรุณาเลือกไฟล์ที่ต้องการอัพโหลด');
      return null;
    }
    
    // ตรวจสอบไฟล์รูปภาพ
    if (files.images && files.images.length > 0) {
      const invalidImages = Array.from(files.images).filter(file => 
        !validateUploadFile(file, ALLOWED_FILE_TYPES.image, FILE_SIZE_LIMITS.image)
      );
      
      if (invalidImages.length > 0) {
        return null;
      }
    }
    
    // ตรวจสอบไฟล์วิดีโอ
    if (files.video) {
      if (!validateUploadFile(files.video, ALLOWED_FILE_TYPES.video, FILE_SIZE_LIMITS.video)) {
        return null;
      }
    }
    
    // ตรวจสอบไฟล์เอกสาร
    if (files.documents && files.documents.length > 0) {
      const invalidDocs = Array.from(files.documents).filter(file => 
        !validateUploadFile(file, ALLOWED_FILE_TYPES.document, FILE_SIZE_LIMITS.document)
      );
      
      if (invalidDocs.length > 0) {
        return null;
      }
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // จำลองความก้าวหน้าของการอัพโหลด
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 3;
        });
      }, 150);
      
      const response = await uploadMultiple(files);
      
      // หยุดการจำลองความก้าวหน้า
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response) {
        setUploadedFiles(response);
        message.success('อัพโหลดไฟล์สำเร็จ');
        
        // อัปเดตข้อมูลการใช้พื้นที่จัดเก็บ
        fetchStorageStatus();
        
        return response;
      } else {
        throw new Error('ไม่สามารถอัพโหลดไฟล์ได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
      message.error(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateUploadFile, fetchStorageStatus]);

  /**
   * ลบไฟล์ที่อัพโหลดไว้
   * @param {string} filePath - พาธของไฟล์ที่ต้องการลบ
   * @param {string} fileId - ID ของไฟล์ในฐานข้อมูล (ถ้ามี)
   * @returns {Promise} - ผลลัพธ์จากการลบไฟล์
   */
  const handleDeleteFile = useCallback(async (filePath, fileId = null) => {
    if (!filePath) {
      message.error('ไม่สามารถลบไฟล์ได้: ไม่มีพาธของไฟล์');
      return false;
    }
    
    try {
      const response = await deleteFile(filePath, fileId);
      
      if (response) {
        message.success('ลบไฟล์สำเร็จ');
        
        // อัปเดต state ของไฟล์ที่อัพโหลด
        setUploadedFiles(prev => prev.filter(file => 
          file.path !== filePath && (fileId ? file.id !== fileId : true)
        ));
        
        // อัปเดตข้อมูลการใช้พื้นที่จัดเก็บ
        fetchStorageStatus();
        
        return true;
      } else {
        throw new Error('ไม่สามารถลบไฟล์ได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบไฟล์');
      message.error(err.message || 'เกิดข้อผิดพลาดในการลบไฟล์');
      return false;
    }
  }, [fetchStorageStatus]);

  /**
   * ล้างข้อมูลการอัพโหลด
   */
  const resetUpload = useCallback(() => {
    setUploadedFiles([]);
    setProgress(0);
    setError(null);
  }, []);

  // ดึงข้อมูลสถานะพื้นที่จัดเก็บไฟล์เมื่อ hook ถูกเรียกใช้
  useEffect(() => {
    fetchStorageStatus();
  }, [fetchStorageStatus]);

  return {
    // State
    uploadedFiles,
    isUploading,
    progress,
    error,
    storageStatus,
    
    // Actions
    uploadProfileImage: handleUploadProfileImage,
    uploadImages: handleUploadImages,
    uploadVideo: handleUploadVideo,
    uploadDocuments: handleUploadDocuments,
    uploadMultiple: handleUploadMultiple,
    deleteFile: handleDeleteFile,
    resetUpload,
    
    // Utilities
    validateFile: validateUploadFile,
    fetchStorageStatus,
    
    // Constants
    ALLOWED_FILE_TYPES,
    FILE_SIZE_LIMITS
  };
};

export default useUpload;