// src/hooks/useLog.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getAllLoginLogs, 
  getVisitorViews, 
  getProjectReviews, 
  getSystemStats, 
  getDailyStats,
  formatDailyTrendsChartData,
  formatViewsChartData,
  calculatePercentChange,
  formatDashboardStats
} from '../services/adminLogService';
import { message } from 'antd';
import useDebounce from './useDebounce';

/**
 * Custom hook สำหรับจัดการข้อมูลประวัติและสถิติระบบ
 * @param {string} logType - ประเภทของ log ('login', 'visitor', 'review', 'stats', 'dashboard')
 * @param {Object} initialFilters - ตัวกรองข้อมูลเริ่มต้น
 * @returns {Object} - สถานะและฟังก์ชันสำหรับจัดการข้อมูลประวัติและสถิติ
 */
const useLog = (logType = 'login', initialFilters = {}) => {
  // สถานะสำหรับจัดเก็บข้อมูล
  const [loginLogs, setLoginLogs] = useState([]);
  const [visitorViews, setVisitorViews] = useState([]);
  const [projectReviews, setProjectReviews] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // สถานะสำหรับตัวกรองข้อมูล
  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    projectId: '',
    status: '',
    adminId: '',
    startDate: '',
    endDate: '',
    ...initialFilters
  });
  
  // สถานะสำหรับการแบ่งหน้า
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // ใช้ debounce สำหรับการค้นหาเพื่อลดการเรียก API บ่อยเกินไป
  const debouncedSearch = useDebounce(filters.search, 500);
  
  /**
   * โหลดประวัติการเข้าสู่ระบบ
   */
  const fetchLoginLogs = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้าง query params
      const queryParams = {
        page,
        limit: pageSize,
        search: debouncedSearch,
        userId: filters.userId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };
      
      const response = await getAllLoginLogs(queryParams);
      
      if (response.success) {
        setLoginLogs(response.data.logs || []);
        setPagination({
          current: page,
          pageSize,
          total: response.data.pagination?.total || response.data.logs?.length || 0
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error fetching login logs:', err);
      setError('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.userId, filters.startDate, filters.endDate]);
  
  /**
   * โหลดประวัติการเข้าชมของผู้เยี่ยมชม
   */
  const fetchVisitorViews = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้าง query params
      const queryParams = {
        page,
        limit: pageSize,
        search: debouncedSearch,
        projectId: filters.projectId || undefined
      };
      
      const response = await getVisitorViews(queryParams);
      
      if (response.success) {
        setVisitorViews(response.data.views || []);
        setPagination({
          current: page,
          pageSize,
          total: response.data.pagination?.total || response.data.views?.length || 0
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error fetching visitor views:', err);
      setError('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าชม กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.projectId]);
  
  /**
   * โหลดประวัติการตรวจสอบโปรเจค
   */
  const fetchProjectReviews = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้าง query params
      const queryParams = {
        page,
        limit: pageSize,
        projectId: filters.projectId || undefined,
        status: filters.status || undefined,
        adminId: filters.adminId || undefined
      };
      
      const response = await getProjectReviews(queryParams);
      
      if (response.success) {
        setProjectReviews(response.data.reviews || []);
        setPagination({
          current: page,
          pageSize,
          total: response.data.pagination?.total || response.data.reviews?.length || 0
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error fetching project reviews:', err);
      setError('เกิดข้อผิดพลาดในการโหลดประวัติการตรวจสอบโปรเจค กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [filters.projectId, filters.status, filters.adminId]);
  
  /**
   * โหลดสถิติระบบ
   */
  const fetchSystemStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSystemStats();
      
      if (response.success) {
        setSystemStats(response.data);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        message.error(response.message || 'ไม่สามารถโหลดสถิติระบบได้');
      }
    } catch (err) {
      console.error('Error fetching system stats:', err);
      setError('เกิดข้อผิดพลาดในการโหลดสถิติระบบ กรุณาลองใหม่อีกครั้ง');
      message.error('เกิดข้อผิดพลาดในการโหลดสถิติระบบ');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * โหลดสถิติประจำวัน
   */
  const fetchDailyStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDailyStats();
      
      if (response.success) {
        setDailyStats(response.data);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        message.error(response.message || 'ไม่สามารถโหลดสถิติประจำวันได้');
      }
    } catch (err) {
      console.error('Error fetching daily stats:', err);
      setError('เกิดข้อผิดพลาดในการโหลดสถิติประจำวัน กรุณาลองใหม่อีกครั้ง');
      message.error('เกิดข้อผิดพลาดในการโหลดสถิติประจำวัน');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * โหลดสถิติสำหรับแดชบอร์ด
   */
  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // โหลดทั้งสถิติระบบและสถิติประจำวัน
      const [systemResponse, dailyResponse] = await Promise.all([
        getSystemStats(),
        getDailyStats()
      ]);
      
      if (systemResponse.success && dailyResponse.success) {
        // รวมข้อมูลและแปลงให้อยู่ในรูปแบบที่ใช้งานได้
        const combinedData = {
          ...systemResponse.data,
          dailyStats: dailyResponse.data
        };
        
        const formattedStats = formatDashboardStats(combinedData);
        setDashboardStats(formattedStats);
      } else {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ');
        message.error('ไม่สามารถโหลดข้อมูลสถิติได้');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ กรุณาลองใหม่อีกครั้ง');
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // โหลดข้อมูลเมื่อตัวแปรที่เกี่ยวข้องเปลี่ยนแปลง
  useEffect(() => {
    if (logType === 'login') {
      fetchLoginLogs(pagination.current, pagination.pageSize);
    } else if (logType === 'visitor') {
      fetchVisitorViews(pagination.current, pagination.pageSize);
    } else if (logType === 'review') {
      fetchProjectReviews(pagination.current, pagination.pageSize);
    } else if (logType === 'stats') {
      fetchSystemStats();
      fetchDailyStats();
    } else if (logType === 'dashboard') {
      fetchDashboardStats();
    }
  }, [
    logType,
    fetchLoginLogs,
    fetchVisitorViews,
    fetchProjectReviews,
    fetchSystemStats,
    fetchDailyStats,
    fetchDashboardStats,
    pagination.current,
    pagination.pageSize,
    debouncedSearch
  ]);
  
  /**
   * จัดการการเปลี่ยนแปลงตัวกรอง
   * @param {Object} newFilters - ตัวกรองใหม่
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // รีเซ็ตหน้าเมื่อมีการเปลี่ยนแปลงตัวกรอง
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);
  
  /**
   * รีเซ็ตตัวกรองทั้งหมด
   */
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      userId: '',
      projectId: '',
      status: '',
      adminId: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);
  
  /**
   * จัดการการเปลี่ยนแปลงการแบ่งหน้า
   * @param {number} page - หน้าที่ต้องการ
   * @param {number} pageSize - จำนวนรายการต่อหน้า
   */
  const handlePaginationChange = useCallback((page, pageSize) => {
    setPagination({
      current: page,
      pageSize,
      total: pagination.total
    });
  }, [pagination.total]);
  
  /**
   * แปลงข้อมูลสำหรับกราฟแนวโน้มการเข้าใช้งานรายวัน
   * @returns {Array} - ข้อมูลที่พร้อมสำหรับการแสดงผลในกราฟ
   */
  const getDailyTrendsChartData = useCallback(() => {
    return formatDailyTrendsChartData(dailyStats);
  }, [dailyStats]);
  
  /**
   * แปลงข้อมูลสำหรับกราฟการเข้าชมโปรเจค
   * @returns {Array} - ข้อมูลที่พร้อมสำหรับการแสดงผลในกราฟ
   */
  const getViewsChartData = useCallback(() => {
    return formatViewsChartData(systemStats);
  }, [systemStats]);
  
  /**
   * คำนวณอัตราการเปลี่ยนแปลงจากข้อมูล
   * @param {number} current - ค่าปัจจุบัน
   * @param {number} previous - ค่าก่อนหน้า
   * @returns {number} - อัตราการเปลี่ยนแปลงเป็นเปอร์เซ็นต์
   */
  const getPercentChange = useCallback((current, previous) => {
    return calculatePercentChange(current, previous);
  }, []);
  
  return {
    // สถานะข้อมูล
    loginLogs,
    visitorViews,
    projectReviews,
    systemStats,
    dailyStats,
    dashboardStats,
    loading,
    error,
    pagination,
    filters,
    
    // การจัดการตัวกรอง
    handleFilterChange,
    resetFilters,
    
    // การแบ่งหน้า
    handlePaginationChange,
    
    // ฟังก์ชันสำหรับโหลดข้อมูล
    fetchLoginLogs,
    fetchVisitorViews,
    fetchProjectReviews,
    fetchSystemStats,
    fetchDailyStats,
    fetchDashboardStats,
    
    // ฟังก์ชันสำหรับแปลงข้อมูล
    getDailyTrendsChartData,
    getViewsChartData,
    getPercentChange
  };
};

export default useLog;