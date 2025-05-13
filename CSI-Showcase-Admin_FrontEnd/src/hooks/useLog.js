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
    visitorType: '',
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
  // Example for fetchLoginLogs
const fetchLoginLogs = useCallback(
    _.debounce(async (page = 1, pageSize = 10) => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // Build query params from all current filters
        const queryParams = {
          page,
          limit: pageSize,
          ...filtersRef.current
        };
        
        // Remove dateRange as it's already processed to startDate and endDate
        if (queryParams.dateRange) {
          delete queryParams.dateRange;
        }
        
        // Convert any dayjs objects to string format
        if (queryParams.startDate && typeof queryParams.startDate === 'object' && queryParams.startDate.format) {
          queryParams.startDate = queryParams.startDate.format('YYYY-MM-DD');
        }
        
        if (queryParams.endDate && typeof queryParams.endDate === 'object' && queryParams.endDate.format) {
          queryParams.endDate = queryParams.endDate.format('YYYY-MM-DD');
        }
        
        // Remove empty values
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === undefined || queryParams[key] === '') {
            delete queryParams[key];
          }
        });
        
        console.log('Fetching login logs with params:', queryParams);
        
        const response = await getAllLoginLogs(queryParams);
        console.log('Login logs API response:', response);
        
        // Rest of the function remains the same...
        
        if (response && response.success) {
          const logsData = response.data?.logs || [];
          setLogs(logsData);
          
          const paginationData = response.data?.pagination || {};
          
          const newPagination = {
            current: paginationData.currentPage || page,
            pageSize: paginationData.limit || pageSize,
            total: paginationData.totalItems || 0,
            hasNextPage: paginationData.hasNextPage,
            hasPrevPage: paginationData.hasPrevPage,
            totalPages: paginationData.totalPages
          };
          
          if (!_.isEqual(paginationRef.current, newPagination)) {
            setPagination(newPagination);
          }
        } else {
          setError((response && response.message) || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
          message.error((response && response.message) || 'ไม่สามารถโหลดประวัติการเข้าสู่ระบบได้');
        }
      } catch (err) {
        console.error('Error fetching login logs:', err);
        setError('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
        message.error('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าสู่ระบบ');
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
        // สร้าง copy ของ filtersRef.current เพื่อไม่ให้มีการแก้ไขอ้างอิงโดยตรง
        const currentFilters = {...filtersRef.current};
        
        // สร้าง query params จาก filters
        const queryParams = {
          page,
          limit: pageSize,
          ...currentFilters
        };
        
        // จัดการกับ dateRange ให้เป็น startDate และ endDate
        if (queryParams.dateRange) {
          // ตรวจสอบว่า dateRange เป็น array หรือไม่
          if (Array.isArray(queryParams.dateRange) && queryParams.dateRange.length === 2) {
            // แปลง dateRange เป็น startDate และ endDate
            queryParams.startDate = queryParams.dateRange[0].format ? 
              queryParams.dateRange[0].format('YYYY-MM-DD') : 
              queryParams.dateRange[0];
              
            queryParams.endDate = queryParams.dateRange[1].format ? 
              queryParams.dateRange[1].format('YYYY-MM-DD') : 
              queryParams.dateRange[1];
          }
          // ลบ dateRange ออกไป
          delete queryParams.dateRange;
        }
        
        // แปลง dayjs objects เป็น string ถ้าจำเป็น
        if (queryParams.startDate && typeof queryParams.startDate === 'object' && queryParams.startDate.format) {
          queryParams.startDate = queryParams.startDate.format('YYYY-MM-DD');
        }
        
        if (queryParams.endDate && typeof queryParams.endDate === 'object' && queryParams.endDate.format) {
          queryParams.endDate = queryParams.endDate.format('YYYY-MM-DD');
        }
        
        // ลบค่าที่เป็น undefined หรือ empty string ออกจาก queryParams
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === null) {
            delete queryParams[key];
          }
        });
        
        console.log('Fetching visitor views with params:', queryParams);
        
        const response = await getVisitorViews(queryParams);
        console.log('Visitor views API response:', response);
        
        if (response && response.success) {
          const viewsData = response.data?.views || [];
          setLogs(viewsData);
          
          const paginationData = response.data?.pagination || {};
          
          const newPagination = {
            current: paginationData.currentPage || page,
            pageSize: paginationData.limit || pageSize,
            total: paginationData.totalItems || 0,
            hasNextPage: paginationData.hasNextPage,
            hasPrevPage: paginationData.hasPrevPage,
            totalPages: paginationData.totalPages
          };
          
          if (!_.isEqual(paginationRef.current, newPagination)) {
            setPagination(newPagination);
          }
        } else {
          setError((response && response.message) || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
          message.error((response && response.message) || 'ไม่สามารถโหลดประวัติการเข้าชมได้');
        }
      } catch (err) {
        console.error('Error fetching visitor views:', err);
        setError('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าชม กรุณาลองใหม่อีกครั้ง');
        message.error('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าชม');
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
        const queryParams = {
          page,
          limit: pageSize,
          ...filtersRef.current
        };
        
        if (queryParams.dateRange) {
          delete queryParams.dateRange;
        }
        
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === undefined || queryParams[key] === '') {
            delete queryParams[key];
          }
        });
        
        console.log('Fetching project reviews with params:', queryParams);
        
        const response = await getProjectReviews(queryParams);
        console.log('Project reviews API response:', response);
        
        if (response && response.success) {
          const reviewsData = response.data?.reviews || [];
          setLogs(reviewsData);
          
          const paginationData = response.data?.pagination || {};
          
          const newPagination = {
            current: paginationData.currentPage || page,
            pageSize: paginationData.limit || pageSize,
            total: paginationData.totalItems || 0,
            hasNextPage: paginationData.hasNextPage,
            hasPrevPage: paginationData.hasPrevPage,
            totalPages: paginationData.totalPages
          };
          
          if (!_.isEqual(paginationRef.current, newPagination)) {
            setPagination(newPagination);
          }
        } else {
          setError((response && response.message) || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
          message.error((response && response.message) || 'ไม่สามารถโหลดประวัติการตรวจสอบโปรเจคได้');
        }
      } catch (err) {
        console.error('Error fetching project reviews:', err);
        setError('เกิดข้อผิดพลาดในการโหลดประวัติการตรวจสอบโปรเจค กรุณาลองใหม่อีกครั้ง');
        message.error('เกิดข้อผิดพลาดในการโหลดประวัติการตรวจสอบโปรเจค');
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
          // รับข้อมูลจาก response ซึ่งมีโครงสร้างตรงกับที่ต้องการแล้ว
          const statsData = response.data;
          
          // ตรวจสอบความถูกต้องของข้อมูลก่อนตั้งค่า state
          if (statsData) {
            setSystemStats({
              totalLogins: statsData.totalLogins || 0,
              totalViews: statsData.totalViews || 0,
              loginsByDay: statsData.loginsByDay || [],
              viewsByDay: statsData.viewsByDay || [],
              projectsByDay: statsData.projectsByDay || [],
              usersByDay: statsData.usersByDay || [],
              reviewsByDay: statsData.reviewsByDay || [],
              reviewsByStatus: statsData.reviewsByStatus || []
            });
          } else {
            setError('ข้อมูลสถิติไม่ถูกต้อง');
            message.error('ข้อมูลสถิติไม่ถูกต้อง');
          }
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
          
          // เก็บข้อมูลดิบไว้สำหรับการใช้งานอื่นๆ
          setSystemStats(systemResponse.data);
          setDailyStats(dailyResponse.data);
        } else {
          const errorMessage = (systemResponse && !systemResponse.success ? systemResponse.message : '') || 
                             (dailyResponse && !dailyResponse.success ? dailyResponse.message : '') || 
                             'เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ';
          
          setError(errorMessage);
          message.error(errorMessage || 'ไม่สามารถโหลดข้อมูลสถิติได้');
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
    
    console.log('Pagination or search changed:', pagination.current, pagination.pageSize, debouncedSearch);
    
    // ใช้ setTimeout เพื่อป้องกันการ fetch บ่อยเกินไป
    const timeoutId = setTimeout(() => {
      if (hasInitialLoadRef.current && !fetchingRef.current) {
        if (logTypeRef.current === 'login') {
          console.log('Fetching login logs with page:', pagination.current);
          fetchLoginLogs(pagination.current, pagination.pageSize);
        } else if (logTypeRef.current === 'visitor') {
          console.log('Fetching visitor views with page:', pagination.current);
          fetchVisitorViews(pagination.current, pagination.pageSize);
        } else if (logTypeRef.current === 'review') {
          console.log('Fetching project reviews with page:', pagination.current);
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
  // แก้ไขส่วนของ handleFilterChange ใน useLog.js
const handleFilterChange = useCallback((newFilters) => {
    console.log('Filter change triggered:', newFilters);
    
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      console.log('Updated filters:', updatedFilters);
      return updatedFilters;
    });
    
    // รีเซ็ตหน้าเมื่อมีการเปลี่ยนแปลงตัวกรอง
    setPagination(prev => ({ ...prev, current: 1 }));
    
    // เพิ่มการเรียก fetch ข้อมูลทันทีหลังจาก filter เปลี่ยน
    setTimeout(() => {
      console.log('Fetching after filter change...');
      if (logTypeRef.current === 'login') {
        fetchLoginLogs(1, paginationRef.current.pageSize);
      } else if (logTypeRef.current === 'visitor') {
        fetchVisitorViews(1, paginationRef.current.pageSize);
      } else if (logTypeRef.current === 'review') {
        fetchProjectReviews(1, paginationRef.current.pageSize);
      }
    }, 0);
  }, [fetchLoginLogs, fetchVisitorViews, fetchProjectReviews]);
  /**
   * รีเซ็ตตัวกรองทั้งหมด
   */
  // 1. First, modify the handleReset function in LogFilterForm.js:

// Change this function in LogFilterForm.js
const handleReset = () => {
    form.resetFields();
    
    if (onReset) {
      // Call onReset callback to trigger data refresh
      onReset();
    }
  };
  
  // 2. Next, modify the resetFilters function in useLog.js:
  
  // Change this function in useLog.js
  const resetFilters = useCallback(() => {
    console.log('Resetting filters');
    
    // Clear all filters with empty values
    const emptyFilters = {
      search: '',
      userId: '',
      projectId: '',
      status: '',
      adminId: '',
      startDate: '',
      endDate: '',
      visitorType: '',
      dateRange: null
    };
    
    // Update filters state with empty values
    setFilters(emptyFilters);
    
    // Also update the ref to ensure immediate access to updated values
    filtersRef.current = emptyFilters;
    
    // Reset pagination to first page
    setPagination(prev => ({ ...prev, current: 1 }));
    
    // Force a data fetch with the reset filters
    setTimeout(() => {
      console.log('Fetching after filter reset...');
      fetchingRef.current = false; // Reset fetching lock to ensure fetch happens
      
      if (logTypeRef.current === 'login') {
        fetchLoginLogs(1, pagination.pageSize);
      } else if (logTypeRef.current === 'visitor') {
        fetchVisitorViews(1, pagination.pageSize);
      } else if (logTypeRef.current === 'review') {
        fetchProjectReviews(1, pagination.pageSize);
      }
    }, 100); // Using a slightly longer timeout to ensure state updates complete
  }, [fetchLoginLogs, fetchVisitorViews, fetchProjectReviews, pagination.pageSize]);
  
  /**
   * จัดการการเปลี่ยนแปลงการแบ่งหน้า
   * ฟังก์ชันนี้จะถูกเรียกจาก Table component ของ Ant Design
   * @param {Object} tablePagination - ข้อมูลการแบ่งหน้าจาก Table
   * @param {Object} tableFilters - ข้อมูลตัวกรองจาก Table (ไม่ใช่ state filters)
   * @param {Object} sorter - ข้อมูลการเรียงลำดับจาก Table
   */
  const handlePaginationChange = useCallback((tablePagination, tableFilters, sorter) => {
    // ดึงค่า page และ pageSize จาก tablePagination
    const { current, pageSize } = tablePagination;
    
    console.log('handlePaginationChange', current, pageSize, tablePagination);
    
    // ป้องกันการเรียกซ้ำถ้าค่าไม่เปลี่ยน
    if (current === pagination.current && pageSize === pagination.pageSize) {
      return;
    }
    
    // อัพเดต pagination ใน state
    setPagination(prev => ({
      ...prev,
      current,
      pageSize
    }));
  }, [pagination.current, pagination.pageSize]);
  
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
    console.log('Refreshing logs');
    
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