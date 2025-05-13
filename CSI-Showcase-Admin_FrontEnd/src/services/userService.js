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
    
    // รับข้อมูลตามโครงสร้างที่ server ส่งกลับมาจริง
    let users = [];
    let pagination = {
      current: parseInt(filters.page) || 1,
      pageSize: parseInt(filters.limit) || 10,
      total: 0
    };
    
    // จากข้อมูล response ที่แสดง ข้อมูลอยู่ใน response.data โดยตรง
    // และมี properties คือ users และ pagination
    if (response) {
      // ดึงข้อมูล users
      if (Array.isArray(response.users)) {
        users = response.users;
      }
      
      // ดึงข้อมูล pagination และแปลงให้ตรงกับรูปแบบที่ต้องการใช้
      if (response.pagination) {
        pagination = {
          current: response.pagination.currentPage || 1,
          pageSize: response.pagination.limit || 10,
          total: response.pagination.totalItems || 0,
          totalPages: response.pagination.totalPages || 1
        };
      }
    }
    
    return {
      success: true,
      data: users,
      pagination: pagination
    };
  } catch (error) {
    console.error('Get all users error:', error);
    
    return {
      success: false,
      message: error.response?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      data: [],
      pagination: {
        current: parseInt(filters.page) || 1,
        pageSize: parseInt(filters.limit) || 10,
        total: 0
      }
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
    // console.log(response)
    
    let userData = null;
    
    if (response) {
      if (response) {
        userData = response;
      } else {
        userData = response.data;
      }
    }
    
    return {
      success: true,
      data: userData
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
    
    let userData = null;
    
    if (response.data) {
      if (response.data.data && response.data.data.user) {
        userData = response.data.data.user;
      } else if (response.data.user) {
        userData = response.data.user;
      } else {
        userData = response.data;
      }
    }
    
    return {
      success: true,
      data: userData,
      message: response.message || response.data?.message || 'สร้างผู้ใช้สำเร็จ'
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
    
    let updatedUserData = null;
    
    if (response.data) {
      if (response.data.data && response.data.data.user) {
        updatedUserData = response.data.data.user;
      } else if (response.data.user) {
        updatedUserData = response.data.user;
      } else {
        updatedUserData = response.data;
      }
    }
    
    return {
      success: true,
      data: updatedUserData,
      message: response.message || response.data?.message || 'อัปเดตข้อมูลผู้ใช้สำเร็จ'
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
      message: response.message || response.data?.message || 'ลบผู้ใช้สำเร็จ'
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
    
    let statsData = null;
    // console.log(response)
    
    if (response) {
      statsData = response;
    }
    
    return {
      success: true,
      data: statsData || {}
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



// src/services/adminUserService.js

/**
 * นำเข้าผู้ใช้จำนวนมากจากไฟล์ CSV
 * @param {FormData} formData - FormData ที่มีไฟล์ CSV
 * @returns {Promise<Object>} - ผลลัพธ์การนำเข้าผู้ใช้
 */
export const importUsersFromCSV = async (formData) => {
  try {
    // ตรวจสอบว่าเป็น FormData
    if (!(formData instanceof FormData)) {
      return {
        success: false,
        message: 'ต้องใช้ FormData ในการส่งไฟล์'
      };
    }
    
    // ตรวจสอบว่ามีไฟล์หรือไม่
    if (!formData.get('file')) {
      return {
        success: false,
        message: 'กรุณาเลือกไฟล์ CSV'
      };
    }
    
    // ส่งข้อมูลไปยัง API
    const response = await axiosUpload(ADMIN.USER.BATCH_IMPORT, formData);
    
    return {
      success: true,
      data: response.data,
      message: response.message || response.data?.message || 'นำเข้าผู้ใช้สำเร็จ'
    };
  } catch (error) {
    console.error('Import users error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าผู้ใช้'
    };
  }
};

/**
 * ดาวน์โหลดเทมเพลต CSV สำหรับการนำเข้าผู้ใช้
 * @returns {Promise<Object>} - URL สำหรับดาวน์โหลดไฟล์
 */
export const downloadCSVTemplate = async () => {
  try {
    // ใช้ axios แบบปกติสำหรับการดาวน์โหลดไฟล์
    const response = await axios.get(ADMIN.USER.CSV_TEMPLATE, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    
    // สร้าง URL object สำหรับการดาวน์โหลด
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // สร้าง element a เพื่อเริ่มการดาวน์โหลด
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_import_template.csv');
    document.body.appendChild(link);
    link.click();
    
    // ทำความสะอาด
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'เริ่มดาวน์โหลดเทมเพลต CSV แล้ว'
    };
  } catch (error) {
    console.error('Download CSV template error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต CSV'
    };
  }
};

// Don't forget to add these to the default export
export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  importUsersFromCSV,
  downloadCSVTemplate
};