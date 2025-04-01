// middleware/userMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createDirectoryIfNotExists, isAllowedFileType, generateUniqueFilename } from '../utils/fileHelper.js';

/**
 * กำหนดค่า multer สำหรับการอัปโหลดรูปโปรไฟล์
 */
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profiles/';
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    createDirectoryIfNotExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, generateUniqueFilename(file.originalname, 'profile-'));
  }
});

/**
 * กำหนดค่า multer สำหรับการอัปโหลดไฟล์โปรเจกต์
 */
const projectStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // สร้างโฟลเดอร์ตามประเภทของไฟล์
    let uploadPath = 'uploads/';
    
    switch (file.mimetype.split('/')[0]) {
      case 'image':
        uploadPath += 'images/';
        break;
      case 'video':
        uploadPath += 'videos/';
        break;
      case 'application':
        uploadPath += 'documents/';
        break;
      default:
        uploadPath += 'others/';
    }
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    createDirectoryIfNotExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, generateUniqueFilename(file.originalname));
  }
});

/**
 * กำหนดข้อจำกัดการอัปโหลดรูปโปรไฟล์
 */
export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
  fileFilter: (req, file, cb) => {
    // ตรวจสอบประเภทไฟล์ที่อนุญาต (เฉพาะรูปภาพ)
    const allowedTypes = /jpeg|jpg|png|gif/;
    
    if (!isAllowedFileType(file.originalname, file.mimetype, allowedTypes)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    
    cb(null, true);
  }
});

/**
 * กำหนดข้อจำกัดการอัปโหลดไฟล์โปรเจกต์
 */
export const uploadProject = multer({
  storage: projectStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 10MB
  fileFilter: (req, file, cb) => {
    // ตรวจสอบประเภทไฟล์ที่อนุญาต
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|avi|mov|doc|docx|ppt|pptx/;
    
    if (!isAllowedFileType(file.originalname, file.mimetype, allowedTypes)) {
      return cb(new Error('File type not allowed'), false);
    }
    
    cb(null, true);
  }
});

/**
 * Middleware สำหรับตรวจสอบว่าผู้ใช้เป็นเจ้าของโปรไฟล์
 */
export const isProfileOwner = (req, res, next) => {
  const userId = req.params.userId;
  
  // ตรวจสอบว่ามีข้อมูลผู้ใช้ใน request หรือไม่
  if (!req.user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authentication required'
    });
  }
  
  // ตรวจสอบว่า userId ที่ส่งมาตรงกับ user_id ใน token หรือไม่
  // หรือเป็น admin ซึ่งสามารถจัดการได้ทุกโปรไฟล์
  if (req.user.id != userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Forbidden, you can only manage your own profile'
    });
  }
  
  next();
};

/**
 * Middleware สำหรับจัดการข้อผิดพลาดจาก multer
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'File too large. Maximum file size allowed is 5MB for profile images and 10MB for project files.'
      });
    }
    
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message
    });
  }
  
  next();
};