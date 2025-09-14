// middleware/adminMiddleware.js
const { verifyAdminToken, verifyToken } = require('../utils/jwtHelper.js');
const { forbiddenResponse } = require('../utils/responseFormatter.js');
const pool = require('../config/database.js');

/**
 * Middleware ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAdmin = async (req, res, next) => {
  try {
    // ตรวจสอบว่ามีข้อมูลผู้ใช้ใน request หรือไม่ (ผ่านการตรวจสอบ token มาแล้ว)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication required',
      });
    }
    
    // ตรวจสอบว่าผู้ใช้มีบทบาทเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return forbiddenResponse(res, 'Access denied. Admin privileges required');
    }
    
    // ผ่านการตรวจสอบ - ดำเนินการต่อไป
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error during admin check',
    });
  }
};

/**
 * Middleware สำหรับตรวจสอบ JWT token ของ Admin 
 * แยกออกมาต่างหากเพราะอาจมีการตรวจสอบ token ในรูปแบบที่แตกต่างจาก user ทั่วไป
 */
const authenticateAdminToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false, 
        statusCode: 401,
        message: 'Access denied. No token provided.'
      });
    }

    // ตรวจสอบ token สำหรับ admin โดยเฉพาะ
    const decoded = verifyAdminToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        statusCode: 401,
        message: 'Invalid or expired token. Please log in again.' 
      });
    }
    
    // ตรวจสอบว่า user มีอยู่จริงในฐานข้อมูลหรือไม่
    const [users] = await pool.execute('SELECT * FROM users WHERE user_id = ? AND role = "admin" AND status = "active"', [decoded.id]);
    
    if (users.length === 0) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Admin user not found or access revoked'
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
    console.error('Error verifying admin token:', error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error during admin authentication'
    });
  }
};

// Export functions using CommonJS
module.exports = {
  isAdmin,
  authenticateAdminToken
};