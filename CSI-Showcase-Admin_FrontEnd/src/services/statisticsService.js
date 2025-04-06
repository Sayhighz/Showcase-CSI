// src/services/statisticsService.js
import { axiosGet } from '../lib/axios';
import { STATISTICS } from '../constants/apiEndpoints';

/**
 * ดึงข้อมูลสถิติสำหรับแดชบอร์ด
 * @returns {Promise<Object>} - ข้อมูลสถิติแดชบอร์ด
 */
export const getDashboardStats = async () => {
  try {
    const response = await axiosGet(STATISTICS.DASHBOARD);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติแดชบอร์ด',
      data: {}
    };
  }
};

/**
 * ดึงข้อมูลสถิติวันนี้
 * @returns {Promise<Object>} - ข้อมูลสถิติวันนี้
 */
export const getTodayStats = async () => {
  try {
    const response = await axiosGet(STATISTICS.TODAY);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get today statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติวันนี้',
      data: {}
    };
  }
};

/**
 * ดึงข้อมูลสถิติจำนวนโปรเจคตามประเภท
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลสถิติจำนวนโปรเจคตามประเภท
 */
export const getProjectTypeStats = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    // สร้าง URL พร้อม query string
    const url = STATISTICS.PROJECT_TYPES + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get project type statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติจำนวนโปรเจคตามประเภท',
      data: {}
    };
  }
};

/**
 * ดึงข้อมูลสถิติจำนวนโปรเจคตามชั้นปี
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลสถิติจำนวนโปรเจคตามชั้นปี
 */
export const getStudyYearStats = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.type) {
      queryParams.append('type', filters.type);
    }
    
    // สร้าง URL พร้อม query string
    const url = STATISTICS.STUDY_YEARS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get study year statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติจำนวนโปรเจคตามชั้นปี',
      data: {}
    };
  }
};

/**
 * ดึงข้อมูลสถิติกิจกรรมผู้ใช้
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลสถิติกิจกรรมผู้ใช้
 */
export const getUserActivityStats = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    if (filters.role) {
      queryParams.append('role', filters.role);
    }
    
    // สร้าง URL พร้อม query string
    const url = STATISTICS.USER_ACTIVITY + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get user activity statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติกิจกรรมผู้ใช้',
      data: {}
    };
  }
};

/**
 * แปลงข้อมูลสถิติโปรเจคตามประเภทเป็นรูปแบบสำหรับแผนภูมิ
 * @param {Array} data - ข้อมูลสถิติโปรเจคตามประเภท
 * @returns {Array} - ข้อมูลสำหรับแผนภูมิ
 */
export const formatProjectTypeChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  return data.map(item => ({
    name: item.type_name || item.type,
    value: item.count,
    fill: item.color || getRandomColor()
  }));
};

/**
 * แปลงข้อมูลสถิติจำนวนโปรเจคตามชั้นปีเป็นรูปแบบสำหรับแผนภูมิ
 * @param {Array} data - ข้อมูลสถิติจำนวนโปรเจคตามชั้นปี
 * @returns {Array} - ข้อมูลสำหรับแผนภูมิ
 */
export const formatStudyYearChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  return data.map(item => ({
    name: `ปี ${item.study_year}`,
    value: item.count,
    fill: item.color || getRandomColor()
  }));
};

/**
 * แปลงข้อมูลสถิติกิจกรรมผู้ใช้เป็นรูปแบบสำหรับแผนภูมิ
 * @param {Array} data - ข้อมูลสถิติกิจกรรมผู้ใช้
 * @returns {Array} - ข้อมูลสำหรับแผนภูมิ
 */
export const formatUserActivityChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  return data.map(item => ({
    name: item.date,
    logins: item.login_count,
    projects: item.project_count,
    reviews: item.review_count
  }));
};

/**
 * สร้างสีสุ่มสำหรับแผนภูมิ
 * @returns {string} - รหัสสี
 */
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default {
  getDashboardStats,
  getTodayStats,
  getProjectTypeStats,
  getStudyYearStats,
  getUserActivityStats,
  formatProjectTypeChartData,
  formatStudyYearChartData,
  formatUserActivityChartData
};