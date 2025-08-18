// src/hooks/useUser.js
import { useState, useEffect, useCallback, useRef } from 'react';
import _ from 'lodash';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserStats,
  importUsersFromCSV,
  downloadCSVTemplate
} from '../services/userService';
import { message } from 'antd';

// Custom debounce hook implementation
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up on value change or unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook สำหรับจัดการข้อมูลผู้ใช้งาน
 * @param {string} role - บทบาทของผู้ใช้ที่ต้องการดึงข้อมูล ('admin', 'student', 'all')
 * @param {string} mode - โหมดการแสดงผล ('list', 'detail')
 * @param {Object} initialFilters - ตัวกรองข้อมูลเริ่มต้น
 * @param {string|number} userId - รหัสผู้ใช้ (สำหรับโหมด 'detail')
 * @returns {Object} - สถานะและฟังก์ชันสำหรับจัดการข้อมูลผู้ใช้
 */
const useUser = (role = 'all', mode = 'list', initialFilters = {}, userId = null) => {
  // สถานะสำหรับจัดเก็บข้อมูล
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  
  // สถานะสำหรับตัวกรองข้อมูล
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    ...initialFilters
  });
  
  // สถานะสำหรับการแบ่งหน้า
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // ใช้ ref สำหรับเก็บค่าล่าสุด
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);
  const fetchingRef = useRef(false);
  const initialModeRef = useRef(mode);
  const initialUserIdRef = useRef(userId);
  
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
   * โหลดข้อมูลผู้ใช้ทั้งหมด
   */
  const fetchUsers = useCallback(
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
          status: filtersRef.current.status
        };
        
        // กำหนดบทบาทถ้าไม่ใช่ 'all'
        if (role !== 'all') {
          queryParams.role = role;
        }
        
        const response = await getAllUsers(queryParams);
        // console.log(response)
        
        if (response.success) {
          // ตรวจสอบว่า response.data เป็น array หรือไม่
          const usersData = Array.isArray(response.data) ? response.data : [];
          setUsers(usersData);
          
          // อัปเดต pagination จาก response
          const newPagination = {
            current: parseInt(page),
            pageSize: parseInt(pageSize),
            total: response.pagination?.total || usersData.length || 0
          };
          
          setPagination(newPagination);
        } else {
          setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
          setUsers([]); // ตั้งค่าเป็น empty array เมื่อเกิดข้อผิดพลาด
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง');
        setUsers([]); // ตั้งค่าเป็น empty array เมื่อเกิดข้อผิดพลาด
      } finally {
        setLoading(false);
        setTimeout(() => {
          fetchingRef.current = false;
        }, 300);
      }
    }, 300),
    [debouncedSearch, role]
  );
  
  /**
   * โหลดข้อมูลผู้ใช้ตาม ID
   */
  const fetchUserDetails = useCallback(
    _.debounce(async (id) => {
      if (!id || fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        const response = await getUserById(id);
        
        if (response.success) {
          setUserDetails(response.data || null);
        } else {
          setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
          setUserDetails(null);
        }
      } catch (err) {
        console.error(`Error fetching user ${id}:`, err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง');
        setUserDetails(null);
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
   * โหลดสถิติผู้ใช้งาน
   */
  const fetchUserStats = useCallback(
    _.debounce(async () => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      
      try {
        const response = await getUserStats();
        console.log(response)
        
        if (response.success) {
          setStats(response.data || null);
        } else {
          message.error(response.message || 'ไม่สามารถโหลดข้อมูลสถิติได้');
          setStats(null);
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
        message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ');
        setStats(null);
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
      
      if (initialModeRef.current === 'detail' && initialUserIdRef.current) {
        fetchUserDetails(initialUserIdRef.current);
      } else if (initialModeRef.current === 'stats') {
        fetchUserStats();
      } else {
        fetchUsers(pagination.current, pagination.pageSize);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // useEffect สำหรับจัดการการเปลี่ยนแปลงของ filters
  useEffect(() => {
    // ไม่ทำงานถ้าเป็นโหมด detail หรือ stats
    if (initialModeRef.current === 'detail' || initialModeRef.current === 'stats') return;
    
    // ไม่ทำงานถ้ายังไม่ได้ initial load หรือกำลัง fetch อยู่
    if (!hasInitialLoadRef.current || fetchingRef.current) return;
    
    // ใช้ setTimeout เพื่อป้องกันการ fetch บ่อยเกินไป
    const timeoutId = setTimeout(() => {
      if (!fetchingRef.current) {
        // รีเซ็ตหน้าเป็น 1 เมื่อมีการเปลี่ยนแปลง filter
        const pageSize = pagination.pageSize || 10;
        fetchUsers(1, pageSize);
        setPagination(prev => ({ ...prev, current: 1 }));
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [debouncedSearch, filters.status, fetchUsers, pagination.pageSize]);
  
  /**
   * จัดการการเปลี่ยนแปลงตัวกรอง
   * @param {Object} newFilters - ตัวกรองใหม่
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => {
      // ใช้ lodash ในการเปรียบเทียบก่อนอัพเดต
      if (_.isEqual({ ...prev, ...newFilters }, prev)) {
        return prev;
      }
      return { ...prev, ...newFilters };
    });
  }, []);
  
  /**
   * รีเซ็ตตัวกรองทั้งหมด
   */
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: ''
    });
  }, []);
  
  /**
   * จัดการการเปลี่ยนแปลงการแบ่งหน้า
   * @param {number} page - หน้าที่ต้องการ
   * @param {number} pageSize - จำนวนรายการต่อหน้า
   */
  const handlePaginationChange = useCallback((page, pageSize) => {
    // รีเซ็ต fetchingRef เพื่อให้สามารถเรียกข้อมูลใหม่ได้
    fetchingRef.current = false;
    
    // อัปเดต pagination และเรียกข้อมูลใหม่
    setPagination(prev => ({
      ...prev,
      current: page || 1,
      pageSize: pageSize || 10
    }));
    
    // เรียกข้อมูลใหม่ตามหน้าที่เลือก
    fetchUsers(page, pageSize);
  }, [fetchUsers]);
  
  /**
   * สร้างผู้ใช้ใหม่
   * @param {Object|FormData} userData - ข้อมูลผู้ใช้
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const createUserAction = useCallback(async (userData) => {
    if (actionLoading) return false;
    
    setActionLoading(true);
    
    try {
      // ตรวจสอบและแปลงข้อมูลเป็น FormData ถ้าจำเป็น
      let formData = userData;
      if (!(userData instanceof FormData)) {
        formData = new FormData();
        Object.keys(userData).forEach(key => {
          if (userData[key] !== undefined && userData[key] !== null) {
            formData.append(key, userData[key]);
          }
        });
      }
      
      const response = await createUser(formData);
      
      if (response.success) {
        message.success(response.message || 'สร้างผู้ใช้สำเร็จ');
        
        // รีเฟรชข้อมูล
        fetchingRef.current = false;
        fetchUsers(1, paginationRef.current.pageSize);
        setPagination(prev => ({ ...prev, current: 1 }));
        
        return true;
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้');
        return false;
      }
    } catch (err) {
      console.error('Error creating user:', err);
      message.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้ กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, fetchUsers]);
  
  /**
   * อัปเดตข้อมูลผู้ใช้
   * @param {string|number} id - รหัสผู้ใช้
   * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการอัปเดต
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const updateUserAction = useCallback(async (id, userData) => {
    if (actionLoading) return false;
    
    setActionLoading(true);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสผู้ใช้');
        return false;
      }
      
      const response = await updateUser(id, userData);
      
      if (response.success) {
        message.success(response.message || 'อัปเดตข้อมูลผู้ใช้สำเร็จ');
        
        // รีเฟรชข้อมูล
        fetchingRef.current = false;
        
        if (initialModeRef.current === 'detail') {
          fetchUserDetails(id);
        } else {
          fetchUsers(paginationRef.current.current, paginationRef.current.pageSize);
        }
        
        return true;
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้');
        return false;
      }
    } catch (err) {
      console.error(`Error updating user ${id}:`, err);
      message.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, fetchUserDetails, fetchUsers]);
  
  /**
   * ลบผู้ใช้
   * @param {string|number} id - รหัสผู้ใช้
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const deleteUserAction = useCallback(async (id) => {
    if (actionLoading) return false;
    
    setActionLoading(true);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสผู้ใช้');
        return false;
      }
      
      const response = await deleteUser(id);
      
      if (response.success) {
        message.success(response.message || 'ลบผู้ใช้สำเร็จ');
        
        // รีเฟรชข้อมูล
        fetchingRef.current = false;
        fetchUsers(1, paginationRef.current.pageSize);
        setPagination(prev => ({ ...prev, current: 1 }));
        
        return true;
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
        return false;
      }
    } catch (err) {
      console.error(`Error deleting user ${id}:`, err);
      message.error('เกิดข้อผิดพลาดในการลบผู้ใช้ กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, fetchUsers]);
  
    /**
   * นำเข้าผู้ใช้จากไฟล์ CSV
   * @param {FormData} formData - FormData ที่มีไฟล์ CSV
   * @returns {Promise<Object>} - ผลลัพธ์การนำเข้าผู้ใช้
   */
    const importUsersAction = useCallback(async (formData) => {
      if (importLoading) return { success: false };
      
      setImportLoading(true);
      
      try {
        const response = await importUsersFromCSV(formData);
        
        if (response.success) {
          // รีเฟรชข้อมูล
          fetchingRef.current = false;
          fetchUsers(1, paginationRef.current.pageSize);
          setPagination(prev => ({ ...prev, current: 1 }));
        }
        
        return response;
      } catch (err) {
        console.error('Error importing users from CSV:', err);
        return {
          success: false,
          message: 'เกิดข้อผิดพลาดในการนำเข้าผู้ใช้จากไฟล์ CSV'
        };
      } finally {
        setImportLoading(false);
      }
    }, [importLoading, fetchUsers]);
    
    /**
     * ดาวน์โหลดเทมเพลต CSV สำหรับการนำเข้าผู้ใช้
     * @returns {Promise<Object>} - ผลลัพธ์การดาวน์โหลด
     */
    const downloadCSVTemplateAction = useCallback(async () => {
      try {
        const response = await downloadCSVTemplate();
        return response;
      } catch (err) {
        console.error('Error downloading CSV template:', err);
        message.error('เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต CSV');
        return {
          success: false,
          message: 'เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต CSV'
        };
      }
    }, []);


  return {
    // สถานะข้อมูล
    users,
    userDetails,
    stats,
    loading,
    error,
    actionLoading,
    pagination,
    filters,
    importLoading,
    
    // การจัดการตัวกรอง
    handleFilterChange,
    resetFilters,
    
    // การแบ่งหน้า
    handlePaginationChange,
    
    importUsers: importUsersAction,
    downloadCSVTemplate: downloadCSVTemplateAction,
    
    // การดำเนินการกับผู้ใช้
    createUser: createUserAction,
    updateUser: updateUserAction,
    deleteUser: deleteUserAction,
    
    // รีเฟรชข้อมูล
    refreshUsers: () => {
      fetchingRef.current = false;
      fetchUsers(paginationRef.current.current, paginationRef.current.pageSize);
    },
    refreshUserDetails: () => {
      fetchingRef.current = false;
      fetchUserDetails(initialUserIdRef.current);
    },
    refreshUserStats: () => {
      fetchingRef.current = false;
      fetchUserStats();
    }
  };
};

export default useUser;