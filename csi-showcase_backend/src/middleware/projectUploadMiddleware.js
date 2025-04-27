// src/middleware/projectUploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * กำหนดโฟลเดอร์หลักสำหรับการจัดเก็บไฟล์
 */
const UPLOAD_PATHS = {
  profiles: 'uploads/profiles',
  images: 'uploads/images',
  videos: 'uploads/videos',
  documents: 'uploads/documents',
  others: 'uploads/others'
};

/**
 * สร้างโฟลเดอร์สำหรับเก็บไฟล์ถ้ายังไม่มี
 */
const createDirectoryIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
};

// สร้างโฟลเดอร์ทั้งหมดเมื่อเริ่มต้น
Object.values(UPLOAD_PATHS).forEach(dir => createDirectoryIfNotExists(dir));

/**
 * กำหนดพื้นที่จัดเก็บสำหรับ multer แบบหลายประเภท
 */
const multiTypeStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath;
    
    // กำหนดโฟลเดอร์ตามประเภทของไฟล์
    if (file.fieldname === 'paperFile' || file.mimetype === 'application/pdf') {
      uploadPath = UPLOAD_PATHS.documents;
    } else if (file.fieldname === 'courseworkVideo' || file.mimetype.startsWith('video/')) {
      uploadPath = UPLOAD_PATHS.videos;
    } else if (file.fieldname.includes('Poster') || file.fieldname.includes('Image') || file.mimetype.startsWith('image/')) {
      uploadPath = UPLOAD_PATHS.images;
    } else {
      uploadPath = UPLOAD_PATHS.others;
    }
    
    createDirectoryIfNotExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${file.fieldname}-${uuidv4()}${fileExtension}`;
    cb(null, uniqueFilename);
  }
});

/**
 * ตรวจสอบประเภทไฟล์
 */
const fileFilter = (req, file, cb) => {
  logger.debug(`Checking file: ${file.fieldname}, mimetype: ${file.mimetype}`);
  
  if (file.fieldname === 'paperFile') {
    // อนุญาตเฉพาะไฟล์ PDF สำหรับเอกสารวิชาการ
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for academic papers'), false);
    }
  } 
  else if (file.fieldname === 'courseworkVideo') {
    // อนุญาตเฉพาะวิดีโอ
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4, WebM, and QuickTime video formats are allowed'), false);
    }
  }
  else if (file.fieldname.includes('Poster') || file.fieldname.includes('Image')) {
    // อนุญาตเฉพาะรูปภาพ
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP image formats are allowed'), false);
    }
  }
  else {
    // สำหรับประเภทอื่น ๆ ยอมรับทั้งหมด
    cb(null, true);
  }
};

/**
 * สร้าง multer uploader สำหรับหลายประเภทไฟล์
 */
const multiTypeUploader = multer({
  storage: multiTypeStorage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max file size
  },
  fileFilter: fileFilter
});

/**
 * Middleware สำหรับการอัปโหลดไฟล์โปรเจคใหม่
 */
export const projectUploadMiddleware = (req, res, next) => {
  logger.info("Processing project upload with improved middleware");
  
  // กำหนดฟิลด์ไฟล์ที่จะรับ
  const uploadFields = multiTypeUploader.fields([
    { name: 'courseworkPoster', maxCount: 1 },
    { name: 'courseworkVideo', maxCount: 1 },
    { name: 'courseworkImage', maxCount: 5 },
    { name: 'competitionPoster', maxCount: 1 },
    { name: 'paperFile', maxCount: 1 }
  ]);
  
  uploadFields(req, res, (err) => {
    if (err) {
      logger.error("Project file upload error:", err);
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `File upload error: ${err.message}`
      });
    }
    
    logger.info("Project files uploaded successfully:", req.files ? Object.keys(req.files) : 'No files');
    
    // จัดการข้อมูลของไฟล์ที่อัปโหลด
    req.project = { files: {} };
    
    if (req.files) {
      // เก็บข้อมูลไฟล์ต่างๆ
      if (req.files.courseworkPoster) req.project.files.courseworkPoster = req.files.courseworkPoster[0];
      if (req.files.courseworkVideo) req.project.files.courseworkVideo = req.files.courseworkVideo[0];
      if (req.files.courseworkImage && req.files.courseworkImage.length > 0) {
        req.project.files.courseworkImage = req.files.courseworkImage[0];
      }
      if (req.files.competitionPoster) req.project.files.competitionPoster = req.files.competitionPoster[0];
      if (req.files.paperFile) req.project.files.paperFile = req.files.paperFile[0];
      
      logger.debug("Processed files information:", req.project.files);
    }
    
    next();
  });
};

/**
 * Middleware สำหรับการอัปเดตไฟล์โปรเจค
 */
export const projectUpdateMiddleware = (req, res, next) => {
  logger.info("Processing project update with improved middleware");
  
  // ใช้ uploader เดียวกันกับ projectUploadMiddleware
  const uploadFields = multiTypeUploader.fields([
    { name: 'courseworkPoster', maxCount: 1 },
    { name: 'courseworkVideo', maxCount: 1 },
    { name: 'courseworkImage', maxCount: 1 },
    { name: 'competitionPoster', maxCount: 1 },
    { name: 'paperFile', maxCount: 1 }
  ]);
  
  uploadFields(req, res, (err) => {
    if (err) {
      logger.error("Update file upload error:", err);
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `File upload error: ${err.message}`
      });
    }
    
    logger.info("Update files processed successfully:", req.files ? Object.keys(req.files) : 'No files');
    
    // จัดการข้อมูลของไฟล์ที่อัปโหลดและเพิ่มเข้าไปใน req.projectUpdate
    req.projectUpdate = { files: {} };
    
    if (req.files) {
      // เก็บข้อมูลไฟล์ต่างๆ
      if (req.files.courseworkPoster) req.projectUpdate.files.courseworkPoster = req.files.courseworkPoster[0];
      if (req.files.courseworkVideo) req.projectUpdate.files.courseworkVideo = req.files.courseworkVideo[0];
      if (req.files.courseworkImage && req.files.courseworkImage.length > 0) {
        req.projectUpdate.files.courseworkImage = req.files.courseworkImage[0];
      }
      if (req.files.competitionPoster) req.projectUpdate.files.competitionPoster = req.files.competitionPoster[0];
      if (req.files.paperFile) req.projectUpdate.files.paperFile = req.files.paperFile[0];
      
      logger.debug("Processed update files information:", req.projectUpdate.files);
    }
    
    next();
  });
};

/**
 * ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
 */
export const fileExists = (filePath) => {
  try {
    if (!filePath) return false;
    return fs.existsSync(filePath);
  } catch (error) {
    logger.error("Error checking file existence:", error);
    return false;
  }
};

/**
 * ลบไฟล์เก่าเมื่อมีการอัปเดตไฟล์ใหม่
 */
export const deleteOldFile = (filePath) => {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Old file deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Error deleting old file ${filePath}:`, error);
    return false;
  }
};

export default {
  projectUploadMiddleware,
  projectUpdateMiddleware,
  fileExists,
  deleteOldFile
};