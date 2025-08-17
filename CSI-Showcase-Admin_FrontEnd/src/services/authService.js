// src/services/adminAuthService.js
import { axiosPost, axiosGet } from '../lib/axios';
import { setAdminAuthCookie, removeAdminAuthCookie, getAdminAuthCookie } from '../lib/cookie';
import { jwtDecode } from 'jwt-decode';
import { AUTH, ADMIN } from '../constants/apiEndpoints';

/**
 * เข้าสู่ระบบแอดมินด้วยชื่อผู้ใช้และรหัสผ่าน
 * @param {string} username - ชื่อผู้ใช้
 * @param {string} password - รหัสผ่าน
 * @returns {Promise<Object>} - ข้อมูลการเข้าสู่ระบบแอดมิน
 */
export const adminLogin = async (username, password) => {
  try {
    // Use the general user authentication endpoint that accepts both students and admins
    const response = await axiosPost(AUTH.LOGIN, { username, password });
    
    if (response.success && response.data && response.data.token) {
      // จัดเก็บ token ใน cookie
      setAdminAuthCookie(response.data.token);
      
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      message: response.message || 'เข้าสู่ระบบแอดมินไม่สำเร็จ'
    };
  } catch (error) {
    console.error('Admin login error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบแอดมิน'
    };
  }
};

/**
 * ออกจากระบบแอดมิน
 * @returns {Promise<Object>} - ผลลัพธ์การออกจากระบบแอดมิน
 */
export const adminLogout = async () => {
  try {
    // ส่งคำขอออกจากระบบไปยัง API
    await axiosPost(AUTH.LOGOUT);
    
    // ลบ token จาก cookie
    removeAdminAuthCookie();
    
    return {
      success: true,
      message: 'ออกจากระบบแอดมินสำเร็จ'
    };
  } catch (error) {
    console.error('Admin logout error:', error);
    
    // ลบ token จาก cookie แม้ว่าจะมีข้อผิดพลาด
    removeAdminAuthCookie();
    
    return {
      success: true,
      message: 'ออกจากระบบแอดมินสำเร็จ'
    };
  }
};

/**
 * ตรวจสอบความถูกต้องของ token แอดมิน
 * @returns {Promise<Object>} - ผลลัพธ์การตรวจสอบ
 */
export const verifyAdminToken = async () => {
  try {
    const token = getAdminAuthCookie();
    
    if (!token) {
      return {
        valid: false,
        message: 'ไม่พบ token แอดมิน'
      };
    }
    
    // ตรวจสอบอายุของ token ในฝั่ง client ก่อน
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      removeAdminAuthCookie();
      return {
        valid: false,
        message: 'Token แอดมินหมดอายุ'
      };
    }
    
    // ตรวจสอบความถูกต้องของ token ด้วย API
    const response = await axiosGet(AUTH.VERIFY_TOKEN);
    
    return {
      valid: response.data?.valid || false,
      user: response.data?.user || null,
      message: response.message || 'ตรวจสอบ token แอดมินสำเร็จ'
    };
  } catch (error) {
    console.error('Admin token verification error:', error);
    
    return {
      valid: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการตรวจสอบ token แอดมิน'
    };
  }
};

/**
 * ดึงข้อมูลแอดมินปัจจุบัน
 * @returns {Promise<Object>} - ข้อมูลแอดมิน
 */
export const getCurrentAdmin = async () => {
  try {
    const response = await axiosGet(AUTH.ME);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get current admin error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลแอดมิน'
    };
  }
};

export default {
  adminLogin,
  adminLogout,
  verifyAdminToken,
  getCurrentAdmin
};