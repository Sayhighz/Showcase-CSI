// src/services/adminUserService.js
import { axiosGet, axiosPost, axiosPut, axiosDelete, axiosUpload } from '../lib/axios';
import { cachedGet } from '../lib/axiosCached';
import { ADMIN, AUTH } from '../constants/apiEndpoints';
import { getAuthToken } from '../lib/cookie-simple';

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
    
    const response = await cachedGet(url, { params: queryParams });

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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
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
    const response = await cachedGet(url);

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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้'
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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้'
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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบผู้ใช้'
    };
  }
};
/**
 * เปลี่ยนรหัสผ่านผู้ใช้ (สำหรับแอดมิน)
 * @param {string|number} userId - รหัสผู้ใช้
 * @param {string} newPassword - รหัสผ่านใหม่
 * @returns {Promise<Object>} - ผลลัพธ์การเปลี่ยนรหัสผ่าน
 */
export const changeUserPassword = async (userId, newPassword) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสผู้ใช้'
      };
    }
    if (!newPassword) {
      return {
        success: false,
        message: 'กรุณาระบุรหัสผ่านใหม่'
      };
    }
    if (newPassword.length < 8) {
      return {
        success: false,
        message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
      };
    }

    const url = ADMIN.USER.CHANGE_PASSWORD(userId);
    const response = await axiosPost(url, { new_password: newPassword });

    return {
      success: true,
      data: response.data || response,
      message: response.message || 'เปลี่ยนรหัสผ่านสำเร็จ'
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
    };
  }
};

/**
 * ดึงสถิติผู้ใช้งาน
 * @returns {Promise<Object>} - ข้อมูลสถิติผู้ใช้งาน
 */
export const getUserStats = async () => {
  try {
    const response = await cachedGet(ADMIN.USER.STATS);
    
    let statsData = null;

    if (response) {
      statsData = response;
    }
    
    return {
      success: true,
      data: statsData || {}
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติผู้ใช้งาน',
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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการนำเข้าผู้ใช้'
    };
  }
};

/**
 * ดาวน์โหลดเทมเพลต CSV สำหรับการนำเข้าผู้ใช้
 * @returns {Promise<Object>} - URL สำหรับดาวน์โหลดไฟล์
 */
export const downloadCSVTemplate = async () => {
  try {
    const token = getAuthToken();
    const resp = await fetch(ADMIN.USER.CSV_TEMPLATE, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true, message: 'เริ่มดาวน์โหลดเทมเพลต CSV แล้ว' };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต CSV'
    };
  }
};

/**
* อัปโหลดรูปโปรไฟล์ผู้ใช้ (สำหรับผู้ใช้อัปเดตโปรไฟล์ตัวเอง)
* @param {number|string} userId
* @param {File|Blob} file
* @returns {Promise<{success:boolean, data:any, message?:string}>}
*/
export const uploadUserProfileImage = async (userId, file) => {
  try {
    if (!userId || !file) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วนสำหรับการอัปโหลดรูปโปรไฟล์' };
    }

    const form = new FormData();
    form.append('profileImage', file);

    // ใช้ endpoint ผู้ใช้สำหรับอัปเดตโปรไฟล์ตัวเอง
    const url = AUTH.UPLOAD_PROFILE_IMAGE;
    const resp = await axiosUpload(url, form);

    // ปรับรูปแบบข้อมูลผลลัพธ์ให้แน่นอน และพยายามดึง path ของรูปใหม่ให้ได้เสมอ
    const raw = resp?.data || resp;

    let updatedUser =
      raw?.data?.user ||
      raw?.user ||
      raw?.data?.data?.user ||
      null;

    let imagePath =
      updatedUser?.image ||
      raw?.data?.image ||
      raw?.image ||
      null;

    // Fallback: ถ้า response ไม่ได้ส่ง path ของรูปมา ให้เรียก /auth/me เพื่อดึงข้อมูลล่าสุด
    if (!imagePath) {
      try {
        const me = await axiosGet(AUTH.ME);
        const meData = me?.data?.data || me?.data || me;
        if (meData?.image) {
          imagePath = meData.image;
        }
        if (!updatedUser && meData) {
          updatedUser = meData.user || meData;
        }
      } catch {
        // ignore fallback fetch errors
      }
    }

    return {
      success: true,
      data: { user: updatedUser, image: imagePath },
      message: raw?.message || 'อัปโหลดรูปโปรไฟล์สำเร็จ'
    };
  } catch (err) {
    return {
      success: false,
      message: err?.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์'
    };
  }
};

/**
* อัปเดตข้อมูลโปรไฟล์ผู้ใช้ตัวเอง
* @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการอัปเดต
* @returns {Promise<Object>} - ผลลัพธ์การอัปเดต
*/
export const updateMyProfile = async (userData) => {
  try {
    const response = await axiosPut(AUTH.UPDATE_ME, userData);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'อัปเดตข้อมูลโปรไฟล์สำเร็จ'
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลโปรไฟล์'
    };
  }
};

/**
* เปลี่ยนรหัสผ่านผู้ใช้ตัวเอง
* @param {string} newPassword - รหัสผ่านใหม่
* @returns {Promise<Object>} - ผลลัพธ์การเปลี่ยนรหัสผ่าน
*/
export const changeMyPassword = async (newPassword) => {
  try {
    const response = await axiosPost(AUTH.CHANGE_PASSWORD, { new_password: newPassword });
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'เปลี่ยนรหัสผ่านสำเร็จ'
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
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
 downloadCSVTemplate,
 uploadUserProfileImage,
 updateMyProfile,
 changeMyPassword
};