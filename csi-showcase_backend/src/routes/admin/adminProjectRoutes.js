// routes/admin/adminProjectRoutes.js

import express from 'express';
import { 
  getAllProjects,
  getPendingProjects,
  getProjectDetails,
  reviewProject,
  deleteProject,
  updateProject,
  getProjectReviews,
  getAdminReviewStats,
  getProjectStats,
  getAllProjectReviews
} from '../../controllers/admin/adminProjectController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// ดึงข้อมูลโครงการทั้งหมด
router.get(
  API_ROUTES.ADMIN.PROJECT.ALL, 
  adminAuth, 
  getAllProjects
);

// ดึงข้อมูลโครงการที่รอการอนุมัติ
router.get(
  API_ROUTES.ADMIN.PROJECT.PENDING, 
  adminAuth, 
  getPendingProjects
);

// ดึงรายละเอียดโครงการ
router.get(
  API_ROUTES.ADMIN.PROJECT.GET_BY_ID, 
  adminAuth, 
  getProjectDetails
);

// อนุมัติหรือปฏิเสธโครงการ
router.post(
  API_ROUTES.ADMIN.PROJECT.REVIEW, 
  adminAuth, 
  reviewProject
);

// ลบโครงการ
router.delete(
  API_ROUTES.ADMIN.PROJECT.DELETE, 
  adminAuth, 
  deleteProject
);

// อัปเดตโครงการ
router.put(
  API_ROUTES.ADMIN.PROJECT.UPDATE, 
  adminAuth, 
  updateProject
);

// ดึงข้อมูลประวัติการตรวจสอบโครงการ
router.get(
  API_ROUTES.ADMIN.PROJECT.REVIEWS, 
  adminAuth, 
  getProjectReviews
);

// ดึงข้อมูลสถิติการตรวจสอบโครงการ
router.get(
  API_ROUTES.ADMIN.PROJECT.REVIEW_STATS, 
  adminAuth, 
  getAdminReviewStats
);

// ดึงข้อมูลสถิติโครงการ
router.get(
  API_ROUTES.ADMIN.PROJECT.STATS, 
  adminAuth, 
  getProjectStats
);

// ดึงข้อมูลการตรวจสอบโครงการทั้งหมด
router.get(
  API_ROUTES.ADMIN.PROJECT.ALL_REVIEWS, 
  adminAuth, 
  getAllProjectReviews
);

export default router;