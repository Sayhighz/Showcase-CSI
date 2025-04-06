// src/services/logService.js
import { axiosGet } from '../lib/axios';
import { LOGS } from '../constants/apiEndpoints';

/**
 * ดึงประวัติการเข้าสู่ระบบ
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลประวัติการเข้าสู่ระบบ
 */
export const getLoginLogs = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.userId) {
      queryParams.append('user_id', filters.userId);
    }
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
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
    const url = LOGS.LOGIN_LOGS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Get login logs error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการเข้าสู่ระบบ',
      data: []
    };
  }
};

/**
 * ดึงประวัติการเข้าชมจากบริษัท
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลประวัติการเข้าชมจากบริษัท
 */
export const getCompanyViews = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.projectId) {
      queryParams.append('project_id', filters.projectId);
    }
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    if (filters.companyName) {
      queryParams.append('company_name', filters.companyName);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = LOGS.COMPANY_VIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Get company views error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการเข้าชมจากบริษัท',
      data: []
    };
  }
};

/**
 * ดึงประวัติการเข้าชมจากผู้เยี่ยมชม
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลประวัติการเข้าชมจากผู้เยี่ยมชม
 */
export const getVisitorViews = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.projectId) {
      queryParams.append('project_id', filters.projectId);
    }
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    if (filters.ipAddress) {
      queryParams.append('ip_address', filters.ipAddress);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = LOGS.VISITOR_VIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Get visitor views error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการเข้าชมจากผู้เยี่ยมชม',
      data: []
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
    
    if (filters.projectId) {
      queryParams.append('project_id', filters.projectId);
    }
    
    if (filters.adminId) {
      queryParams.append('admin_id', filters.adminId);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    // สร้าง URL พร้อม query string
    const url = LOGS.PROJECT_REVIEWS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response,
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  } catch (error) {
    console.error('Get project reviews error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการตรวจสอบโปรเจค',
      data: []
    };
  }
};

/**
 * ดึงสถิติการใช้งานระบบ
 * @returns {Promise<Object>} - ข้อมูลสถิติการใช้งานระบบ
 */
export const getSystemStats = async () => {
  try {
    const response = await axiosGet(LOGS.SYSTEM_STATS);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get system statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติการใช้งานระบบ',
      data: {}
    };
  }
};

/**
 * ดึงสถิติประจำวัน
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลสถิติประจำวัน
 */
export const getDailyStats = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    // สร้าง URL พร้อม query string
    const url = LOGS.DAILY_STATS + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    
    const response = await axiosGet(url);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get daily statistics error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติประจำวัน',
      data: {}
    };
  }
};

/**
 * แปลงข้อมูลสถิติประจำวันเป็นรูปแบบสำหรับแผนภูมิ
 * @param {Array} data - ข้อมูลสถิติประจำวัน
 * @returns {Array} - ข้อมูลสำหรับแผนภูมิ
 */
export const formatDailyStatsChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  return data.map(item => ({
    date: item.date,
    logins: item.login_count || 0,
    views: item.view_count || 0,
    projects: item.project_count || 0,
    reviews: item.review_count || 0
  }));
};

/**
 * แปลงข้อมูลประวัติการเข้าสู่ระบบเป็นรูปแบบสำหรับตาราง
 * @param {Array} data - ข้อมูลประวัติการเข้าสู่ระบบ
 * @returns {Array} - ข้อมูลสำหรับตาราง
 */
export const formatLoginLogsTableData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  return data.map((item, index) => ({
    key: item.log_id || index,
    user_id: item.user_id,
    username: item.username,
    full_name: item.full_name,
    login_time: new Date(item.login_time).toLocaleString('th-TH'),
    ip_address: item.ip_address,
    user_agent: item.user_agent,
    status: item.status,
    details: item.details
  }));
};

export default {
  getLoginLogs,
  getCompanyViews,
  getVisitorViews,
  getProjectReviews,
  getSystemStats,
  getDailyStats,
  formatDailyStatsChartData,
  formatLoginLogsTableData
};