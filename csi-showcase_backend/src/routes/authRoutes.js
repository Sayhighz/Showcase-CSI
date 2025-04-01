// ===== routes/authRoutes.js =====

import express from 'express';
import {
  login,
  getCurrentUser,
  verifyToken,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== 1. API สำหรับการเข้าสู่ระบบและออกจากระบบ =====

// เข้าสู่ระบบ
router.post('/login', login);

// ตรวจสอบ token
router.get('/verify-token', authenticateToken, verifyToken);

// ออกจากระบบ (สำหรับการเรียกโดย frontend)
router.post('/logout', logout);

// ===== 2. API สำหรับการรีเซ็ตรหัสผ่าน =====

// เริ่มต้นกระบวนการรีเซ็ตรหัสผ่าน (ส่งอีเมล)
router.post('/forgot-password', forgotPassword);

// ตั้งรหัสผ่านใหม่หลังจากรีเซ็ต
router.post('/reset-password', resetPassword);

// ===== 3. API สำหรับการตรวจสอบข้อมูลผู้ใช้ =====

// ดึงข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', authenticateToken, getCurrentUser);

export default router;