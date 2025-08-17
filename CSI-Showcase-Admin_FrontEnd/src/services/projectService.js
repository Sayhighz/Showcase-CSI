// src/services/projectService.js
import { axiosGet, axiosPost, axiosPut, axiosDelete, axiosUpload } from '../lib/axios';
import API_ROUTES, { BASE_URL } from '../constants/apiEndpoints';

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
    
    if (filters.level) {
      queryParams.append('level', filters.level);
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
    const url = API_ROUTES.PROJECT.GET_ALL + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      pagination: response.pagination || {
        page: response.page || 1,
        limit: response.limit || 10,
        totalItems: response.totalItems || response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.totalItems || response.total || 0) / (response.limit || 10))
      }
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
    
    if (filters.level) {
      queryParams.append('level', filters.level);
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
    const url = API_ROUTES.PROJECT.PENDING + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      pagination: response.pagination || {
        page: response.page || 1,
        limit: response.limit || 10,
        totalItems: response.totalItems || response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.totalItems || response.total || 0) / (response.limit || 10))
      }
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
export const getProjectDetails = async (projectId) => {
  try {
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }
    
    const url = API_ROUTES.PROJECT.GET_BY_ID(projectId);
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
    
    const url = API_ROUTES.PROJECT.REVIEW(projectId);
    const response = await axiosPost(url, { status, comment });
    
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
    
    const url = API_ROUTES.PROJECT.UPDATE(projectId);
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
    
    const url = API_ROUTES.PROJECT.DELETE(projectId);
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
 * สร้างโปรเจคใหม่
 * @param {number} userId - รหัสผู้ใช้
 * @param {FormData} projectData - ข้อมูลโปรเจคในรูปแบบ FormData
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างโปรเจค
 */
export const createProject = async (userId, projectData) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสผู้ใช้'
      };
    }

    if (!projectData) {
      return {
        success: false,
        message: 'ไม่ระบุข้อมูลโปรเจค'
      };
    }

    const url = `${BASE_URL}/projects/user/${userId}`;
    const response = await axiosUpload(url, projectData);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'สร้างโปรเจคสำเร็จ'
    };
  } catch (error) {
    console.error('Create project error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างโปรเจค'
    };
  }
};

/**
 * ดึงโปรเจคของผู้ใช้ที่ระบุ
 * @param {number} userId - รหัสผู้ใช้
 * @param {Object} filters - ตัวกรองข้อมูลโปรเจค
 * @returns {Promise<Object>} - ข้อมูลโปรเจคของผู้ใช้
 */
export const getMyProjects = async (userId, filters = {}) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสผู้ใช้'
      };
    }

    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.category) {
      queryParams.append('category', filters.category);
    }
    
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    
    if (filters.level) {
      queryParams.append('level', filters.level);
    }
    
    if (filters.keyword) {
      queryParams.append('keyword', filters.keyword);
    }

    const url = `${BASE_URL}/projects/myprojects/${userId}` +
                (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      pagination: response.pagination || {
        page: response.page || 1,
        limit: response.limit || 10,
        totalItems: response.totalItems || response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.totalItems || response.total || 0) / (response.limit || 10))
      }
    };
  } catch (error) {
    console.error('Get my projects error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ',
      data: []
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
    
    const url = API_ROUTES.PROJECT.REVIEWS(projectId);
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
export const getAdminReviewStats = async () => {
  try {
    const response = await axiosGet(API_ROUTES.PROJECT.REVIEW_STATS);
    
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
    const response = await axiosGet(API_ROUTES.PROJECT.STATS);
    // console.log("dddd",response)
    
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
export const getAllProjectReviews = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.admin_id) {
      queryParams.append('adminId', filters.admin_id);
    }
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = API_ROUTES.PROJECT.ALL_REVIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      pagination: response.pagination || {
        page: response.page || 1,
        limit: response.limit || 10,
        totalItems: response.totalItems || response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.totalItems || response.total || 0) / (response.limit || 10))
      }
    };
  } catch (error) {
    console.error('Get all project reviews error:', error);
    
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
  getProjectDetails,
  reviewProject,
  updateProject,
  deleteProject,
  getProjectReviews,
  getAdminReviewStats,
  getProjectStats,
  getAllProjectReviews,
  createProject,
  getMyProjects
};