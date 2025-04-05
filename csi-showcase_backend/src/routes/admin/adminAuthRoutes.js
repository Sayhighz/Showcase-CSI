// routes/admin/adminAuthRoutes.js

import express from 'express';
import { 
  adminLogin, 
  getCurrentAdmin, 
  verifyAdminToken, 
  changeAdminPassword,
  adminLogout,
  forgotAdminPassword,
  resetAdminPassword
} from '../../controllers/admin/adminAuthController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';
import { checkSecretKey } from '../../middleware/secretKeyMiddleware.js';

const router = express.Router();

// เข้าสู่ระบบสำหรับผู้ดูแลระบบ
router.post(
  API_ROUTES.ADMIN.AUTH.LOGIN, 
  checkSecretKey, 
  adminLogin
);

// ตรวจสอบความถูกต้องของ Token
router.get(
  API_ROUTES.ADMIN.AUTH.VERIFY_TOKEN, 
  authenticateToken, 
  isAdmin, 
  verifyAdminToken
);

// ดึงข้อมูลผู้ดูแลระบบปัจจุบัน
router.get(
  API_ROUTES.ADMIN.AUTH.ME, 
  authenticateToken, 
  isAdmin, 
  getCurrentAdmin
);

// เปลี่ยนรหัสผ่านผู้ดูแลระบบ
router.post(
  API_ROUTES.ADMIN.AUTH.CHANGE_PASSWORD, 
  authenticateToken, 
  isAdmin, 
  changeAdminPassword
);

// ออกจากระบบ
router.post(
  API_ROUTES.ADMIN.AUTH.LOGOUT, 
  authenticateToken, 
  isAdmin, 
  adminLogout
);

// ขอรีเซ็ตรหัสผ่าน
router.post(
  API_ROUTES.ADMIN.AUTH.FORGOT_PASSWORD, 
  forgotAdminPassword
);

// รีเซ็ตรหัสผ่าน
router.post(
  API_ROUTES.ADMIN.AUTH.RESET_PASSWORD, 
  resetAdminPassword
);

export default router;