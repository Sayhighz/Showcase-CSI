// controllers/admin/adminAuthController.js
import { UAParser } from 'ua-parser-js';
import pool from '../../config/database.js';
import logger from '../../config/logger.js';
import tokenService from '../../services/tokenService.js';
import emailService from '../../services/emailService.js';
import { hashPassword, comparePassword, checkPasswordStrength } from '../../utils/passwordHelper.js';
import { getErrorMessage } from '../../constants/errorMessages.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  forbiddenResponse, 
  validationErrorResponse, 
  handleServerError 
} from '../../utils/responseFormatter.js';
import { isValidEmail, isEmpty } from '../../utils/validationHelper.js';


/**
 * ล็อกอินสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    logger.debug("Admin login attempt", { username });
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (isEmpty(username) || isEmpty(password)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.INVALID_CREDENTIALS'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ค้นหาผู้ใช้จากฐานข้อมูล
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE username = ? AND role = 'admin'
    `, [username]);
    
    // ตรวจสอบว่ามีผู้ใช้หรือไม่
    if (users.length === 0) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        errorResponse(getErrorMessage('AUTH.INVALID_CREDENTIALS'), STATUS_CODES.UNAUTHORIZED)
      );
    }
    
    const user = users[0];
    
    // ตรวจสอบรหัสผ่าน
    const isMatch = await comparePassword(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        errorResponse(getErrorMessage('AUTH.INVALID_CREDENTIALS'), STATUS_CODES.UNAUTHORIZED)
      );
    }
    
    // สร้าง JWT token สำหรับ admin
    const token = tokenService.generateAdminToken({
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
    
    // บันทึกล็อกการเข้าสู่ระบบ
    logger.info(`Admin login successful: ${username}`, { userId: user.user_id, ip: req.ip });
    
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
    }, 'Admin login successful'));
    
  } catch (error) {
    logger.error('Error in admin login:', error);
    return handleServerError(res, error);
  }
};

/**
 * ตรวจสอบข้อมูลผู้ดูแลระบบปัจจุบัน
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCurrentAdmin = async (req, res) => {
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
      WHERE user_id = ? AND role = 'admin'
    `, [req.user.id]);
    
    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }
    
    const user = users[0];
    
    return res.json(successResponse({
      id: user.user_id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.created_at
    }, 'Admin info retrieved successfully'));
    
  } catch (error) {
    logger.error('Error in getting current admin:', error);
    return handleServerError(res, error);
  }
};

/**
 * ตรวจสอบความถูกต้องของ token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

export const verifyAdminToken = async (req, res) => {
  try {
    // ถ้ามีการรับ req.user จาก middleware แล้ว
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Access denied. No token provided.'
      });
    }

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Access forbidden. Admin privileges required.'
      });
    }

    // ค้นหาข้อมูลผู้ใช้เพิ่มเติมจากฐานข้อมูล เพื่อให้ได้ข้อมูล image ด้วย
    const [users] = await pool.execute(`
      SELECT user_id, username, full_name, email, image, role
      FROM users
      WHERE user_id = ? AND role = 'admin'
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Admin user not found'
      });
    }

    // รวมข้อมูลและส่งกลับ
    return res.json(successResponse({ 
      valid: true, 
      user: {
        id: users[0].user_id,
        username: users[0].username,
        fullName: users[0].full_name,
        email: users[0].email,
        image: users[0].image,
        role: users[0].role
      }
    }, 'Admin token is valid'));
  } catch (error) {
    logger.error('Error verifying admin token:', error);
    return handleServerError(res, error);
  }
};
/**
 * รีเซ็ตรหัสผ่านสำหรับผู้ดูแลระบบ (เริ่มต้นกระบวนการรีเซ็ต)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const forgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (isEmpty(email) || !isValidEmail(email)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        validationErrorResponse(res, getErrorMessage('USER.INVALID_EMAIL'))
      );
    }
    
    // ค้นหาผู้ใช้จากอีเมล
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE email = ? AND role = 'admin'
    `, [email]);
    
    // ข้อความตอบกลับเหมือนกันไม่ว่าจะพบผู้ใช้หรือไม่ เพื่อความปลอดภัย
    const genericResponse = 'If your email is registered as an admin, you will receive password reset instructions.';
    
    if (users.length === 0) {
      // บันทึกลงล็อกเฉพาะกรณีที่ไม่พบอีเมล
      logger.warn(`Password reset attempt for non-existent admin email: ${email}`);
      return res.json(successResponse(null, genericResponse));
    }
    
    const user = users[0];
    
    // สร้าง reset token ที่มีอายุ 1 ชั่วโมง
    const resetToken = tokenService.generatePasswordResetToken({
      id: user.user_id,
      role: user.role,
    });
    
    // บันทึก reset token และเวลาหมดอายุลงในฐานข้อมูล
    await pool.execute(`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
    `, [user.user_id, resetToken]);
    
    // ส่งอีเมลรีเซ็ตรหัสผ่าน
    await emailService.sendPasswordResetEmail(email, resetToken, user.username);
    
    logger.info(`Password reset token generated for admin: ${user.username}`, { userId: user.user_id });
    
    return res.json(successResponse(null, genericResponse));
    
  } catch (error) {
    logger.error('Error in admin forgot password:', error);
    return handleServerError(res, error);
  }
};

/**
 * รีเซ็ตรหัสผ่านสำหรับผู้ดูแลระบบ (ตั้งรหัสผ่านใหม่)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const resetAdminPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (isEmpty(token) || isEmpty(newPassword)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.REQUIRED_FIELDS_MISSING'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบความแข็งแรงของรหัสผ่านใหม่
    const passwordCheck = checkPasswordStrength(newPassword);
    if (!passwordCheck.isStrong) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        validationErrorResponse(res, 'Password is not strong enough', passwordCheck.feedback)
      );
    }
    
    // ตรวจสอบความถูกต้องของ token
    const decoded = tokenService.verifyPasswordResetToken(token);
    
    if (!decoded) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.PASSWORD_RESET_EXPIRED'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบว่า token ยังไม่หมดอายุในฐานข้อมูล
    const [resetRecords] = await pool.execute(`
      SELECT * FROM password_resets
      WHERE user_id = ? AND token = ? AND expires_at > NOW()
    `, [decoded.id, token]);
    
    if (resetRecords.length === 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.PASSWORD_RESET_EXPIRED'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบว่าผู้ใช้เป็น admin จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ? AND role = 'admin'
    `, [decoded.id]);
    
    if (users.length === 0) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
    
    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await hashPassword(newPassword);
    
    // อัปเดตรหัสผ่านใหม่
    await pool.execute(`
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `, [hashedPassword, decoded.id]);
    
    // ลบ token ที่ใช้แล้ว
    await pool.execute(`
      DELETE FROM password_resets
      WHERE user_id = ? AND token = ?
    `, [decoded.id, token]);
    
    logger.info(`Admin password reset successful`, { userId: decoded.id });
    
    return res.json(successResponse(null, 'Admin password has been reset successfully'));
    
  } catch (error) {
    logger.error('Error in admin reset password:', error);
    return handleServerError(res, error);
  }
};

/**
 * ออกจากระบบสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const adminLogout = async (req, res) => {
  try {
    // ถ้ามีการเก็บข้อมูล token ไว้ในฐานข้อมูล (blacklist) ก็ลบออก
    if (req.user && req.token) {
      // เพิกถอน token ปัจจุบัน
      await tokenService.revokeToken(req.token, req.user);
      logger.info(`Admin logged out`, { userId: req.user.id });
    }
    
    return res.json(successResponse(null, 'Admin logout successful'));
  } catch (error) {
    logger.error('Error in admin logout:', error);
    return handleServerError(res, error);
  }
};

/**
 * เปลี่ยนรหัสผ่านของผู้ดูแลระบบปัจจุบัน
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (isEmpty(currentPassword) || isEmpty(newPassword)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.REQUIRED_FIELDS_MISSING'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบความแข็งแรงของรหัสผ่านใหม่
    const passwordCheck = checkPasswordStrength(newPassword);
    if (!passwordCheck.isStrong) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        validationErrorResponse(res, 'Password is not strong enough', passwordCheck.feedback)
      );
    }
    
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ? AND role = 'admin'
    `, [req.user.id]);
    
    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }
    
    const user = users[0];
    
    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    
    if (!isMatch) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        errorResponse(getErrorMessage('AUTH.CURRENT_PASSWORD_INCORRECT'), STATUS_CODES.UNAUTHORIZED)
      );
    }
    
    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await hashPassword(newPassword);
    
    // อัปเดตรหัสผ่าน
    await pool.execute(`
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `, [hashedPassword, req.user.id]);
    
    logger.info(`Admin password changed`, { userId: req.user.id });
    
    return res.json(successResponse(null, 'Admin password changed successfully'));
    
  } catch (error) {
    logger.error('Error in changing admin password:', error);
    return handleServerError(res, error);
  }
};