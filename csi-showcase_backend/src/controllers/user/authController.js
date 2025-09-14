// controllers/user/authController.js
const { comparePassword, hashPassword } = require('../../utils/passwordHelper.js');
const pool = require('../../config/database.js');
const { handleServerError, successResponse, errorResponse } = require('../../utils/responseFormatter.js');
const { generateToken, generatePasswordResetToken, verifyPasswordResetToken } = require('../../utils/jwtHelper.js');
const { sendPasswordResetEmail } = require('../../services/emailService.js');
const logger = require('../../config/logger.js');
const { STATUS_CODES } = require('../../constants/statusCodes.js');
const { getErrorMessage } = require('../../constants/errorMessages.js');
const { isValidEmail } = require('../../utils/validationHelper.js');
const { logLogin } = require('../../utils/logHelper.js');
const { UAParser } = require('ua-parser-js');

/**
 * ล็อกอินสำหรับผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
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
const getCurrentUser = async (req, res) => {
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
    
    // ดึงข้อมูลจำนวนโครงการของผู้ใช้ (รวมทั้งที่เป็นสมาชิกในกลุ่มโครงการด้วย)
    const [projectStats] = await pool.execute(`
      SELECT
        COUNT(*) as total_projects,
        SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved_projects
      FROM projects p
      WHERE p.user_id = ?
         OR EXISTS (
           SELECT 1 FROM project_groups pg
           WHERE pg.project_id = p.project_id AND pg.user_id = ?
         )
    `, [user.user_id, user.user_id]);
    
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
const verifyToken = (req, res) => {
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
const logout = (req, res) => {
  // บันทึกการออกจากระบบ (ถ้ามี req.user จาก middleware)
  if (req.user) {
    logger.info(`User ${req.user.username} (ID: ${req.user.id}) logged out`);
  }
  
  return res.json(successResponse(null, 'Logout successful'));
};

// Password reset: request link
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    // Always return success-style response to avoid user enumeration
    if (!email || !isValidEmail(email)) {
      return res.json(successResponse(null, 'If an account with that email exists, a reset link has been sent'));
    }

    const [users] = await pool.execute(
      `SELECT user_id, username, email FROM users WHERE email = ?`,
      [email]
    );

    // Do not reveal existence of the email
    if (users.length === 0) {
      return res.json(successResponse(null, 'If an account with that email exists, a reset link has been sent'));
    }

    const user = users[0];
    const resetToken = generatePasswordResetToken({
      id: user.user_id,
      username: user.username,
      email: user.email
    });

    try {
      await sendPasswordResetEmail(user.email, resetToken, user.username);
    } catch (mailErr) {
      logger.error('Failed to send password reset email:', mailErr);
      // Still return success-style message to avoid leaking info
    }

    return res.json(successResponse(null, 'If an account with that email exists, a reset link has been sent'));
  } catch (error) {
    logger.error('Forgot password error:', error);
    return handleServerError(res, error);
  }
};

// Password reset: confirm new password
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body || {};

    if (!token || !new_password) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse('Token and new_password are required', STATUS_CODES.BAD_REQUEST)
      );
    }

    if (new_password.length < 8) {
      return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json(
        errorResponse('Password must be at least 8 characters long', STATUS_CODES.UNPROCESSABLE_ENTITY)
      );
    }

    const decoded = verifyPasswordResetToken(token);
    if (!decoded || !decoded.id) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json(
        errorResponse('Invalid or expired token', STATUS_CODES.UNAUTHORIZED)
      );
    }

    // Ensure user exists
    const [users] = await pool.execute(
      `SELECT user_id FROM users WHERE user_id = ?`,
      [decoded.id]
    );
    if (users.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse(getErrorMessage('USER.NOT_FOUND'), STATUS_CODES.NOT_FOUND)
      );
    }

    const hashed = await hashPassword(new_password);
    await pool.execute(
      `UPDATE users SET password_hash = ? WHERE user_id = ?`,
      [hashed, decoded.id]
    );

    logger.info(`User ${decoded.id} reset password`);
    return res.json(successResponse(null, 'Password has been reset successfully'));
  } catch (error) {
    logger.error('Reset password error:', error);
    return handleServerError(res, error);
  }
};

// Export functions
module.exports = {
  login,
  getCurrentUser,
  verifyToken,
  logout,
  forgotPassword,
  resetPassword
};