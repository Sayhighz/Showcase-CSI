// ===== routes/admin/adminAuthRoutes.js =====

import express from 'express';
import { 
  adminLogin, 
  getCurrentAdmin, 
  verifyAdminToken, 
  changeAdminPassword, 
  adminLogout 
} from '../../controllers/admin/adminAuthController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// เส้นทางสำหรับการเข้าสู่ระบบของ Admin
router.post('/login', adminLogin);

// เส้นทางสำหรับการตรวจสอบ token ของ Admin
router.get('/verify-token', authenticateToken, isAdmin, verifyAdminToken);

// เส้นทางสำหรับดึงข้อมูล Admin ปัจจุบัน
router.get('/me', authenticateToken, isAdmin, getCurrentAdmin);

// เส้นทางสำหรับเปลี่ยนรหัสผ่าน Admin
router.post('/change-password/:adminId', authenticateToken, isAdmin, changeAdminPassword);

// เส้นทางสำหรับออกจากระบบ
router.post('/logout', adminLogout);

export default router;