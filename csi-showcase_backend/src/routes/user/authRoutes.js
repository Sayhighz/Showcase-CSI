// routes/user/authRoutes.js

import express from 'express';
import {
  login,
  getCurrentUser,
  verifyToken,
  logout,
} from '../../controllers/user/authController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related APIs
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/verify-token:
 *   get:
 *     summary: Verify user token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Unauthorized
 */


// เข้าสู่ระบบ
router.post(API_ROUTES.AUTH.LOGIN, login);

// ตรวจสอบ token
router.get(API_ROUTES.AUTH.VERIFY_TOKEN, authenticateToken, verifyToken);

// ออกจากระบบ (สำหรับการเรียกโดย frontend)
router.post(API_ROUTES.AUTH.LOGOUT, logout);

// ดึงข้อมูลผู้ใช้ปัจจุบัน
router.get(API_ROUTES.AUTH.ME, authenticateToken, getCurrentUser);

export default router;