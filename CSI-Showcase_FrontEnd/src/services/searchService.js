/**
 * Service สำหรับการจัดการการค้นหา
 * ให้บริการฟังก์ชันเกี่ยวกับการค้นหาโปรเจค, ผู้ใช้, แท็ก เป็นต้น
 */
import { get, post } from './apiService';
import { SEARCH } from '../constants/apiEndpoints';
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
    
    const response = await get(SEARCH.PROJECTS, queryParams);
    
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
    const response = await get(SEARCH.USERS, { keyword, limit });
    
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
 * ค้นหาโปรเจคตามแท็ก
 * @param {string} tag - แท็กที่ต้องการค้นหา
 * @param {Object} params - พารามิเตอร์เพิ่มเติมสำหรับการค้นหา
 * @param {number} params.page - หน้าที่ต้องการ
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า
 * @returns {Promise} - ผลลัพธ์จากการค้นหาโปรเจคตามแท็ก
 */
export const searchProjectsByTag = async (tag, params = {}) => {
  try {
    const queryParams = {
      tag,
      ...params,
    };
    
    const response = await get(SEARCH.TAGS, queryParams);
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถค้นหาโปรเจคตามแท็กได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจคตามแท็ก:', error);
    throw error;
  }
};

/**
 * ดึงแท็กยอดนิยม
 * @param {number} limit - จำนวนแท็กที่ต้องการ
 * @returns {Promise} - รายการแท็กยอดนิยม
 */
export const getPopularTags = async (limit = 10) => {
  try {
    const response = await get(SEARCH.POPULAR_TAGS, { limit });
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถดึงแท็กยอดนิยมได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงแท็กยอดนิยม:', error);
    throw error;
  }
};

/**
 * ดึงคำค้นหายอดนิยม
 * @param {number} limit - จำนวนคำค้นหาที่ต้องการ
 * @returns {Promise} - รายการคำค้นหายอดนิยม
 */
export const getPopularSearches = async (limit = 10) => {
  try {
    const response = await get(SEARCH.POPULAR_SEARCHES, { limit });
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถดึงคำค้นหายอดนิยมได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงคำค้นหายอดนิยม:', error);
    throw error;
  }
};

/**
 * บันทึกคำค้นหา
 * @param {string} keyword - คำค้นหาที่ต้องการบันทึก
 * @returns {Promise} - ผลลัพธ์จากการบันทึกคำค้นหา
 */
export const logSearch = async (keyword) => {
  try {
    if (!keyword || keyword.trim() === '') {
      return;
    }
    
    await post(SEARCH.LOG_SEARCH, { keyword });
    return true;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกคำค้นหา:', error);
    // ไม่ throw error เพราะไม่ต้องการให้เกิดผลกระทบกับผู้ใช้
    return false;
  }
};

/**
 * ดึงประวัติการค้นหาของผู้ใช้
 * @param {number} limit - จำนวนประวัติการค้นหาที่ต้องการ
 * @returns {Promise} - รายการประวัติการค้นหาของผู้ใช้
 */
export const getUserSearchHistory = async (limit = 10) => {
  try {
    const response = await get(SEARCH.USER_HISTORY, { limit });
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถดึงประวัติการค้นหาของคุณได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงประวัติการค้นหาของผู้ใช้:', error);
    throw error;
  }
};

/**
 * ค้นหาขั้นสูง
 * @param {Object} filters - ตัวกรองสำหรับการค้นหา
 * @param {string} filters.keyword - คำค้นหา
 * @param {string} filters.type - ประเภทของโปรเจค
 * @param {string} filters.year - ปีของโปรเจค
 * @param {string} filters.studyYear - ชั้นปีของผู้สร้างโปรเจค
 * @param {Array} filters.tags - รายการแท็กที่ต้องการค้นหา
 * @param {Object} pagination - ข้อมูลการแบ่งหน้า
 * @param {number} pagination.page - หน้าที่ต้องการ
 * @param {number} pagination.limit - จำนวนผลลัพธ์ต่อหน้า
 * @returns {Promise} - ผลลัพธ์จากการค้นหา
 */
export const advancedSearch = async (filters = {}, pagination = {}) => {
  try {
    const queryParams = {
      ...filters,
      ...pagination,
      // แปลงอาร์เรย์แท็กเป็นสตริงคั่นด้วยเครื่องหมายจุลภาค
      tags: filters.tags ? filters.tags.join(',') : undefined,
    };
    
    const response = await get(SEARCH.PROJECTS, queryParams);
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถค้นหาขั้นสูงได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการค้นหาขั้นสูง:', error);
    throw error;
  }
};

/**
 * แนะนำคำค้นหาตามการพิมพ์
 * @param {string} keyword - คำที่กำลังพิมพ์
 * @param {number} limit - จำนวนคำแนะนำที่ต้องการ
 * @returns {Promise} - รายการคำแนะนำ
 */
export const getSearchSuggestions = async (keyword, limit = 5) => {
  // ฟังก์ชันนี้ใช้สำหรับการแนะนำคำค้นหาแบบ real-time ขณะที่ผู้ใช้กำลังพิมพ์
  try {
    if (!keyword || keyword.trim().length < 2) {
      return [];
    }
    
    // สร้าง API endpoint สำหรับการแนะนำคำค้นหา
    // หมายเหตุ: ต้องเพิ่ม endpoint นี้ใน apiEndpoints.js หากต้องการใช้งานจริง
    const endpoint = `${SEARCH.PROJECTS}/suggestions`;
    
    const response = await get(endpoint, { keyword, limit });
    
    if (response && response.success) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงคำแนะนำการค้นหา:', error);
    return [];
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
  searchProjectsByTag,
  getPopularTags,
  getPopularSearches,
  logSearch,
  getUserSearchHistory,
  advancedSearch,
  getSearchSuggestions,
  buildSearchQuery,
};