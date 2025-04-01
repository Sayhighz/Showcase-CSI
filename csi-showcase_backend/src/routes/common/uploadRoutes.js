// ===== routes/common/uploadRoutes.js =====

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

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// เส้นทางสำหรับอัปโหลดรูปโปรไฟล์
router.post('/profile-image', authenticateToken, uploadProfileImage, handleMulterError, handleFileUpload);

// เส้นทางสำหรับอัปโหลดรูปภาพทั่วไป
router.post('/images', authenticateToken, uploadImages, handleMulterError, handleFileUpload);

// เส้นทางสำหรับอัปโหลดวิดีโอ
router.post('/video', authenticateToken, uploadVideo, handleMulterError, handleFileUpload);

// เส้นทางสำหรับอัปโหลดเอกสาร
router.post('/documents', authenticateToken, uploadDocuments, handleMulterError, handleFileUpload);

// เส้นทางสำหรับอัปโหลดไฟล์ทั่วไป
router.post('/files', authenticateToken, uploadFiles, handleMulterError, handleFileUpload);

// เส้นทางสำหรับอัปโหลดหลายประเภทในคราวเดียว
router.post('/multiple', authenticateToken, uploadMultiple, handleMulterError, handleFileUpload);

// เส้นทางสำหรับลบไฟล์
router.delete('/delete', authenticateToken, deleteFile);

// เส้นทางสำหรับตรวจสอบสถานะพื้นที่จัดเก็บไฟล์ (เฉพาะ admin)
router.get('/storage-status', adminAuth, getStorageStatus);

export default router;