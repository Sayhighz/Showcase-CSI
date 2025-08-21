// routes/admin/statisticsRoutes.js

const express = require('express');
const { 
  getDashboardStats,
  getTodayStats,
  getProjectTypeStats,
  getStudyYearStats
} = require('../../controllers/admin/statisticsController.js');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware.js');
const { API_ROUTES } = require('../../constants/routes.js');

const router = express.Router();

/**
 * @swagger
 * /api/admin/stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieves comprehensive statistics for the admin dashboard, including user metrics, project metrics, and activity trends
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
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
 *                 message:
 *                   type: string
 *                   example: "Dashboard statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totals:
 *                       type: object
 *                       properties:
 *                         projects:
 *                           type: integer
 *                           description: Total number of projects
 *                           example: 124
 *                         users:
 *                           type: integer
 *                           description: Total number of users
 *                           example: 85
 *                         views:
 *                           type: integer
 *                           description: Total number of views
 *                           example: 3240
 *                     projectStats:
 *                       type: object
 *                       properties:
 *                         byType:
 *                           type: array
 *                           description: Projects categorized by type
 *                           items:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 example: "coursework"
 *                               count:
 *                                 type: integer
 *                                 example: 42
 *                         byStatus:
 *                           type: array
 *                           description: Projects categorized by status
 *                           items:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                                 example: "approved"
 *                               count:
 *                                 type: integer
 *                                 example: 85
 *                         byMonth:
 *                           type: array
 *                           description: Project uploads over time (12 months)
 *                           items:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: string
 *                                 example: "2024-03"
 *                               count:
 *                                 type: integer
 *                                 example: 12
 *                         topViewed:
 *                           type: array
 *                           description: Most viewed projects
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 42
 *                               title:
 *                                 type: string
 *                                 example: "AI Image Recognition System"
 *                               viewsCount:
 *                                 type: integer
 *                                 example: 156
 *                               category:
 *                                 type: string
 *                                 example: "competition"
 *                               author:
 *                                 type: object
 *                                 properties:
 *                                   username:
 *                                     type: string
 *                                     example: "johndoe"
 *                                   fullName:
 *                                     type: string
 *                                     example: "John Doe"
 *                     userStats:
 *                       type: object
 *                       properties:
 *                         byRole:
 *                           type: array
 *                           description: Users categorized by role
 *                           items:
 *                             type: object
 *                             properties:
 *                               role:
 *                                 type: string
 *                                 example: "student"
 *                               count:
 *                                 type: integer
 *                                 example: 78
 *                         byMonth:
 *                           type: array
 *                           description: User registrations over time (12 months)
 *                           items:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: string
 *                                 example: "2024-03"
 *                               count:
 *                                 type: integer
 *                                 example: 8
 *                         topContributors:
 *                           type: array
 *                           description: Users with most projects
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 15
 *                               username:
 *                                 type: string
 *                                 example: "janedoe"
 *                               fullName:
 *                                 type: string
 *                                 example: "Jane Doe"
 *                               projectCount:
 *                                 type: integer
 *                                 example: 7
 *                     viewStats:
 *                       type: object
 *                       properties:
 *                         byMonth:
 *                           type: array
 *                           description: Views over time (12 months)
 *                           items:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: string
 *                                 example: "2024-03"
 *                               count:
 *                                 type: integer
 *                                 example: 245
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.STATISTICS.DASHBOARD, 
  [authenticateToken, isAdmin],
  getDashboardStats
);

/**
 * @swagger
 * /api/admin/stats/today:
 *   get:
 *     summary: Get today's statistics
 *     description: Retrieves today's statistics compared with yesterday and provides percentage changes
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
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
 *                 message:
 *                   type: string
 *                   example: "Today statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                           description: New projects uploaded today
 *                           example: 5
 *                         yesterday:
 *                           type: integer
 *                           description: New projects uploaded yesterday
 *                           example: 3
 *                         percentChange:
 *                           type: integer
 *                           description: Percentage change
 *                           example: 66
 *                     users:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                           description: New users registered today
 *                           example: 2
 *                         yesterday:
 *                           type: integer
 *                           description: New users registered yesterday
 *                           example: 3
 *                         percentChange:
 *                           type: integer
 *                           description: Percentage change
 *                           example: -33
 *                     views:
 *                       type: object
 *                       properties:
 *                         visitor:
 *                           type: object
 *                           properties:
 *                             today:
 *                               type: integer
 *                               example: 42
 *                             yesterday:
 *                               type: integer
 *                               example: 38
 *                             percentChange:
 *                               type: integer
 *                               example: 10
 *                         company:
 *                           type: object
 *                           properties:
 *                             today:
 *                               type: integer
 *                               example: 8
 *                             yesterday:
 *                               type: integer
 *                               example: 5
 *                             percentChange:
 *                               type: integer
 *                               example: 60
 *                         total:
 *                           type: object
 *                           properties:
 *                             today:
 *                               type: integer
 *                               example: 50
 *                             yesterday:
 *                               type: integer
 *                               example: 43
 *                             percentChange:
 *                               type: integer
 *                               example: 16
 *                     logins:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                           description: Login count today
 *                           example: 28
 *                         yesterday:
 *                           type: integer
 *                           description: Login count yesterday
 *                           example: 25
 *                         percentChange:
 *                           type: integer
 *                           description: Percentage change
 *                           example: 12
 *                     reviews:
 *                       type: object
 *                       properties:
 *                         approved:
 *                           type: object
 *                           properties:
 *                             today:
 *                               type: integer
 *                               example: 3
 *                             yesterday:
 *                               type: integer
 *                               example: 2
 *                             percentChange:
 *                               type: integer
 *                               example: 50
 *                         rejected:
 *                           type: object
 *                           properties:
 *                             today:
 *                               type: integer
 *                               example: 1
 *                             yesterday:
 *                               type: integer
 *                               example: 2
 *                             percentChange:
 *                               type: integer
 *                               example: -50
 *                         total:
 *                           type: object
 *                           properties:
 *                             today:
 *                               type: integer
 *                               example: 4
 *                             yesterday:
 *                               type: integer
 *                               example: 4
 *                             percentChange:
 *                               type: integer
 *                               example: 0
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.STATISTICS.TODAY, 
  [authenticateToken, isAdmin],
  getTodayStats
);

/**
 * @swagger
 * /api/admin/stats/project-types:
 *   get:
 *     summary: Get project type statistics
 *     description: Retrieves detailed statistics broken down by project types
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
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
 *                 message:
 *                   type: string
 *                   example: "Project type statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       description: Statistics for each project type
 *                       properties:
 *                         coursework:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 45
 *                             avgViews:
 *                               type: number
 *                               format: float
 *                               example: 24.5
 *                             approvalRate:
 *                               type: number
 *                               format: float
 *                               example: 82.5
 *                             approvedCount:
 *                               type: integer
 *                               example: 33
 *                             rejectedCount:
 *                               type: integer
 *                               example: 7
 *                             totalReviewCount:
 *                               type: integer
 *                               example: 40
 *                             topProjects:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 23
 *                                   title:
 *                                     type: string
 *                                     example: "Database Design Project"
 *                                   viewsCount:
 *                                     type: integer
 *                                     example: 85
 *                                   author:
 *                                     type: object
 *                                     properties:
 *                                       username:
 *                                         type: string
 *                                         example: "student1"
 *                                       fullName:
 *                                         type: string
 *                                         example: "John Student"
 *                         competition:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 15
 *                             avgViews:
 *                               type: number
 *                               format: float
 *                               example: 42.3
 *                             approvalRate:
 *                               type: number
 *                               format: float
 *                               example: 93.3
 *                             approvedCount:
 *                               type: integer
 *                               example: 14
 *                             rejectedCount:
 *                               type: integer
 *                               example: 1
 *                             totalReviewCount:
 *                               type: integer
 *                               example: 15
 *                             topProjects:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   title:
 *                                     type: string
 *                                   viewsCount:
 *                                     type: integer
 *                                   author:
 *                                     type: object
 *                                     properties:
 *                                       username:
 *                                         type: string
 *                                       fullName:
 *                                         type: string
 *                         academic:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 20
 *                             avgViews:
 *                               type: number
 *                               format: float
 *                               example: 18.7
 *                             approvalRate:
 *                               type: number
 *                               format: float
 *                               example: 85.0
 *                             approvedCount:
 *                               type: integer
 *                               example: 17
 *                             rejectedCount:
 *                               type: integer
 *                               example: 3
 *                             totalReviewCount:
 *                               type: integer
 *                               example: 20
 *                             topProjects:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   title:
 *                                     type: string
 *                                   viewsCount:
 *                                     type: integer
 *                                   author:
 *                                     type: object
 *                                     properties:
 *                                       username:
 *                                         type: string
 *                                       fullName:
 *                                         type: string
 *                     monthlyTrends:
 *                       type: array
 *                       description: Monthly trends for each project type
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-03"
 *                           coursework:
 *                             type: integer
 *                             example: 7
 *                           academic:
 *                             type: integer
 *                             example: 3
 *                           competition:
 *                             type: integer
 *                             example: 2
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.STATISTICS.PROJECT_TYPES, 
  [authenticateToken, isAdmin],
  getProjectTypeStats
);

/**
 * @swagger
 * /api/admin/stats/study-years:
 *   get:
 *     summary: Get study year statistics
 *     description: Retrieves detailed statistics broken down by student study years
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
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
 *                 message:
 *                   type: string
 *                   example: "Study year statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       description: Statistics for each study year
 *                       properties:
 *                         1:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 12
 *                             avgViews:
 *                               type: number
 *                               format: float
 *                               example: 15.8
 *                             approvalRate:
 *                               type: number
 *                               format: float
 *                               example: 75.0
 *                             approvedCount:
 *                               type: integer
 *                               example: 9
 *                             rejectedCount:
 *                               type: integer
 *                               example: 3
 *                             totalReviewCount:
 *                               type: integer
 *                               example: 12
 *                             byType:
 *                               type: object
 *                               properties:
 *                                 coursework:
 *                                   type: integer
 *                                   example: 10
 *                                 academic:
 *                                   type: integer
 *                                   example: 1
 *                                 competition:
 *                                   type: integer
 *                                   example: 1
 *                             topProjects:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 14
 *                                   title:
 *                                     type: string
 *                                     example: "Introduction to Programming"
 *                                   viewsCount:
 *                                     type: integer
 *                                     example: 45
 *                                   type:
 *                                     type: string
 *                                     example: "coursework"
 *                                   author:
 *                                     type: object
 *                                     properties:
 *                                       username:
 *                                         type: string
 *                                         example: "firstyear1"
 *                                       fullName:
 *                                         type: string
 *                                         example: "First Year Student"
 *                         2:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 25
 *                             avgViews:
 *                               type: number
 *                               format: float
 *                             approvalRate:
 *                               type: number
 *                               format: float
 *                             approvedCount:
 *                               type: integer
 *                             rejectedCount:
 *                               type: integer
 *                             totalReviewCount:
 *                               type: integer
 *                             byType:
 *                               type: object
 *                               properties:
 *                                 coursework:
 *                                   type: integer
 *                                 academic:
 *                                   type: integer
 *                                 competition:
 *                                   type: integer
 *                             topProjects:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         3:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 35
 *                             avgViews:
 *                               type: number
 *                               format: float
 *                             approvalRate:
 *                               type: number
 *                               format: float
 *                             approvedCount:
 *                               type: integer
 *                             rejectedCount:
 *                               type: integer
 *                             totalReviewCount:
 *                               type: integer
 *                             byType:
 *                               type: object
 *                               properties:
 *                                 coursework:
 *                                   type: integer
 *                                 academic:
 *                                   type: integer
 *                                 competition:
 *                                   type: integer
 *                             topProjects:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         4:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 45
 *                             avgViews:
 *                               type: number
 *                               format: float
 *                             approvalRate:
 *                               type: number
 *                               format: float
 *                             approvedCount:
 *                               type: integer
 *                             rejectedCount:
 *                               type: integer
 *                             totalReviewCount:
 *                               type: integer
 *                             byType:
 *                               type: object
 *                               properties:
 *                                 coursework:
 *                                   type: integer
 *                                 academic:
 *                                   type: integer
 *                                 competition:
 *                                   type: integer
 *                             topProjects:
 *                               type: array
 *                               items:
 *                                 type: object
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get(
  API_ROUTES.ADMIN.STATISTICS.STUDY_YEARS, 
  [authenticateToken, isAdmin],
  getStudyYearStats

);

module.exports = router;