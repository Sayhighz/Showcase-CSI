// ===== routes/admin/statisticsRoutes.js =====

import express from 'express';
import { getDashboardStats } from '../../controllers/admin/statisticsController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// เส้นทางสำหรับดึงข้อมูลสถิติภาพรวมทั้งหมดสำหรับแดชบอร์ด
router.get('/dashboard', adminAuth, getDashboardStats);

export default router;