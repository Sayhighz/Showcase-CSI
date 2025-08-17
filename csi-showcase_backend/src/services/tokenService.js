// services/tokenService.js
const logger = require('../config/logger.js');
const pool = require('../config/database.js');
const {
  generateToken,
  generateAdminToken,
  generatePasswordResetToken,
  verifyToken,
  verifyAdminToken,
  verifyPasswordResetToken
} = require('../utils/jwtHelper.js');
  
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
  // Re-export JWT helper functions for backward compatibility
  generateToken,
  generateAdminToken,
  generatePasswordResetToken,
  verifyToken,
  verifyAdminToken,
  verifyPasswordResetToken,
  // Token management functions
  revokeToken,
  isTokenRevoked,
  cleanupExpiredTokens
};