// src/hooks/useLog.js
import { useState, useEffect, useCallback, useRef } from 'react';
import _ from 'lodash';
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
  const [logs, setLogs] = useState([]);
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
  
  // ใช้ ref เพื่อเก็บค่าล่าสุด
  const logTypeRef = useRef(logType);
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);
  const fetchingRef = useRef(false);
  
  // อัพเดต ref เมื่อ state เปลี่ยน
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);
  
  // ใช้ debounce สำหรับการค้นหาเพื่อลดการเรียก API บ่อยเกินไป
  const debouncedSearch = useDebounce(filters.search, 500);
  
  /**
   * โหลดประวัติการเข้าสู่ระบบ
   */
  const fetchLoginLogs = useCallback(
    _.debounce(async (page = 1, pageSize = 10) => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // สร้าง query params
        const queryParams = {
          page,
          limit: pageSize,
          search: debouncedSearch,
          userId: filtersRef.current.userId || undefined,
          startDate: filtersRef.current.startDate || undefined,
          endDate: filtersRef.current.endDate || undefined
        };
        
        const response = await getAllLoginLogs(queryParams);
        
        if (response && response.success) {
            console.log("assdasd",response)
          // ตรวจสอบว่า response.data มีอยู่ และใช้ optional chaining สำหรับการเข้าถึง logs
          const logsData = response?.data || [];
          setLogs(logsData);
          
          // ใช้ lodash ในการเปรียบเทียบก่อนอัพเดต pagination
          const newPagination = {
            current: page,
            pageSize,
            total: response.data?.pagination?.total || logsData.length || 0
          };
          
          if (!_.isEqual(paginationRef.current, newPagination)) {
            setPagination(newPagination);
          }
        } else {
          setError((response && response.message) || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
      } catch (err) {
        console.error('Error fetching login logs:', err);
        setError('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
        setTimeout(() => {
          fetchingRef.current = false;
        }, 300);
      }
    }, 300),
    [debouncedSearch]
  );
  
  /**
   * โหลดประวัติการเข้าชมของผู้เยี่ยมชม
   */
  const fetchVisitorViews = useCallback(
    _.debounce(async (page = 1, pageSize = 10) => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // สร้าง query params
        const queryParams = {
          page,
          limit: pageSize,
          search: debouncedSearch,
          projectId: filtersRef.current.projectId || undefined
        };
        
        const response = await getVisitorViews(queryParams);
        
        if (response && response.success) {
          // ตรวจสอบว่า response.data มีอยู่ และใช้ optional chaining สำหรับการเข้าถึง views
          const viewsData = response.data?.views || [];
          setLogs(viewsData);
          
          // ใช้ lodash ในการเปรียบเทียบก่อนอัพเดต pagination
          const newPagination = {
            current: page,
            pageSize,
            total: response.data?.pagination?.total || viewsData.length || 0
          };
          
          if (!_.isEqual(paginationRef.current, newPagination)) {
            setPagination(newPagination);
          }
        } else {
          setError((response && response.message) || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
      } catch (err) {
        console.error('Error fetching visitor views:', err);
        setError('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าชม กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
        setTimeout(() => {
          fetchingRef.current = false;
        }, 300);
      }
    }, 300),
    [debouncedSearch]
  );
  
  /**
   * โหลดประวัติการตรวจสอบโปรเจค
   */
  const fetchProjectReviews = useCallback(
    _.debounce(async (page = 1, pageSize = 10) => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // สร้าง query params
        const queryParams = {
          page,
          limit: pageSize,
          projectId: filtersRef.current.projectId || undefined,
          status: filtersRef.current.status || undefined,
          adminId: filtersRef.current.adminId || undefined
        };
        
        const response = await getProjectReviews(queryParams);
        
        if (response && response.success) {
          // ตรวจสอบ response.data และเข้าถึง reviews อย่างปลอดภัย
          const reviewsData = response.data?.reviews || response.data || [];
          setLogs(reviewsData);
          
          // ใช้ lodash ในการเปรียบเทียบก่อนอัพเดต pagination
          const newPagination = {
            current: page,
            pageSize,
            total: response.data?.pagination?.total || reviewsData.length || 0
          };
          
          if (!_.isEqual(paginationRef.current, newPagination)) {
            setPagination(newPagination);
          }
        } else {
          setError((response && response.message) || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
      } catch (err) {
        console.error('Error fetching project reviews:', err);
        setError('เกิดข้อผิดพลาดในการโหลดประวัติการตรวจสอบโปรเจค กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
        setTimeout(() => {
          fetchingRef.current = false;
        }, 300);
      }
    }, 300),
    []
  );
  
  /**
   * โหลดสถิติระบบ
   */
  const fetchSystemStats = useCallback(
    _.debounce(async () => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        const response = await getSystemStats();
        
        if (response && response.success) {
          setSystemStats(response.data);
        } else {
          setError((response && response.message) || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
          message.error((response && response.message) || 'ไม่สามารถโหลดสถิติระบบได้');
        }
      } catch (err) {
        console.error('Error fetching system stats:', err);
        setError('เกิดข้อผิดพลาดในการโหลดสถิติระบบ กรุณาลองใหม่อีกครั้ง');
        message.error('เกิดข้อผิดพลาดในการโหลดสถิติระบบ');
      } finally {
        setLoading(false);
        setTimeout(() => {
          fetchingRef.current = false;
        }, 300);
      }
    }, 300),
    []
  );
  
  /**
   * โหลดสถิติประจำวัน
   */
  const fetchDailyStats = useCallback(
    _.debounce(async () => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        const response = await getDailyStats();
        
        if (response && response.success) {
          setDailyStats(response.data);
        } else {
          setError((response && response.message) || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
          message.error((response && response.message) || 'ไม่สามารถโหลดสถิติประจำวันได้');
        }
      } catch (err) {
        console.error('Error fetching daily stats:', err);
        setError('เกิดข้อผิดพลาดในการโหลดสถิติประจำวัน กรุณาลองใหม่อีกครั้ง');
        message.error('เกิดข้อผิดพลาดในการโหลดสถิติประจำวัน');
      } finally {
        setLoading(false);
        setTimeout(() => {
          fetchingRef.current = false;
        }, 300);
      }
    }, 300),
    []
  );
  
  /**
   * โหลดสถิติสำหรับแดชบอร์ด
   */
  const fetchDashboardStats = useCallback(
    _.debounce(async () => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // โหลดทั้งสถิติระบบและสถิติประจำวัน
        const [systemResponse, dailyResponse] = await Promise.all([
          getSystemStats(),
          getDailyStats()
        ]);
        
        if (systemResponse && systemResponse.success && dailyResponse && dailyResponse.success) {
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
        setTimeout(() => {
          fetchingRef.current = false;
        }, 300);
      }
    }, 300),
    []
  );
  
  // ใช้ ref เพื่อติดตามการเรียก fetch ครั้งแรก
  const hasInitialLoadRef = useRef(false);
  
  // โหลดข้อมูลครั้งแรกเมื่อ component mount
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      
      if (logTypeRef.current === 'login') {
        fetchLoginLogs(pagination.current, pagination.pageSize);
      } else if (logTypeRef.current === 'visitor') {
        fetchVisitorViews(pagination.current, pagination.pageSize);
      } else if (logTypeRef.current === 'review') {
        fetchProjectReviews(pagination.current, pagination.pageSize);
      } else if (logTypeRef.current === 'stats') {
        fetchSystemStats();
        fetchDailyStats();
      } else if (logTypeRef.current === 'dashboard') {
        fetchDashboardStats();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // useEffect สำหรับจัดการการเปลี่ยนแปลงของ filters และ pagination
  useEffect(() => {
    // ไม่ทำงานถ้าเป็นโหมด stats หรือ dashboard
    if (logTypeRef.current === 'stats' || logTypeRef.current === 'dashboard') return;
    
    // ใช้ setTimeout เพื่อป้องกันการ fetch บ่อยเกินไป
    const timeoutId = setTimeout(() => {
      if (hasInitialLoadRef.current && !fetchingRef.current) {
        if (logTypeRef.current === 'login') {
          fetchLoginLogs(pagination.current, pagination.pageSize);
        } else if (logTypeRef.current === 'visitor') {
          fetchVisitorViews(pagination.current, pagination.pageSize);
        } else if (logTypeRef.current === 'review') {
          fetchProjectReviews(pagination.current, pagination.pageSize);
        }
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [debouncedSearch, pagination.current, pagination.pageSize]);
  
  /**
   * จัดการการเปลี่ยนแปลงตัวกรอง
   * @param {Object} newFilters - ตัวกรองใหม่
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => {
      // ใช้ lodash ในการเปรียบเทียบก่อนอัพเดต filters
      const updatedFilters = { ...prev, ...newFilters };
      if (_.isEqual(updatedFilters, prev)) {
        return prev;
      }
      return updatedFilters;
    });
    
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
    // ป้องกันการเรียกซ้ำถ้าค่าไม่เปลี่ยน
    if (page === pagination.current && pageSize === pagination.pageSize) {
      return;
    }
    
    setPagination({
      current: page,
      pageSize,
      total: pagination.total
    });
  }, [pagination.current, pagination.pageSize, pagination.total]);
  
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

  /**
   * รีเฟรชข้อมูลล็อก (เรียกจากภายนอก)
   */
  const refreshLogs = useCallback(() => {
    fetchingRef.current = false; // รีเซ็ตป้องกัน flag
    
    if (logTypeRef.current === 'login') {
      fetchLoginLogs(paginationRef.current.current, paginationRef.current.pageSize);
    } else if (logTypeRef.current === 'visitor') {
      fetchVisitorViews(paginationRef.current.current, paginationRef.current.pageSize);
    } else if (logTypeRef.current === 'review') {
      fetchProjectReviews(paginationRef.current.current, paginationRef.current.pageSize);
    } else if (logTypeRef.current === 'stats') {
      fetchSystemStats();
      fetchDailyStats();
    } else if (logTypeRef.current === 'dashboard') {
      fetchDashboardStats();
    }
  }, []);
  
  return {
    // สถานะข้อมูล
    logs,
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
    getPercentChange,
    
    // รีเฟรชข้อมูล
    refreshLogs,
    refreshStats: () => {
      fetchingRef.current = false;
      fetchSystemStats();
      fetchDailyStats();
    }
  };
};

export default useLog;