// middleware/secretKeyMiddleware.js
const dotenv = require('dotenv');

// Initialize .env configuration
dotenv.config();

/**
 * Middleware สำหรับตรวจสอบ secret key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkSecretKey = (req, res, next) => {
  // ดึง secret key จาก header
  const secretKey = req.headers['secret_key'];
  
  // ตรวจสอบว่ามี path ที่ไม่จำเป็นต้องมี secret key หรือไม่
  const publicPaths = [
    '/',                       // หน้าแรก
    '/api/auth/login',         // หน้า login
    '/api/auth/register',      // หน้าลงทะเบียน
    '/api/auth/forgot-password', // หน้ารีเซ็ตรหัสผ่าน
    '/api/auth/reset-password',  // หน้าตั้งรหัสผ่านใหม่
    '/api/admin/auth/login',   // หน้า login สำหรับ admin
  ];
  
  // ตรวจสอบว่าเป็น path ที่ต้องผ่านการตรวจสอบ secret key หรือไม่
  // ถ้าเป็น path ที่ไม่ต้องตรวจสอบ ให้ผ่านไปได้เลย
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  
  if (isPublicPath) {
    return next();
  }
  
  // ตรวจสอบ OPTIONS request สำหรับ CORS
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // ตรวจสอบว่ามี secret key หรือไม่
  if (!secretKey) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Missing secret key'
    });
  }
  
  // ตรวจสอบความถูกต้องของ secret key
  const correctSecretKey = process.env.API_SECRET_KEY;
  
  if (!correctSecretKey || secretKey !== correctSecretKey) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Invalid secret key'
    });
  }
  
  // ถ้า secret key ถูกต้อง ให้ดำเนินการต่อไป
  next();
};

/**
 * Middleware สำหรับตรวจสอบ secret key เฉพาะสำหรับ Admin API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkAdminSecretKey = (req, res, next) => {
  // ดึง secret key จาก header
  const secretKey = req.headers['admin_secret_key'];
  
  // ตรวจสอบ OPTIONS request สำหรับ CORS
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // ตรวจสอบว่ามี secret key หรือไม่
  if (!secretKey) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Missing admin secret key'
    });
  }
  
  // ตรวจสอบความถูกต้องของ secret key
  const correctSecretKey = process.env.ADMIN_API_SECRET_KEY;
  
  if (!correctSecretKey || secretKey !== correctSecretKey) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Invalid admin secret key'
    });
  }
  
  // ถ้า secret key ถูกต้อง ให้ดำเนินการต่อไป
  next();
};

// Export functions using CommonJS
module.exports = {
  checkSecretKey,
  checkAdminSecretKey
};