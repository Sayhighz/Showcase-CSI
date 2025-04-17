/**
 * Service สำหรับการจัดการการค้นหา
 * ให้บริการฟังก์ชันเกี่ยวกับการค้นหาโปรเจค, ผู้ใช้ เป็นต้น
 */
import { get, post } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { message } from 'antd';

/**
 * ค้นหาโปรเจคตามคำค้นหา
 * @param {string} keyword - คำค้นหา
 * @param {Object} params - พารามิเตอร์เพิ่มเติมสำหรับการค้นหา
 * @param {number} params.page - หน้าที่ต้องการ
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า
 * @param {string} params.type - ประเภทของโปรเจค
 * @param {string} params.year - ปีของโปรเจค
 * @param {string} params.studyYear - ชั้นปีของผู้สร้างโปรเจค
 * @returns {Promise} - ผลลัพธ์จากการค้นหาโปรเจค
 */
export const searchProjects = async (keyword, params = {}) => {
  try {
    const queryParams = {
      keyword,
      ...params,
    };
    
    const response = await get(API_ENDPOINTS.SEARCH.PROJECTS, queryParams);
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถค้นหาโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจค:', error);
    throw error;
  }
};

/**
 * ค้นหาผู้ใช้ตามคำค้นหา
 * @param {string} keyword - คำค้นหา
 * @param {number} limit - จำนวนผลลัพธ์ที่ต้องการ
 * @returns {Promise} - ผลลัพธ์จากการค้นหาผู้ใช้
 */
export const searchUsers = async (keyword, limit = 10) => {
  try {
    const response = await get(API_ENDPOINTS.SEARCH.USERS, { keyword, limit });
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถค้นหาผู้ใช้ได้');
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
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      if (Array.isArray(params[key])) {
        // ถ้าเป็นอาร์เรย์ให้แปลงเป็นสตริงคั่นด้วยเครื่องหมายจุลภาค
        queryParams.append(key, params[key].join(','));
      } else {
        queryParams.append(key, params[key]);
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