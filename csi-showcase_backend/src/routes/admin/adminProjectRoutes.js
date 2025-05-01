// routes/admin/adminProjectRoutes.js

import express from 'express';
import { 
  getAllProjects,
  getPendingProjects,
  getProjectDetails,
  reviewProject,
  deleteProject,
  updateProject,
  getProjectReviews,
  getAdminReviewStats,
  getProjectStats,
  getAllProjectReviews
} from '../../controllers/admin/adminProjectController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

/**
 * @swagger
 * /api/admin/projects/all:
 *   get:
 *     summary: Get all projects
 *     description: Retrieves all projects with filtering and pagination options. Admin only.
 *     tags: [Admin Projects]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by project status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [coursework, academic, competition]
 *         description: Filter by project type
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by academic year
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
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
 *                   example: "Projects retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           project_id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "Database Design Project"
 *                           description:
 *                             type: string
 *                             example: "A project about designing and implementing a database system"
 *                           type:
 *                             type: string
 *                             enum: [coursework, academic, competition]
 *                             example: "coursework"
 *                           study_year:
 *                             type: integer
 *                             example: 2
 *                           year:
 *                             type: integer
 *                             example: 2024
 *                           semester:
 *                             type: string
 *                             example: "1"
 *                           status:
 *                             type: string
 *                             enum: [pending, approved, rejected]
 *                             example: "approved"
 *                           user_id:
 *                             type: integer
 *                             example: 5
 *                           username:
 *                             type: string
 *                             example: "johndoe"
 *                           full_name:
 *                             type: string
 *                             example: "John Doe"
 *                           user_image:
 *                             type: string
 *                             nullable: true
 *                             example: "uploads/profiles/profile-123.jpg"
 *                           image:
 *                             type: string
 *                             nullable: true
 *                             example: "uploads/images/project-123.jpg"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                           visibility:
 *                             type: integer
 *                             example: 1
 *                           views_count:
 *                             type: integer
 *                             example: 45
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
  API_ROUTES.ADMIN.PROJECT.ALL, 
  adminAuth, 
  getAllProjects
);

/**
 * @swagger
 * /api/admin/projects/pending:
 *   get:
 *     summary: Get pending projects
 *     description: Retrieves all pending projects that need admin review. Admin only.
 *     tags: [Admin Projects]
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
 *     responses:
 *       200:
 *         description: Pending projects retrieved successfully
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
 *                   example: "Pending projects retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
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
  API_ROUTES.ADMIN.PROJECT.PENDING, 
  adminAuth, 
  getPendingProjects
);

/**
 * @swagger
 * /api/admin/projects/project/{projectId}:
 *   get:
 *     summary: Get project details
 *     description: Retrieves detailed information about a specific project including review history. Admin only.
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the project to retrieve
 *     responses:
 *       200:
 *         description: Project details retrieved successfully
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
 *                   example: "Project details retrieved successfully"
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Project'
 *                     - type: object
 *                       properties:
 *                         files:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               file_type:
 *                                 type: string
 *                                 example: "image"
 *                               file_path:
 *                                 type: string
 *                                 example: "uploads/images/image-123.jpg"
 *                               file_name:
 *                                 type: string
 *                                 example: "image-123.jpg"
 *                               file_size:
 *                                 type: integer
 *                                 example: 1024000
 *                               upload_date:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 *                         contributors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               user_id:
 *                                 type: integer
 *                                 example: 6
 *                               username:
 *                                 type: string
 *                                 example: "contributor1"
 *                               full_name:
 *                                 type: string
 *                                 example: "Contributor One"
 *                               email:
 *                                 type: string
 *                                 example: "contributor1@example.com"
 *                               image:
 *                                 type: string
 *                                 nullable: true
 *                         reviews:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               review_id:
 *                                 type: integer
 *                                 example: 3
 *                               project_id:
 *                                 type: integer
 *                                 example: 1
 *                               admin_id:
 *                                 type: integer
 *                                 example: 2
 *                               status:
 *                                 type: string
 *                                 enum: [approved, rejected, updated]
 *                                 example: "approved"
 *                               review_comment:
 *                                 type: string
 *                                 example: "Good work!"
 *                               reviewed_at:
 *                                 type: string
 *                                 format: date-time
 *                               admin_username:
 *                                 type: string
 *                                 example: "admin1"
 *                               admin_name:
 *                                 type: string
 *                                 example: "Admin One"
 *                               admin_image:
 *                                 type: string
 *                                 nullable: true
 *                         academic:
 *                           type: object
 *                           properties:
 *                             publication_date:
 *                               type: string
 *                               format: date
 *                               nullable: true
 *                             published_year:
 *                               type: integer
 *                               example: 2024
 *                             paper_file:
 *                               type: string
 *                               nullable: true
 *                               example: "uploads/documents/paper-123.pdf"
 *                             last_updated:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                         competition:
 *                           type: object
 *                           properties:
 *                             competition_name:
 *                               type: string
 *                               example: "National Coding Challenge"
 *                             competition_year:
 *                               type: integer
 *                               example: 2024
 *                             poster:
 *                               type: string
 *                               nullable: true
 *                               example: "uploads/images/poster-123.jpg"
 *                         coursework:
 *                           type: object
 *                           properties:
 *                             poster:
 *                               type: string
 *                               nullable: true
 *                               example: "uploads/images/poster-123.jpg"
 *                             clip_video:
 *                               type: string
 *                               nullable: true
 *                               example: "uploads/videos/video-123.mp4"
 *                             image:
 *                               type: string
 *                               nullable: true
 *                               example: "uploads/images/image-123.jpg"
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
  API_ROUTES.ADMIN.PROJECT.GET_BY_ID, 
  adminAuth, 
  getProjectDetails
);

/**
 * @swagger
 * /api/admin/projects/review/{projectId}:
 *   post:
 *     summary: Review project
 *     description: Approve or reject a pending project. Admin only.
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the project to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: "approved"
 *                 description: Review decision
 *               comment:
 *                 type: string
 *                 example: "Excellent work. Approved."
 *                 description: Optional review comment
 *     responses:
 *       200:
 *         description: Project review completed successfully
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
 *                   example: "Project approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 15
 *                     status:
 *                       type: string
 *                       enum: [approved, rejected]
 *                       example: "approved"
 *                     comment:
 *                       type: string
 *                       example: "Excellent work. Approved."
 *                     reviewedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request - Missing project ID or status
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: Project not found
 *       422:
 *         description: Invalid status
 *       500:
 *         description: Internal Server Error
 */
router.post(
  API_ROUTES.ADMIN.PROJECT.REVIEW, 
  adminAuth, 
  reviewProject
);

/**
 * @swagger
 * /api/admin/projects/delete/{projectId}:
 *   delete:
 *     summary: Delete project
 *     description: Permanently deletes a project and all associated files. Admin only.
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the project to delete
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Project deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: Bad Request - Missing project ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
  API_ROUTES.ADMIN.PROJECT.DELETE, 
  adminAuth, 
  deleteProject
);

/**
 * @swagger
 * /api/admin/projects/update/{projectId}:
 *   put:
 *     summary: Update project
 *     description: Updates project information. Admin only.
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Project Title"
 *               description:
 *                 type: string
 *                 example: "Updated project description with more details."
 *               type:
 *                 type: string
 *                 enum: [coursework, academic, competition]
 *                 example: "coursework"
 *               study_year:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 2
 *               year:
 *                 type: integer
 *                 example: 2024
 *               semester:
 *                 type: string
 *                 enum: ["1", "2", "3"]
 *                 example: "1"
 *               visibility:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 example: "approved"
 *               tags:
 *                 type: string
 *                 example: "database,sql,design"
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
 *                       example: 15
 *                     title:
 *                       type: string
 *                       example: "Updated Project Title"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: Project not found
 *       422:
 *         description: Validation error - Invalid project type or status
 *       500:
 *         description: Internal Server Error
 */
router.put(
  API_ROUTES.ADMIN.PROJECT.UPDATE, 
  adminAuth, 
  updateProject
);

/**
 * @swagger
 * /api/admin/projects/reviews/{projectId}:
 *   get:
 *     summary: Get project reviews
 *     description: Retrieves review history for a specific project. Admin only.
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the project
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       review_id:
 *                         type: integer
 *                         example: 3
 *                       project_id:
 *                         type: integer
 *                         example: 15
 *                       admin_id:
 *                         type: integer
 *                         example: 2
 *                       status:
 *                         type: string
 *                         enum: [approved, rejected, updated]
 *                         example: "approved"
 *                       review_comment:
 *                         type: string
 *                         example: "Excellent work. Approved."
 *                       reviewed_at:
 *                         type: string
 *                         format: date-time
 *                       admin_username:
 *                         type: string
 *                         example: "admin1"
 *                       admin_name:
 *                         type: string
 *                         example: "Admin One"
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Internal Server Error
 */
router.get(
  API_ROUTES.ADMIN.PROJECT.REVIEWS, 
  adminAuth, 
  getProjectReviews
);

/**
 * @swagger
 * /api/admin/projects/review-stats:
 *   get:
 *     summary: Get admin review statistics
 *     description: Retrieves statistics about project reviews by admins. Admin only.
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin review statistics retrieved successfully
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
 *                   example: "Admin review statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     overall:
 *                       type: object
 *                       properties:
 *                         total_reviews:
 *                           type: integer
 *                           example: 120
 *                         approved_count:
 *                           type: integer
 *                           example: 85
 *                         rejected_count:
 *                           type: integer
 *                           example: 35
 *                         pending_count:
 *                           type: integer
 *                           example: 15
 *                     admin_stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 2
 *                           username:
 *                             type: string
 *                             example: "admin1"
 *                           full_name:
 *                             type: string
 *                             example: "Admin One"
 *                           review_count:
 *                             type: integer
 *                             example: 45
 *                           approved_count:
 *                             type: integer
 *                             example: 38
 *                           rejected_count:
 *                             type: integer
 *                             example: 7
 *                     time_stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-03"
 *                           review_count:
 *                             type: integer
 *                             example: 25
 *                           approved_count:
 *                             type: integer
 *                             example: 20
 *                           rejected_count:
 *                             type: integer
 *                             example: 5
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Internal Server Error
 */
router.get(
  API_ROUTES.ADMIN.PROJECT.REVIEW_STATS, 
  adminAuth, 
  getAdminReviewStats
);

/**
 * @swagger
 * /api/admin/projects/stats:
 *   get:
 *     summary: Get project statistics
 *     description: Retrieves comprehensive project statistics for the admin dashboard. Admin only.
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project statistics retrieved successfully
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
 *                   example: "Project statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     project_counts:
 *                       type: object
 *                       properties:
 *                         total_projects:
 *                           type: integer
 *                           example: 120
 *                         approved_count:
 *                           type: integer
 *                           example: 85
 *                         pending_count:
 *                           type: integer
 *                           example: 15
 *                         rejected_count:
 *                           type: integer
 *                           example: 20
 *                         academic_count:
 *                           type: integer
 *                           example: 30
 *                         coursework_count:
 *                           type: integer
 *                           example: 70
 *                         competition_count:
 *                           type: integer
 *                           example: 20
 *                     top_projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           project_id:
 *                             type: integer
 *                             example: 12
 *                           title:
 *                             type: string
 *                             example: "AI-Powered Image Recognition"
 *                           type:
 *                             type: string
 *                             enum: [coursework, academic, competition]
 *                             example: "competition"
 *                           views_count:
 *                             type: integer
 *                             example: 245
 *                           username:
 *                             type: string
 *                             example: "student1"
 *                           full_name:
 *                             type: string
 *                             example: "Student One"
 *                           cover_image:
 *                             type: string
 *                             nullable: true
 *                             example: "uploads/images/poster-123.jpg"
 *                     recent_projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           project_id:
 *                             type: integer
 *                             example: 25
 *                           title:
 *                             type: string
 *                             example: "Modern Web Development"
 *                           type:
 *                             type: string
 *                             enum: [coursework, academic, competition]
 *                             example: "coursework"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             enum: [pending, approved, rejected]
 *                             example: "pending"
 *                           username:
 *                             type: string
 *                             example: "student2"
 *                           full_name:
 *                             type: string
 *                             example: "Student Two"
 *                     monthly_uploads:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-03"
 *                           project_count:
 *                             type: integer
 *                             example: 15
 *                           academic_count:
 *                             type: integer
 *                             example: 3
 *                           coursework_count:
 *                             type: integer
 *                             example: 10
 *                           competition_count:
 *                             type: integer
 *                             example: 2
 *                     monthly_views:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-03"
 *                           view_count:
 *                             type: integer
 *                             example: 358
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 *       500:
 *         description: Internal Server Error
 */
router.get(
  API_ROUTES.ADMIN.PROJECT.STATS, 
  adminAuth, 
  getProjectStats
);


/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         project_id:
 *           type: integer
 *           example: 15
 *         title:
 *           type: string
 *           example: "Database Design Project"
 *         description:
 *           type: string
 *           example: "A comprehensive project on database design and implementation"
 *         type:
 *           type: string
 *           enum: [coursework, academic, competition]
 *           example: "coursework"
 *         study_year:
 *           type: integer
 *           example: 2
 *         year:
 *           type: integer
 *           example: 2024
 *         semester:
 *           type: string
 *           example: "1"
 *         visibility:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: "approved"
 *         views_count:
 *           type: integer
 *           example: 85
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         user_id:
 *           type: integer
 *           example: 8
 *         username:
 *           type: string
 *           example: "student1"
 *         full_name:
 *           type: string
 *           example: "Student One"
 *         email:
 *           type: string
 *           example: "student1@example.com"
 *         user_image:
 *           type: string
 *           nullable: true
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           example: 10
 *         totalItems:
 *           type: integer
 *           description: Total number of items
 *           example: 85
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 9
 *         from:
 *           type: integer
 *           description: First item index on current page
 *           example: 1
 *         to:
 *           type: integer
 *           description: Last item index on current page
 *           example: 10
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *           example: false
 *         nextPage:
 *           type: integer
 *           nullable: true
 *           description: Next page number, or null if there is no next page
 *           example: 2
 *         prevPage:
 *           type: integer
 *           nullable: true
 *           description: Previous page number, or null if there is no previous page
 *           example: null
 */


router.get(
  API_ROUTES.ADMIN.PROJECT.ALL_REVIEWS, 
  adminAuth, 
  getAllProjectReviews
);


export default router;