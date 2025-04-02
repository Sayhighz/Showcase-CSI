// ===== routes/user/projectRoutes.js =====

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

const router = express.Router();

// ===== 1. API เกี่ยวกับการดึงข้อมูลโครงการ =====

// ดึงข้อมูลโครงการทั้งหมดที่ได้รับการอนุมัติแล้ว
router.get('/all', getAllProjects);

// ดึงข้อมูลโครงการยอดนิยม 9 อันดับแรก
router.get('/top9', getTop9Projects);

// ดึงข้อมูลโครงการล่าสุด 9 โครงการ
router.get('/latest', getLatestProjects);

// ดึงข้อมูลโครงการของผู้ใช้คนนั้น ๆ (ต้องล็อกอินก่อน)
router.get('/myprojects/:user_id', authenticateToken, isResourceOwner, getMyProjects);

// ดึงข้อมูลรายละเอียดโครงการตาม project_id
router.get('/project/:projectId', getProjectDetails);

// ค้นหาโครงการตามเงื่อนไขต่าง ๆ
router.get('/search', searchProjects);

// ดึงข้อมูลประเภทโครงการทั้งหมด (สำหรับ dropdown)
router.get('/types', getProjectTypes);

// ดึงข้อมูลปีการศึกษาทั้งหมดที่มีในระบบ (สำหรับ dropdown)
router.get('/years', getProjectYears);

// ดึงข้อมูลชั้นปีของนักศึกษาทั้งหมด (สำหรับ dropdown)
router.get('/study-years', getStudyYears);

// ===== 2. API สำหรับการจัดการโครงการ =====

// อัปโหลดโครงการใหม่
router.post('/upload/:user_id', authenticateToken, isResourceOwner, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'posterImage', maxCount: 1 },
  { name: 'courseworkPoster', maxCount: 1 },
  { name: 'courseworkImage', maxCount: 1 },
  { name: 'courseworkVideo', maxCount: 1 },
  { name: 'competitionPoster', maxCount: 1 },
  { name: 'pdfFiles', maxCount: 3 }
]), uploadProject);

// อัปโหลดไฟล์สำหรับโครงการ
router.post('/upload-file/:projectId', authenticateToken, upload.single('file'), uploadProjectFile);

// เช็คสถานะการอัปโหลด
router.get('/upload-status/:sessionId', authenticateToken, getUploadStatus);

// ยกเลิกการอัปโหลด
router.post('/cancel-upload/:sessionId', authenticateToken, cancelUpload);

// อัปเดตโครงการ
router.put('/update/:projectId', authenticateToken, isResourceOwner, updateProject);

// ลบโครงการ
router.delete('/delete/:projectId', authenticateToken, isResourceOwner, deleteProject);

// ===== 3. API สำหรับการบันทึกการเข้าชม =====

// บันทึกการเข้าชมจากบริษัท
router.post('/view/company/:projectId', recordCompanyView);

// บันทึกการเข้าชมจากผู้เยี่ยมชมทั่วไป
router.post('/view/visitor/:projectId', recordVisitorView);

// ===== 4. API สำหรับ Admin =====

// ดึงข้อมูลโครงการที่รอการอนุมัติ
router.get('/pending', authenticateToken, isAdmin, getPendingProjects);

// ดึงข้อมูลสถิติโครงการสำหรับ Dashboard
router.get('/stats', authenticateToken, isAdmin, getProjectStats);

// อนุมัติหรือปฏิเสธโครงการ
router.post('/review/:projectId', authenticateToken, isAdmin, reviewProject);

export default router;