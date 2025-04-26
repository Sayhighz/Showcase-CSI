/**
 * Service สำหรับการจัดการข้อมูลโปรเจค
 * ให้บริการฟังก์ชันเกี่ยวกับการดึงข้อมูล, สร้าง, แก้ไข, ลบโปรเจค เป็นต้น
 */
import { get, post, put, del, uploadFile, updateFile } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { message } from 'antd';

/**
 * ดึงข้อมูลโปรเจคทั้งหมด
 * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
 * @param {number} params.page - หน้าที่ต้องการ
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า
 * @param {string} params.category - ประเภทของโปรเจค (coursework, academic, competition)
 * @param {number} params.year - ปีของโปรเจค
 * @param {number} params.level - ชั้นปีของผู้สร้างโปรเจค (ปี 1, ปี 2, ปี 3, ปี 4)
 * @returns {Promise} - รายการโปรเจค
 */
export const getAllProjects = async (params = {}) => {
  try {
    // ตรวจสอบและแปลงค่าตัวเลขให้เป็น number
    if (params.page) params.page = Number(params.page);
    if (params.limit) params.limit = Number(params.limit);
    if (params.year) params.year = Number(params.year);
    if (params.level) params.level = Number(params.level);
    
    // แปลง type เป็น category (เนื่องจาก API ใช้ชื่อพารามิเตอร์ category)
    if (params.type !== undefined && params.category === undefined) {
      params.category = params.type;
      delete params.type;
    }
    
    // แปลง studyYear เป็น level (เนื่องจาก API ใช้ชื่อพารามิเตอร์ level)
    if (params.studyYear !== undefined && params.level === undefined) {
      params.level = params.studyYear;
      delete params.studyYear;
    }
    
    // แปลง search เป็น keyword (ถ้ามีการส่ง search แต่ไม่มี keyword)
    if (params.search !== undefined && params.keyword === undefined) {
      params.keyword = params.search;
      delete params.search;
    }
    
    console.log('API params before filtering:', params);
    
    // กรองพารามิเตอร์ที่เป็น null, undefined หรือ empty string ออก
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== null && value !== undefined && value !== ''
      )
    );
    
    console.log('API params after filtering (sent to API):', filteredParams);
    
    const response = await get(API_ENDPOINTS.PROJECT.GET_ALL, filteredParams);
    
    if (response && response.success) {
      return {
        projects: response.data.projects || [],
        pagination: response.data.pagination || {
          current: params.page || 1,
          pageSize: params.limit || 10,
          totalItems: 0,
          totalPages: 0
        }
      };
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลโปรเจคที่มียอดเข้าชมสูงสุด
 * @returns {Promise} - รายการโปรเจคยอดนิยม
 */
export const getTopProjects = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.TOP);
    
    if (response && response.success) {
      return response.data || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคยอดนิยมได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคยอดนิยม:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลโปรเจคล่าสุด
 * @param {number} limit - จำนวนโปรเจคที่ต้องการ
 * @returns {Promise} - รายการโปรเจคล่าสุด
 */
export const getLatestProjects = async (limit = 9) => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.LATEST, { limit: Number(limit) });
    
    if (response && response.success) {
      return response.data || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคล่าสุดได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลโปรเจคของผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise} - รายการโปรเจคของผู้ใช้
 */
export const getMyProjects = async (userId) => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.MY_PROJECTS(userId));
    
    if (response && response.success) {
      return response.data || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคของคุณได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลรายละเอียดของโปรเจค
 * @param {string} projectId - ID ของโปรเจค
 * @returns {Promise} - ข้อมูลรายละเอียดของโปรเจค
 */
export const getProjectDetails = async (projectId) => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.GET_BY_ID(projectId));
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลรายละเอียดของโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดของโปรเจค:', error);
    throw error;
  }
};

/**
 * อัปโหลดโปรเจคใหม่
 * @param {string} userId - ID ของผู้ใช้
 * @param {Object} projectData - ข้อมูลของโปรเจค
 * @param {File[]} files - ไฟล์ที่ต้องการอัปโหลด
 * @returns {Promise} - ผลลัพธ์จากการอัปโหลดโปรเจค
 */
export const uploadProject = async (userId, projectData, files) => {
  try {
    // สร้าง FormData สำหรับการส่งข้อมูลและไฟล์
    const formData = new FormData();
    
    // เพิ่มข้อมูลของโปรเจคลงใน FormData
    Object.keys(projectData).forEach(key => {
      // ถ้าเป็น Object หรือ Array ให้แปลงเป็น JSON string
      if (typeof projectData[key] === 'object' && projectData[key] !== null && !(projectData[key] instanceof File)) {
        formData.append(key, JSON.stringify(projectData[key]));
      } else if (projectData[key] !== null && projectData[key] !== undefined) {
        // ไม่เพิ่มค่า null หรือ undefined
        formData.append(key, projectData[key]);
      }
    });
    
    // แปลงชื่อฟิลด์ถ้าจำเป็น
    if (projectData.type && !projectData.category) {
      formData.append('category', projectData.type);
    }
    
    if (projectData.studyYear && !projectData.level) {
      formData.append('level', projectData.studyYear);
    }
    
    // เพิ่มไฟล์ลงใน FormData
    if (files) {
      Object.keys(files).forEach(key => {
        if (files[key]) {
          if (Array.isArray(files[key])) {
            // ถ้าเป็นอาร์เรย์ของไฟล์
            files[key].forEach(file => {
              formData.append(key, file);
            });
          } else {
            // ถ้าเป็นไฟล์เดียว
            formData.append(key, files[key]);
          }
        }
      });
    }
    
    const response = await uploadFile(API_ENDPOINTS.PROJECT.UPLOAD(userId), formData);
    
    if (response && response.success) {
      message.success('อัปโหลดโปรเจคสำเร็จ');
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถอัปโหลดโปรเจคได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดโปรเจค');
    console.error('เกิดข้อผิดพลาดในการอัปโหลดโปรเจค:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลโปรเจค
 * @param {string} projectId - ID ของโปรเจค
 * @param {Object} projectData - ข้อมูลที่ต้องการอัปเดต
 * @param {File[]} files - ไฟล์ที่ต้องการอัปโหลดใหม่
 * @returns {Promise} - ผลลัพธ์จากการอัปเดตโปรเจค
 */
export const updateProject = async (projectId, projectData, files) => {
  try {
    // สร้าง FormData สำหรับการส่งข้อมูลและไฟล์
    const formData = new FormData();
    
    // เพิ่มข้อมูลของโปรเจคลงใน FormData
    Object.keys(projectData).forEach(key => {
      // ถ้าเป็น Object หรือ Array ให้แปลงเป็น JSON string
      if (typeof projectData[key] === 'object' && projectData[key] !== null && !(projectData[key] instanceof File)) {
        formData.append(key, JSON.stringify(projectData[key]));
      } else if (projectData[key] !== null && projectData[key] !== undefined) {
        // ไม่เพิ่มค่า null หรือ undefined
        formData.append(key, projectData[key]);
      }
    });
    
    // แปลงชื่อฟิลด์ถ้าจำเป็น
    if (projectData.type && !projectData.category) {
      formData.append('category', projectData.type);
    }
    
    if (projectData.studyYear && !projectData.level) {
      formData.append('level', projectData.studyYear);
    }
    
    // เพิ่มไฟล์ลงใน FormData
    if (files) {
      Object.keys(files).forEach(key => {
        if (files[key]) {
          if (Array.isArray(files[key])) {
            // ถ้าเป็นอาร์เรย์ของไฟล์
            files[key].forEach(file => {
              formData.append(key, file);
            });
          } else {
            // ถ้าเป็นไฟล์เดียว
            formData.append(key, files[key]);
          }
        }
      });
    }
    
    const response = await updateFile(API_ENDPOINTS.PROJECT.UPDATE(projectId), formData);
    
    if (response && response.success) {
      message.success('อัปเดตโปรเจคสำเร็จ');
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถอัปเดตโปรเจคได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรเจค');
    console.error('เกิดข้อผิดพลาดในการอัปเดตโปรเจค:', error);
    throw error;
  }
};

/**
 * ลบโปรเจค
 * @param {string} projectId - ID ของโปรเจคที่ต้องการลบ
 * @returns {Promise} - ผลลัพธ์จากการลบโปรเจค
 */
export const deleteProject = async (projectId) => {
  try {
    const response = await del(API_ENDPOINTS.PROJECT.DELETE(projectId));
    
    if (response && response.success) {
      message.success('ลบโปรเจคสำเร็จ');
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถลบโปรเจคได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการลบโปรเจค');
    console.error('เกิดข้อผิดพลาดในการลบโปรเจค:', error);
    throw error;
  }
};

/**
 * ค้นหาโปรเจค
 * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
 * @param {string} params.keyword - คำค้นหา
 * @param {string} params.category - ประเภทของโปรเจค
 * @param {number} params.year - ปีของโปรเจค
 * @param {number} params.level - ชั้นปีของผู้สร้างโปรเจค
 * @param {number} params.page - หน้าที่ต้องการ
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า
 * @returns {Promise} - ผลลัพธ์จากการค้นหาโปรเจค
 */
export const searchProjects = async (params = {}) => {
  try {
    // ตรวจสอบและแปลงค่าตัวเลขให้เป็น number
    if (params.page) params.page = Number(params.page);
    if (params.limit) params.limit = Number(params.limit);
    if (params.year) params.year = Number(params.year);
    if (params.level) params.level = Number(params.level);
    
    // แปลง type เป็น category
    if (params.type !== undefined && params.category === undefined) {
      params.category = params.type;
      delete params.type;
    }
    
    // แปลง studyYear เป็น level
    if (params.studyYear !== undefined && params.level === undefined) {
      params.level = params.studyYear;
      delete params.studyYear;
    }
    
    console.log('Search params before filtering:', params);
    
    // กรองพารามิเตอร์ที่เป็น null, undefined หรือ empty string ออก
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== null && value !== undefined && value !== ''
      )
    );
    
    console.log('Search params after filtering (sent to API):', filteredParams);
    
    const response = await get(API_ENDPOINTS.PROJECT.SEARCH, filteredParams);
    
    if (response && response.success) {
      return {
        projects: response.data.projects || [],
        pagination: response.data.pagination || {
          current: params.page || 1,
          pageSize: params.limit || 10,
          totalItems: 0,
          totalPages: 0
        }
      };
    } else {
      throw new Error(response?.message || 'ไม่สามารถค้นหาโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจค:', error);
    throw error;
  }
};

/**
 * อัปโหลดไฟล์สำหรับโปรเจค
 * @param {string} projectId - ID ของโปรเจค
 * @param {File} file - ไฟล์ที่ต้องการอัปโหลด
 * @returns {Promise} - ผลลัพธ์จากการอัปโหลดไฟล์
 */
export const uploadProjectFile = async (projectId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await uploadFile(API_ENDPOINTS.PROJECT.UPLOAD_FILE(projectId), formData);
    
    if (response && response.success) {
      message.success('อัปโหลดไฟล์สำเร็จ');
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถอัปโหลดไฟล์ได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    console.error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์:', error);
    throw error;
  }
};

/**
 * บันทึกการเข้าชมโปรเจคจากผู้เยี่ยมชม
 * @param {string} projectId - ID ของโปรเจค
 * @returns {Promise} - ผลลัพธ์จากการบันทึกการเข้าชม
 */
export const recordVisitorView = async (projectId) => {
  try {
    await post(API_ENDPOINTS.PROJECT.VISITOR_VIEW(projectId));
    return true;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกการเข้าชมโปรเจค:', error);
    // ไม่ throw error เพราะไม่ต้องการให้เกิดผลกระทบกับผู้ใช้
    return false;
  }
};

/**
 * ดึงข้อมูลประเภทของโปรเจคทั้งหมด
 * @returns {Promise} - รายการประเภทของโปรเจค
 */
export const getProjectTypes = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.TYPES);
    
    if (response && response.success) {
      return response.data || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลประเภทของโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลประเภทของโปรเจค:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลปีของโปรเจคทั้งหมด
 * @returns {Promise} - รายการปีของโปรเจค
 */
export const getProjectYears = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.YEARS);
    
    if (response && response.success) {
      return response.data || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลปีของโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลปีของโปรเจค:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลชั้นปีของผู้สร้างโปรเจคทั้งหมด
 * @returns {Promise} - รายการชั้นปีของผู้สร้างโปรเจค
 */
export const getStudyYears = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.STUDY_YEARS);
    
    if (response && response.success) {
      return response.data || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลชั้นปีของผู้สร้างโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลชั้นปีของผู้สร้างโปรเจค:', error);
    throw error;
  }
};

export default {
  getAllProjects,
  getTopProjects,
  getLatestProjects,
  getMyProjects,
  getProjectDetails,
  uploadProject,
  updateProject,
  deleteProject,
  searchProjects,
  uploadProjectFile,
  recordVisitorView,
  getProjectTypes,
  getProjectYears,
  getStudyYears,
};