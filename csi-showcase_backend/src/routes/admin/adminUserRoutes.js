// ===== routes/admin/adminUserRoutes.js =====

import express from 'express';
import { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  getUserStats
} from '../../controllers/admin/adminUserController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// เส้นทางสำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/all', adminAuth, getAllUsers);

// เส้นทางสำหรับดึงข้อมูลผู้ใช้ตาม ID
router.get('/user/:userId', adminAuth, getUserById);

// เส้นทางสำหรับสร้างผู้ใช้ใหม่
router.post('/create', adminAuth, createUser);

// เส้นทางสำหรับอัปเดตผู้ใช้
router.put('/update/:userId', adminAuth, updateUser);

// เส้นทางสำหรับรีเซ็ตรหัสผ่านของผู้ใช้
router.post('/reset-password/:userId', adminAuth, resetUserPassword);

// เส้นทางสำหรับลบผู้ใช้
router.delete('/delete/:userId', adminAuth, deleteUser);

// เส้นทางสำหรับดึงข้อมูลสถิติผู้ใช้
router.get('/stats', adminAuth, getUserStats);

export default router;