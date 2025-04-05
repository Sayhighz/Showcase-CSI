// ===== routes/admin/statisticsRoutes.js =====

import express from 'express';
import { 
  getDashboardStats,
  getTodayStats,
  getProjectTypeStats,
  getStudyYearStats
} from '../../controllers/admin/statisticsController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { checkAdminSecretKey } from '../../middleware/secretKeyMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Statistics
 *   description: Administrative statistics and analytics endpoints
 */

/**
 * @swagger
 * /api/admin/stats/dashboard:
 *   get:
 *     summary: Get overall dashboard statistics
 *     description: Retrieve comprehensive statistics for the admin dashboard including users, projects, and views
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *       - adminSecretKey: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totals:
 *                       type: object
 *                     projectStats:
 *                       type: object
 *                     userStats:
 *                       type: object
 *                     viewStats:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.STATISTICS.DASHBOARD.replace(API_ROUTES.ADMIN.STATISTICS.BASE, ''),
  [checkAdminSecretKey, authenticateToken, isAdmin],
  getDashboardStats
);

/**
 * @swagger
 * /api/admin/stats/today:
 *   get:
 *     summary: Get today's statistics
 *     description: Retrieve today's statistics and compare with previous averages
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *       - adminSecretKey: []
 *     responses:
 *       200:
 *         description: Today's statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logins:
 *                       type: object
 *                     views:
 *                       type: object
 *                     projects:
 *                       type: object
 *                     users:
 *                       type: object
 *                     reviews:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: Today statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  '/today',
  [checkAdminSecretKey, authenticateToken, isAdmin],
  getTodayStats
);

/**
 * @swagger
 * /api/admin/stats/project-types:
 *   get:
 *     summary: Get statistics by project type
 *     description: Retrieve detailed statistics categorized by project types
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *       - adminSecretKey: []
 *     responses:
 *       200:
 *         description: Project type statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                     monthlyTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                 message:
 *                   type: string
 *                   example: Project type statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  '/project-types',
  [checkAdminSecretKey, authenticateToken, isAdmin],
  getProjectTypeStats
);

/**
 * @swagger
 * /api/admin/stats/study-years:
 *   get:
 *     summary: Get statistics by study year
 *     description: Retrieve detailed statistics categorized by student study years
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *       - adminSecretKey: []
 *     responses:
 *       200:
 *         description: Study year statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: Study year statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  '/study-years',
  [checkAdminSecretKey, authenticateToken, isAdmin],
  getStudyYearStats
);

export default router;