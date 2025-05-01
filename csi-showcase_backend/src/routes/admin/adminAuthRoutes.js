// routes/admin/adminAuthRoutes.js

import express from 'express';
import { 
  adminLogin, 
  getCurrentAdmin, 
  verifyAdminToken, 
  adminLogout,
} from '../../controllers/admin/adminAuthController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';
import { checkSecretKey } from '../../middleware/secretKeyMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticates an admin user and generates a JWT token
 *     tags: [Admin Authentication]
 *     security:
 *       - {}
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
 *                 description: Admin username
 *               password:
 *                 type: string
 *                 description: Admin password
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Admin user ID
 *                         username:
 *                           type: string
 *                           description: Admin username
 *                         fullName:
 *                           type: string
 *                           description: Admin full name
 *                         email:
 *                           type: string
 *                           description: Admin email
 *                         role:
 *                           type: string
 *                           example: "admin"
 *                         image:
 *                           type: string
 *                           description: Admin profile image path
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Not an admin user
 */
router.post(
  API_ROUTES.ADMIN.AUTH.LOGIN, 
  checkSecretKey, 
  adminLogin
);

/**
 * @swagger
 * /api/admin/auth/verify-token:
 *   get:
 *     summary: Verify admin token
 *     description: Verifies if the provided admin token is valid
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin token is valid"
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         image:
 *                           type: string
 *                         role:
 *                           type: string
 *                           example: "admin"
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: Not an admin user
 */
router.get(
  API_ROUTES.ADMIN.AUTH.VERIFY_TOKEN, 
  authenticateToken, 
  isAdmin, 
  verifyAdminToken
);

/**
 * @swagger
 * /api/admin/auth/me:
 *   get:
 *     summary: Get current admin
 *     description: Retrieves the current admin user information
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin info retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not an admin user
 *       404:
 *         description: Admin user not found
 */
router.get(
  API_ROUTES.ADMIN.AUTH.ME, 
  authenticateToken, 
  isAdmin, 
  getCurrentAdmin
);


/**
 * @swagger
 * /api/admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     description: Logs out an admin user by revoking their token
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin logout successful"
 *       401:
 *         description: Authentication required
 */
router.post(
  API_ROUTES.ADMIN.AUTH.LOGOUT, 
  authenticateToken, 
  isAdmin, 
  adminLogout
);

export default router;