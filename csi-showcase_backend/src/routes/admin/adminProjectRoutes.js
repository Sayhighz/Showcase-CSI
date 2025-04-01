// ===== routes/admin/adminProjectRoutes.js =====

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

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// เส้นทางสำหรับดึงข้อมูลโครงการทั้งหมด
router.get('/all', adminAuth, getAllProjects);

// เส้นทางสำหรับดึงข้อมูลโครงการที่รอการอนุมัติ
router.get('/pending', adminAuth, getPendingProjects);

// เส้นทางสำหรับดึงรายละเอียดของโครงการที่ระบุ
router.get('/project/:projectId', adminAuth, getProjectDetails);

// เส้นทางสำหรับอนุมัติหรือปฏิเสธโครงการ
router.post('/review/:projectId', adminAuth, reviewProject);

// เส้นทางสำหรับลบโครงการ
router.delete('/delete/:projectId', adminAuth, deleteProject);

// เส้นทางสำหรับอัปเดตโครงการ
router.put('/update/:projectId', adminAuth, updateProject);

// เส้นทางสำหรับดึงข้อมูลประวัติการตรวจสอบโครงการ
router.get('/reviews/:projectId', adminAuth, getProjectReviews);

// เส้นทางสำหรับดึงข้อมูลสถิติการตรวจสอบโครงการ
router.get('/review-stats', adminAuth, getAdminReviewStats);

// เส้นทางสำหรับดึงข้อมูลสถิติโครงการ
router.get('/stats', adminAuth, getProjectStats);

// เส้นทางสำหรับดึงข้อมูลการตรวจสอบโครงการทั้งหมด
router.get('/all-reviews', adminAuth, getAllProjectReviews);

export default router;