// routes/admin/logsRoutes.js

import express from 'express';
import { 
  getAllLoginLogs, 
  getCompanyViews, 
  getVisitorViews,
  getProjectReviews,
  getSystemStats,
  getDailyStats
} from '../../controllers/admin/logsController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// เส้นทางสำหรับดึงข้อมูลการเข้าสู่ระบบทั้งหมด
router.get(
  API_ROUTES.ADMIN.LOGS.LOGIN_LOGS, 
  adminAuth, 
  getAllLoginLogs
);

// เส้นทางสำหรับดึงข้อมูลการเข้าชมจากบริษัท
router.get(
  API_ROUTES.ADMIN.LOGS.COMPANY_VIEWS, 
  adminAuth, 
  getCompanyViews
);

// เส้นทางสำหรับดึงข้อมูลการเข้าชมจากผู้เยี่ยมชม
router.get(
  API_ROUTES.ADMIN.LOGS.VISITOR_VIEWS, 
  adminAuth, 
  getVisitorViews
);

// เส้นทางสำหรับดึงข้อมูลประวัติการตรวจสอบโครงการ
router.get(
  API_ROUTES.ADMIN.LOGS.PROJECT_REVIEWS, 
  adminAuth, 
  getProjectReviews
);

// เส้นทางสำหรับดึงข้อมูลสถิติระบบทั้งหมด
router.get(
  API_ROUTES.ADMIN.LOGS.SYSTEM_STATS, 
  adminAuth, 
  getSystemStats
);

// เส้นทางสำหรับดึงข้อมูลสถิติประจำวัน
router.get(
  API_ROUTES.ADMIN.LOGS.DAILY_STATS, 
  adminAuth, 
  getDailyStats
);

export default router;