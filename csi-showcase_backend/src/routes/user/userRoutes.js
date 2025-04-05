// routes/common/uploadRoutes.js

import express from 'express';
import { 
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
} from '../../controllers/common/uploadController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// Middleware combination for admin-only routes
const adminAuth = [authenticateToken, isAdmin];

// อัปโหลดรูปโปรไฟล์
router.post(
  API_ROUTES.UPLOAD.PROFILE_IMAGE, 
  authenticateToken, 
  uploadProfileImage, 
  handleMulterError, 
  handleFileUpload
);

// อัปโหลดรูปภาพหลายรูป
router.post(
  API_ROUTES.UPLOAD.IMAGES, 
  authenticateToken, 
  uploadImages, 
  handleMulterError, 
  handleFileUpload
);

// อัปโหลดวิดีโอ
router.post(
  API_ROUTES.UPLOAD.VIDEO, 
  authenticateToken, 
  uploadVideo, 
  handleMulterError, 
  handleFileUpload
);

// อัปโหลดเอกสาร
router.post(
  API_ROUTES.UPLOAD.DOCUMENTS, 
  authenticateToken, 
  uploadDocuments, 
  handleMulterError, 
  handleFileUpload
);

// อัปโหลดไฟล์ทั่วไป
router.post(
  API_ROUTES.UPLOAD.FILES, 
  authenticateToken, 
  uploadFiles, 
  handleMulterError, 
  handleFileUpload
);

// อัปโหลดไฟล์หลายประเภท
router.post(
  API_ROUTES.UPLOAD.MULTIPLE, 
  authenticateToken, 
  uploadMultiple, 
  handleMulterError, 
  handleFileUpload
);

// ลบไฟล์
router.delete(
  API_ROUTES.UPLOAD.DELETE, 
  authenticateToken, 
  deleteFile
);

// ตรวจสอบสถานะการจัดเก็บ (เฉพาะแอดมิน)
router.get(
  API_ROUTES.UPLOAD.STORAGE_STATUS, 
  adminAuth, 
  getStorageStatus
);

export default router;