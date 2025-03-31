import express from 'express';
import { getAllProjects, getTop9Projects, getLatestProjects, getMyProjects, getProjectDetails, uploadProject } from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route สำหรับดึงข้อมูลโครงการทั้งหมด
router.get('/all', getAllProjects);

// Route สำหรับดึงข้อมูลโครงการที่ได้รับการดูมากที่สุด (Top 9)
router.get('/top9', getTop9Projects);

// Route สำหรับดึงข้อมูลโครงการล่าสุด (Latest 9)
router.get('/latest', getLatestProjects);

// Route สำหรับดึงข้อมูลโครงการของผู้ใช้ที่เข้าสู่ระบบ
router.get('/myprojects/:user_id', getMyProjects);

// Route สำหรับดึงข้อมูลรายละเอียดทั้งหมดของโครงการตาม project_id
router.get('/project/:projectId', getProjectDetails); // This route will accept a project ID

router.post('/upload/:user_id', authenticateToken, uploadProject);

export default router;
