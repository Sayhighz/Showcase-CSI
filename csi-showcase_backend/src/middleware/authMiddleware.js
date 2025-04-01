// middleware/authMiddleware.js
import { verifyToken } from '../utils/jwtHelper.js';
import { forbiddenResponse } from '../utils/responseFormatter.js';
import pool from '../config/database.js';

/**
 * Middleware ตรวจสอบ JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Token has expired or is invalid. Please log in again.'
      });
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงในฐานข้อมูลหรือไม่
    const [users] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [decoded.id]);
    
    if (users.length === 0) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'User not found'
      });
    }
    
    // เก็บข้อมูลผู้ใช้ไว้ใน req object เพื่อใช้ในฟังก์ชันถัดไป
    req.user = {
      id: users[0].user_id,
      username: users[0].username,
      fullName: users[0].full_name,
      email: users[0].email,
      role: users[0].role
    };
    
    // บันทึกประวัติการเข้าสู่ระบบ (ตาม IP)
    await pool.execute(`
      INSERT INTO login_logs (user_id, ip_address)
      VALUES (?, ?)
    `, [decoded.id, req.ip]);
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error during authentication'
    });
  }
};

/**
 * Middleware ตรวจสอบว่าผู้ใช้เป็น Admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return forbiddenResponse(res, 'Access denied. Admin privileges required');
  }
  
  next();
};

/**
 * Middleware ตรวจสอบว่าผู้ใช้เป็น Student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'student') {
    return forbiddenResponse(res, 'Access denied. Student privileges required');
  }
  
  next();
};

/**
 * Middleware ตรวจสอบว่าผู้ใช้เป็นเจ้าของทรัพยากรหรือมีสิทธิ์ในการเข้าถึง
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isResourceOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication required'
      });
    }
    
    const resourceId = req.params.projectId || req.params.userId;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Resource ID is required'
      });
    }
    
    // ถ้าเป็น Admin ให้ผ่านไปได้เลย
    if (req.user.role === 'admin') {
      return next();
    }
    
    // ตรวจสอบว่าเป็น userId หรือไม่
    if (req.params.userId) {
      // ถ้าเป็น userId ต้องเป็นของตัวเองเท่านั้น
      if (req.user.id != req.params.userId) {
        return forbiddenResponse(res, 'Access denied. You can only access your own resources');
      }
      return next();
    }
    
    // ถ้าเป็น projectId ต้องตรวจสอบว่าเป็นเจ้าของหรือไม่
    if (req.params.projectId) {
      // ตรวจสอบว่าผู้ใช้เป็นเจ้าของโครงการหรือไม่
      const [owners] = await pool.execute(`
        SELECT user_id FROM project_groups WHERE project_id = ?
      `, [resourceId]);
      
      const isOwner = owners.some(owner => owner.user_id == req.user.id);
      
      if (!isOwner) {
        return forbiddenResponse(res, 'Access denied. You are not the owner of this resource');
      }
      
      return next();
    }
    
    // ถ้าไม่ใช่กรณีข้างบน ให้ปฏิเสธการเข้าถึง
    return forbiddenResponse(res, 'Access denied. Invalid resource');
    
  } catch (error) {
    console.error('Error in resource owner check:', error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error during resource owner check'
    });
  }
};