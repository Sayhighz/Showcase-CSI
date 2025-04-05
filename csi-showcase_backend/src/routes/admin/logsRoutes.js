// routes/admin/logsRoutes.js
import express from 'express';
import { 
  getAllLoginLogs, 
  getCompanyViews, 
  getVisitorViews,
  getProjectReviews,
  getSystemStats,
  getDailyStats
} from '../../controllers/admin/logsController.js';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// สร้าง middleware chain ที่ใช้บ่อย
const adminAuth = [authenticateToken, isAdmin];

// เส้นทางสำหรับดึงข้อมูลการเข้าสู่ระบบทั้งหมด
/**
 * @swagger
 * /api/admin/logs/login-logs:
 *   get:
 *     summary: ดึงข้อมูลการเข้าสู่ระบบทั้งหมด
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: กรองการเข้าสู่ระบบตาม ID ผู้ใช้
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: วันเริ่มต้นในการค้นหา
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: วันสิ้นสุดในการค้นหา
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าปัจจุบัน
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: รายการการเข้าสู่ระบบดึงสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/login-logs', adminAuth, getAllLoginLogs);

// เส้นทางสำหรับดึงข้อมูลการเข้าชมจากบริษัท
/**
 * @swagger
 * /api/admin/logs/company-views:
 *   get:
 *     summary: ดึงข้อมูลการเข้าชมจากบริษัท
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: กรองการเข้าชมตาม ID โครงการ
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: คำค้นหา
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าปัจจุบัน
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: รายการการเข้าชมจากบริษัทดึงสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/company-views', adminAuth, getCompanyViews);

// เส้นทางสำหรับดึงข้อมูลการเข้าชมจากผู้เยี่ยมชม
/**
 * @swagger
 * /api/admin/logs/visitor-views:
 *   get:
 *     summary: ดึงข้อมูลการเข้าชมจากผู้เยี่ยมชม
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: กรองการเข้าชมตาม ID โครงการ
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: คำค้นหา
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าปัจจุบัน
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: รายการการเข้าชมจากผู้เยี่ยมชมดึงสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/visitor-views', adminAuth, getVisitorViews);

// เส้นทางสำหรับดึงข้อมูลประวัติการตรวจสอบโครงการ
/**
 * @swagger
 * /api/admin/logs/project-reviews:
 *   get:
 *     summary: ดึงข้อมูลประวัติการตรวจสอบโครงการ
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: กรองการตรวจสอบตาม ID โครงการ
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending', 'approved', 'rejected']
 *         description: กรองตามสถานะการตรวจสอบ
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: กรองตาม ID ผู้ดูแลระบบ
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าปัจจุบัน
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: รายการการตรวจสอบโครงการดึงสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/project-reviews', adminAuth, getProjectReviews);

// เส้นทางสำหรับดึงข้อมูลสถิติระบบทั้งหมด
/**
 * @swagger
 * /api/admin/logs/system-stats:
 *   get:
 *     summary: ดึงข้อมูลสถิติระบบทั้งหมด
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงสถิติระบบสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/system-stats', adminAuth, getSystemStats);

// เส้นทางสำหรับดึงข้อมูลสถิติประจำวัน
/**
 * @swagger
 * /api/admin/logs/daily-stats:
 *   get:
 *     summary: ดึงข้อมูลสถิติประจำวัน
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงสถิติประจำวันสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get('/daily-stats', adminAuth, getDailyStats);

export default router;