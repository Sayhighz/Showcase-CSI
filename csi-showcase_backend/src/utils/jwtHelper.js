// utils/jwtHelper.js
const jwt = require('jsonwebtoken');

/**
 * สร้าง JWT token สำหรับผู้ใช้
 * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
 * @param {string} expiresIn - ระยะเวลาหมดอายุของ token (default: 24h)
 * @returns {string} - JWT token
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * สร้าง JWT token สำหรับผู้ดูแลระบบ
 * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
 * @param {string} expiresIn - ระยะเวลาหมดอายุของ token (default: 12h)
 * @returns {string} - JWT token
 */
const generateAdminToken = (payload, expiresIn = '12h') => {
  return jwt.sign(
    { ...payload, isAdmin: true },
    process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * ถอดรหัส JWT token และตรวจสอบความถูกต้อง
 * @param {string} token - JWT token ที่ต้องการถอดรหัส
 * @returns {Object|null} - ข้อมูลที่ถอดรหัสแล้ว หรือ null หากไม่ถูกต้อง
 */
const verifyToken = (token, useAdminSecret = false) => {
  try {
    // ถ้าเป็น admin token ให้ลอง verify ด้วย admin secret ก่อน
    if (useAdminSecret && process.env.JWT_ADMIN_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        if (decoded.isAdmin && decoded.role === 'admin') {
          return decoded;
        }
      } catch (adminError) {
        // หากไม่สำเร็จ ให้ลอง verify ด้วย secret ปกติ
      }
    }
    
    // ใช้ JWT_SECRET ปกติ
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return null;
  }
};

/**
 * ถอดรหัส JWT token สำหรับผู้ดูแลระบบและตรวจสอบความถูกต้อง
 * @param {string} token - JWT token ที่ต้องการถอดรหัส
 * @returns {Object|null} - ข้อมูลที่ถอดรหัสแล้ว หรือ null หากไม่ถูกต้อง
 */
const verifyAdminToken = (token) => {
  const decoded = verifyToken(token, true);
  
  if (!decoded) {
    return null;
  }
  
  // ตรวจสอบว่าเป็น admin token หรือไม่
  if (decoded.role !== 'admin') {
    console.error('Token is not from an admin user');
    return null;
  }
  
  return decoded;
};

/**
 * สร้าง JWT token สำหรับรีเซ็ตรหัสผ่าน
 * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
 * @returns {string} - JWT token สำหรับรีเซ็ตรหัสผ่าน
 */
const generatePasswordResetToken = (payload) => {
  return jwt.sign(
    { ...payload, purpose: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * ตรวจสอบความถูกต้องของ token สำหรับรีเซ็ตรหัสผ่าน
 * @param {string} token - JWT token ที่ต้องการตรวจสอบ
 * @returns {Object|null} - ข้อมูลที่ถอดรหัสแล้ว หรือ null หากไม่ถูกต้อง
 */
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ตรวจสอบว่า token นี้มีวัตถุประสงค์เพื่อรีเซ็ตรหัสผ่านหรือไม่
    if (decoded.purpose === 'password_reset') {
      return decoded;
    }
    return null;
  } catch (error) {
    console.error('Password Reset Token Verification Error:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  generateAdminToken,
  verifyToken,
  verifyAdminToken,
  generatePasswordResetToken,
  verifyPasswordResetToken
};