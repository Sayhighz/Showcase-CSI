// routes/user/searchRoutes.js

const express = require('express');
const { searchProjects, searchStudents } = require('../../controllers/user/searchController.js');
const { authenticateToken } = require('../../middleware/authMiddleware.js');
const { API_ROUTES } = require('../../constants/routes.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search related APIs
 */

/**
 * @swagger
 * /api/search/projects:
 *   get:
 *     summary: Search projects
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search for projects (optional)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [coursework, competition, academic]
 *         description: Type of project (optional)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year of the project (optional)
 *       - in: query
 *         name: studyYear
 *         schema:
 *           type: integer
 *         description: Study year of the student (optional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page (optional)
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           category:
 *                             type: string
 *                           level:
 *                             type: string
 *                           year:
 *                             type: integer
 *                           image:
 *                             type: string
 *                           student:
 *                             type: string
 *                           studentId:
 *                             type: integer
 *                           projectLink:
 *                             type: string
 *                     pagination:
 *                       type: object
 */


/**
 * @swagger
 * /api/search/users:
 *   get:
 *     summary: Search students (Requires Authentication)
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Keyword to search for students
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of students to return
 *     responses:
 *       200:
 *         description: List of students
 *       400:
 *         description: Keyword is missing
 *       401:
 *         description: Unauthorized
 */


router.get('/projects', searchProjects);
router.get('/users', authenticateToken, searchStudents);

module.exports = router;