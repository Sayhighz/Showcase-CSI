// ===== routes/userRoutes.js =====

import express from 'express';
import {
  register,
  getAllUsers,
  getUserById,
  updateUser,
  uploadProfileImage,
  changePassword,
  changeUserRole,
  deleteUser,
  getUserLoginHistory,
  getUserProjects,
  upload
} from '../controllers/userController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== 1. การลงทะเบียนและดึงข้อมูลผู้ใช้ =====

// ลงทะเบียนผู้ใช้ใหม่ (ไม่ต้องการ authentication)
router.post('/register', register);

// ดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับ Admin)
router.get('/all', authenticateToken, isAdmin, getAllUsers);

// ดึงข้อมูลผู้ใช้ตาม ID
router.get('/:userId', authenticateToken, getUserById);

// ===== 2. การจัดการข้อมูลของผู้ใช้ =====

// อัปเดตข้อมูลผู้ใช้
router.put('/:userId', authenticateToken, updateUser);

// อัปโหลดรูปโปรไฟล์
router.post('/:userId/profile-image', authenticateToken, upload.single('image'), uploadProfileImage);

// เปลี่ยนรหัสผ่าน
router.post('/:userId/change-password', authenticateToken, changePassword);

// ===== 3. การจัดการผู้ใช้โดย Admin =====

// เปลี่ยนบทบาทของผู้ใช้ (สำหรับ Admin)
router.put('/:userId/role', authenticateToken, isAdmin, changeUserRole);

// ลบผู้ใช้ (สำหรับ Admin)
router.delete('/:userId', authenticateToken, isAdmin, deleteUser);

// ===== 4. การดึงข้อมูลเพิ่มเติมของผู้ใช้ =====

// ดึงประวัติการเข้าสู่ระบบของผู้ใช้
router.get('/:userId/login-history', authenticateToken, getUserLoginHistory);

// ดึงโครงการที่ผู้ใช้มีส่วนร่วม
router.get('/:userId/projects', authenticateToken, getUserProjects);

export default router;