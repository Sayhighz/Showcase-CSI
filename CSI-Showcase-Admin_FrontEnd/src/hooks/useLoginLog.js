// src/hooks/useLoginLog.js
import { useState, useEffect, useCallback } from 'react';
import { getLoginLogs } from '../services/logService';
import { formatThaiDate } from '../utils/dataUtils';
import useDebounce from './useDebounce';

/**
 * Custom hook สำหรับจัดการประวัติการเข้าสู่ระบบ
 * @param {Object} initialFilters - ตัวกรองข้อมูลเริ่มต้น
 * @returns {Object} - สถานะและฟังก์ชันสำหรับจัดการประวัติการเข้าสู่ระบบ
 */
const useLoginLog = (initialFilters = {}) => {
  // สถานะสำหรับจัดเก็บข้อมูล
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // สถานะสำหรับจัดเก็บตัวกรองข้อมูล
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: null,
    endDate: null,
    ...initialFilters
  });

  // ใช้ debounce สำหรับการค้นหาเพื่อลดการเรียก API บ่อยเกินไป
  const debouncedSearch = useDebounce(filters.search, 500);
  
  /**
   * โหลดข้อมูลประวัติการเข้าสู่ระบบ
   */
  const fetchLoginLogs = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้าง query params สำหรับส่งไปยัง API
      const queryParams = {
        page,
        limit: pageSize,
        search: debouncedSearch,
        status: filters.status
      };
      
      // เพิ่ม startDate และ endDate ถ้ามีค่า
      if (filters.startDate) {
        queryParams.startDate = filters.startDate.toISOString();
      }
      
      if (filters.endDate) {
        queryParams.endDate = filters.endDate.toISOString();
      }
      
      // เรียกใช้ API service
      const response = await getLoginLogs(queryParams);
      
      if (response.success) {
        // ปรับรูปแบบวันที่ให้เป็นภาษาไทย
        const formattedLogs = response.data.map(log => ({
          ...log,
          login_time: formatThaiDate(log.login_time, { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
          })
        }));
        
        setLogs(formattedLogs);
        setPagination({
          current: page,
          pageSize,
          total: response.total || formattedLogs.length
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error fetching login logs:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status, filters.startDate, filters.endDate]);
  
  // โหลดข้อมูลเมื่อค่าตัวกรองเปลี่ยนแปลง
  useEffect(() => {
    fetchLoginLogs(pagination.current, pagination.pageSize);
  }, [fetchLoginLogs, pagination.current, pagination.pageSize]);
  
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
      status: '',
      startDate: null,
      endDate: null
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
  
  return {
    logs,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    resetFilters,
    handlePaginationChange,
    refresh: fetchLoginLogs
  };
};

export default useLoginLog;