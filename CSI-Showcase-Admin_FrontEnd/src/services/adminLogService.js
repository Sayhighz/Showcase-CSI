// src/services/adminLogService.js
import { axiosGet } from '../lib/axios';
import { ADMIN } from '../constants/apiEndpoints';
import { formatThaiDate } from '../utils/dataUtils';

/**
 * ดึงประวัติการเข้าสู่ระบบทั้งหมด
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลประวัติการเข้าสู่ระบบ
 */
export const getAllLoginLogs = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.userId) {
      queryParams.append('userId', filters.userId);
    }
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    // สร้าง URL พร้อม query string
    const url = ADMIN.LOGS.LOGIN_LOGS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'ดึงประวัติการเข้าสู่ระบบสำเร็จ'
    };
  } catch (error) {
    console.error('Get all login logs error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการเข้าสู่ระบบ',
      data: { logs: [], pagination: {} }
    };
  }
};

/**
 * ดึงประวัติการเข้าชมของผู้เยี่ยมชม
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลประวัติการเข้าชม
 */
export const getVisitorViews = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.projectId) {
      queryParams.append('projectId', filters.projectId);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    // สร้าง URL พร้อม query string
    const url = ADMIN.LOGS.VISITOR_VIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'ดึงประวัติการเข้าชมสำเร็จ'
    };
  } catch (error) {
    console.error('Get visitor views error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการเข้าชม',
      data: { views: [], pagination: {} }
    };
  }
};

/**
 * ดึงประวัติการตรวจสอบโปรเจค
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลประวัติการตรวจสอบโปรเจค
 */
export const getProjectReviews = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.projectId) {
      queryParams.append('projectId', filters.projectId);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.adminId) {
      queryParams.append('adminId', filters.adminId);
    }
    
    // สร้าง URL พร้อม query string
    const url = ADMIN.LOGS.PROJECT_REVIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'ดึงประวัติการตรวจสอบโปรเจคสำเร็จ'
    };
  } catch (error) {
    console.error('Get project reviews error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการตรวจสอบโปรเจค',
      data: { reviews: [], pagination: {} }
    };
  }
};

/**
 * ดึงสถิติการใช้งานระบบ
 * @returns {Promise<Object>} - ข้อมูลสถิติการใช้งานระบบ
 */
export const getSystemStats = async () => {
  try {
    const response = await axiosGet(ADMIN.LOGS.SYSTEM_STATS);
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'ดึงสถิติระบบสำเร็จ'
    };
  } catch (error) {
    console.error('Get system stats error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงสถิติระบบ',
      data: {}
    };
  }
};

/**
 * ดึงสถิติประจำวัน
 * @returns {Promise<Object>} - ข้อมูลสถิติประจำวัน
 */
export const getDailyStats = async () => {
  try {
    const response = await axiosGet(ADMIN.LOGS.DAILY_STATS);
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'ดึงสถิติประจำวันสำเร็จ'
    };
  } catch (error) {
    console.error('Get daily stats error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงสถิติประจำวัน',
      data: {}
    };
  }
};

/**
 * แปลงข้อมูลสำหรับกราฟแนวโน้มการเข้าใช้งานรายวัน
 * @param {Array} data - ข้อมูลสถิติรายวันจาก API
 * @returns {Array} - ข้อมูลที่พร้อมสำหรับการแสดงผลในกราฟ
 */
export const formatDailyTrendsChartData = (data) => {
  if (!data || !data.loginsByDay || !Array.isArray(data.loginsByDay)) {
    return [];
  }
  
  return data.loginsByDay.map(item => ({
    date: formatThaiDate(item.date, { dateStyle: 'short' }),
    logins: item.count || 0
  }));
};

/**
 * แปลงข้อมูลสำหรับกราฟการเข้าชมโปรเจค
 * @param {Array} data - ข้อมูลการเข้าชมจาก API
 * @returns {Array} - ข้อมูลที่พร้อมสำหรับการแสดงผลในกราฟ
 */
export const formatViewsChartData = (data) => {
  if (!data || !data.viewsByDay || !Array.isArray(data.viewsByDay)) {
    return [];
  }
  
  return data.viewsByDay.map(item => ({
    date: formatThaiDate(item.date, { dateStyle: 'short' }),
    visitorCount: item.visitorCount || 0,
    companyCount: item.companyCount || 0,
    totalCount: item.totalCount || 0
  }));
};

/**
 * คำนวณอัตราการเปลี่ยนแปลงเป็นเปอร์เซ็นต์
 * @param {number} current - ค่าปัจจุบัน
 * @param {number} previous - ค่าก่อนหน้า
 * @returns {number} - อัตราการเปลี่ยนแปลงเป็นเปอร์เซ็นต์
 */
export const calculatePercentChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * แปลงข้อมูลสถิติแดชบอร์ดเป็นรูปแบบที่ใช้งานได้
 * @param {Object} data - ข้อมูลสถิติจาก API
 * @returns {Object} - ข้อมูลที่พร้อมสำหรับการแสดงผลในแดชบอร์ด
 */
export const formatDashboardStats = (data) => {
  if (!data) {
    return {
      totals: {
        logins: 0,
        views: 0,
        projects: 0,
        users: 0,
        reviews: 0
      },
      today: {
        logins: 0,
        views: 0,
        projects: 0,
        reviews: 0
      },
      trends: [],
      reviewsByStatus: []
    };
  }
  
  // สถิติรวม
  const totals = {
    logins: data.totalLogins || 0,
    views: data.totalViews || 0,
    projects: 0, // คำนวณจากข้อมูลอื่น
    users: 0,    // คำนวณจากข้อมูลอื่น
    reviews: 0   // คำนวณจากข้อมูลอื่น
  };
  
  // แนวโน้มข้อมูล
  const trends = formatDailyTrendsChartData(data);
  
  // การตรวจสอบโปรเจคแยกตามสถานะ
  const reviewsByStatus = data.reviewsByStatus || [];
  
  return {
    totals,
    trends,
    reviewsByStatus
  };
};

export default {
  getAllLoginLogs,
  getVisitorViews,
  getProjectReviews,
  getSystemStats,
  getDailyStats,
  formatDailyTrendsChartData,
  formatViewsChartData,
  calculatePercentChange,
  formatDashboardStats
};