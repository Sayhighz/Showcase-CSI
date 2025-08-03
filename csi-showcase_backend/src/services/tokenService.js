// services/tokenService.js
const jwt = require('jsonwebtoken');
const logger = require('../config/logger.js');
const pool = require('../config/database.js');


/**
 * สร้าง JWT token
 * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
 * @param {string} secret - Secret key สำหรับเข้ารหัส token
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {string} - JWT token
 */
const generateToken = (payload, secret = process.env.JWT_SECRET, options = {}) => {
    try {
      // ตั้งค่า expiresIn เริ่มต้น
      const defaultOptions = { expiresIn: '24h' };
      // รวมตัวเลือกที่ส่งเข้ามากับตัวเลือกเริ่มต้น
      const tokenOptions = { ...defaultOptions, ...options };
      
      // สร้าง token
      const token = jwt.sign(payload, secret, tokenOptions);
      
      logger.debug('Token generated', { 
        user: payload.id || payload.username,
        expiresIn: tokenOptions.expiresIn
      });
      
      return token;
    } catch (error) {
      logger.error('Error generating token:', error);
      throw new Error('Failed to generate token');
    }
  };
  
  /**
   * ถอดรหัส JWT token
   * @param {string} token - JWT token ที่ต้องการถอดรหัส
   * @param {string} secret - Secret key ที่ใช้ในการถอดรหัส
   * @returns {Object|null} - ข้อมูลที่ถอดรหัสแล้ว หรือ null หากไม่ถูกต้อง
   */
  const verifyToken = (token, secret = process.env.JWT_SECRET) => {
    try {
      // ถอดรหัส token
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      logger.error('Token verification error:', error.message);
      return null;
    }
  };
  
  /**
   * สร้าง token สำหรับการรีเซ็ตรหัสผ่าน
   * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
   * @returns {string} - JWT token
   */
  const generatePasswordResetToken = (payload) => {
    // เพิ่ม purpose เพื่อระบุว่าเป็น token สำหรับการรีเซ็ตรหัสผ่าน
    const resetPayload = { ...payload, purpose: 'password_reset' };
    // กำหนดอายุของ token เป็น 1 ชั่วโมง
    return generateToken(resetPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  };
  
  /**
   * สร้าง token สำหรับ admin
   * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
   * @returns {string} - JWT token
   */
  const generateAdminToken = (payload) => {
    // เพิ่ม isAdmin เพื่อระบุว่าเป็น token สำหรับ admin
    const adminPayload = { ...payload, isAdmin: true };
    // ใช้ secret key สำหรับ admin หรือ secret key ปกติถ้าไม่มี
    const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
    // กำหนดอายุของ token เป็น 12 ชั่วโมง
    return generateToken(adminPayload, secret, { expiresIn: '12h' });
  };
  
  /**
   * ตรวจสอบ token ว่าเป็น admin token หรือไม่
   * @param {string} token - JWT token ที่ต้องการตรวจสอบ
   * @returns {Object|null} - ข้อมูลที่ถอดรหัสแล้ว หรือ null หากไม่ถูกต้อง
   */
  const verifyAdminToken = (token) => {
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
      logger.error('Admin token verification error:', error.message);
      return null;
    }
  };
  
  /**
   * บันทึก token ที่ถูกเพิกถอนลงในฐานข้อมูล
   * @param {string} token - JWT token ที่ต้องการเพิกถอน
   * @param {Object} decoded - ข้อมูลที่ถอดรหัสจาก token
   * @returns {Promise<boolean>} - ผลการเพิกถอน token
   */
  const revokeToken = async (token, decoded) => {
    try {
      // คำนวณเวลาหมดอายุจาก exp ใน token
      const expiresAt = new Date(decoded.exp * 1000);
      
      // บันทึกข้อมูล token ที่ถูกเพิกถอนลงในฐานข้อมูล
      await pool.execute(`
        INSERT INTO revoked_tokens (token_hash, user_id, expires_at)
        VALUES (SHA2(?, 256), ?, ?)
      `, [token, decoded.id, expiresAt]);
      
      logger.info('Token revoked', { userId: decoded.id });
      
      return true;
    } catch (error) {
      logger.error('Error revoking token:', error);
      return false;
    }
  };
  
  /**
   * ตรวจสอบว่า token ถูกเพิกถอนหรือไม่
   * @param {string} token - JWT token ที่ต้องการตรวจสอบ
   * @returns {Promise<boolean>} - true ถ้า token ถูกเพิกถอน, false ถ้าไม่ถูกเพิกถอน
   */
  const isTokenRevoked = async (token) => {
    try {
      // ตรวจสอบว่า token อยู่ในรายการที่ถูกเพิกถอนหรือไม่
      const [rows] = await pool.execute(`
        SELECT * FROM revoked_tokens
        WHERE token_hash = SHA2(?, 256) AND expires_at > NOW()
      `, [token]);
      
      return rows.length > 0;
    } catch (error) {
      logger.error('Error checking revoked token:', error);
      return true; // ถ้าเกิดข้อผิดพลาด ให้ถือว่า token ถูกเพิกถอน
    }
  };
  
  /**
   * ลบ token ที่หมดอายุออกจากฐานข้อมูล
   * @returns {Promise<number>} - จำนวน token ที่ถูกลบ
   */
  const cleanupExpiredTokens = async () => {
    try {
      // ลบ token ที่หมดอายุแล้ว
      const [result] = await pool.execute(`
        DELETE FROM revoked_tokens
        WHERE expires_at <= NOW()
      `);
      
      logger.info(`Cleaned up ${result.affectedRows} expired tokens`);
      
      return result.affectedRows;
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  };
  
  module.exports = {
    generateToken,
    verifyToken,
    generatePasswordResetToken,
    generateAdminToken,
    verifyAdminToken,
    revokeToken,
    isTokenRevoked,
    cleanupExpiredTokens
  };