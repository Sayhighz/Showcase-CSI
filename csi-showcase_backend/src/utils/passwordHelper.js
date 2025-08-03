// utils/passwordHelper.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * เข้ารหัสรหัสผ่านด้วย bcrypt
 * @param {string} password - รหัสผ่านที่ต้องการเข้ารหัส
 * @param {number} saltRounds - จำนวนรอบการเข้ารหัส (default: 10)
 * @returns {Promise<string>} - รหัสผ่านที่เข้ารหัสแล้ว
 */
const hashPassword = async (password, saltRounds = 10) => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * ตรวจสอบรหัสผ่านว่าตรงกับรหัสผ่านที่เข้ารหัสไว้หรือไม่
 * @param {string} password - รหัสผ่านที่ต้องการตรวจสอบ
 * @param {string} hashedPassword - รหัสผ่านที่เข้ารหัสไว้
 * @returns {Promise<boolean>} - ผลการตรวจสอบ
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * สร้างรหัสผ่านแบบสุ่ม
 * @param {number} length - ความยาวของรหัสผ่าน (default: 12)
 * @returns {string} - รหัสผ่านแบบสุ่ม
 */
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password += charset.charAt(randomIndex);
  }
  
  return password;
};

/**
 * ตรวจสอบความแข็งแรงของรหัสผ่าน
 * @param {string} password - รหัสผ่านที่ต้องการตรวจสอบ
 * @returns {Object} - ผลการตรวจสอบ
 */
const checkPasswordStrength = (password) => {
  const result = {
    isStrong: false,
    score: 0,
    feedback: []
  };
  
  // ตรวจสอบความยาว
  if (password.length < 8) {
    result.feedback.push('รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร');
  } else {
    result.score += 1;
  }
  
  // ตรวจสอบตัวอักษรพิมพ์เล็ก
  if (!/[a-z]/.test(password)) {
    result.feedback.push('ควรมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว');
  } else {
    result.score += 1;
  }
  
  // ตรวจสอบตัวอักษรพิมพ์ใหญ่
  if (!/[A-Z]/.test(password)) {
    result.feedback.push('ควรมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  } else {
    result.score += 1;
  }
  
  // ตรวจสอบตัวเลข
  if (!/[0-9]/.test(password)) {
    result.feedback.push('ควรมีตัวเลขอย่างน้อย 1 ตัว');
  } else {
    result.score += 1;
  }
  
  // ตรวจสอบอักขระพิเศษ
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.feedback.push('ควรมีอักขระพิเศษอย่างน้อย 1 ตัว');
  } else {
    result.score += 1;
  }
  
  // กำหนดความแข็งแรง
  result.isStrong = result.score >= 4;
  
  return result;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomPassword,
  checkPasswordStrength
};