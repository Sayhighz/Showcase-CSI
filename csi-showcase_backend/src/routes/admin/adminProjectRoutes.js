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

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

/**
 * @swagger
 * tags:
 *   name: Admin Projects
 *   description: API สำหรับการจัดการโครงการโดยผู้ดูแลระบบ
 */

/**
 * @swagger
 * /api/admin/projects/all:
 *   get:
 *     summary: ดึงข้อมูลโครงการทั้งหมด
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [${Object.values(PROJECT_STATUSES).join(', ')}]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [${Object.values(PROJECT_TYPES).join(', ')}]
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: รายการโครงการทั้งหมด
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 */
router.get('/all', adminAuth, getAllProjects);

/**
 * @swagger
 * /api/admin/projects/pending:
 *   get:
 *     summary: ดึงข้อมูลโครงการที่รอการอนุมัติ
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: รายการโครงการที่รอการอนุมัติ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 */
router.get('/pending', adminAuth, getPendingProjects);

/**
 * @swagger
 * /api/admin/projects/project/{projectId}:
 *   get:
 *     summary: ดึงรายละเอียดโครงการ
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: รายละเอียดโครงการ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 *       404:
 *         description: ไม่พบโครงการ
 */
router.get('/project/:projectId', adminAuth, getProjectDetails);

/**
 * @swagger
 * /api/admin/projects/review/{projectId}:
 *   post:
 *     summary: อนุมัติหรือปฏิเสธโครงการ
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [${Object.values(PROJECT_STATUSES).join(', ')}]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: ดำเนินการตรวจสอบโครงการสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 *       404:
 *         description: ไม่พบโครงการ
 */
router.post('/review/:projectId', adminAuth, reviewProject);

/**
 * @swagger
 * /api/admin/projects/delete/{projectId}:
 *   delete:
 *     summary: ลบโครงการ
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบโครงการสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 *       404:
 *         description: ไม่พบโครงการ
 */
router.delete('/delete/:projectId', adminAuth, deleteProject);

/**
 * @swagger
 * /api/admin/projects/update/{projectId}:
 *   put:
 *     summary: อัปเดตโครงการ
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [${Object.values(PROJECT_TYPES).join(', ')}]
 *               study_year:
 *                 type: integer
 *               year:
 *                 type: integer
 *               semester:
 *                 type: string
 *               visibility:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [${Object.values(PROJECT_STATUSES).join(', ')}]
 *               tags:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตโครงการสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 *       404:
 *         description: ไม่พบโครงการ
 */
router.put('/update/:projectId', adminAuth, updateProject);

/**
 * @swagger
 * /api/admin/projects/reviews/{projectId}:
 *   get:
 *     summary: ดึงข้อมูลประวัติการตรวจสอบโครงการ
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ข้อมูลประวัติการตรวจสอบโครงการ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 *       404:
 *         description: ไม่พบโครงการ
 */
router.get('/reviews/:projectId', adminAuth, getProjectReviews);

/**
 * @swagger
 * /api/admin/projects/review-stats:
 *   get:
 *     summary: ดึงข้อมูลสถิติการตรวจสอบโครงการ
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สถิติการตรวจสอบโครงการ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 */
router.get('/review-stats', adminAuth, getAdminReviewStats);

/**
 * @swagger
 * /api/admin/projects/stats:
 *   get:
 *     summary: ดึงข้อมูลสถิติโครงการ
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สถิติโครงการ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 */
router.get('/stats', adminAuth, getProjectStats);

/**
 * @swagger
 * /api/admin/projects/all-reviews:
 *   get:
 *     summary: ดึงข้อมูลการตรวจสอบโครงการทั้งหมด
 *     tags: [Admin Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: รายการการตรวจสอบโครงการทั้งหมด
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       403:
 *         description: ต้องเป็นผู้ดูแลระบบ
 */
router.get('/all-reviews', adminAuth, getAllProjectReviews);


export default router;