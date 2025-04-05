import express from 'express';
import { 
  adminLogin, 
  getCurrentAdmin, 
  verifyAdminToken, 
  changeAdminPassword,
  adminLogout,
  forgotAdminPassword,
  resetAdminPassword
} from '../../controllers/admin/adminAuthController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { checkSecretKey } from '../../middleware/secretKeyMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: เข้าสู่ระบบสำหรับผู้ดูแลระบบ
 *     description: ล็อกอินสำหรับผู้ดูแลระบบด้วยชื่อผู้ใช้และรหัสผ่าน
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: ชื่อผู้ใช้งาน
 *               password:
 *                 type: string
 *                 description: รหัสผ่าน
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     image:
 *                       type: string
 *       401:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */
router.post('/login', checkSecretKey, adminLogin);

/**
 * @swagger
 * /api/admin/auth/verify-token:
 *   get:
 *     summary: ตรวจสอบความถูกต้องของ Token
 *     description: ตรวจสอบว่า Token สำหรับผู้ดูแลระบบยังใช้งานได้อยู่
 *     tags:
 *       - Admin Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token ใช้งานได้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 */
router.get('/verify-token', authenticateToken, isAdmin, verifyAdminToken);

/**
 * @swagger
 * /api/admin/auth/me:
 *   get:
 *     summary: ดึงข้อมูลผู้ดูแลระบบปัจจุบัน
 *     description: ดึงข้อมูลรายละเอียดของผู้ดูแลระบบที่กำลังเข้าใช้งาน
 *     tags:
 *       - Admin Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 image:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/me', authenticateToken, isAdmin, getCurrentAdmin);

/**
 * @swagger
 * /api/admin/auth/change-password/{adminId}:
 *   post:
 *     summary: เปลี่ยนรหัสผ่านผู้ดูแลระบบ
 *     description: เปลี่ยนรหัสผ่านสำหรับผู้ดูแลระบบ
 *     tags:
 *       - Admin Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: รหัสผ่านปัจจุบัน
 *               newPassword:
 *                 type: string
 *                 description: รหัสผ่านใหม่
 *     responses:
 *       200:
 *         description: เปลี่ยนรหัสผ่านสำเร็จ
 *       400:
 *         description: รหัสผ่านไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */
router.post('/change-password/:adminId', authenticateToken, isAdmin, changeAdminPassword);

/**
 * @swagger
 * /api/admin/auth/logout:
 *   post:
 *     summary: ออกจากระบบ
 *     description: ออกจากระบบสำหรับผู้ดูแลระบบ
 *     tags:
 *       - Admin Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */
router.post('/logout', authenticateToken, isAdmin, adminLogout);

/**
 * @swagger
 * /api/admin/auth/forgot-password:
 *   post:
 *     summary: ขอรีเซ็ตรหัสผ่าน
 *     description: ส่งอีเมลรีเซ็ตรหัสผ่านสำหรับผู้ดูแลระบบ
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: อีเมลของผู้ดูแลระบบ
 *     responses:
 *       200:
 *         description: ส่งคำขอรีเซ็ตรหัสผ่านสำเร็จ
 *       400:
 *         description: อีเมลไม่ถูกต้อง
 */
router.post('/forgot-password', forgotAdminPassword);

/**
 * @swagger
 * /api/admin/auth/reset-password:
 *   post:
 *     summary: รีเซ็ตรหัสผ่าน
 *     description: ตั้งรหัสผ่านใหม่สำหรับผู้ดูแลระบบ
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: โทเค็นรีเซ็ตรหัสผ่าน
 *               newPassword:
 *                 type: string
 *                 description: รหัสผ่านใหม่
 *     responses:
 *       200:
 *         description: รีเซ็ตรหัสผ่านสำเร็จ
 *       400:
 *         description: โทเค็นหรือรหัสผ่านไม่ถูกต้อง
 */
router.post('/reset-password', resetAdminPassword);

export default router;