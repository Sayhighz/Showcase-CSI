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
  updateProjectWithFiles,
  deleteProject,
  reviewProject,
  getPendingProjects,
  recordCompanyView,
  recordVisitorView,
  uploadProjectFile,
  getProjectTypes,
  getProjectYears,
  getStudyYears,
  getProjectStats
  // getUploadStatus - ไม่ได้ export จาก controller
  // cancelUpload - ไม่ได้ export จาก controller
  // upload - ไม่ได้ export จาก controller
} from '../../controllers/user/projectController.js';
import { authenticateToken, isAdmin, isResourceOwner } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';
import storageService from '../../services/storageService.js';
import { optionalAuthenticateToken } from '../../middleware/optionalAuthenticateToken.js';

const router = express.Router();

const projectUploader = (req, res, next) => {
  // สร้าง multer uploader ที่รองรับหลายประเภทไฟล์
  const upload = storageService.createUploader('images', { maxSize: 10 * 1024 * 1024 });
  
  // กำหนดฟิลด์ไฟล์ที่จะรับ
  const uploadFields = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'courseworkPoster', maxCount: 1 },
    { name: 'courseworkVideo', maxCount: 1 },
    { name: 'paperFile', maxCount: 1 },
    { name: 'competitionPoster', maxCount: 1 }
  ]);
  
  // ใช้ middleware
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `File upload error: ${err.message}`
      });
    }
    next();
  });
};

const projectUpdateUploader = (req, res, next) => {
  // สร้าง multer uploader ที่รองรับหลายประเภทไฟล์
  const upload = storageService.createUploader('images', { maxSize: 10 * 1024 * 1024 });
  
  // กำหนดฟิลด์ไฟล์ที่จะรับ - เพิ่มฟิลด์ที่อาจต้องการสำหรับการอัปเดต
  const uploadFields = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'posterImage', maxCount: 1 },
    { name: 'courseworkPoster', maxCount: 1 },
    { name: 'courseworkImage', maxCount: 5 },
    { name: 'courseworkVideo', maxCount: 1 },
    { name: 'competitionPoster', maxCount: 1 },
    { name: 'paperFile', maxCount: 1 },
    { name: 'additionalFiles', maxCount: 5 }
  ]);
  
  // ใช้ middleware
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `File upload error: ${err.message}`
      });
    }
    next();
  });
};

router.post(
  '/user/:user_id', // ใช้ path ตรงๆ แทน API_ROUTES
  authenticateToken, 
  isResourceOwner,
  projectUploader, // เพิ่ม middleware สำหรับการอัปโหลดไฟล์
  uploadProject
);

// อัปโหลดไฟล์สำหรับโครงการ
router.post(
  '/:projectId/files', // ใช้ path ตรงๆ แทน API_ROUTES
  authenticateToken,
  (req, res, next) => {
    // สร้าง uploader สำหรับไฟล์เดียว
    const upload = storageService.createUploader('images', { maxSize: 10 * 1024 * 1024 });
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: `File upload error: ${err.message}`
        });
      }
      next();
    });
  },
  uploadProjectFile
);

// ดึงข้อมูลโครงการทั้งหมดที่ได้รับการอนุมัติแล้ว
router.get(API_ROUTES.PROJECT.GET_ALL, getAllProjects);

// ดึงข้อมูลโครงการยอดนิยม 9 อันดับแรก
router.get(API_ROUTES.PROJECT.TOP, getTop9Projects);

// ดึงข้อมูลโครงการล่าสุด 9 โครงการ
router.get(API_ROUTES.PROJECT.LATEST, getLatestProjects);

// ดึงข้อมูลโครงการของผู้ใช้คนนั้น ๆ (ต้องล็อกอินก่อน)
router.get(API_ROUTES.PROJECT.MY_PROJECTS, authenticateToken, isResourceOwner, getMyProjects);

// ดึงข้อมูลรายละเอียดโครงการตาม project_id
router.get(API_ROUTES.PROJECT.GET_BY_ID, optionalAuthenticateToken, getProjectDetails);

// ค้นหาโครงการตามเงื่อนไขต่าง ๆ
router.get(API_ROUTES.PROJECT.SEARCH, searchProjects);

// ดึงข้อมูลประเภทโครงการทั้งหมด (สำหรับ dropdown)
router.get(API_ROUTES.PROJECT.TYPES, getProjectTypes);

// ดึงข้อมูลปีการศึกษาทั้งหมดที่มีในระบบ (สำหรับ dropdown)
router.get(API_ROUTES.PROJECT.YEARS, getProjectYears);

// ดึงข้อมูลชั้นปีของนักศึกษาทั้งหมด (สำหรับ dropdown)
router.get(API_ROUTES.PROJECT.STUDY_YEARS, getStudyYears);

// อัปโหลดโครงการใหม่ - ต้องแก้ไขเพราะไม่มี upload export ออกมา
router.post(
  API_ROUTES.PROJECT.UPLOAD, 
  authenticateToken, 
  isResourceOwner, 
  uploadProject
);

// ใช้ route อย่างง่ายไปก่อน ไม่ใช้ multer upload
router.post(
  API_ROUTES.PROJECT.UPLOAD, 
  authenticateToken, 
  isResourceOwner, 
  uploadProject
);

// อัปโหลดไฟล์สำหรับโครงการ - ต้องแก้ไขเพราะไม่มี upload export ออกมา
// router.post(
//   API_ROUTES.PROJECT.UPLOAD_FILE, 
//   authenticateToken, 
//   upload.single('file'), 
//   uploadProjectFile
// );

// ใช้ route อย่างง่ายไปก่อน ไม่ใช้ multer upload
router.post(
  API_ROUTES.PROJECT.UPLOAD_FILE, 
  authenticateToken, 
  uploadProjectFile
);

// เช็คสถานะการอัปโหลด - ต้องแก้ไขเพราะไม่มีฟังก์ชัน getUploadStatus
// router.get(
//   API_ROUTES.PROJECT.UPLOAD_STATUS, 
//   authenticateToken, 
//   getUploadStatus
// );

// ยกเลิกการอัปโหลด - ต้องแก้ไขเพราะไม่มีฟังก์ชัน cancelUpload
// router.post(
//   API_ROUTES.PROJECT.CANCEL_UPLOAD, 
//   authenticateToken, 
//   cancelUpload
// );

// อัปเดตโครงการ
router.put(
  API_ROUTES.PROJECT.UPDATE, 
  authenticateToken, 
  isResourceOwner,
  projectUpdateUploader,
  updateProjectWithFiles
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