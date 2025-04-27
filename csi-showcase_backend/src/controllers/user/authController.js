// controllers/user/authController.js
import { comparePassword } from '../../utils/passwordHelper.js';
import pool from '../../config/database.js';
import { handleServerError, successResponse, errorResponse } from '../../utils/responseFormatter.js';
import { generateToken, generatePasswordResetToken } from '../../utils/jwtHelper.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';
import logger from '../../config/logger.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';
import { getErrorMessage } from '../../constants/errorMessages.js';
import { isValidEmail } from '../../utils/validationHelper.js';
import { logLogin } from '../../utils/logHelper.js';
import { UAParser } from 'ua-parser-js';

/**
 * ล็อกอินสำหรับผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.INVALID_CREDENTIALS'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ค้นหาผู้ใช้จากฐานข้อมูล
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE username = ?
    `, [username]);
    
    // ตรวจสอบว่ามีผู้ใช้หรือไม่
    if (users.length === 0) {
      logLogin(username, req.ip, false);
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        errorResponse(getErrorMessage('AUTH.INVALID_CREDENTIALS'), STATUS_CODES.UNAUTHORIZED)
      );
    }
    
    const user = users[0];
    
    // ตรวจสอบรหัสผ่าน
    const isMatch = await comparePassword(password, user.password_hash);
    
    if (!isMatch) {
      logLogin(username, req.ip, false);
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        errorResponse(getErrorMessage('AUTH.INVALID_CREDENTIALS'), STATUS_CODES.UNAUTHORIZED)
      );
    }
    
    // สร้าง JWT token
    const token = generateToken({
      id: user.user_id,
      username: user.username,
      role: user.role,
    });
    
    // วิเคราะห์ User Agent
    const uaParser = new UAParser(req.headers['user-agent']);
    const device = uaParser.getDevice();
    const os = uaParser.getOS();
    const browser = uaParser.getBrowser();
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // บันทึกประวัติการเข้าสู่ระบบ
    await pool.execute(`
      INSERT INTO login_logs (user_id, ip_address, device_type, os, browser, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      user.user_id, 
      req.ip, 
      device.type || 'Unknown', 
      `${os.name || 'Unknown'} ${os.version || ''}`, 
      `${browser.name || 'Unknown'} ${browser.version || ''}`,
      userAgent
    ]);
    
    logLogin(username, req.ip, true);
    logger.info(`User ${username} logged in successfully`);
    
    return res.json(successResponse({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        image: user.image
      }
    }, 'Login successful'));
    
  } catch (error) {
    logger.error(`Login error: ${error.message}`, { error });
    return handleServerError(res, error);
  }
};

/**
 * ตรวจสอบข้อมูลผู้ใช้ปัจจุบัน
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCurrentUser = async (req, res) => {
  try {
    // ข้อมูลผู้ใช้ถูกเพิ่มให้ req.user โดย middleware
    if (!req.user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        errorResponse(getErrorMessage('AUTH.LOGIN_REQUIRED'), STATUS_CODES.UNAUTHORIZED)
      );
    }
    
    // ค้นหาข้อมูลผู้ใช้เพิ่มเติมจากฐานข้อมูล
    const [users] = await pool.execute(`
      SELECT user_id, username, full_name, email, image, role, created_at 
      FROM users 
      WHERE user_id = ?
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse(getErrorMessage('USER.NOT_FOUND'), STATUS_CODES.NOT_FOUND)
      );
    }
    
    const user = users[0];
    
    // ดึงข้อมูลจำนวนโครงการของผู้ใช้
    const [projectStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_projects
      FROM projects
      WHERE user_id = ?
    `, [user.user_id]);
    
    return res.json(successResponse({
      id: user.user_id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.created_at,
      stats: {
        totalProjects: projectStats[0].total_projects || 0,
        approvedProjects: projectStats[0].approved_projects || 0
      }
    }, 'User info retrieved successfully'));
    
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`, { error });
    return handleServerError(res, error);
  }
};

/**
 * ตรวจสอบความถูกต้องของ token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyToken = (req, res) => {
  // ถ้ามาถึงจุดนี้แสดงว่า token ถูกต้อง (เพราะผ่าน middleware authenticateToken มาแล้ว)
  return res.json(successResponse({ 
    valid: true, 
    user: req.user 
  }, 'Token is valid'));
};


/**
 * ออกจากระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logout = (req, res) => {
  // บันทึกการออกจากระบบ (ถ้ามี req.user จาก middleware)
  if (req.user) {
    logger.info(`User ${req.user.username} (ID: ${req.user.id}) logged out`);
  }
  
  return res.json(successResponse(null, 'Logout successful'));
};