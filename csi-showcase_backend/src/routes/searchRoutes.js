import express from 'express';
import { searchProjects } from '../controllers/searchController.js';

const router = express.Router();

router.get('/projects', searchProjects);

export default router;
