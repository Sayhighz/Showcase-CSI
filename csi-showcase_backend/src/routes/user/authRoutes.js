// routes/user/authRoutes.js

import express from 'express';
import {
  login,
  getCurrentUser,
  verifyToken,
  logout,
  forgotPassword,
  resetPassword
} from '../../controllers/user/authController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// เข้าสู่ระบบ
router.post(API_ROUTES.AUTH.LOGIN, login);

// ตรวจสอบ token
router.get(API_ROUTES.AUTH.VERIFY_TOKEN, authenticateToken, verifyToken);

// ออกจากระบบ (สำหรับการเรียกโดย frontend)
router.post(API_ROUTES.AUTH.LOGOUT, logout);

// เริ่มต้นกระบวนการรีเซ็ตรหัสผ่าน (ส่งอีเมล)
router.post(API_ROUTES.AUTH.FORGOT_PASSWORD, forgotPassword);

// ตั้งรหัสผ่านใหม่หลังจากรีเซ็ต
router.post(API_ROUTES.AUTH.RESET_PASSWORD, resetPassword);

// ดึงข้อมูลผู้ใช้ปัจจุบัน
router.get(API_ROUTES.AUTH.ME, authenticateToken, getCurrentUser);

export default router;