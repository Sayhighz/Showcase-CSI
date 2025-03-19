import express from 'express';
import { getAllProjects, getTop9Projects, getLatestProjects } from '../controllers/projectController.js';

const router = express.Router();

// Route สำหรับดึงข้อมูลโครงการทั้งหมด
router.get('/all', getAllProjects);
router.get('/top9', getTop9Projects);
router.get('/latest', getLatestProjects);

export default router;
