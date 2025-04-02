// services/projectService.js
import { axiosGet, axiosPut, axiosPost, axiosDelete } from '../lib/axios';

/**
 * ดึงรายการโปรเจคทั้งหมด
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลโปรเจค
 */
export const getAllProjects = async (filters = {}) => {
  try {
    let endpoint = '/projects/all';
    
    // Build query parameters
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
    
    if (filters.keyword) {
      queryParams.append('keyword', filters.keyword);
    }
    
    // Add query params to endpoint if there are any
    const queryString = queryParams.toString();
    if (queryString) {
      endpoint = `${endpoint}?${queryString}`;
    }
    
    const response = await axiosGet(endpoint);
    
    // ตรวจสอบรูปแบบของข้อมูลที่ได้รับกลับมา
    if (response && response.data) {
      return response.data; // ถ้าข้อมูลอยู่ใน response.data
    } else if (Array.isArray(response)) {
      return response; // ถ้า response เป็น array
    }
    
    // ถ้าไม่ใช่ทั้งสองกรณี ให้ส่งคืน array ว่าง
    return [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    // ในกรณีที่เกิด error ให้ส่งคืน array ว่าง แทนที่จะโยน error
    return [];
  }
};

/**
 * ดึงรายการโปรเจคที่รอการอนุมัติ
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลโปรเจคที่รอการอนุมัติ
 */
export const getPendingProjects = async () => {
  try {
    const response = await axiosGet('/projects/pending');
    
    // ตรวจสอบรูปแบบของข้อมูลที่ได้รับกลับมา
    if (response && response.data) {
      return response.data; // ถ้าข้อมูลอยู่ใน response.data
    } else if (Array.isArray(response)) {
      return response; // ถ้า response เป็น array
    }
    
    // ถ้าไม่ใช่ทั้งสองกรณี ให้ส่งคืน array ว่าง
    return [];
  } catch (error) {
    console.error('Error fetching pending projects:', error);
    // ในกรณีที่เกิด error ให้ส่งคืน array ว่าง
    return [];
  }
};

// ส่วนอื่น ๆ ของ projectService ยังคงเหมือนเดิม...
/**
 * ดึงรายละเอียดโปรเจค
 * @param {string} projectId - รหัสโปรเจค
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลรายละเอียดโปรเจค
 */
export const getProjectDetail = async (projectId) => {
  try {
    const response = await axiosGet(`/projects/project/${projectId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    throw error;
  }
};

/**
 * อนุมัติหรือปฏิเสธโปรเจค
 * @param {string} projectId - รหัสโปรเจค
 * @param {string} status - สถานะใหม่ (approved หรือ rejected)
 * @param {string} comment - ความคิดเห็นสำหรับการอนุมัติหรือปฏิเสธ
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การดำเนินการ
 */
export const reviewProject = async (projectId, status, comment = '') => {
  try {
    const data = {
      status,
      review_comment: comment
    };
    
    const response = await axiosPost(`/projects/review/${projectId}`, data);
    return response;
  } catch (error) {
    console.error(`Error reviewing project ${projectId}:`, error);
    throw error;
  }
};

/**
 * ลบโปรเจค
 * @param {string} projectId - รหัสโปรเจคที่ต้องการลบ
 * @returns {Promise} - Promise ที่ส่งคืนผลลัพธ์การดำเนินการ
 */
export const deleteProject = async (projectId) => {
  try {
    const response = await axiosDelete(`/projects/delete/${projectId}`);
    return response;
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    throw error;
  }
};

/**
 * ดึงข้อมูลสถิติของโปรเจค
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลสถิติ
 */
export const getProjectStats = async () => {
  try {
    const response = await axiosGet('/projects/stats');
    return response;
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลประเภทโปรเจค
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลประเภทโปรเจค
 */
export const getProjectTypes = async () => {
  try {
    const response = await axiosGet('/projects/types');
    return response;
  } catch (error) {
    console.error('Error fetching project types:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลปีการศึกษา
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลปีการศึกษา
 */
export const getProjectYears = async () => {
  try {
    const response = await axiosGet('/projects/years');
    return response;
  } catch (error) {
    console.error('Error fetching project years:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลชั้นปีของนักศึกษา
 * @returns {Promise} - Promise ที่ส่งคืนข้อมูลชั้นปีของนักศึกษา
 */
export const getStudyYears = async () => {
  try {
    const response = await axiosGet('/projects/study-years');
    return response;
  } catch (error) {
    console.error('Error fetching study years:', error);
    throw error;
  }
};