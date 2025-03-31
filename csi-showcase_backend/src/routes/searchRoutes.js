import express from 'express';
import { searchProjects, searchStudents } from '../controllers/searchController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/projects', searchProjects);
router.get('/users', searchStudents, authenticateToken);

export default router;
