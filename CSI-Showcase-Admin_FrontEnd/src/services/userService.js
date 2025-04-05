import { axiosGet, axiosPost, axiosPut, axiosDelete, axiosUpload } from '../lib/axios';

/**
 * ดึงรายการผู้ใช้งานทั้งหมด (เฉพาะ admin)
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลผู้ใช้งาน
 */
export const getAllUsers = async () => {
    try {
      const response = await axiosGet('/users/all');
      return response;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  };

/**
 * ดึงข้อมูลผู้ใช้งานตาม ID
 * @param {string} userId - รหัสผู้ใช้งาน
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลผู้ใช้งาน
 */
export const getUserById = async (userId) => {
  try {
    const response = await axiosGet(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

/**
 * ลงทะเบียนผู้ใช้งานใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้งานที่ต้องการลงทะเบียน
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การลงทะเบียน
 */
export const registerUser = async (userData) => {
  try {
    const response = await axiosPost('/users/register', userData);
    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลผู้ใช้งาน
 * @param {string} userId - รหัสผู้ใช้งาน
 * @param {Object} userData - ข้อมูลผู้ใช้งานที่ต้องการอัปเดต
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การอัปเดต
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosPut(`/users/update/${userId}`, userData);
    return response;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

/**
 * อัปโหลดรูปโปรไฟล์ของผู้ใช้งาน
 * @param {string} userId - รหัสผู้ใช้งาน
 * @param {FormData} formData - ข้อมูลไฟล์รูปภาพ
 * @param {Function} onProgress - ฟังก์ชันสำหรับติดตามความคืบหน้าการอัปโหลด
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การอัปโหลด
 */
export const uploadProfileImage = async (userId, formData, onProgress) => {
  try {
    const response = await axiosUpload(`/upload/profile-image/${userId}`, formData, onProgress);
    return response;
  } catch (error) {
    console.error(`Error uploading profile image for user ${userId}:`, error);
    throw error;
  }
};

/**
 * เปลี่ยนรหัสผ่านของผู้ใช้งาน
 * @param {string} userId - รหัสผู้ใช้งาน
 * @param {string} currentPassword - รหัสผ่านปัจจุบัน
 * @param {string} newPassword - รหัสผ่านใหม่
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การเปลี่ยนรหัสผ่าน
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await axiosPost(`/users/${userId}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response;
  } catch (error) {
    console.error(`Error changing password for user ${userId}:`, error);
    throw error;
  }
};

/**
 * เปลี่ยนบทบาทของผู้ใช้งาน (เฉพาะ admin)
 * @param {string} userId - รหัสผู้ใช้งาน
 * @param {string} role - บทบาทใหม่ (student, admin, visitor)
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การเปลี่ยนบทบาท
 */
export const changeUserRole = async (userId, role) => {
  try {
    const response = await axiosPut(`/users/${userId}/role`, { role });
    return response;
  } catch (error) {
    console.error(`Error changing role for user ${userId}:`, error);
    throw error;
  }
};

/**
 * ลบผู้ใช้งาน (เฉพาะ admin)
 * @param {string} userId - รหัสผู้ใช้งาน
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การลบ
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axiosDelete(`/users/delete/${userId}`);
    return response;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

/**
 * ดึงประวัติการเข้าสู่ระบบของผู้ใช้งาน
 * @param {string} userId - รหัสผู้ใช้งาน
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลประวัติการเข้าสู่ระบบ
 */
export const getUserLoginHistory = async (userId) => {
  try {
    const response = await axiosGet(`/users/${userId}/login-history`);
    return response;
  } catch (error) {
    console.error(`Error fetching login history for user ${userId}:`, error);
    throw error;
  }
};

/**
 * ดึงโปรเจคที่ผู้ใช้งานมีส่วนร่วม
 * @param {string} userId - รหัสผู้ใช้งาน
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลโปรเจค
 */
export const getUserProjects = async (userId) => {
  try {
    const response = await axiosGet(`/users/${userId}/projects`);
    return response;
  } catch (error) {
    console.error(`Error fetching projects for user ${userId}:`, error);
    throw error;
  }
};

/**
 * ค้นหาผู้ใช้งาน
 * @param {string} keyword - คำค้นหา
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การค้นหา
 */
export const searchUsers = async (keyword) => {
  try {
    const response = await axiosGet(`/search/users?keyword=${keyword}`);
    return response;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};