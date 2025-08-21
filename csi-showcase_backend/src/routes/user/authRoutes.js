// routes/user/authRoutes.js

const express = require('express');
const {
  login,
  getCurrentUser,
  verifyToken,
  logout,
} = require('../../controllers/user/authController.js');
const { authenticateToken } = require('../../middleware/authMiddleware.js');
const { API_ROUTES } = require('../../constants/routes.js');

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
router.post('/login', login);

// ตรวจสอบ token
router.get('/verify-token', authenticateToken, verifyToken);

// ออกจากระบบ (สำหรับการเรียกโดย frontend)
router.post('/logout', logout);

// ดึงข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;