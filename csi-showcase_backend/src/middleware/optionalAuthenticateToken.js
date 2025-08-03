// middleware/optionalAuthenticateToken.js
const { verifyToken } = require('../utils/jwtHelper.js');
const pool = require('../config/database.js');

const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // ไม่มี token แต่ไม่บล็อก ให้ผ่านไปได้เลย
      return next();
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      // token ไม่ถูกต้อง แต่ไม่บล็อก ให้ผ่านไปได้เลย
      return next();
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงในฐานข้อมูลหรือไม่
    const [users] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [decoded.id]);
    
    if (users.length === 0) {
      // ไม่พบผู้ใช้ แต่ไม่บล็อก ให้ผ่านไปได้เลย
      return next();
    }
    
    // เก็บข้อมูลผู้ใช้ไว้ใน req object
    req.user = {
      id: users[0].user_id,
      username: users[0].username,
      fullName: users[0].full_name,
      email: users[0].email,
      role: users[0].role
    };
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    // มี error แต่ไม่บล็อก ให้ผ่านไปได้เลย
    next();
  }
};

// Export function using CommonJS
module.exports = {
  optionalAuthenticateToken
};