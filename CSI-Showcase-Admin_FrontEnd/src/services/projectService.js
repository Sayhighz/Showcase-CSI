// src/services/projectService.js
import { axiosGet, axiosPost, axiosPut, axiosDelete, axiosUpload } from '../lib/axios';
import { PROJECT, UPLOAD } from '../constants/apiEndpoints';

/**
 * ดึงรายการโปรเจคทั้งหมด
 * @param {Object} filters - ตัวกรองข้อมูลโปรเจค
 * @returns {Promise<Object>} - ข้อมูลโปรเจค
 */
export const getAllProjects = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.type) {
      queryParams.append('type', filters.type);
    }
    
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    
    if (filters.study_year) {
      queryParams.append('study_year', filters.study_year);
    }
    
    if (filters.semester) {
      queryParams.append('semester', filters.semester);
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
    const url = PROJECT.GET_ALL + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Get all projects error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค',
      data: []
    };
  }
};

/**
 * ดึงรายการโปรเจคที่รอการอนุมัติ
 * @param {Object} filters - ตัวกรองข้อมูลโปรเจค
 * @returns {Promise<Object>} - ข้อมูลโปรเจคที่รอการอนุมัติ
 */
export const getPendingProjects = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.type) {
      queryParams.append('type', filters.type);
    }
    
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    
    if (filters.study_year) {
      queryParams.append('study_year', filters.study_year);
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
    const url = PROJECT.PENDING + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Get pending projects error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคที่รอการอนุมัติ',
      data: []
    };
  }
};

/**
 * ดึงข้อมูลโปรเจคตาม ID
 * @param {string|number} projectId - รหัสโปรเจค
 * @returns {Promise<Object>} - ข้อมูลโปรเจค
 */
export const getProjectById = async (projectId) => {
  try {
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }
    
    const url = PROJECT.GET_BY_ID(projectId);
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error(`Get project ${projectId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค'
    };
  }
};

/**
 * ตรวจสอบและอนุมัติหรือปฏิเสธโปรเจค
 * @param {string|number} projectId - รหัสโปรเจค
 * @param {string} status - สถานะใหม่ ('approved' หรือ 'rejected')
 * @param {string} comment - ความคิดเห็น
 * @returns {Promise<Object>} - ผลลัพธ์การตรวจสอบ
 */
export const reviewProject = async (projectId, status, comment = '') => {
  try {
    console.log("asd",comment);
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }
    
    if (status !== 'approved' && status !== 'rejected') {
      return {
        success: false,
        message: 'สถานะไม่ถูกต้อง'
      };
    }
    
    // ถ้าสถานะเป็น 'rejected' ต้องมีความคิดเห็น
    if (status === 'rejected' && !comment) {
      return {
        success: false,
        message: 'กรุณาระบุเหตุผลที่ปฏิเสธ'
      };
    }
    
    const url = PROJECT.REVIEW(projectId);
    const response = await axiosPost(url, { status, comment: comment });
    console.log(response);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || (status === 'approved' ? 'อนุมัติโปรเจคสำเร็จ' : 'ปฏิเสธโปรเจคสำเร็จ')
    };
  } catch (error) {
    console.error(`Review project ${projectId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการตรวจสอบโปรเจค'
    };
  }
};

/**
 * อัปเดตข้อมูลโปรเจค
 * @param {string|number} projectId - รหัสโปรเจค
 * @param {Object} projectData - ข้อมูลโปรเจคที่ต้องการอัปเดต
 * @returns {Promise<Object>} - ผลลัพธ์การอัปเดตโปรเจค
 */
export const updateProject = async (projectId, projectData) => {
  try {
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }
    
    const url = PROJECT.UPDATE(projectId);
    const response = await axiosPut(url, projectData);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'อัปเดตโปรเจคสำเร็จ'
    };
  } catch (error) {
    console.error(`Update project ${projectId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรเจค'
    };
  }
};

/**
 * ลบโปรเจค
 * @param {string|number} projectId - รหัสโปรเจค
 * @returns {Promise<Object>} - ผลลัพธ์การลบโปรเจค
 */
export const deleteProject = async (projectId) => {
  try {
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }
    
    const url = PROJECT.DELETE(projectId);
    const response = await axiosDelete(url);
    
    return {
      success: true,
      message: response.message || 'ลบโปรเจคสำเร็จ'
    };
  } catch (error) {
    console.error(`Delete project ${projectId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบโปรเจค'
    };
  }
};

/**
 * อัปโหลดไฟล์โปรเจค
 * @param {string|number} projectId - รหัสโปรเจค
 * @param {FormData} formData - ข้อมูลไฟล์
 * @param {Function} onProgress - ฟังก์ชันติดตามความคืบหน้า
 * @returns {Promise<Object>} - ผลลัพธ์การอัปโหลดไฟล์
 */
export const uploadProjectFile = async (projectId, formData, onProgress) => {
  try {
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }
    
    if (!formData || !(formData instanceof FormData)) {
      return {
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง'
      };
    }
    
    const url = UPLOAD.PROJECT_FILE(projectId);
    const response = await axiosUpload(url, formData, onProgress);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'อัปโหลดไฟล์สำเร็จ'
    };
  } catch (error) {
    console.error(`Upload file for project ${projectId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์'
    };
  }
};

/**
 * อัปโหลดรูปภาพโปรเจค
 * @param {string|number} projectId - รหัสโปรเจค
 * @param {FormData} formData - ข้อมูลรูปภาพ
 * @param {Function} onProgress - ฟังก์ชันติดตามความคืบหน้า
 * @returns {Promise<Object>} - ผลลัพธ์การอัปโหลดรูปภาพ
 */
export const uploadProjectImage = async (projectId, formData, onProgress) => {
  try {
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }
    
    if (!formData || !(formData instanceof FormData)) {
      return {
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง'
      };
    }
    
    const url = UPLOAD.PROJECT_IMAGE(projectId);
    const response = await axiosUpload(url, formData, onProgress);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'อัปโหลดรูปภาพสำเร็จ'
    };
  } catch (error) {
    console.error(`Upload image for project ${projectId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ'
    };
  }
};

/**
 * ลบไฟล์โปรเจค
 * @param {string|number} fileId - รหัสไฟล์
 * @returns {Promise<Object>} - ผลลัพธ์การลบไฟล์
 */
export const deleteFile = async (fileId) => {
  try {
    if (!fileId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสไฟล์'
      };
    }
    
    const url = UPLOAD.DELETE_FILE(fileId);
    const response = await axiosDelete(url);
    
    return {
      success: true,
      message: response.message || 'ลบไฟล์สำเร็จ'
    };
  } catch (error) {
    console.error(`Delete file ${fileId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบไฟล์'
    };
  }
};

/**
 * ดึงประวัติการตรวจสอบโปรเจค
 * @param {string|number} projectId - รหัสโปรเจค
 * @returns {Promise<Object>} - ข้อมูลประวัติการตรวจสอบ
 */
export const getProjectReviews = async (projectId) => {
  try {
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }
    
    const url = PROJECT.REVIEWS(projectId);
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error(`Get reviews for project ${projectId} error:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการตรวจสอบ',
      data: []
    };
  }
};

/**
 * ดึงสถิติการตรวจสอบโปรเจค
 * @returns {Promise<Object>} - ข้อมูลสถิติการตรวจสอบ
 */
export const getReviewStats = async () => {
  try {
    const response = await axiosGet(PROJECT.REVIEW_STATS);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get review stats error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติการตรวจสอบ',
      data: {}
    };
  }
};

/**
 * ดึงสถิติโปรเจค
 * @returns {Promise<Object>} - ข้อมูลสถิติโปรเจค
 */
export const getProjectStats = async () => {
  try {
    const response = await axiosGet(PROJECT.STATS);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get project stats error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติโปรเจค',
      data: {}
    };
  }
};

/**
 * ดึงรายการตรวจสอบทั้งหมด
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลรายการตรวจสอบ
 */
export const getAllReviews = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.admin_id) {
      queryParams.append('admin_id', filters.admin_id);
    }
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = PROJECT.ALL_REVIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Get all reviews error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการตรวจสอบ',
      data: []
    };
  }
};

export default {
  getAllProjects,
  getPendingProjects,
  getProjectById,
  reviewProject,
  updateProject,
  deleteProject,
  uploadProjectFile,
  uploadProjectImage,
  deleteFile,
  getProjectReviews,
  getReviewStats,
  getProjectStats,
  getAllReviews
};