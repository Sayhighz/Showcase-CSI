// src/services/searchService.js
import { axiosGet } from '../lib/axios';
import { SEARCH } from '../constants/apiEndpoints';

/**
 * ค้นหาโปรเจค
 * @param {string} keyword - คำค้นหา
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ผลลัพธ์การค้นหา
 */
export const searchProjects = async (keyword, filters = {}) => {
  try {
    if (!keyword && Object.keys(filters).length === 0) {
      return {
        success: false,
        message: 'กรุณาระบุคำค้นหาหรือตัวกรอง',
        data: []
      };
    }
    
    // สร้าง query string
    const queryParams = new URLSearchParams();
    
    if (keyword) {
      queryParams.append('keyword', keyword);
    }
    
    if (filters.type) {
      queryParams.append('type', filters.type);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    
    if (filters.study_year) {
      queryParams.append('study_year', filters.study_year);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = `${SEARCH.PROJECTS}?${queryParams.toString()}`;
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Search projects error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการค้นหาโปรเจค',
      data: []
    };
  }
};

/**
 * ค้นหาผู้ใช้
 * @param {string} keyword - คำค้นหา
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ผลลัพธ์การค้นหา
 */
export const searchUsers = async (keyword, filters = {}) => {
  try {
    if (!keyword && Object.keys(filters).length === 0) {
      return {
        success: false,
        message: 'กรุณาระบุคำค้นหาหรือตัวกรอง',
        data: []
      };
    }
    
    // สร้าง query string
    const queryParams = new URLSearchParams();
    
    if (keyword) {
      queryParams.append('keyword', keyword);
    }
    
    if (filters.role) {
      queryParams.append('role', filters.role);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = `${SEARCH.USERS}?${queryParams.toString()}`;
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Search users error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการค้นหาผู้ใช้',
      data: []
    };
  }
};

/**
 * ค้นหาแท็ก
 * @param {string} keyword - คำค้นหา
 * @returns {Promise<Object>} - ผลลัพธ์การค้นหา
 */
export const searchTags = async (keyword) => {
  try {
    if (!keyword) {
      return {
        success: false,
        message: 'กรุณาระบุคำค้นหา',
        data: []
      };
    }
    
    // สร้าง URL พร้อม query string
    const url = `${SEARCH.TAGS}?keyword=${keyword}`;
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Search tags error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการค้นหาแท็ก',
      data: []
    };
  }
};

/**
 * ดึงคำค้นหายอดนิยม
 * @returns {Promise<Object>} - ข้อมูลคำค้นหายอดนิยม
 */
export const getPopularSearches = async () => {
  try {
    const response = await axiosGet(SEARCH.POPULAR);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get popular searches error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลคำค้นหายอดนิยม',
      data: []
    };
  }
};

export default {
  searchProjects,
  searchUsers,
  searchTags,
  getPopularSearches
};