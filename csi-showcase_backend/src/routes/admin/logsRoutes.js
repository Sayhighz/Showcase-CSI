// routes/admin/logsRoutes.js

import express from 'express';
import { 
  getAllLoginLogs, 
  getVisitorViews,
  getProjectReviews,
  getSystemStats,
  getDailyStats
} from '../../controllers/admin/logsController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

/**
 * @swagger
 * /api/admin/logs/login-logs:
 *   get:
 *     summary: Get all login logs
 *     description: Retrieves login history for all users with pagination and filtering options
 *     tags: [Admin Logs]
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
 *         description: Number of items per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by login date (start date)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by login date (end date)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username, full name, IP address, or device info
 *     responses:
 *       200:
 *         description: Login logs retrieved successfully
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
 *                   example: "Login logs retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           userId:
 *                             type: integer
 *                           username:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           role:
 *                             type: string
 *                           loginTime:
 *                             type: string
 *                             format: date-time
 *                           ipAddress:
 *                             type: string
 *                           device:
 *                             type: string
 *                           os:
 *                             type: string
 *                           browser:
 *                             type: string
 *                           userAgent:
 *                             type: string
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.LOGS.LOGIN_LOGS, 
  adminAuth, 
  getAllLoginLogs
);


/**
 * @swagger
 * /api/admin/logs/visitor-views:
 *   get:
 *     summary: Get visitor views
 *     description: Retrieves history of project views by regular visitors with pagination and filtering options
 *     tags: [Admin Logs]
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
 *         description: Number of items per page
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: Filter by project ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for IP address or project title
 *     responses:
 *       200:
 *         description: Visitor views retrieved successfully
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
 *                   example: "Visitor views retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     views:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           projectId:
 *                             type: integer
 *                           projectTitle:
 *                             type: string
 *                           ipAddress:
 *                             type: string
 *                           userAgent:
 *                             type: string
 *                           viewedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.LOGS.VISITOR_VIEWS, 
  adminAuth, 
  getVisitorViews
);

/**
 * @swagger
 * /api/admin/logs/project-reviews:
 *   get:
 *     summary: Get project reviews
 *     description: Retrieves history of project reviews by admins with pagination and filtering options
 *     tags: [Admin Logs]
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
 *         description: Number of items per page
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: Filter by project ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, rejected, updated]
 *         description: Filter by review status
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: integer
 *         description: Filter by admin ID
 *     responses:
 *       200:
 *         description: Project reviews retrieved successfully
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
 *                   example: "Project reviews retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           projectId:
 *                             type: integer
 *                           projectTitle:
 *                             type: string
 *                           projectType:
 *                             type: string
 *                           admin:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               username:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                           status:
 *                             type: string
 *                             enum: [approved, rejected, updated]
 *                           comment:
 *                             type: string
 *                           reviewedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.LOGS.PROJECT_REVIEWS, 
  adminAuth, 
  getProjectReviews
);

/**
 * @swagger
 * /api/admin/logs/system-stats:
 *   get:
 *     summary: Get system statistics
 *     description: Retrieves comprehensive system statistics including logins, views, and activity trends
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
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
 *                   example: "System statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalLogins:
 *                       type: integer
 *                       description: Total number of logins
 *                     loginsByDay:
 *                       type: array
 *                       description: Login counts for the last 30 days
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: integer
 *                     totalViews:
 *                       type: integer
 *                       description: Total number of project views
 *                     viewsByDay:
 *                       type: array
 *                       description: View counts for the last 30 days
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           visitorCount:
 *                             type: integer
 *                           companyCount:
 *                             type: integer
 *                           totalCount:
 *                             type: integer
 *                     projectsByDay:
 *                       type: array
 *                       description: Project upload counts for the last 30 days
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: integer
 *                     usersByDay:
 *                       type: array
 *                       description: User registration counts for the last 30 days
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: integer
 *                     reviewsByDay:
 *                       type: array
 *                       description: Project review counts for the last 30 days
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: integer
 *                           status:
 *                             type: string
 *                     reviewsByStatus:
 *                       type: array
 *                       description: Project review counts by status
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.LOGS.SYSTEM_STATS, 
  adminAuth, 
  getSystemStats
);

/**
 * @swagger
 * /api/admin/logs/daily-stats:
 *   get:
 *     summary: Get daily statistics
 *     description: Retrieves daily statistics compared to the 7-day average
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily statistics retrieved successfully
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
 *                   example: "Daily statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     logins:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                           description: Login count for today
 *                         average:
 *                           type: number
 *                           format: float
 *                           description: Average login count for the past 7 days
 *                         percentChange:
 *                           type: integer
 *                           description: Percentage change compared to the average
 *                     views:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                           description: Total view count for today
 *                         visitor:
 *                           type: integer
 *                           description: Visitor view count for today
 *                         company:
 *                           type: integer
 *                           description: Company view count for today
 *                         average:
 *                           type: number
 *                           format: float
 *                           description: Average view count for the past 7 days
 *                         percentChange:
 *                           type: integer
 *                           description: Percentage change compared to the average
 *                     projects:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                           description: Project upload count for today
 *                         average:
 *                           type: number
 *                           format: float
 *                           description: Average project upload count for the past 7 days
 *                         percentChange:
 *                           type: integer
 *                           description: Percentage change compared to the average
 *                     users:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                           description: User registration count for today
 *                         average:
 *                           type: number
 *                           format: float
 *                           description: Average user registration count for the past 7 days
 *                         percentChange:
 *                           type: integer
 *                           description: Percentage change compared to the average
 *                     reviews:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                           description: Total review count for today
 *                         approved:
 *                           type: integer
 *                           description: Approved project count for today
 *                         rejected:
 *                           type: integer
 *                           description: Rejected project count for today
 *                         average:
 *                           type: number
 *                           format: float
 *                           description: Average review count for the past 7 days
 *                         percentChange:
 *                           type: integer
 *                           description: Percentage change compared to the average
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.LOGS.DAILY_STATS, 
  adminAuth, 
  getDailyStats
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *         totalItems:
 *           type: integer
 *           description: Total number of items across all pages
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *         from:
 *           type: integer
 *           description: First item index on current page
 *         to:
 *           type: integer
 *           description: Last item index on current page
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *         hasPrevPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *         nextPage:
 *           type: integer
 *           nullable: true
 *           description: Next page number, or null if there is no next page
 *         prevPage:
 *           type: integer
 *           nullable: true
 *           description: Previous page number, or null if there is no previous page
 */

export default router;