// routes/user/searchRoutes.js

import express from 'express';
import { searchProjects, searchStudents } from '../../controllers/user/searchController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

router.get(API_ROUTES.SEARCH.PROJECTS, searchProjects);
router.get(API_ROUTES.SEARCH.USERS, authenticateToken, searchStudents);

export default router;