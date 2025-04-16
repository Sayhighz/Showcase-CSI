// controllers/user/authController.js
import { comparePassword, hashPassword } from '../../utils/passwordHelper.js';
import pool, { beginTransaction, commitTransaction, rollbackTransaction } from '../../config/database.js';
import { handleServerError, successResponse, errorResponse, validationErrorResponse } from '../../utils/responseFormatter.js';
import { generateToken, generatePasswordResetToken, verifyPasswordResetToken } from '../../utils/jwtHelper.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../services/emailService.js';
import logger from '../../config/logger.js';
import { ROLES } from '../../constants/roles.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';
import { ERROR_MESSAGES, getErrorMessage } from '../../constants/errorMessages.js';
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
 * ลงทะเบียนผู้ใช้ใหม่
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const register = async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { username, password, fullName, email } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !fullName || !email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('USER.REQUIRED_FIELDS_MISSING'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบรูปแบบอีเมล
    if (!isValidEmail(email)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        validationErrorResponse('Invalid email format', { email: getErrorMessage('USER.INVALID_EMAIL') })
      );
    }
    
    // ตรวจสอบว่ามีชื่อผู้ใช้หรืออีเมลซ้ำหรือไม่
    const [existingUsers] = await connection.execute(`
      SELECT username, email FROM users 
      WHERE username = ? OR email = ?
    `, [username, email]);
    
    const validationErrors = {};
    
    if (existingUsers.some(user => user.username === username)) {
      validationErrors.username = getErrorMessage('AUTH.USERNAME_TAKEN');
    }
    
    if (existingUsers.some(user => user.email === email)) {
      validationErrors.email = getErrorMessage('AUTH.EMAIL_TAKEN');
    }
    
    if (Object.keys(validationErrors).length > 0) {
      await rollbackTransaction(connection);
      return res.status(STATUS_CODES.CONFLICT).json(
        validationErrorResponse('Registration validation failed', validationErrors, STATUS_CODES.CONFLICT)
      );
    }
    
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await hashPassword(password);
    
    // สร้างผู้ใช้ใหม่ (นักศึกษา)
    const [result] = await connection.execute(`
      INSERT INTO users (username, password_hash, full_name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `, [username, hashedPassword, fullName, email, ROLES.STUDENT]);
    
    const userId = result.insertId;
    
    // สร้าง token สำหรับการเข้าสู่ระบบอัตโนมัติ
    const token = generateToken({
      id: userId,
      username,
      role: ROLES.STUDENT,
    });
    
    // Commit transaction
    await commitTransaction(connection);
    
    // ส่งอีเมลต้อนรับ
    sendWelcomeEmail(email, username).catch(err => {
      logger.warn(`Failed to send welcome email to ${email}: ${err.message}`);
    });
    
    logger.info(`New user registered: ${username}`);
    
    return res.status(STATUS_CODES.CREATED).json(successResponse({
      token,
      user: {
        id: userId,
        username,
        fullName,
        email,
        role: ROLES.STUDENT,
      }
    }, 'Registration successful', STATUS_CODES.CREATED));
    
  } catch (error) {
    await rollbackTransaction(connection);
    logger.error(`Registration error: ${error.message}`, { error });
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
 * รีเซ็ตรหัสผ่าน (เริ่มต้นกระบวนการรีเซ็ต)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse('Email is required', STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบรูปแบบอีเมล
    if (!isValidEmail(email)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse('Invalid email format', STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ค้นหาผู้ใช้จากอีเมล
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE email = ?
    `, [email]);
    
    if (users.length === 0) {
      // ไม่ควรเปิดเผยว่าอีเมลไม่มีในระบบเพื่อความปลอดภัย
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return res.json(successResponse(
        null,
        'If your email is registered, you will receive password reset instructions.'
      ));
    }
    
    const user = users[0];
    
    // สร้าง reset token ที่มีอายุ 1 ชั่วโมง
    const resetToken = generatePasswordResetToken({
      id: user.user_id,
      email: user.email,
      role: user.role,
    });
    
    // ลบ token เก่าของผู้ใช้นี้ (ถ้ามี)
    await pool.execute(`
      DELETE FROM password_resets WHERE user_id = ?
    `, [user.user_id]);
    
    // บันทึก reset token และเวลาหมดอายุลงในฐานข้อมูล
    await pool.execute(`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
    `, [user.user_id, resetToken]);
    
    // ส่งอีเมลรีเซ็ตรหัสผ่าน
    const emailSent = await sendPasswordResetEmail(email, resetToken, user.username);
    
    if (!emailSent) {
      logger.warn(`Failed to send password reset email to ${email}`);
    } else {
      logger.info(`Password reset email sent to ${email}`);
    }
    
    return res.json(successResponse(
      null,
      'If your email is registered, you will receive password reset instructions.'
    ));
    
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`, { error });
    return handleServerError(res, error);
  }
};

/**
 * รีเซ็ตรหัสผ่าน (ตั้งรหัสผ่านใหม่)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const resetPassword = async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { token, newPassword, confirmPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse('Token and new password are required', STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกัน
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.PASSWORD_MISMATCH'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบความถูกต้องของ token
    const decoded = verifyPasswordResetToken(token);
    
    if (!decoded) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.PASSWORD_RESET_EXPIRED'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // ตรวจสอบว่า token ยังไม่หมดอายุในฐานข้อมูล
    const [resetRecords] = await connection.execute(`
      SELECT * FROM password_resets
      WHERE user_id = ? AND token = ? AND expires_at > NOW()
    `, [decoded.id, token]);
    
    if (resetRecords.length === 0) {
      await rollbackTransaction(connection);
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(getErrorMessage('AUTH.PASSWORD_RESET_EXPIRED'), STATUS_CODES.BAD_REQUEST)
      );
    }
    
    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await hashPassword(newPassword);
    
    // อัปเดตรหัสผ่านใหม่
    await connection.execute(`
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `, [hashedPassword, decoded.id]);
    
    // ลบ token ที่ใช้แล้ว
    await connection.execute(`
      DELETE FROM password_resets
      WHERE user_id = ? AND token = ?
    `, [decoded.id, token]);
    
    await commitTransaction(connection);
    
    logger.info(`Password reset successful for user ID: ${decoded.id}`);
    
    return res.json(successResponse(null, 'Password has been reset successfully'));
    
  } catch (error) {
    await rollbackTransaction(connection);
    logger.error(`Reset password error: ${error.message}`, { error });
    return handleServerError(res, error);
  }
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