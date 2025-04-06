// src/services/authService.js
import { axiosPost, axiosGet } from '../lib/axios';
import { setAuthCookie, removeAuthCookie, getAuthCookie } from '../lib/cookie';
import { jwtDecode } from 'jwt-decode';
import { AUTH } from '../constants/apiEndpoints';

/**
 * เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน
 * @param {string} username - ชื่อผู้ใช้
 * @param {string} password - รหัสผ่าน
 * @returns {Promise<Object>} - ข้อมูลการเข้าสู่ระบบ
 */
export const login = async (username, password) => {
  try {
    const response = await axiosPost(AUTH.LOGIN, { username, password });
    
    if (response.success && response.data && response.data.token) {
      // จัดเก็บ token ใน cookie
      setAuthCookie(response.data.token);
      
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      message: response.message || 'เข้าสู่ระบบไม่สำเร็จ'
    };
  } catch (error) {
    console.error('Login error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    };
  }
};

/**
 * ออกจากระบบ
 * @returns {Promise<Object>} - ผลลัพธ์การออกจากระบบ
 */
export const logout = async () => {
  try {
    // ส่งคำขอออกจากระบบไปยัง API
    await axiosPost(AUTH.LOGOUT);
    
    // ลบ token จาก cookie
    removeAuthCookie();
    
    return {
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    };
  } catch (error) {
    console.error('Logout error:', error);
    
    // ลบ token จาก cookie แม้ว่าจะมีข้อผิดพลาด
    removeAuthCookie();
    
    return {
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    };
  }
};

/**
 * ตรวจสอบความถูกต้องของ token
 * @returns {Promise<Object>} - ผลลัพธ์การตรวจสอบ
 */
export const verifyToken = async () => {
  try {
    const token = getAuthCookie();
    
    if (!token) {
      return {
        valid: false,
        message: 'ไม่พบ token'
      };
    }
    
    // ตรวจสอบอายุของ token ในฝั่ง client ก่อน
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      removeAuthCookie();
      return {
        valid: false,
        message: 'Token หมดอายุ'
      };
    }
    
    // ตรวจสอบความถูกต้องของ token ด้วย API
    const response = await axiosGet(AUTH.VERIFY_TOKEN);
    
    return {
      valid: response.valid || false,
      message: response.message || 'ตรวจสอบ token สำเร็จ'
    };
  } catch (error) {
    console.error('Token verification error:', error);
    
    return {
      valid: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการตรวจสอบ token'
    };
  }
};

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 * @returns {Promise<Object>} - ข้อมูลผู้ใช้
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosGet(AUTH.ME);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get current user error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    };
  }
};

/**
 * เปลี่ยนรหัสผ่าน
 * @param {string} currentPassword - รหัสผ่านปัจจุบัน
 * @param {string} newPassword - รหัสผ่านใหม่
 * @returns {Promise<Object>} - ผลลัพธ์การเปลี่ยนรหัสผ่าน
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axiosPost(AUTH.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword
    });
    
    return {
      success: true,
      message: response.message || 'เปลี่ยนรหัสผ่านสำเร็จ'
    };
  } catch (error) {
    console.error('Change password error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
    };
  }
};

/**
 * ขอรีเซ็ตรหัสผ่าน
 * @param {string} email - อีเมลที่ใช้ในการลงทะเบียน
 * @returns {Promise<Object>} - ผลลัพธ์การขอรีเซ็ตรหัสผ่าน
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axiosPost(AUTH.FORGOT_PASSWORD, { email });
    
    return {
      success: true,
      message: response.message || 'ส่งคำขอรีเซ็ตรหัสผ่านสำเร็จ'
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน'
    };
  }
};

/**
 * รีเซ็ตรหัสผ่าน
 * @param {string} token - Token สำหรับรีเซ็ตรหัสผ่าน
 * @param {string} newPassword - รหัสผ่านใหม่
 * @returns {Promise<Object>} - ผลลัพธ์การรีเซ็ตรหัสผ่าน
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosPost(AUTH.RESET_PASSWORD, {
      token,
      new_password: newPassword
    });
    
    return {
      success: true,
      message: response.message || 'รีเซ็ตรหัสผ่านสำเร็จ'
    };
  } catch (error) {
    console.error('Reset password error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน'
    };
  }
};

export default {
  login,
  logout,
  verifyToken,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword
};