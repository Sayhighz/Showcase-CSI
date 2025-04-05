// routes/admin/statisticsRoutes.js

import express from 'express';
import { 
  getDashboardStats,
  getTodayStats,
  getProjectTypeStats,
  getStudyYearStats
} from '../../controllers/admin/statisticsController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { checkAdminSecretKey } from '../../middleware/secretKeyMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// ดึงข้อมูลสถิติ Dashboard
router.get(
  API_ROUTES.ADMIN.STATISTICS.DASHBOARD, 
  [checkAdminSecretKey, authenticateToken, isAdmin],
  getDashboardStats
);

// ดึงข้อมูลสถิติประจำวัน
router.get(
  API_ROUTES.ADMIN.STATISTICS.TODAY, 
  [checkAdminSecretKey, authenticateToken, isAdmin],
  getTodayStats
);

// ดึงสถิติประเภทโครงการ
router.get(
  API_ROUTES.ADMIN.STATISTICS.PROJECT_TYPES, 
  [checkAdminSecretKey, authenticateToken, isAdmin],
  getProjectTypeStats
);

// ดึงสถิติชั้นปี
router.get(
  API_ROUTES.ADMIN.STATISTICS.STUDY_YEARS, 
  [checkAdminSecretKey, authenticateToken, isAdmin],
  getStudyYearStats

);

export default router;