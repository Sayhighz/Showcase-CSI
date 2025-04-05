// routes/admin/adminUserRoutes.js

import express from 'express';
import { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} from '../../controllers/admin/adminUserController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// ดึงข้อมูลผู้ใช้ทั้งหมด
router.get(
  API_ROUTES.ADMIN.USER.ALL, 
  adminAuth, 
  getAllUsers
);

// ดึงข้อมูลผู้ใช้ตาม ID
router.get(
  API_ROUTES.ADMIN.USER.GET_BY_ID, 
  adminAuth, 
  getUserById
);

// สร้างผู้ใช้ใหม่
router.post(
  API_ROUTES.ADMIN.USER.CREATE, 
  adminAuth, 
  createUser
);

// อัปเดตข้อมูลผู้ใช้
router.put(
  API_ROUTES.ADMIN.USER.UPDATE, 
  adminAuth, 
  updateUser
);

// ลบผู้ใช้
router.delete(
  API_ROUTES.ADMIN.USER.DELETE, 
  adminAuth, 
  deleteUser
);

// ดึงข้อมูลสถิติผู้ใช้
router.get(
  API_ROUTES.ADMIN.USER.STATS, 
  adminAuth, 
  getUserStats
);

export default router;