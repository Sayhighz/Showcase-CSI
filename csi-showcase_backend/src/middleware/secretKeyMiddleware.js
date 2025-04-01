// ===== middleware/secretKeyMiddleware.js =====

import dotenv from 'dotenv';

// Initialize .env configuration
dotenv.config();

// Middleware สำหรับตรวจสอบ secret key
export const checkSecretKey = (req, res, next) => {
  // ดึง secret key จาก header
  const secretKey = req.headers['secret_key'];
  
  // ตรวจสอบว่ามี path ที่ไม่จำเป็นต้องมี secret key หรือไม่
  const publicPaths = [
    '/',             // หน้าแรก
    '/api/auth/login',     // หน้า login
    '/api/auth/register',  // หน้าลงทะเบียน
    '/api/auth/forgot-password', // หน้ารีเซ็ตรหัสผ่าน
    '/api/auth/reset-password',  // หน้าตั้งรหัสผ่านใหม่
  ];
  
  // หากเป็น path ที่ไม่จำเป็นต้องมี secret key ให้ผ่านไปได้เลย
  if (publicPaths.includes(req.path)) {
    return next();
  }
  
  // ตรวจสอบ OPTIONS request สำหรับ CORS
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // ตรวจสอบว่ามี secret key หรือไม่
  if (!secretKey) {
    return res.status(401).json({ message: 'Missing secret key' });
  }
  
  // ตรวจสอบความถูกต้องของ secret key
  const correctSecretKey = process.env.API_SECRET_KEY;
  
  if (secretKey !== correctSecretKey) {
    return res.status(403).json({ message: 'Invalid secret key' });
  }
  
  // ถ้า secret key ถูกต้อง ให้ดำเนินการต่อไป
  next();
};