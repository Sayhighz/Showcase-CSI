// controllers/common/uploadController.js
import { createUploader } from '../../services/storageService.js';
import { handleMulterError } from '../../middleware/userMiddleware.js';
import { ALLOWED_FILE_TYPES, formatFileSize } from '../../constants/fileTypes.js';
import logger from '../../config/logger.js';
import { successResponse, errorResponse } from '../../utils/responseFormatter.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';
import pool from '../../config/database.js';
import storageService from '../../services/storageService.js';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// ใช้ค่าที่กำหนดจาก services/storageService.js
const UPLOAD_PATHS = storageService.UPLOAD_PATHS;

// สร้าง multer uploader สำหรับแต่ละประเภท
export const uploadProfileImage = createUploader('profiles').single('profileImage');
export const uploadImages = createUploader('images').array('images', 5);
export const uploadVideo = createUploader('videos').single('video');
export const uploadDocuments = createUploader('documents').array('documents', 3);
export const uploadFiles = createUploader('others').array('files', 5);
export const uploadMultiple = createUploader('others').fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 },
  { name: 'documents', maxCount: 3 }
]);

/**
 * อัปโหลดไฟล์ทั่วไป
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleFileUpload = async (req, res) => {
  try {
    // ตรวจสอบว่ามีไฟล์หรือไม่
    if (!req.file && !req.files) {
      return errorResponse(
        res, 
        'No file uploaded', 
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    // เตรียมข้อมูลสำหรับการตอบกลับ
    let responseData = {};
    
    // กรณีอัปโหลดไฟล์เดียว
    if (req.file) {
      responseData.file = formatFileResponse(req.file, req);
    }
    
    // กรณีอัปโหลดหลายไฟล์ (array)
    if (req.files && Array.isArray(req.files)) {
      responseData.files = req.files.map(file => formatFileResponse(file, req));
    }
    
    // กรณีอัปโหลดหลายประเภท (fields)
    if (req.files && !Array.isArray(req.files)) {
      responseData.files = {};
      
      Object.keys(req.files).forEach(fieldname => {
        responseData.files[fieldname] = req.files[fieldname].map(file => 
          formatFileResponse(file, req)
        );
      });
    }

    // บันทึกข้อมูลการอัปโหลดลงในฐานข้อมูล (ถ้ามี project_id)
    if (req.body.project_id) {
      await saveUploadedFileToDatabase(req);
    }
    
    return successResponse(
      res,
      responseData,
      'File uploaded successfully',
      STATUS_CODES.OK
    );
  } catch (error) {
    logger.error('File upload error:', error);
    return errorResponse(
      res,
      'File upload failed',
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

/**
 * ลบไฟล์
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteFile = async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return errorResponse(
        res,
        'File path is required',
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    // ตรวจสอบว่าเป็น path ที่อยู่ในโฟลเดอร์ uploads จริงหรือไม่
    if (!filePath.startsWith('uploads/')) {
      return errorResponse(
        res,
        'Invalid file path',
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    // ลบไฟล์โดยใช้ฟังก์ชันจาก storageService
    const deleted = await storageService.deleteFile(filePath);
    
    if (!deleted) {
      return errorResponse(
        res,
        'File not found or could not be deleted',
        STATUS_CODES.NOT_FOUND
      );
    }

    // ลบข้อมูลไฟล์จากฐานข้อมูล (ถ้ามี)
    if (req.body.file_id) {
      await deleteFileFromDatabase(req.body.file_id);
    }
    
    return successResponse(
      res,
      { filePath },
      'File deleted successfully',
      STATUS_CODES.OK
    );
  } catch (error) {
    logger.error('File deletion error:', error);
    return errorResponse(
      res,
      'File deletion failed',
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

/**
 * ตรวจสอบสถานะพื้นที่จัดเก็บไฟล์
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStorageStatus = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return errorResponse(
        res,
        'Access denied. Admin privileges required',
        STATUS_CODES.FORBIDDEN
      );
    }
    
    // ใช้ฟังก์ชันจาก storageService
    const storageStats = await storageService.getStorageStatus();
    
    return successResponse(
      res,
      storageStats,
      'Storage status retrieved successfully',
      STATUS_CODES.OK
    );
  } catch (error) {
    logger.error('Storage status error:', error);
    return errorResponse(
      res,
      'Failed to get storage status',
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

/**
 * ฟังก์ชันช่วยจัดรูปแบบข้อมูลไฟล์ที่อัปโหลด
 * @param {Object} file - ข้อมูลไฟล์ที่อัปโหลด
 * @param {Object} req - Express request object
 * @returns {Object} - ข้อมูลไฟล์ที่จัดรูปแบบแล้ว
 */
function formatFileResponse(file, req) {
  // สร้าง URL สำหรับเข้าถึงไฟล์
  const fileUrl = `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`;
  
  return {
    filename: file.filename,
    originalname: file.originalname,
    path: file.path,
    url: fileUrl,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    mimetype: file.mimetype,
    fileType: getFileTypeFromMimetype(file.mimetype)
  };
}

/**
 * ดึงประเภทของไฟล์จาก MIME type
 * @param {string} mimetype - MIME type ของไฟล์
 * @returns {string} - ประเภทของไฟล์
 */
function getFileTypeFromMimetype(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'presentation';
  return 'other';
}

/**
 * บันทึกข้อมูลไฟล์ที่อัปโหลดลงในฐานข้อมูล
 * @param {Object} req - Express request object
 */
async function saveUploadedFileToDatabase(req) {
  try {
    const projectId = req.body.project_id;
    
    // ตรวจสอบว่ามี project_id หรือไม่
    if (!projectId) return;
    
    let files = [];
    
    // รวบรวมไฟล์ทั้งหมดที่อัปโหลด
    if (req.file) {
      files.push(req.file);
    } else if (req.files && Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && !Array.isArray(req.files)) {
      Object.values(req.files).forEach(fileArray => {
        files = files.concat(fileArray);
      });
    }
    
    // บันทึกข้อมูลไฟล์ลงในฐานข้อมูล
    for (const file of files) {
      const fileType = getFileTypeFromMimetype(file.mimetype);
      
      await pool.execute(`
        INSERT INTO project_files (
          project_id, file_type, file_path, file_name, file_size
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        projectId,
        fileType,
        file.path,
        file.originalname,
        file.size
      ]);
    }
    
    logger.info(`Saved ${files.length} files to database for project ${projectId}`);
  } catch (error) {
    logger.error('Error saving file to database:', error);
    throw error;
  }
}

/**
 * ลบข้อมูลไฟล์จากฐานข้อมูล
 * @param {number} fileId - ID ของไฟล์ในฐานข้อมูล
 */
async function deleteFileFromDatabase(fileId) {
  try {
    await pool.execute(`
      DELETE FROM project_files WHERE file_id = ?
    `, [fileId]);
    
    logger.info(`Deleted file with ID ${fileId} from database`);
  } catch (error) {
    logger.error('Error deleting file from database:', error);
    throw error;
  }
}

// นำเข้าฟังก์ชันจัดการข้อผิดพลาดจาก userMiddleware.js
export { handleMulterError };

export default {
  uploadProfileImage,
  uploadImages,
  uploadVideo,
  uploadDocuments,
  uploadFiles,
  uploadMultiple,
  handleFileUpload,
  deleteFile,
  getStorageStatus,
  handleMulterError
};