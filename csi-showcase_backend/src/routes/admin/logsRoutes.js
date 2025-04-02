// ===== routes/admin/logsRoutes.js =====

import express from 'express';
import { 
  getAllLoginLogs,
} from '../../controllers/admin/logsController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// เส้นทางสำหรับดึงข้อมูลการเข้าสู่ระบบทั้งหมด
router.get('/login-logs', adminAuth, getAllLoginLogs);

// เส้นทางสำหรับดึงข้อมูลการเข้าสู่ระบบของผู้ใช้ที่ระบุ
// router.get('/login-logs/:userId', adminAuth, getUserLoginLogs);

// เส้นทางสำหรับดึงข้อมูลสถิติการเข้าสู่ระบบ
// router.get('/login-stats', adminAuth, getLoginStats);

// เส้นทางสำหรับดึงข้อมูลสถิติการเข้าชมผลงาน
// router.get('/view-stats', adminAuth, getViewStats);

export default router;