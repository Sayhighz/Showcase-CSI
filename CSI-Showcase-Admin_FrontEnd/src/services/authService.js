import { axiosPost, axiosGet } from '../lib/axios';

/**
 * เข้าสู่ระบบ
 * @param {string} username - ชื่อผู้ใช้
 * @param {string} password - รหัสผ่าน
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การเข้าสู่ระบบ
 */
export const authLogin = async (username, password) => {
  try {
    const response = await axiosPost('/auth/login', { username, password });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * ตรวจสอบความถูกต้องของ token
 * @param {string} token - JWT token
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การตรวจสอบ
 */
export const authVerify = async (token) => {
  try {
    const response = await axiosGet('/auth/verify-token');
    return response;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

/**
 * ออกจากระบบ
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การออกจากระบบ
 */
export const authLogout = async () => {
  try {
    const response = await axiosPost('/auth/logout');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลผู้ใช้
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosGet('/auth/me');
    return response;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * ลืมรหัสผ่าน - ส่งอีเมลสำหรับรีเซ็ตรหัสผ่าน
 * @param {string} email - อีเมล
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การดำเนินการ
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axiosPost('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * รีเซ็ตรหัสผ่าน
 * @param {string} token - Token สำหรับรีเซ็ตรหัสผ่าน
 * @param {string} newPassword - รหัสผ่านใหม่
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การดำเนินการ
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosPost('/auth/reset-password', { token, newPassword });
    return response;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};