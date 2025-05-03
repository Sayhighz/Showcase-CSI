// src/services/adminUserService.js
import { axiosGet, axiosPost, axiosPut, axiosDelete, axiosUpload } from '../lib/axios';
import { ADMIN } from '../constants/apiEndpoints';

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
    const url = ADMIN.USER.ALL + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      pagination: response.pagination
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
    
    const url = ADMIN.USER.GET_BY_ID(userId);
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
 * @param {FormData} formData - FormData ที่มีข้อมูลผู้ใช้และรูปภาพ (ถ้ามี)
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างผู้ใช้
 */
export const createUser = async (formData) => {
  try {
    // ตรวจสอบว่าเป็น FormData
    if (!(formData instanceof FormData)) {
      // ถ้าไม่ใช่ FormData ให้สร้าง FormData ใหม่
      const newFormData = new FormData();
      
      // เพิ่มข้อมูลผู้ใช้ลงใน FormData
      Object.keys(formData).forEach(key => {
        newFormData.append(key, formData[key]);
      });
      
      formData = newFormData;
    }
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!formData.get('username') || !formData.get('password') || !formData.get('full_name') || !formData.get('email')) {
      return {
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      };
    }
    
    // ส่งข้อมูลไปยัง API โดยใช้ axiosUpload เนื่องจากอาจมีการส่งไฟล์ภาพด้วย
    const response = await axiosUpload(ADMIN.USER.CREATE, formData);
    
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
    
    const url = ADMIN.USER.UPDATE(userId);
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
    
    const url = ADMIN.USER.DELETE(userId);
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
 * ดึงสถิติผู้ใช้งาน
 * @returns {Promise<Object>} - ข้อมูลสถิติผู้ใช้งาน
 */
export const getUserStats = async () => {
  try {
    const response = await axiosGet(ADMIN.USER.STATS);
    
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
  getUserStats
};