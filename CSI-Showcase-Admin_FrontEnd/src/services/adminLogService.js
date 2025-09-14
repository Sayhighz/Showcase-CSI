// src/services/adminLogService.js
import { cachedGet } from '../lib/axiosCached';
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
    
    // Clone filters to avoid modifying the original object
    const processedFilters = { ...filters };
    
    // Convert any date objects to strings
    if (processedFilters.startDate && typeof processedFilters.startDate === 'object' && processedFilters.startDate.format) {
      processedFilters.startDate = processedFilters.startDate.format('YYYY-MM-DD');
    }
    
    if (processedFilters.endDate && typeof processedFilters.endDate === 'object' && processedFilters.endDate.format) {
      processedFilters.endDate = processedFilters.endDate.format('YYYY-MM-DD');
    }
    
    // Filter out empty values before appending to queryParams
    Object.entries(processedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    // สร้าง URL พร้อม query string
    const url = ADMIN.LOGS.LOGIN_LOGS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await cachedGet(url, { params: queryParams });

    return {
      success: true,
      data: {
        logs: response.logs || [],
        pagination: response.pagination || {}
      },
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
    const queryParams = new URLSearchParams();
    
    // Filter out empty values before appending to queryParams
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    // สร้าง URL พร้อม query string
    const url = ADMIN.LOGS.VISITOR_VIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await cachedGet(url, { params: queryParams });

    return {
      success: true,
      data: {
        views: response.data?.views || response.views || [],
        pagination: response.data?.pagination || response.pagination || {}
      },
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
    const queryParams = new URLSearchParams();
    
    // Filter out empty values before appending to queryParams
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    // สร้าง URL พร้อม query string
    const url = ADMIN.LOGS.PROJECT_REVIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await cachedGet(url, { params: queryParams });

    return {
      success: true,
      data: {
        reviews: response.data?.reviews || response.reviews || [],
        pagination: response.data?.pagination || response.pagination || {}
      },
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
    const response = await cachedGet(ADMIN.LOGS.SYSTEM_STATS);
    
    // สร้างโครงสร้างข้อมูลให้ตรงกับ response ที่ได้รับ
    const statsData = {
      totalLogins: response?.totalLogins || 0,
      totalViews: response?.totalViews || 0,
      loginsByDay: response?.loginsByDay || [],
      viewsByDay: response?.viewsByDay || [],
      projectsByDay: response?.projectsByDay || [],
      usersByDay: response?.usersByDay || [],
      reviewsByDay: response?.reviewsByDay || [],
      reviewsByStatus: response?.reviewsByStatus || []
    };
    
    return {
      success: true,
      data: statsData,
      message: response.message || 'ดึงสถิติระบบสำเร็จ'
    };
  } catch (error) {
    console.error('Get system stats error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงสถิติระบบ',
      data: {
        totalLogins: 0,
        totalViews: 0,
        loginsByDay: [],
        viewsByDay: [],
        projectsByDay: [],
        usersByDay: [],
        reviewsByDay: [],
        reviewsByStatus: []
      }
    };
  }
};

/**
 * ดึงสถิติประจำวัน
 * @returns {Promise<Object>} - ข้อมูลสถิติประจำวัน
 */
export const getDailyStats = async () => {
  try {
    const response = await cachedGet(ADMIN.LOGS.DAILY_STATS);
    
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
    projects: data.totalProjects || 0,
    users: data.totalUsers || 0,
    reviews: data.totalReviews || 0
  };
  
  // สถิติวันนี้
  const today = {
    logins: data.dailyStats?.logins?.today || 0,
    views: data.dailyStats?.views?.today || 0,
    projects: data.dailyStats?.projects?.today || 0,
    reviews: data.dailyStats?.reviews?.today || 0
  };
  
  // แนวโน้มข้อมูล
  const trends = formatDailyTrendsChartData(data);
  
  // การตรวจสอบโปรเจคแยกตามสถานะ
  const reviewsByStatus = data.reviewsByStatus || [];
  
  return {
    totals,
    today,
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