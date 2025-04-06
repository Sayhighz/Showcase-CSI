// src/hooks/useProject.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getAllProjects, 
  getPendingProjects, 
  getProjectById,
  reviewProject,
  deleteProject 
} from '../services/projectService';
import { message } from 'antd';
import useDebounce from './useDebounce';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook สำหรับจัดการข้อมูลโปรเจค
 * @param {string} mode - โหมดการแสดงผล ('all', 'pending', 'detail')
 * @param {Object} initialFilters - ตัวกรองข้อมูลเริ่มต้น
 * @param {string|number} projectId - รหัสโปรเจค (สำหรับโหมด 'detail')
 * @returns {Object} - สถานะและฟังก์ชันสำหรับจัดการข้อมูลโปรเจค
 */
const useProject = (mode = 'all', initialFilters = {}, projectId = null) => {
  const { admin } = useAuth();
  
  // สถานะสำหรับจัดเก็บข้อมูล
  const [projects, setProjects] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // สถานะสำหรับการแบ่งหน้า
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // สถานะสำหรับตัวกรองข้อมูล
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    year: '',
    studyYear: '',
    ...initialFilters
  });

  // ใช้ debounce สำหรับการค้นหาเพื่อลดการเรียก API บ่อยเกินไป
  const debouncedSearch = useDebounce(filters.search, 500);
  
  /**
   * โหลดข้อมูลโปรเจคทั้งหมด
   */
  const fetchProjects = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้าง query params
      const queryParams = {
        page,
        limit: pageSize,
        search: debouncedSearch,
        type: filters.type,
        status: filters.status,
        year: filters.year,
        study_year: filters.studyYear
      };
      
      // เลือกฟังก์ชันที่จะใช้ตามโหมด
      let apiFunction = getAllProjects;
      if (mode === 'pending') {
        apiFunction = getPendingProjects;
      }
      
      const response = await apiFunction(queryParams);
      
      if (response.success) {
        setProjects(response.data);
        setPagination({
          current: page,
          pageSize,
          total: response.total || response.data.length
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจค กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.type, filters.status, filters.year, filters.studyYear, mode]);
  
  /**
   * โหลดข้อมูลโปรเจคตาม ID
   */
  const fetchProjectDetails = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getProjectById(id);
      
      if (response.success) {
        setProjectDetails(response.data);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจค');
      }
    } catch (err) {
      console.error(`Error fetching project ${id}:`, err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจค กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // โหลดข้อมูลเมื่อตัวแปรที่เกี่ยวข้องเปลี่ยนแปลง
  useEffect(() => {
    if (mode === 'detail' && projectId) {
      fetchProjectDetails(projectId);
    } else {
      fetchProjects(pagination.current, pagination.pageSize);
    }
  }, [
    mode, 
    projectId, 
    fetchProjectDetails, 
    fetchProjects, 
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
      type: '',
      status: '',
      year: '',
      studyYear: ''
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
   * ตรวจสอบและอนุมัติหรือปฏิเสธโปรเจค
   * @param {string|number} id - รหัสโปรเจค
   * @param {string} status - สถานะใหม่ ('approved' หรือ 'rejected')
   * @param {string} comment - ความคิดเห็น (จำเป็นในกรณี rejected)
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const reviewProjectAction = useCallback(async (id, status, comment = '') => {
    setActionLoading(true);
    
    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!id) {
        message.error('ไม่ระบุรหัสโปรเจค');
        return false;
      }
      
      if (status !== 'approved' && status !== 'rejected') {
        message.error('สถานะไม่ถูกต้อง');
        return false;
      }
      
      if (status === 'rejected' && !comment) {
        message.error('กรุณาระบุเหตุผลที่ปฏิเสธ');
        return false;
      }
      
      const response = await reviewProject(id, status, comment);
      
      if (response.success) {
        message.success(
          status === 'approved' ? 'อนุมัติโปรเจคสำเร็จ' : 'ปฏิเสธโปรเจคสำเร็จ'
        );
        
        // รีเฟรชข้อมูล
        if (mode === 'detail') {
          fetchProjectDetails(id);
        } else {
          fetchProjects(pagination.current, pagination.pageSize);
        }
        
        return true;
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการตรวจสอบโปรเจค');
        return false;
      }
    } catch (err) {
      console.error(`Error reviewing project ${id}:`, err);
      message.error('เกิดข้อผิดพลาดในการตรวจสอบโปรเจค กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [mode, fetchProjectDetails, fetchProjects, pagination]);
  
  /**
   * ลบโปรเจค
   * @param {string|number} id - รหัสโปรเจค
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const deleteProjectAction = useCallback(async (id) => {
    setActionLoading(true);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสโปรเจค');
        return false;
      }
      
      const response = await deleteProject(id);
      
      if (response.success) {
        message.success('ลบโปรเจคสำเร็จ');
        
        // รีเฟรชข้อมูล
        fetchProjects(pagination.current, pagination.pageSize);
        
        return true;
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการลบโปรเจค');
        return false;
      }
    } catch (err) {
      console.error(`Error deleting project ${id}:`, err);
      message.error('เกิดข้อผิดพลาดในการลบโปรเจค กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchProjects, pagination]);
  
  return {
    // สถานะข้อมูล
    projects,
    projectDetails,
    loading,
    error,
    actionLoading,
    pagination,
    filters,
    
    // ข้อมูลผู้ใช้
    admin,
    
    // การจัดการตัวกรอง
    handleFilterChange,
    resetFilters,
    
    // การแบ่งหน้า
    handlePaginationChange,
    
    // การดำเนินการกับโปรเจค
    approveProject: (id) => reviewProjectAction(id, 'approved'),
    rejectProject: (id, comment) => reviewProjectAction(id, 'rejected', comment),
    deleteProject: deleteProjectAction,
    
    // รีเฟรชข้อมูล
    refreshProjects: () => fetchProjects(pagination.current, pagination.pageSize),
    refreshProjectDetails: () => fetchProjectDetails(projectId)
  };
};

export default useProject;