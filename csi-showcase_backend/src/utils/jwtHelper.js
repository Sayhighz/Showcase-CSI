// utils/jwtHelper.js
import jwt from 'jsonwebtoken';

/**
 * สร้าง JWT token สำหรับผู้ใช้
 * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
 * @param {string} expiresIn - ระยะเวลาหมดอายุของ token (default: 24h)
 * @returns {string} - JWT token
 */
export const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * สร้าง JWT token สำหรับผู้ดูแลระบบ
 * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
 * @param {string} expiresIn - ระยะเวลาหมดอายุของ token (default: 12h)
 * @returns {string} - JWT token
 */
export const generateAdminToken = (payload, expiresIn = '12h') => {
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
export const verifyToken = (token) => {
  try {
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
export const verifyAdminToken = (token) => {
  try {
    // ลองถอดรหัสด้วย Admin Secret ก่อน
    try {
      if (process.env.JWT_ADMIN_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        // ตรวจสอบว่า token นี้เป็นของ admin จริงหรือไม่
        if (decoded.isAdmin && decoded.role === 'admin') {
          return decoded;
        }
      }
    } catch (adminError) {
      // หากไม่สามารถถอดรหัสด้วย Admin Secret ได้ ให้ลองใช้ Secret ปกติ
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // ตรวจสอบว่า token นี้เป็นของ admin จริงหรือไม่
      if (decoded.isAdmin && decoded.role === 'admin') {
        return decoded;
      }
    }
    return null;
  } catch (error) {
    console.error('Admin JWT Verification Error:', error.message);
    return null;
  }
};

/**
 * สร้าง JWT token สำหรับรีเซ็ตรหัสผ่าน
 * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
 * @returns {string} - JWT token สำหรับรีเซ็ตรหัสผ่าน
 */
export const generatePasswordResetToken = (payload) => {
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
export const verifyPasswordResetToken = (token) => {
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