// routes/user/projectRoutes.js

const express = require('express');
const {
  getAllProjects,
  getTop9Projects,
  getLatestProjects,
  getMyProjects,
  getProjectDetails,
  uploadProject,
  updateProjectWithFiles,
  deleteProject,
  incrementViewCount,
} = require('../../controllers/user/projectController.js');
const { authenticateToken, isResourceOwner } = require('../../middleware/authMiddleware.js');
const { API_ROUTES } = require('../../constants/routes.js');
const { optionalAuthenticateToken } = require('../../middleware/optionalAuthenticateToken.js');
const { 
  projectUploadMiddleware, 
  projectUpdateMiddleware, 
} = require('../../middleware/projectUploadMiddleware.js');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - study_year
 *         - year
 *         - semester
 *       properties:
 *         title:
 *           type: string
 *           description: Project title
 *         description:
 *           type: string
 *           description: Project description
 *         type:
 *           type: string
 *           enum: [coursework, competition, academic]
 *           description: Project type
 *         study_year:
 *           type: integer
 *           description: Year of study of the student
 *         year:
 *           type: integer
 *           description: Academic year of the project
 *         semester:
 *           type: integer
 *           description: Semester of the project
 *         visibility:
 *           type: integer
 *           default: 1
 *           description: Project visibility (0=hidden, 1=visible)
 *         contributors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               role:
 *                 type: string
 *     ProjectResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         level:
 *           type: string
 *         year:
 *           type: integer
 *         image:
 *           type: string
 *           nullable: true
 *         student:
 *           type: string
 *         studentId:
 *           type: integer
 *         username:
 *           type: string
 *         userImage:
 *           type: string
 *           nullable: true
 *         projectLink:
 *           type: string
 *         viewsCount:
 *           type: integer
 *     ProjectDetailResponse:
 *       type: object
 *       properties:
 *         projectId:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         studyYear:
 *           type: integer
 *         year:
 *           type: integer
 *         semester:
 *           type: integer
 *         visibility:
 *           type: integer
 *         status:
 *           type: string
 *         author:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             fullName:
 *               type: string
 *             image:
 *               type: string
 *               nullable: true
 *             email:
 *               type: string
 *               nullable: true
 *         contributors:
 *           type: array
 *           items:
 *             type: object
 *         files:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               path:
 *                 type: string
 *               name:
 *                 type: string
 *               size:
 *                 type: integer
 *               uploadDate:
 *                 type: string
 *                 format: date-time
 *         viewsCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/projects/user/{user_id}:
 *   post:
 *     summary: Upload a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - study_year
 *               - year
 *               - semester
 *             properties:
 *               title:
 *                 type: string
 *                 description: Project title
 *               description:
 *                 type: string
 *                 description: Project description
 *               type:
 *                 type: string
 *                 enum: [coursework, competition, academic]
 *                 description: Type of project
 *               study_year:
 *                 type: integer
 *                 description: Year of study (1-4)
 *               year:
 *                 type: integer
 *                 description: Academic year of the project
 *               semester:
 *                 type: string
 *                 enum: ["1", "2", "3"]
 *                 description: Semester (1, 2, or summer)
 *               visibility:
 *                 type: integer
 *                 default: 1
 *                 description: Project visibility (0=hidden, 1=visible)
 *               contributors:
 *                 type: string
 *                 format: json
 *                 description: JSON string of contributors (array of {user_id, role})
 *               courseworkPoster:
 *                 type: string
 *                 format: binary
 *                 description: Poster image for coursework (stored as 'poster' in courseworks table)
 *               courseworkImage:
 *                 type: string
 *                 format: binary
 *                 description: Additional image for coursework (stored as 'image' in courseworks table)
 *               courseworkVideo:
 *                 type: string
 *                 format: binary
 *                 description: Video file for coursework (stored as 'clip_video' in courseworks table)
 *               clip_video:
 *                 type: string
 *                 description: Video URL for coursework (stored as 'clip_video' in courseworks table)
 *               competitionPoster:
 *                 type: string
 *                 format: binary
 *                 description: Poster image for competition (stored as 'poster' in competitions table)
 *               paperFile:
 *                 type: string
 *                 format: binary
 *                 description: Academic paper file in PDF format (stored as 'paper_file' in academic_papers table)
 *               competition_name:
 *                 type: string
 *                 description: Name of the competition (for competition type projects)
 *               competition_year:
 *                 type: integer
 *                 description: Year of the competition (for competition type projects)
 *               publication_date:
 *                 type: string
 *                 format: date
 *                 description: Publication date (for academic type projects)
 *               published_year:
 *                 type: integer
 *                 description: Published year (for academic type projects)
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: Bad request, missing required fields or invalid file format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not project owner
 *       500:
 *         description: Server error
 */
router.post(
  '/user/:user_id', // ใช้ path ตรงๆ แทน API_ROUTES
  authenticateToken, 
  isResourceOwner,
  projectUploadMiddleware, // ใช้ middleware ที่แยกออกมา
  uploadProject
);

/**
 * @swagger
 * /api/projects/all:
 *   get:
 *     summary: Get all approved projects
 *     tags: [Projects]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [coursework, competition, academic]
 *         description: Filter by project type/category
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by academic year
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *         description: Filter by study year level
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword
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
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Server error
 */
router.get(API_ROUTES.PROJECT.GET_ALL, getAllProjects);

/**
 * @swagger
 * /api/projects/top9:
 *   get:
 *     summary: Get top 9 projects by view count
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Top 9 projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Server error
 */
router.get(API_ROUTES.PROJECT.TOP, getTop9Projects);

/**
 * @swagger
 * /api/projects/latest:
 *   get:
 *     summary: Get latest 9 projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 9
 *         description: Number of items to return
 *     responses:
 *       200:
 *         description: Latest projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Server error
 */
router.get(API_ROUTES.PROJECT.LATEST, getLatestProjects);

/**
 * @swagger
 * /api/projects/user/{user_id}/my-projects:
 *   get:
 *     summary: Get projects belonging to the authenticated user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
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
 *     responses:
 *       200:
 *         description: User's projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/ProjectResponse'
 *                           - type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, can only view own projects
 *       500:
 *         description: Server error
 */
router.get('/user/:user_id/my-projects', authenticateToken, isResourceOwner, getMyProjects);

/**
 * @swagger
 * /api/projects/project/{projectId}:
 *   get:
 *     summary: Get details of a specific project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     security:
 *       - bearerAuth: []
 *       - {}  # Make security optional
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ProjectDetailResponse'
 *       403:
 *         description: Forbidden, project not publicly available
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get(API_ROUTES.PROJECT.GET_BY_ID, optionalAuthenticateToken, getProjectDetails);

/**
 * @swagger
 * /api/projects/update/{projectId}:
 *   put:
 *     summary: Update an existing project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated project title
 *               description:
 *                 type: string
 *                 description: Updated project description
 *               study_year:
 *                 type: integer
 *                 description: Updated study year
 *               year:
 *                 type: integer
 *                 description: Updated academic year
 *               semester:
 *                 type: string
 *                 enum: ["1", "2", "3"]
 *                 description: Updated semester
 *               visibility:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Updated visibility (0=hidden, 1=visible)
 *               contributors:
 *                 type: string
 *                 format: json
 *                 description: Updated list of contributors in JSON format (e.g. [{"user_id":2,"role":"contributor"}])
 *               # Academic Paper specific fields
 *               paperFile:
 *                 type: string
 *                 format: binary
 *                 description: Updated academic paper file (PDF only, max 15MB) - for academic projects only
 *               publication_date:
 *                 type: string
 *                 format: date
 *                 description: Updated publication date for academic papers (YYYY-MM-DD)
 *               published_year:
 *                 type: integer
 *                 description: Updated published year for academic papers
 *               # Competition specific fields
 *               competitionPoster:
 *                 type: string
 *                 format: binary
 *                 description: Updated poster for competition (JPEG, PNG, GIF, WebP only) - for competition projects only
 *               competition_name:
 *                 type: string
 *                 description: Updated competition name
 *               competition_year:
 *                 type: integer
 *                 description: Updated competition year
 *               # Coursework specific fields
 *               courseworkPoster:
 *                 type: string
 *                 format: binary
 *                 description: Updated poster for coursework (JPEG, PNG, GIF, WebP only) - for coursework projects only
 *               courseworkImage:
 *                 type: string
 *                 format: binary
 *                 description: Updated image for coursework (JPEG, PNG, GIF, WebP only) - for coursework projects only
 *               courseworkVideo:
 *                 type: string
 *                 format: binary
 *                 description: Updated video file for coursework (MP4, WebM, QuickTime only, max 15MB) - for coursework projects only
 *               clip_video:
 *                 type: string
 *                 description: Updated video URL for coursework (YouTube, TikTok, or Facebook URL)
 *               # Alternative names for fields (still supported)
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Generic cover image (will be stored as 'poster' based on project type)
 *               posterImage:
 *                 type: string
 *                 format: binary
 *                 description: Alternative name for cover image
 *               additionalFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Additional files to attach to the project (currently not supported)
 *     responses:
 *       200:
 *         description: Project updated successfully
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
 *                   example: "Project updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 123
 *                     message:
 *                       type: string
 *                       example: "Project updated successfully. Please wait for admin approval."
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "File upload error: Only PDF files are allowed for academic papers"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not project owner
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.put(
  API_ROUTES.PROJECT.UPDATE, 
  authenticateToken, 
  isResourceOwner,
  projectUpdateMiddleware, // ใช้ middleware สำหรับการอัปเดต
  updateProjectWithFiles
);

/**
 * @swagger
 * /api/projects/delete/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not project owner
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.delete(
  API_ROUTES.PROJECT.DELETE,
  authenticateToken,
  isResourceOwner,
  deleteProject
);

/**
 * @swagger
 * /api/projects/{projectId}/view:
 *   post:
 *     summary: Increment view count for a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: View count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                     viewsCount:
 *                       type: integer
 *                     message:
 *                       type: string
 *       404:
 *         description: Project not found or not visible
 *       500:
 *         description: Server error
 */
router.post(API_ROUTES.PROJECT.VIEW_COUNT, incrementViewCount);

module.exports = router;