/**
 * Service สำหรับการจัดการการค้นหา
 * ให้บริการฟังก์ชันเกี่ยวกับการค้นหาโปรเจค, ผู้ใช้ เป็นต้น
 */
import { get, post } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { message } from 'antd';

/**
 * ค้นหาโปรเจคตามคำค้นหาและตัวกรอง
 * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
 * @param {string} params.keyword - คำค้นหา (optional)
 * @param {string} params.type - ประเภทของโปรเจค (optional, enum: [coursework, competition, academic])
 * @param {number} params.year - ปีของโปรเจค (optional)
 * @param {number} params.studyYear - ชั้นปีของผู้สร้างโปรเจค (optional)
 * @param {number} params.page - หน้าที่ต้องการ (optional, default: 1)
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า (optional, default: 10)
 * @returns {Promise} - ผลลัพธ์จากการค้นหาโปรเจค
 */
export const searchProjects = async (params = {}) => {
  try {
    // แปลงค่าตัวเลขให้เป็น number
    if (params.page) params.page = Number(params.page);
    if (params.limit) params.limit = Number(params.limit);
    if (params.year) params.year = Number(params.year);
    if (params.studyYear) params.studyYear = Number(params.studyYear);
    
    // ทำ query parameters ตาม API spec
    const queryParams = { ...params };
    
    // กรองค่า null, undefined และ empty string ออก
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
        delete queryParams[key];
      }
    });
    
    console.log('Searching projects with params:', queryParams);
    
    const response = await get(API_ENDPOINTS.SEARCH.PROJECTS, queryParams);
    
    if (response && response.success) {
      return {
        projects: response.data.projects || [],
        pagination: {
          page: Number(response.data.pagination?.page) || 1,
          limit: Number(response.data.pagination?.limit) || 10,
          total: Number(response.data.pagination?.totalItems) || 0,
          totalPages: Number(response.data.pagination?.totalPages) || 0
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
 * ค้นหาผู้ใช้ตามคำค้นหา (ต้องเข้าสู่ระบบ)
 * @param {string} keyword - คำค้นหา
 * @param {number} limit - จำนวนผลลัพธ์ที่ต้องการ (default: 10)
 * @returns {Promise} - ผลลัพธ์จากการค้นหาผู้ใช้
 */
export const searchUsers = async (keyword, limit = 10) => {
  try {
    if (!keyword) {
      throw new Error('กรุณาระบุคำค้นหา');
    }
    
    const response = await get(API_ENDPOINTS.SEARCH.USERS, { 
      keyword, 
      limit: Number(limit) 
    });
    
    if (response && response.success) {
      return response.data || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถค้นหาผู้ใช้ได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้:', error);
    throw error;
  }
};

/**
 * แปลงพารามิเตอร์การค้นหาให้เป็น URL query string
 * @param {Object} params - พารามิเตอร์การค้นหา
 * @returns {string} - URL query string
 */
export const buildSearchQuery = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // กรองค่า null, undefined และ empty string ออก
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // กรณีเป็นอาร์เรย์ เช่น tags
        queryParams.append(key, value.join(','));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });
  
  return queryParams.toString();
};

export default {
  searchProjects,
  searchUsers,
  buildSearchQuery,
};