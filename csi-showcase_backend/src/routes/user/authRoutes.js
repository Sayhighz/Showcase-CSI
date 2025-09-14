// routes/user/authRoutes.js

const express = require('express');
const {
  login,
  getCurrentUser,
  verifyToken,
  logout,
  forgotPassword,
  resetPassword,
} = require('../../controllers/user/authController.js');
const { authenticateToken, isResourceOwner } = require('../../middleware/authMiddleware.js');
const { uploadProfileImage } = require('../../controllers/common/uploadController.js');
const { updateUser, changeUserPassword } = require('../../controllers/admin/adminUserController.js');
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

// ขออีเมลลิงก์รีเซ็ตรหัสผ่าน (ไม่ต้อง authenticate)
router.post('/forgot-password', forgotPassword);

// รีเซ็ตรหัสผ่านด้วย token (ไม่ต้อง authenticate)
router.post('/reset-password', resetPassword);

// ตรวจสอบ token
router.get('/verify-token', authenticateToken, verifyToken);

// ออกจากระบบ (สำหรับการเรียกโดย frontend)
router.post('/logout', logout);

// ดึงข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', authenticateToken, getCurrentUser);

// อัปเดตข้อมูลผู้ใช้ปัจจุบัน
router.put('/me',
  authenticateToken,
  (req, res, next) => {
    // Set the user_id parameter for the middleware
    req.params.userId = req.user.id;
    next();
  },
  updateUser
);

// อัปโหลดรูปโปรไฟล์ผู้ใช้ปัจจุบัน
router.post('/me/profile-image',
  authenticateToken,
  uploadProfileImage,
  (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'No file uploaded'
        });
      }
      // Set the user_id parameter for the middleware
      req.params.userId = req.user.id;
      // Forward to updateUser controller with only the image field
      req.body = { image: req.file.path };
      next();
    } catch (err) {
      next(err);
    }
  },
  updateUser
);

// เปลี่ยนรหัสผ่านผู้ใช้ปัจจุบัน
router.post('/me/change-password',
  authenticateToken,
  (req, res, next) => {
    // Set the user_id parameter for the middleware
    req.params.userId = req.user.id;
    next();
  },
  changeUserPassword
);

module.exports = router;