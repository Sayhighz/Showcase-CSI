// routes/admin/adminUserRoutes.js

import express from 'express';
import { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} from '../../controllers/admin/adminUserController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';
import { uploadProfileImage } from '../../controllers/common/uploadController.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

/**
 * @swagger
 * /api/admin/users/all:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a paginated list of all users with filtering options. Admin only.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, admin, visitor]
 *         description: Filter users by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username, full name, or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: "johndoe"
 *                           full_name:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                           role:
 *                             type: string
 *                             example: "student"
 *                             enum: [student, admin, visitor]
 *                           image:
 *                             type: string
 *                             nullable: true
 *                             example: "uploads/profiles/profile-123.jpg"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           project_count:
 *                             type: integer
 *                             example: 5
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Internal Server Error
 */
router.get(
  API_ROUTES.ADMIN.USER.ALL, 
  adminAuth, 
  getAllUsers
);

/**
 * @swagger
 * /api/admin/users/user/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves detailed information for a specific user including their projects and login history. Admin only.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                   example: "User retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     full_name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     role:
 *                       type: string
 *                       example: "student"
 *                     image:
 *                       type: string
 *                       nullable: true
 *                       example: "uploads/profiles/profile-123.jpg"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           title:
 *                             type: string
 *                             example: "Database Project"
 *                           category:
 *                             type: string
 *                             example: "coursework"
 *                           level:
 *                             type: string
 *                             example: "ปี 2"
 *                           year:
 *                             type: integer
 *                             example: 2024
 *                           status:
 *                             type: string
 *                             example: "approved"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           image:
 *                             type: string
 *                             example: "uploads/images/image-123.jpg"
 *                           projectLink:
 *                             type: string
 *                             example: "/projects/5"
 *                     loginHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           log_id:
 *                             type: integer
 *                             example: 42
 *                           login_time:
 *                             type: string
 *                             format: date-time
 *                           ip_address:
 *                             type: string
 *                             example: "192.168.1.1"
 *       400:
 *         description: Bad Request - Invalid user ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
  API_ROUTES.ADMIN.USER.GET_BY_ID, 
  adminAuth, 
  getUserById
);

/**
 * @swagger
 * /api/admin/users/create:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user in the system. Admin only.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - full_name
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newuser"
 *                 description: Unique username (4-20 characters, alphanumeric and underscore only)
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *                 description: User password (min 8 characters)
 *               full_name:
 *                 type: string
 *                 example: "New User"
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@example.com"
 *                 description: User's email address
 *               role:
 *                 type: string
 *                 enum: [student, admin, visitor]
 *                 default: student
 *                 description: User role
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: User profile image
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 15
 *                         username:
 *                           type: string
 *                           example: "newuser"
 *                         full_name:
 *                           type: string
 *                           example: "New User"
 *                         email:
 *                           type: string
 *                           example: "newuser@example.com"
 *                         role:
 *                           type: string
 *                           example: "student"
 *                         image:
 *                           type: string
 *                           nullable: true
 *                           example: "uploads/profiles/profile-123.jpg"
 *       400:
 *         description: Bad Request - Missing required fields or validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       409:
 *         description: Conflict - Username or email already exists
 *       422:
 *         description: Unprocessable Entity - Validation errors
 *       500:
 *         description: Internal Server Error
 */
router.post(
  API_ROUTES.ADMIN.USER.CREATE, 
  adminAuth,
  uploadProfileImage,
  createUser
);

/**
 * @swagger
 * /api/admin/users/update/{userId}:
 *   put:
 *     summary: Update user
 *     description: Updates an existing user's information. Admin only.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "updatedusername"
 *                 description: Updated username (4-20 characters, alphanumeric and underscore only)
 *               full_name:
 *                 type: string
 *                 example: "Updated User"
 *                 description: Updated full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "updated@example.com"
 *                 description: Updated email address
 *               role:
 *                 type: string
 *                 enum: [student, admin, visitor]
 *                 description: Updated user role
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: "User updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 5
 *                         username:
 *                           type: string
 *                           example: "updatedusername"
 *                         full_name:
 *                           type: string
 *                           example: "Updated User"
 *                         email:
 *                           type: string
 *                           example: "updated@example.com"
 *                         role:
 *                           type: string
 *                           example: "student"
 *       400:
 *         description: Bad Request - Invalid user ID or validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: User not found
 *       409:
 *         description: Conflict - Username or email already exists
 *       422:
 *         description: Unprocessable Entity - Validation errors
 *       500:
 *         description: Internal Server Error
 */
router.put(
  API_ROUTES.ADMIN.USER.UPDATE, 
  adminAuth, 
  updateUser
);

/**
 * @swagger
 * /api/admin/users/delete/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: Deletes a user from the system. Admin cannot delete their own account. Admin only.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "User deleted successfully"
 *       400:
 *         description: Bad Request - Invalid user ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin cannot delete their own account
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
  API_ROUTES.ADMIN.USER.DELETE, 
  adminAuth, 
  deleteUser
);

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieves comprehensive user statistics for the admin dashboard. Admin only.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                   example: "User statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 85
 *                       description: Total number of users in the system
 *                     usersByRole:
 *                       type: array
 *                       description: User counts by role
 *                       items:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: string
 *                             example: "student"
 *                           count:
 *                             type: integer
 *                             example: 76
 *                     usersByMonth:
 *                       type: array
 *                       description: User registrations over time (12 months)
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-03"
 *                           count:
 *                             type: integer
 *                             example: 8
 *                     recentLogins:
 *                       type: array
 *                       description: 5 most recent user logins
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12
 *                           username:
 *                             type: string
 *                             example: "recentuser"
 *                           fullName:
 *                             type: string
 *                             example: "Recent User"
 *                           role:
 *                             type: string
 *                             example: "student"
 *                           loginTime:
 *                             type: string
 *                             format: date-time
 *                           ipAddress:
 *                             type: string
 *                             example: "192.168.1.5"
 *                     topContributors:
 *                       type: array
 *                       description: 5 users with the most projects
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 3
 *                           username:
 *                             type: string
 *                             example: "topcontributor"
 *                           fullName:
 *                             type: string
 *                             example: "Top Contributor"
 *                           projectCount:
 *                             type: integer
 *                             example: 12
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Internal Server Error
 */
router.get(
  API_ROUTES.ADMIN.USER.STATS, 
  adminAuth, 
  getUserStats
);

export default router;