// src/hooks/useUser.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getAllUsers, 
  getUserById, 
  createUserWithImage, 
  updateUser, 
  deleteUser,
  getUserLoginHistory,
  uploadProfileImage
} from '../services/userService';
import { message } from 'antd';
import useDebounce from './useDebounce';

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
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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
  
  // ใช้ debounce สำหรับการค้นหาเพื่อลดการเรียก API บ่อยเกินไป
  const debouncedSearch = useDebounce(filters.search, 500);
  
  /**
   * โหลดข้อมูลผู้ใช้ทั้งหมด
   */
  const fetchUsers = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้าง query params
      const queryParams = {
        page,
        limit: pageSize,
        search: debouncedSearch,
        status: filters.status
      };
      
      // กำหนดบทบาทถ้าไม่ใช่ 'all'
      if (role !== 'all') {
        queryParams.role = role;
      }
      
      const response = await getAllUsers(queryParams);
      
      if (response.success) {
        setUsers(response.data.users);
        console.log(response.data)
        setPagination({
          current: page,
          pageSize,
          total: response.total || response.data.length
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status, role]);
  
  /**
   * โหลดข้อมูลผู้ใช้ตาม ID
   */
  const fetchUserDetails = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUserById(id);
      
      if (response.success) {
        setUserDetails(response.data);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
      }
    } catch (err) {
      console.error(`Error fetching user ${id}:`, err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * โหลดประวัติการเข้าสู่ระบบของผู้ใช้
   */
  const fetchLoginHistory = useCallback(async (id, page = 1, pageSize = 10) => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      const response = await getUserLoginHistory(id, {
        page,
        limit: pageSize
      });
      
      if (response.success) {
        setLoginHistory(response.data);
      } else {
        message.error(response.message || 'ไม่สามารถโหลดประวัติการเข้าสู่ระบบได้');
      }
    } catch (err) {
      console.error(`Error fetching login history for user ${id}:`, err);
      message.error('เกิดข้อผิดพลาดในการโหลดประวัติการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // โหลดข้อมูลเมื่อตัวแปรที่เกี่ยวข้องเปลี่ยนแปลง
  useEffect(() => {
    if (mode === 'detail' && userId) {
      fetchUserDetails(userId);
      // โหลดประวัติการเข้าสู่ระบบเฉพาะเมื่ออยู่ในโหมด detail
      fetchLoginHistory(userId);
    } else {
      fetchUsers(pagination.current, pagination.pageSize);
    }
  }, [
    mode, 
    userId, 
    fetchUserDetails, 
    fetchLoginHistory, 
    fetchUsers, 
    pagination.current, 
    pagination.pageSize
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
      status: ''
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
   * สร้างผู้ใช้ใหม่
   * @param {Object} userData - ข้อมูลผู้ใช้
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const createUserAction = useCallback(async (userData) => {
    setActionLoading(true);
    
    try {
      const response = await createUserWithImage(userData);
      
      if (response.success) {
        message.success('สร้างผู้ใช้สำเร็จ');
        
        // รีเฟรชข้อมูล
        fetchUsers(pagination.current, pagination.pageSize);
        
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
  }, [fetchUsers, pagination]);
  
  /**
   * อัปเดตข้อมูลผู้ใช้
   * @param {string|number} id - รหัสผู้ใช้
   * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการอัปเดต
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const updateUserAction = useCallback(async (id, userData) => {
    setActionLoading(true);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสผู้ใช้');
        return false;
      }
      
      const response = await updateUser(id, userData);
      
      if (response.success) {
        message.success('อัปเดตข้อมูลผู้ใช้สำเร็จ');
        
        // รีเฟรชข้อมูล
        if (mode === 'detail') {
          fetchUserDetails(id);
        } else {
          fetchUsers(pagination.current, pagination.pageSize);
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
  }, [mode, fetchUserDetails, fetchUsers, pagination]);
  
  /**
   * ลบผู้ใช้
   * @param {string|number} id - รหัสผู้ใช้
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const deleteUserAction = useCallback(async (id) => {
    setActionLoading(true);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสผู้ใช้');
        return false;
      }
      
      const response = await deleteUser(id);
      
      if (response.success) {
        message.success('ลบผู้ใช้สำเร็จ');
        
        // รีเฟรชข้อมูล
        fetchUsers(pagination.current, pagination.pageSize);
        
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
  }, [fetchUsers, pagination]);
  
  /**
   * อัปโหลดรูปโปรไฟล์
   * @param {string|number} id - รหัสผู้ใช้
   * @param {FormData} formData - ข้อมูลรูปภาพ
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const uploadProfileImageAction = useCallback(async (id, formData) => {
    setActionLoading(true);
    setUploadProgress(0);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสผู้ใช้');
        return false;
      }
      
      if (!formData || !(formData instanceof FormData)) {
        message.error('ข้อมูลไม่ถูกต้อง');
        return false;
      }
      
      // ฟังก์ชันติดตามความคืบหน้า
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };
      
      const response = await uploadProfileImage(id, formData, onProgress);
      
      if (response.success) {
        message.success('อัปโหลดรูปโปรไฟล์สำเร็จ');
        
        // รีเฟรชข้อมูล
        if (mode === 'detail') {
          fetchUserDetails(id);
        } else {
          fetchUsers(pagination.current, pagination.pageSize);
        }
        
        return true;
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์');
        return false;
      }
    } catch (err) {
      console.error(`Error uploading profile image for user ${id}:`, err);
      message.error('เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์ กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
      // รีเซ็ตความคืบหน้าหลังจากเสร็จสิ้น
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [mode, fetchUserDetails, fetchUsers, pagination]);
  
  return {
    // สถานะข้อมูล
    users,
    userDetails,
    loginHistory,
    loading,
    error,
    actionLoading,
    uploadProgress,
    pagination,
    filters,
    
    // การจัดการตัวกรอง
    handleFilterChange,
    resetFilters,
    
    // การแบ่งหน้า
    handlePaginationChange,
    
    // การดำเนินการกับผู้ใช้
    createUser: createUserAction,
    updateUser: updateUserAction,
    deleteUser: deleteUserAction,
    uploadProfileImage: uploadProfileImageAction,
    
    // รีเฟรชข้อมูล
    refreshUsers: () => fetchUsers(pagination.current, pagination.pageSize),
    refreshUserDetails: () => fetchUserDetails(userId),
    refreshLoginHistory: () => fetchLoginHistory(userId)
  };
};

export default useUser;