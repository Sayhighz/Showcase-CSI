// controllers/admin/adminAuthController.js
import bcrypt from 'bcryptjs';
import pool from '../../config/database.js';
import { handleServerError, successResponse } from '../../utils/responseFormatter.js';
import { generateAdminToken, generatePasswordResetToken, verifyPasswordResetToken } from '../../utils/jwtHelper.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';

/**
 * ล็อกอินสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Username and password are required'
      });
    }
    
    // ค้นหาผู้ใช้จากฐานข้อมูล
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE username = ? AND role = 'admin'
    `, [username]);
    
    // ตรวจสอบว่ามีผู้ใช้หรือไม่
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid credentials or not an admin account'
      });
    }
    
    const user = users[0];
    
    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid credentials'
      });
    }
    
    // สร้าง JWT token สำหรับ admin
    const token = generateAdminToken({
      id: user.user_id,
      username: user.username,
      role: user.role,
    });
    
    // บันทึกประวัติการเข้าสู่ระบบ
    await pool.execute(`
      INSERT INTO login_logs (user_id, ip_address)
      VALUES (?, ?)
    `, [user.user_id, req.ip]);
    
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
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Admin not authenticated'
      });
    }
    
    // ค้นหาข้อมูลผู้ใช้เพิ่มเติมจากฐานข้อมูล
    const [users] = await pool.execute(`
      SELECT user_id, username, full_name, email, image, role, created_at 
      FROM users 
      WHERE user_id = ? AND role = 'admin'
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Admin not found'
      });
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
    return handleServerError(res, error);
  }
};

/**
 * ตรวจสอบความถูกต้องของ token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyAdminToken = (req, res) => {
  // ถ้ามาถึงจุดนี้แสดงว่า token ถูกต้อง (เพราะผ่าน middleware authenticateAdminToken มาแล้ว)
  return res.json(successResponse({ 
    valid: true, 
    user: req.user 
  }, 'Admin token is valid'));
};

/**
 * รีเซ็ตรหัสผ่านสำหรับผู้ดูแลระบบ (เริ่มต้นกระบวนการรีเซ็ต)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const forgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Email is required'
      });
    }
    
    // ค้นหาผู้ใช้จากอีเมล
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE email = ? AND role = 'admin'
    `, [email]);
    
    if (users.length === 0) {
      // ไม่ควรเปิดเผยว่าอีเมลไม่มีในระบบเพื่อความปลอดภัย
      return res.json(successResponse(
        null,
        'If your email is registered as an admin, you will receive password reset instructions.'
      ));
    }
    
    const user = users[0];
    
    // สร้าง reset token ที่มีอายุ 1 ชั่วโมง
    const resetToken = generatePasswordResetToken({
      id: user.user_id,
      role: user.role,
    });
    
    // บันทึก reset token และเวลาหมดอายุลงในฐานข้อมูล
    await pool.execute(`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
    `, [user.user_id, resetToken]);
    
    // ส่งอีเมลรีเซ็ตรหัสผ่าน
    sendPasswordResetEmail(email, resetToken, user.username);
    
    return res.json(successResponse(
      null,
      'If your email is registered as an admin, you will receive password reset instructions.'
    ));
    
  } catch (error) {
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
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Token and new password are required'
      });
    }
    
    // ตรวจสอบความถูกต้องของ token
    const decoded = verifyPasswordResetToken(token);
    
    if (!decoded) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid or expired token'
      });
    }
    
    // ตรวจสอบว่า token ยังไม่หมดอายุในฐานข้อมูล
    const [resetRecords] = await pool.execute(`
      SELECT * FROM password_resets
      WHERE user_id = ? AND token = ? AND expires_at > NOW()
    `, [decoded.id, token]);
    
    if (resetRecords.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Token is invalid or has expired'
      });
    }
    
    // ตรวจสอบว่าผู้ใช้เป็น admin จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ? AND role = 'admin'
    `, [decoded.id]);
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Only admin accounts can use this endpoint'
      });
    }
    
    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
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
    
    return res.json(successResponse(null, 'Admin password has been reset successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ออกจากระบบสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const adminLogout = (req, res) => {
  // ในการใช้ JWT ไม่จำเป็นต้องทำอะไรที่ server เพราะ token จะถูกเก็บที่ client
  // client สามารถลบ token ออกเองได้
  // แต่เราสามารถเพิ่มฟังก์ชันนี้เพื่อให้ frontend เรียกใช้ได้
  return res.json(successResponse(null, 'Admin logout successful'));
};

/**
 * เปลี่ยนรหัสผ่านของผู้ดูแลระบบปัจจุบัน
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Current password and new password are required'
      });
    }
    
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ? AND role = 'admin'
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Admin user not found'
      });
    }
    
    const user = users[0];
    
    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Current password is incorrect'
      });
    }
    
    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // อัปเดตรหัสผ่าน
    await pool.execute(`
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `, [hashedPassword, req.user.id]);
    
    return res.json(successResponse(null, 'Admin password changed successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};