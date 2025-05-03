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
 * ดึงข้อมูลสถิติระบบ
 * @returns {Promise<Object>} - ข้อมูลสถิติระบบ
 */
export const getSystemStats = async () => {
  try {
    const response = await axiosGet(STATISTICS.SYSTEM_STATS);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get system statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติระบบ',
      data: {}
    };
  }
};

/**
 * ดึงข้อมูลสถิติรายวัน
 * @returns {Promise<Object>} - ข้อมูลสถิติรายวัน
 */
export const getDailyStats = async () => {
  try {
    const response = await axiosGet(STATISTICS.DAILY_STATS);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get daily statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติรายวัน',
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
 * แปลงข้อมูลสถิติสถานะโปรเจคเป็นรูปแบบสำหรับแผนภูมิ
 * @param {Array} data - ข้อมูลสถิติสถานะโปรเจค
 * @returns {Array} - ข้อมูลสำหรับแผนภูมิ
 */
export const formatProjectStatusChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  const statusColors = {
    pending: '#f0ad4e',
    approved: '#5cb85c',
    rejected: '#d9534f'
  };
  
  return data.map(item => ({
    name: translateStatus(item.status),
    value: item.count,
    fill: statusColors[item.status] || getRandomColor()
  }));
};

/**
 * แปลสถานะภาษาอังกฤษเป็นภาษาไทย
 * @param {string} status - สถานะภาษาอังกฤษ
 * @returns {string} - สถานะภาษาไทย
 */
function translateStatus(status) {
  const statusMap = {
    pending: 'รอการอนุมัติ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ไม่อนุมัติ'
  };
  
  return statusMap[status] || status;
}

/**
 * แปลงข้อมูลสถิติข้อมูลทั่วไปเป็นรูปแบบสำหรับการแสดงผล
 * @param {Object} data - ข้อมูลสถิติทั่วไป
 * @returns {Array} - ข้อมูลสำหรับการแสดงผล
 */
export const formatGeneralStats = (data) => {
  if (!data || typeof data !== 'object') {
    return [];
  }
  
  return Object.keys(data).map(key => ({
    key,
    value: data[key],
    label: translateStatKey(key)
  }));
};

/**
 * แปลคีย์สถิติเป็นป้ายกำกับภาษาไทย
 * @param {string} key - คีย์สถิติ
 * @returns {string} - ป้ายกำกับภาษาไทย
 */
function translateStatKey(key) {
  const keyMap = {
    totalProjects: 'จำนวนโปรเจคทั้งหมด',
    totalUsers: 'จำนวนผู้ใช้ทั้งหมด',
    totalViews: 'จำนวนการเข้าชมทั้งหมด',
    totalLogins: 'จำนวนการเข้าสู่ระบบทั้งหมด',
    pendingProjects: 'โปรเจครอการอนุมัติ',
    approvedProjects: 'โปรเจคที่อนุมัติแล้ว',
    rejectedProjects: 'โปรเจคที่ไม่อนุมัติ'
  };
  
  return keyMap[key] || key;
}

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
  getSystemStats,
  getDailyStats,
  formatProjectTypeChartData,
  formatStudyYearChartData,
  formatProjectStatusChartData,
  formatGeneralStats
};