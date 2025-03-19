import express from 'express';
import { login, getUser } from '../controllers/loginController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route สำหรับ login
router.post('/login', login);

// Route สำหรับตรวจสอบข้อมูลผู้ใช้ (ต้องใช้ token)
router.get('/user', authenticateToken, getUser);

export default router;
