// src/services/userService.js
import { axiosGet, axiosPost, axiosPut, axiosDelete, axiosUpload } from '../lib/axios';
import { USER } from '../constants/apiEndpoints';

/**
 * ดึงรายการผู้ใช้ทั้งหมด
 * @param {Object} filters - ตัวกรองข้อมูลผู้ใช้
 * @returns {Promise<Object>} - ข้อมูลผู้ใช้
 */
export const getAllUsers = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.role) {
      queryParams.append('role', filters.role);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = USER.GET_ALL + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Get all users error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      data: []
    };
  }
};

/**
 * ดึงข้อมูลผู้ใช้ตาม ID
 * @param {string|number} userId - รหัสผู้ใช้
 * @returns {Promise<Object>} - ข้อมูลผู้ใช้
 */
export const getUserById = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสผู้ใช้'
      };
    }
    
    const url = USER.GET_BY_ID(userId);
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error(`Get user ${userId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    };
  }
};

/**
 * สร้างผู้ใช้ใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างผู้ใช้
 */
export const createUser = async (userData) => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!userData.username || !userData.password || !userData.full_name || !userData.email) {
      return {
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      };
    }
    
    const response = await axiosPost(USER.CREATE, userData);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'สร้างผู้ใช้สำเร็จ'
    };
  } catch (error) {
    console.error('Create user error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้'
    };
  }
};

/**
 * อัปเดตข้อมูลผู้ใช้
 * @param {string|number} userId - รหัสผู้ใช้
 * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการอัปเดต
 * @returns {Promise<Object>} - ผลลัพธ์การอัปเดตผู้ใช้
 */
export const updateUser = async (userId, userData) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสผู้ใช้'
      };
    }
    
    const url = USER.UPDATE(userId);
    const response = await axiosPut(url, userData);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'อัปเดตข้อมูลผู้ใช้สำเร็จ'
    };
  } catch (error) {
    console.error(`Update user ${userId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้'
    };
  }
};

/**
 * ลบผู้ใช้
 * @param {string|number} userId - รหัสผู้ใช้
 * @returns {Promise<Object>} - ผลลัพธ์การลบผู้ใช้
 */
export const deleteUser = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสผู้ใช้'
      };
    }
    
    const url = USER.DELETE(userId);
    const response = await axiosDelete(url);
    
    return {
      success: true,
      message: response.message || 'ลบผู้ใช้สำเร็จ'
    };
  } catch (error) {
    console.error(`Delete user ${userId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้'
    };
  }
};

/**
 * อัปโหลดรูปโปรไฟล์
 * @param {string|number} userId - รหัสผู้ใช้
 * @param {FormData} formData - ข้อมูลรูปภาพ
 * @param {Function} onProgress - ฟังก์ชันติดตามความคืบหน้า
 * @returns {Promise<Object>} - ผลลัพธ์การอัปโหลดรูปโปรไฟล์
 */
export const uploadProfileImage = async (userId, formData, onProgress) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสผู้ใช้'
      };
    }
    
    if (!formData || !(formData instanceof FormData)) {
      return {
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง'
      };
    }
    
    const url = USER.UPLOAD_PROFILE_IMAGE(userId);
    const response = await axiosUpload(url, formData, onProgress);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'อัปโหลดรูปโปรไฟล์สำเร็จ'
    };
  } catch (error) {
    console.error(`Upload profile image for user ${userId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์'
    };
  }
};

/**
 * ดึงประวัติการเข้าสู่ระบบของผู้ใช้
 * @param {string|number} userId - รหัสผู้ใช้
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลประวัติการเข้าสู่ระบบ
 */
export const getUserLoginHistory = async (userId, filters = {}) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสผู้ใช้'
      };
    }
    
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    // สร้าง URL พร้อม query string
    const url = USER.LOGIN_HISTORY(userId) + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error(`Get login history for user ${userId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการเข้าสู่ระบบ',
      data: []
    };
  }
};

/**
 * ลงทะเบียนผู้ใช้ใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการลงทะเบียน
 * @returns {Promise<Object>} - ผลลัพธ์การลงทะเบียน
 */
export const registerUser = async (userData) => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!userData.username || !userData.password || !userData.full_name || !userData.email) {
      return {
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      };
    }
    
    const response = await axiosPost(USER.REGISTER, userData);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'ลงทะเบียนผู้ใช้สำเร็จ'
    };
  } catch (error) {
    console.error('Register user error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
    };
  }
};

/**
 * ดึงสถิติผู้ใช้งาน
 * @returns {Promise<Object>} - ข้อมูลสถิติผู้ใช้งาน
 */
export const getUserStats = async () => {
  try {
    const response = await axiosGet(USER.STATS);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติผู้ใช้งาน',
      data: {}
    };
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getUserLoginHistory,
  registerUser,
  getUserStats
};