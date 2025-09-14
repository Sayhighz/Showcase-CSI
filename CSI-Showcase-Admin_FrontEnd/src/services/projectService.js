// src/services/projectService.js
import { axiosPost, axiosPut, axiosDelete, axiosUpload } from '../lib/axios';
import { cachedGet } from '../lib/axiosCached';
import API_ROUTES, { BASE_URL, ADMIN, PROJECT } from '../constants/apiEndpoints';
import { getAuthToken } from '../lib/cookie-simple';
import { jwtDecode } from 'jwt-decode';

/**
 * อ่านบทบาทจากโทเค็นปัจจุบัน
 */
const getCurrentRole = () => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded?.role || null;
  } catch {
    return null;
  }
};

/**
 * ดึงรายการโปรเจคทั้งหมด
 * @param {Object} filters - ตัวกรองข้อมูลโปรเจค
 * @returns {Promise<Object>} - ข้อมูลโปรเจค
 */
export const getAllProjects = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters - แก้ไขการ mapping ให้ตรงกับ backend
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
    
    if (filters.level || filters.studyYear) {
      queryParams.append('level', filters.level || filters.studyYear);
    }
    
    if (filters.semester) {
      queryParams.append('semester', filters.semester);
    }
    
    if (filters.search || filters.keyword) {
      queryParams.append('search', filters.search || filters.keyword);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = ADMIN.PROJECT.ALL + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await cachedGet(url, { params: queryParams });

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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค',
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
    // สร้าง query string จาก filters - แก้ไขการ mapping ให้ตรงกับ backend
    const queryParams = new URLSearchParams();
    
    if (filters.type) {
      queryParams.append('type', filters.type);
    }
    
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    
    if (filters.level || filters.studyYear) {
      queryParams.append('level', filters.level || filters.studyYear);
    }
    
    if (filters.search || filters.keyword) {
      queryParams.append('search', filters.search || filters.keyword);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = ADMIN.PROJECT.PENDING + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await cachedGet(url, { params: queryParams });

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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคที่รอการอนุมัติ',
      data: []
    };
  }
};

/**
 * ดึงข้อมูลโปรเจคตาม ID
 * @param {string|number} projectId - รหัสโปรเจค
 * @returns {Promise<Object>} - ข้อมูลโปรเจค
 */
export const getProjectDetails = async (projectId, options = {}) => {
  try {
    if (!projectId) {
      return {
        success: false,
        message: 'ไม่ระบุรหัสโปรเจค'
      };
    }

    // อนุญาตให้บังคับไม่ใช้ cache กรณี refresh หลังอัปเดต/ลบสื่อ
    const useCache = options.useCache !== false;

    const role = getCurrentRole();

    if (role === 'admin') {
      // ผู้ดูแลระบบใช้ endpoint ฝั่งแอดมิน (ไม่เพิ่มวิว)
      const adminUrl = ADMIN.PROJECT.GET_BY_ID(projectId);
      const adminResp = await cachedGet(adminUrl, {}, { useCache });
      return {
        success: true,
        data: adminResp.data || adminResp
      };
    }

    // นักศึกษา/ผู้ใช้ทั่วไปบน Admin FE: ใช้ endpoint ฝั่งผู้ใช้ (Backend จะไม่เพิ่มวิวเพราะส่ง header x-admin-client)
    const userUrl = PROJECT.GET_BY_ID(projectId);
    const userResp = await cachedGet(userUrl, {}, { useCache });
    const d = userResp.data || userResp;

    // ปรับรูปแบบข้อมูลให้สอดคล้องกับหน้ารายละเอียดที่มีอยู่
    const normalized = {
      // คีย์แบบ snake_case ที่หน้าเดิมใช้งาน
      project_id: d.projectId,
      title: d.title,
      description: d.description,
      type: d.type,
      study_year: d.studyYear,
      year: d.year,
      semester: d.semester,
      visibility: d.visibility,
      status: d.status,
      created_at: d.createdAt,
      updated_at: d.updatedAt,
      views_count: d.viewsCount,

      // ภาพหลัก: ใช้จาก coursework/competition poster ถ้ามี
      image: (d.coursework?.poster) || (d.competition?.poster) || d.image || null,

      // ผู้สร้างเดิม (เพื่อรองรับคอมโพเนนต์เก่า)
      user_id: d.author?.id,
      username: d.author?.username,
      full_name: d.author?.fullName,
      email: d.author?.email,
      user_image: d.author?.image,

      // ฟิลด์ใหม่ที่คอมโพเนนต์ CreatorInfo ใช้งานแล้ว
      uploader: d.uploader || null,

      // ผู้ร่วมงานและไฟล์
      contributors: d.contributors || [],
      files: d.files || [],

      // เก็บข้อมูลเฉพาะประเภทด้วย
      academic: d.academic || null,
      competition: d.competition || null,
      coursework: d.coursework || null
    };

    return {
      success: true,
      data: normalized
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค'
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
    
    const url = ADMIN.PROJECT.REVIEW(projectId);
    const response = await axiosPost(url, { status, comment });
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || (status === 'approved' ? 'อนุมัติโปรเจคสำเร็จ' : 'ปฏิเสธโปรเจคสำเร็จ')
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบโปรเจค'
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

    const role = getCurrentRole();
    const url = role === 'admin' ? ADMIN.PROJECT.UPDATE(projectId) : PROJECT.UPDATE(projectId);

    const response = await axiosPut(url, projectData);
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'อัปเดตโปรเจคสำเร็จ'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรเจค'
    };
  }
};

/**
 * อัปเดตข้อมูลโปรเจค (รองรับไฟล์โปสเตอร์และลิงก์วิดีโอ)
 * บังคับใช้ endpoint ฝั่งผู้ใช้ซึ่งรองรับ multipart/form-data และจัดการแทนที่ไฟล์เก่า
 * - courseworkPoster | competitionPoster: รูปโปสเตอร์ตามประเภท
 * - courseworkVideo: ไฟล์วิดีโอ หรือใช้ clip_video (URL) แทน
 * - clip_video: URL วิดีโอ (YouTube/TikTok/Facebook) จะไปแทนที่ค่าก่อนหน้า
 * หมายเหตุ: ควรส่งเป็น FormData เสมอ แม้จะแก้เฉพาะ URL เพื่อให้ middleware ประมวลผลถูกต้อง
 */
export const updateProjectWithFiles = async (projectId, formData) => {
  try {
    if (!projectId || !formData) {
      return {
        success: false,
        message: 'ข้อมูลไม่ครบถ้วนสำหรับการอัปเดตโปรเจค'
      };
    }

    // กำหนด timeout เพิ่มเติมสำหรับคำขอที่เป็น FormData (เช่น อัปโหลดรูป/วิดีโอ)
    const extendedTimeout = parseInt(import.meta.env?.VITE_AXIOS_FORMDATA_TIMEOUT || '120000', 10);
    const putConfig = (typeof FormData !== 'undefined' && formData instanceof FormData)
      ? { timeout: Number.isNaN(extendedTimeout) ? 120000 : extendedTimeout }
      : {};

    // ถ้าเป็น FormData ให้เรียก endpoint ฝั่งผู้ใช้เสมอ (admin ผ่าน isResourceOwner ได้)
    if (typeof FormData !== 'undefined' && formData instanceof FormData) {
      const url = PROJECT.UPDATE(projectId);
      const response = await axiosPut(url, formData, putConfig);
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'อัปเดตโปรเจคสำเร็จ'
      };
    }

    // กรณีไม่ใช่ FormData: admin -> admin route, อื่นๆ -> user route
    const role = getCurrentRole();
    const url = role === 'admin' ? ADMIN.PROJECT.UPDATE(projectId) : PROJECT.UPDATE(projectId);
    const response = await axiosPut(url, formData, putConfig);
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'อัปเดตโปรเจคสำเร็จ'
    };
  } catch (e) {
    return {
      success: false,
      message: e?.response?.data?.message || e?.response?.data?.error || (e?.message?.includes('timeout') ? 'การอัปเดตใช้เวลานานเกินไป โปรดลองอีกครั้ง' : 'เกิดข้อผิดพลาดในการอัปเดตโปรเจค')
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

    const role = getCurrentRole();
    const url = role === 'admin' ? ADMIN.PROJECT.DELETE(projectId) : PROJECT.DELETE(projectId);

    const response = await axiosDelete(url);
    return {
      success: true,
      message: response.message || 'ลบโปรเจคสำเร็จ'
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบโปรเจค'
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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างโปรเจค'
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

    // สร้าง query string จาก filters - แก้ไขการ mapping ให้ตรงกับ backend
    const queryParams = new URLSearchParams();
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.category || filters.type) {
      queryParams.append('category', filters.category || filters.type);
    }
    
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    
    if (filters.level || filters.studyYear) {
      queryParams.append('level', filters.level || filters.studyYear);
    }
    
    if (filters.keyword || filters.search) {
      queryParams.append('keyword', filters.keyword || filters.search);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }

    const url = `${BASE_URL}/projects/user/${userId}/my-projects` +
                (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await cachedGet(url, { params: queryParams });
    
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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ',
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
    
    const url = ADMIN.PROJECT.REVIEWS(projectId);
    const response = await cachedGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงประวัติการตรวจสอบ',
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
    const response = await cachedGet(ADMIN.PROJECT.REVIEW_STATS);

    return {
      success: true,
      data: response.data || response
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติการตรวจสอบ',
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
    const response = await cachedGet(ADMIN.PROJECT.STATS);

    return {
      success: true,
      data: response.data || response
    };
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติโปรเจค',
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
    const url = ADMIN.PROJECT.ALL_REVIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');

    const response = await cachedGet(url, { params: queryParams });
    
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
  } catch {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการตรวจสอบ',
      data: []
    };
  }
};


/**
 * ลบรูปภาพ/สื่อของโปรเจคแบบเฉพาะรายการ
 * payload:
 *  - file_ids?: number[]
 *  - file_paths?: string[]
 *  - remove_primary_image?: boolean
 *  - remove_poster?: boolean
 */
export const deleteProjectImages = async (projectId, payload = {}) => {
  try {
    if (!projectId) {
      return { success: false, message: 'ไม่ระบุรหัสโปรเจค' };
    }
    const url = `${BASE_URL}/projects/update/${projectId}/images/delete`;
    const response = await axiosPost(url, payload);
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'ลบรูปภาพสำเร็จ'
    };
  } catch (err) {
    return {
      success: false,
      message: err?.response?.data?.message || 'เกิดข้อผิดพลาดในการลบรูปภาพ'
    };
  }
};

export default {
  getAllProjects,
  getPendingProjects,
  getProjectDetails,
  reviewProject,
  updateProject,
  updateProjectWithFiles,
  deleteProject,
  getProjectReviews,
  getAdminReviewStats,
  getProjectStats,
  getAllProjectReviews,
  createProject,
  getMyProjects,
  deleteProjectImages
};