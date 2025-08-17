/**
 * Service สำหรับการจัดการข้อมูลโปรเจค
 * ให้บริการฟังก์ชันเกี่ยวกับการดึงข้อมูล, สร้าง, แก้ไข, ลบโปรเจค เป็นต้น
 */
import { get } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * ดึงข้อมูลโปรเจคทั้งหมด
 * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
 * @param {number} params.page - หน้าที่ต้องการ
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า
 * @param {string} params.category - ประเภทของโปรเจค (coursework, academic, competition)
 * @param {number} params.year - ปีของโปรเจค
 * @param {number} params.level - ชั้นปีของผู้สร้างโปรเจค (ปี 1, ปี 2, ปี 3, ปี 4)
 * @param {string} params.keyword - คำค้นหา
 * @returns {Promise} - รายการโปรเจค
 */
export const getAllProjects = async (params = {}) => {
  try {
    // ตรวจสอบและแปลงค่าตัวเลขให้เป็น number
    if (params.page) params.page = Number(params.page);
    if (params.limit) params.limit = Number(params.limit);
    if (params.year) params.year = Number(params.year);
    if (params.level) params.level = Number(params.level);
    
    // console.log('API params before filtering:', params);
    
    // กรองพารามิเตอร์ที่เป็น null, undefined หรือ empty string ออก
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) =>
        value !== null && value !== undefined && value !== ''
      )
    );
    
    // console.log('API params after filtering (sent to API):', filteredParams);
    
    const response = await get(API_ENDPOINTS.PROJECT.GET_ALL, filteredParams);
    
    if (response && response.success) {
      return {
        projects: response.data.projects || [],
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
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
 * ดึงข้อมูลโปรเจคที่มียอดเข้าชมสูงสุด 9 อันดับแรก
 * @returns {Promise} - รายการโปรเจคยอดนิยม
 */
export const getTopProjects = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.TOP);
    
    if (response && response.success) {
      return response.data.projects || [];
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
 * @param {number} limit - จำนวนโปรเจคที่ต้องการ (default: 9)
 * @returns {Promise} - รายการโปรเจคล่าสุด
 */
export const getLatestProjects = async (limit = 9) => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.LATEST, { limit: Number(limit) });
    // console.log(response)
    
    if (response && response.success) {
      return response.data.projects || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคล่าสุดได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด:', error);
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
    if (!projectId) {
      throw new Error('ไม่มี ID ของโปรเจค');
    }
    
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
    
    // console.log('Search params before filtering:', params);
    
    // กรองพารามิเตอร์ที่เป็น null, undefined หรือ empty string ออก
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) =>
        value !== null && value !== undefined && value !== ''
      )
    );
    
    // console.log('Search params after filtering (sent to API):', filteredParams);
    
    const response = await get(API_ENDPOINTS.SEARCH.PROJECTS, filteredParams);
    
    if (response && response.success) {
      return {
        projects: response.data.projects || [],
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
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

export default {
  getAllProjects,
  getTopProjects,
  getLatestProjects,
  getProjectDetails,
  searchProjects,
};