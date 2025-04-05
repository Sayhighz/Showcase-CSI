import express from 'express';
import { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserLoginHistory,
  getUserStats
} from '../../controllers/admin/adminUserController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

/**
 * @swagger
 * /api/admin/users/all:
 *   get:
 *     summary: ดึงข้อมูลผู้ใช้ทั้งหมด
 *     description: ดึงรายการผู้ใช้ทั้งหมดในระบบ โดยสามารถกรองตามบทบาทและค้นหาได้
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หมายเลขหน้าสำหรับการแบ่งหน้า
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: ['visitor', 'student', 'admin']
 *         description: กรองผู้ใช้ตามบทบาท
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: ค้นหาผู้ใช้จากชื่อผู้ใช้ ชื่อ-นามสกุล หรืออีเมล
 *     responses:
 *       200:
 *         description: รายการผู้ใช้ที่ดึงสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       full_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       project_count:
 *                         type: integer
 *                 pagination:
 *                   type: object
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/all', adminAuth, getAllUsers);

/**
 * @swagger
 * /api/admin/users/user/{userId}:
 *   get:
 *     summary: ดึงข้อมูลผู้ใช้ตาม ID
 *     description: ดึงรายละเอียดของผู้ใช้เฉพาะราย
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสผู้ใช้
 *     responses:
 *       200:
 *         description: ข้อมูลผู้ใช้ที่ดึงสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบผู้ใช้
 */
router.get('/user/:userId', adminAuth, getUserById);

/**
 * @swagger
 * /api/admin/users/create:
 *   post:
 *     summary: สร้างผู้ใช้ใหม่
 *     description: สร้างผู้ใช้ใหม่ในระบบโดยผู้ดูแลระบบ
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['visitor', 'student', 'admin']
 *                 default: 'student'
 *     responses:
 *       201:
 *         description: สร้างผู้ใช้สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.post('/create', adminAuth, createUser);

/**
 * @swagger
 * /api/admin/users/update/{userId}:
 *   put:
 *     summary: อัปเดตข้อมูลผู้ใช้
 *     description: อัปเดตข้อมูลผู้ใช้โดยผู้ดูแลระบบ
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสผู้ใช้
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['visitor', 'student', 'admin']
 *     responses:
 *       200:
 *         description: อัปเดตผู้ใช้สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบผู้ใช้
 */
router.put('/update/:userId', adminAuth, updateUser);

/**
 * @swagger
 * /api/admin/users/delete/{userId}:
 *   delete:
 *     summary: ลบผู้ใช้
 *     description: ลบผู้ใช้ออกจากระบบโดยผู้ดูแลระบบ
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสผู้ใช้
 *     responses:
 *       200:
 *         description: ลบผู้ใช้สำเร็จ
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบผู้ใช้
 */
router.delete('/delete/:userId', adminAuth, deleteUser);

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     summary: ดึงข้อมูลสถิติผู้ใช้
 *     description: ดึงข้อมูลสถิติผู้ใช้สำหรับแดชบอร์ด
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงสถิติผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 usersByRole:
 *                   type: array
 *                 usersByMonth:
 *                   type: array
 *                 recentLogins:
 *                   type: array
 *                 topContributors:
 *                   type: array
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/stats', adminAuth, getUserStats);

export default router;