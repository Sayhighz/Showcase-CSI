// src/services/loginLogService.js
import { axiosGet } from '../lib/axios';
import { LOGS } from '../constants/apiEndpoints';
import { formatThaiDate } from '../utils/dataUtils';

/**
 * ดึงข้อมูลประวัติการเข้าสู่ระบบพร้อมกับตัวกรอง
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลประวัติการเข้าสู่ระบบ
 */
export const getLoginLogs = async (filters = {}) => {
  try {
    // สร้าง query string จาก filters
    const queryParams = new URLSearchParams();
    
    if (filters.search) {
      queryParams.append('search', filters.search);
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
    
    if (filters.userId) {
      queryParams.append('user_id', filters.userId);
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
 * ดึงข้อมูลสถิติการเข้าสู่ระบบ
 * @param {Object} filters - ตัวกรองข้อมูล
 * @returns {Promise<Object>} - ข้อมูลสถิติการเข้าสู่ระบบ
 */
export const getLoginStats = async (filters = {}) => {
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
    
    // คำนวณสถิติเพิ่มเติมจากข้อมูลที่ได้
    const statsData = response.data || [];
    
    // รวมจำนวนการเข้าสู่ระบบทั้งหมด
    const totalLogins = statsData.reduce((total, day) => total + (day.login_count || 0), 0);
    
    // จำนวนการเข้าสู่ระบบสำเร็จ
    const successLogins = statsData.reduce((total, day) => total + (day.success_count || 0), 0);
    
    // จำนวนการเข้าสู่ระบบล้มเหลว
    const failedLogins = statsData.reduce((total, day) => total + (day.failed_count || 0), 0);
    
    // จำนวนการเข้าสู่ระบบวันนี้
    const today = new Date().toISOString().split('T')[0];
    const todayData = statsData.find(day => day.date === today);
    const todayLogins = todayData ? todayData.login_count || 0 : 0;
    
    // อัตราการเข้าสู่ระบบสำเร็จ
    const successRate = totalLogins > 0 ? (successLogins / totalLogins) * 100 : 0;
    
    // จัดรูปแบบข้อมูลสำหรับแผนภูมิ
    const chartData = statsData.map(day => ({
      date: formatThaiDate(day.date, { dateStyle: 'short' }),
      successLogins: day.success_count || 0,
      failedLogins: day.failed_count || 0,
      totalLogins: day.login_count || 0
    }));
    
    return {
      success: true,
      data: chartData,
      stats: {
        totalLogins,
        successLogins,
        failedLogins,
        todayLogins,
        successRate
      }
    };
  } catch (error) {
    console.error('Get login stats error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงสถิติการเข้าสู่ระบบ',
      data: [],
      stats: {}
    };
  }
};

export default {
  getLoginLogs,
  getLoginStats
};