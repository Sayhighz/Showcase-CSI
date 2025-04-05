// routes/user/projectRoutes.js

import express from 'express';
import { 
  getAllProjects, 
  getTop9Projects, 
  getLatestProjects, 
  getMyProjects, 
  getProjectDetails, 
  uploadProject,
  searchProjects,
  updateProject,
  deleteProject,
  reviewProject,
  getPendingProjects,
  recordCompanyView,
  recordVisitorView,
  uploadProjectFile,
  getProjectTypes,
  getProjectYears,
  getStudyYears,
  getProjectStats,
  getUploadStatus,
  cancelUpload,
  upload
} from '../../controllers/user/projectController.js';
import { authenticateToken, isAdmin, isResourceOwner } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// ดึงข้อมูลโครงการทั้งหมดที่ได้รับการอนุมัติแล้ว
router.get(API_ROUTES.PROJECT.GET_ALL, getAllProjects);

// ดึงข้อมูลโครงการยอดนิยม 9 อันดับแรก
router.get(API_ROUTES.PROJECT.TOP, getTop9Projects);

// ดึงข้อมูลโครงการล่าสุด 9 โครงการ
router.get(API_ROUTES.PROJECT.LATEST, getLatestProjects);

// ดึงข้อมูลโครงการของผู้ใช้คนนั้น ๆ (ต้องล็อกอินก่อน)
router.get(API_ROUTES.PROJECT.MY_PROJECTS, authenticateToken, isResourceOwner, getMyProjects);

// ดึงข้อมูลรายละเอียดโครงการตาม project_id
router.get(API_ROUTES.PROJECT.GET_BY_ID, getProjectDetails);

// ค้นหาโครงการตามเงื่อนไขต่าง ๆ
router.get(API_ROUTES.PROJECT.SEARCH, searchProjects);

// ดึงข้อมูลประเภทโครงการทั้งหมด (สำหรับ dropdown)
router.get(API_ROUTES.PROJECT.TYPES, getProjectTypes);

// ดึงข้อมูลปีการศึกษาทั้งหมดที่มีในระบบ (สำหรับ dropdown)
router.get(API_ROUTES.PROJECT.YEARS, getProjectYears);

// ดึงข้อมูลชั้นปีของนักศึกษาทั้งหมด (สำหรับ dropdown)
router.get(API_ROUTES.PROJECT.STUDY_YEARS, getStudyYears);

// อัปโหลดโครงการใหม่
router.post(
  API_ROUTES.PROJECT.UPLOAD, 
  authenticateToken, 
  isResourceOwner, 
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'posterImage', maxCount: 1 },
    { name: 'courseworkPoster', maxCount: 1 },
    { name: 'courseworkImage', maxCount: 1 },
    { name: 'courseworkVideo', maxCount: 1 },
    { name: 'competitionPoster', maxCount: 1 },
    { name: 'pdfFiles', maxCount: 3 }
  ]), 
  uploadProject
);

// อัปโหลดไฟล์สำหรับโครงการ
router.post(
  API_ROUTES.PROJECT.UPLOAD_FILE, 
  authenticateToken, 
  upload.single('file'), 
  uploadProjectFile
);

// เช็คสถานะการอัปโหลด
router.get(
  API_ROUTES.PROJECT.UPLOAD_STATUS, 
  authenticateToken, 
  getUploadStatus
);

// ยกเลิกการอัปโหลด
router.post(
  API_ROUTES.PROJECT.CANCEL_UPLOAD, 
  authenticateToken, 
  cancelUpload
);

// อัปเดตโครงการ
router.put(
  API_ROUTES.PROJECT.UPDATE, 
  authenticateToken, 
  isResourceOwner, 
  updateProject
);

// ลบโครงการ
router.delete(
  API_ROUTES.PROJECT.DELETE, 
  authenticateToken, 
  isResourceOwner, 
  deleteProject
);

// บันทึกการเข้าชมจากบริษัท
router.post(
  API_ROUTES.PROJECT.COMPANY_VIEW, 
  recordCompanyView
);

// บันทึกการเข้าชมจากผู้เยี่ยมชมทั่วไป
router.post(
  API_ROUTES.PROJECT.VISITOR_VIEW, 
  recordVisitorView
);

// ดึงข้อมูลโครงการที่รอการอนุมัติ
router.get(
  // routes/user/projectRoutes.js (ต่อ)

  API_ROUTES.PROJECT.PENDING, 
  authenticateToken, 
  isAdmin, 
  getPendingProjects
);

// ดึงข้อมูลสถิติโครงการสำหรับ Dashboard
router.get(
  API_ROUTES.PROJECT.STATS, 
  authenticateToken, 
  isAdmin, 
  getProjectStats
);

// อนุมัติหรือปฏิเสธโครงการ
router.post(
  API_ROUTES.PROJECT.REVIEW, 
  authenticateToken, 
  isAdmin, 
  reviewProject
);

export default router;