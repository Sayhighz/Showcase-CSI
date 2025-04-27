// routes/user/projectRoutes.js

import express from 'express';
import { 
  getAllProjects, 
  getTop9Projects, 
  getLatestProjects, 
  getMyProjects, 
  getProjectDetails, 
  uploadProject,
  updateProjectWithFiles,
  deleteProject,
  uploadProjectFile,
} from '../../controllers/user/projectController.js';
import { authenticateToken, isAdmin, isResourceOwner } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';
import storageService from '../../services/storageService.js';
import { optionalAuthenticateToken } from '../../middleware/optionalAuthenticateToken.js';

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
 *         tags:
 *           type: string
 *           description: Project tags separated by commas
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

const projectUploader = (req, res, next) => {
  // สร้าง multer uploader ที่รองรับหลายประเภทไฟล์
  const upload = storageService.createUploader('images', { maxSize: 10 * 1024 * 1024 });
  
  // กำหนดฟิลด์ไฟล์ที่จะรับ
  const uploadFields = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'courseworkPoster', maxCount: 1 },
    { name: 'courseworkVideo', maxCount: 1 },
    { name: 'paperFile', maxCount: 1 },
    { name: 'competitionPoster', maxCount: 1 }
  ]);
  
  // ใช้ middleware
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `File upload error: ${err.message}`
      });
    }
    next();
  });
};

const projectUpdateUploader = (req, res, next) => {
  // สร้าง multer uploader ที่รองรับหลายประเภทไฟล์
  const upload = storageService.createUploader('images', { maxSize: 10 * 1024 * 1024 });
  
  // กำหนดฟิลด์ไฟล์ที่จะรับ - เพิ่มฟิลด์ที่อาจต้องการสำหรับการอัปเดต
  const uploadFields = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'posterImage', maxCount: 1 },
    { name: 'courseworkPoster', maxCount: 1 },
    { name: 'courseworkImage', maxCount: 5 },
    { name: 'courseworkVideo', maxCount: 1 },
    { name: 'competitionPoster', maxCount: 1 },
    { name: 'paperFile', maxCount: 1 },
    { name: 'additionalFiles', maxCount: 5 }
  ]);
  
  // ใช้ middleware
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `File upload error: ${err.message}`
      });
    }
    next();
  });
};

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
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [coursework, competition, academic]
 *               study_year:
 *                 type: integer
 *               year:
 *                 type: integer
 *               semester:
 *                 type: integer
 *               visibility:
 *                 type: integer
 *                 default: 1
 *               tags:
 *                 type: string
 *               contributors:
 *                 type: string
 *                 format: json
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               courseworkPoster:
 *                 type: string
 *                 format: binary
 *               courseworkVideo:
 *                 type: string
 *               paperFile:
 *                 type: string
 *                 format: binary
 *               competitionPoster:
 *                 type: string
 *                 format: binary
 *               competition_name:
 *                 type: string
 *               competition_year:
 *                 type: integer
 *               publication_date:
 *                 type: string
 *                 format: date
 *               published_year:
 *                 type: integer
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
 *         description: Bad request, missing required fields
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
  projectUploader, // เพิ่ม middleware สำหรับการอัปโหลดไฟล์
  uploadProject
);

/**
 * @swagger
 * /api/projects/{projectId}/files:
 *   post:
 *     summary: Upload a file to an existing project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       201:
 *         description: File uploaded successfully
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
 *                     fileId:
 *                       type: integer
 *                     fileName:
 *                       type: string
 *                     filePath:
 *                       type: string
 *                     fileSize:
 *                       type: integer
 *                     fileType:
 *                       type: string
 *       400:
 *         description: No file uploaded or invalid file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not project owner
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:projectId/files',
  authenticateToken,
  (req, res, next) => {
    // สร้าง uploader สำหรับไฟล์เดียว
    const upload = storageService.createUploader('images', { maxSize: 10 * 1024 * 1024 });
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: `File upload error: ${err.message}`
        });
      }
      next();
    });
  },
  uploadProjectFile
);

/**
 * @swagger
 * /api/projects:
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
 * /api/projects/top:
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
router.get(API_ROUTES.PROJECT.MY_PROJECTS, authenticateToken, isResourceOwner, getMyProjects);

/**
 * @swagger
 * /api/projects/{projectId}:
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
 * /api/projects/{projectId}:
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
 *               description:
 *                 type: string
 *               study_year:
 *                 type: integer
 *               year:
 *                 type: integer
 *               semester:
 *                 type: integer
 *               visibility:
 *                 type: integer
 *               tags:
 *                 type: string
 *               contributors:
 *                 type: string
 *                 format: json
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               posterImage:
 *                 type: string
 *                 format: binary
 *               courseworkPoster:
 *                 type: string
 *                 format: binary
 *               courseworkImage:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               courseworkVideo:
 *                 type: string
 *               clip_video:
 *                 type: string
 *               competitionPoster:
 *                 type: string
 *                 format: binary
 *               paperFile:
 *                 type: string
 *                 format: binary
 *               additionalFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               competition_name:
 *                 type: string
 *               competition_year:
 *                 type: integer
 *               publication_date:
 *                 type: string
 *                 format: date
 *               published_year:
 *                 type: integer
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
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                     message:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, not project owner
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.put(
  API_ROUTES.PROJECT.UPDATE, 
  authenticateToken, 
  isResourceOwner,
  projectUpdateUploader,
  updateProjectWithFiles
);

/**
 * @swagger
 * /api/projects/{projectId}:
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

export default router;