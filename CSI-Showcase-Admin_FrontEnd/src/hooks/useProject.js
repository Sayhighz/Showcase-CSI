// src/hooks/useProject.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getAllProjects, 
  getPendingProjects, 
  getProjectById,
  reviewProject,
  deleteProject,
  uploadProjectFile,
  updateProject
} from '../services/projectService';
import { message } from 'antd';
import useDebounce from './useDebounce';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook สำหรับจัดการข้อมูลโปรเจค
 * @param {string} mode - โหมดการแสดงผล ('all', 'pending', 'detail')
 * @param {string} viewMode - โหมดการแสดงผล ('list', 'detail', etc.)
 * @param {Object} initialFilters - ตัวกรองข้อมูลเริ่มต้น
 * @param {string|number} projectId - รหัสโปรเจค (สำหรับโหมด 'detail')
 * @returns {Object} - สถานะและฟังก์ชันสำหรับจัดการข้อมูลโปรเจค
 */
const useProject = (mode = 'all', viewMode = 'list', initialFilters = {}, projectId = null) => {
  const { admin } = useAuth();
  
  // ใช้ ref เก็บค่าเริ่มต้นเพื่อป้องกันการ fetch ซ้ำเมื่อ re-render
  const initialModeRef = useRef(mode);
  const initialProjectIdRef = useRef(projectId);
  
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

  // ใช้ ref เพื่อควบคุมการ fetch ข้อมูลซ้ำ
  const fetchingRef = useRef(false);
  
  // ใช้ ref เพื่อเก็บค่าล่าสุดของ filters และ pagination
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  // อัพเดต ref เมื่อ state เปลี่ยน
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  /**
   * โหลดข้อมูลโปรเจคทั้งหมด
   */
  const fetchProjects = useCallback(async (page = 1, pageSize = 10) => {
    // ป้องกันการ fetch ซ้ำในกรณีที่กำลัง fetch อยู่
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
        type: filtersRef.current.type,
        status: filtersRef.current.status,
        year: filtersRef.current.year,
        study_year: filtersRef.current.studyYear
      };
      
      // เลือกฟังก์ชันที่จะใช้ตามโหมด
      let apiFunction = getAllProjects;
      if (initialModeRef.current === 'pending') {
        apiFunction = getPendingProjects;
      }
      
      const response = await apiFunction(queryParams);
      
      if (response.success) {
        setProjects(response.data.projects || []);
        setPagination({
          current: page,
          pageSize,
          total: response.total || (response.data ? response.data.length : 0)
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจค กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
      // รอให้ animation เสร็จก่อนอนุญาตให้ fetch ใหม่
      setTimeout(() => {
        fetchingRef.current = false;
      }, 300);
    }
  }, [debouncedSearch]); // ลดจำนวน dependencies ให้เหลือเฉพาะที่จำเป็น
  
  /**
   * โหลดข้อมูลโปรเจคตาม ID
   */
  const fetchProjectDetails = useCallback(async (id) => {
    if (!id || fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await getProjectById(id);
    //   console.log(response,"asdasd")
      
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
      setTimeout(() => {
        fetchingRef.current = false;
      }, 300);
    }
  }, []); // ไม่มี dependencies เพื่อป้องกันการสร้างฟังก์ชันใหม่
  
  // ใช้ ref เพื่อติดตามการเรียก fetch ครั้งแรก
  const hasInitialLoadRef = useRef(false);
  
  // สำหรับติดตามการเปลี่ยนแปลงของ filter
  const filterChangeTimeoutRef = useRef(null);
  
  // โหลดข้อมูลครั้งแรกเมื่อ component mount
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      
      if (initialModeRef.current === 'detail' && initialProjectIdRef.current) {
        fetchProjectDetails(initialProjectIdRef.current);
      } else {
        fetchProjects(pagination.current, pagination.pageSize);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // useEffect สำหรับจัดการการเปลี่ยนแปลงของ filters และ pagination
  // แต่ใช้ timeout เพื่อลดการเรียก API บ่อยเกินไป
  useEffect(() => {
    // ไม่ทำงานถ้าเป็นโหมด detail
    if (initialModeRef.current === 'detail') return;
    
    // ยกเลิก timeout เดิม
    if (filterChangeTimeoutRef.current) {
      clearTimeout(filterChangeTimeoutRef.current);
    }
    
    // ตั้ง timeout ใหม่
    filterChangeTimeoutRef.current = setTimeout(() => {
      if (hasInitialLoadRef.current && !fetchingRef.current) {
        fetchProjects(pagination.current, pagination.pageSize);
      }
    }, 300);
    
    return () => {
      if (filterChangeTimeoutRef.current) {
        clearTimeout(filterChangeTimeoutRef.current);
      }
    };
  }, [
    debouncedSearch, 
    filters.type, 
    filters.status, 
    filters.year, 
    filters.studyYear,
    pagination.current, 
    pagination.pageSize,
    fetchProjects
  ]);
  
  /**
   * จัดการการเปลี่ยนแปลงตัวกรอง
   * @param {Object} newFilters - ตัวกรองใหม่
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => {
      // ถ้าค่าไม่เปลี่ยน ไม่ต้องอัพเดท state
      if (JSON.stringify({...prev, ...newFilters}) === JSON.stringify(prev)) {
        return prev;
      }
      return { ...prev, ...newFilters };
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
   * ตรวจสอบและอนุมัติหรือปฏิเสธโปรเจค
   * @param {string|number} id - รหัสโปรเจค
   * @param {string} status - สถานะใหม่ ('approved' หรือ 'rejected')
   * @param {string} comment - ความคิดเห็น (จำเป็นในกรณี rejected)
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const reviewProjectAction = useCallback(async (id, status, comment) => {
    if (actionLoading) return false;
    
    setActionLoading(true);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสโปรเจค');
        return false;
      }
      
      if (status !== 'approved' && status !== 'rejected') {
        message.error('สถานะไม่ถูกต้อง');
        return false;
      }
      
      // Allow optional comments for approval, mandatory for rejection
      if (status === 'rejected' && !comment.trim()) {
        message.error('กรุณาระบุเหตุผลที่ปฏิเสธ');
        return false;
      }
      console.log("asd",comment);
      
      const response = await reviewProject(id, status, comment);
      
      if (response.success) {
        // Existing success handling code...
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
  }, [actionLoading, fetchProjectDetails, fetchProjects]);
  
  /**
   * ลบโปรเจค
   * @param {string|number} id - รหัสโปรเจค
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const deleteProjectAction = useCallback(async (id) => {
    if (actionLoading) return false;
    
    setActionLoading(true);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสโปรเจค');
        return false;
      }
      
      const response = await deleteProject(id);
      
      if (response.success) {
        // รีเฟรชข้อมูล
        fetchingRef.current = false; // รีเซ็ตป้องกัน flag
        fetchProjects(paginationRef.current.current, paginationRef.current.pageSize);
        
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
  }, [actionLoading, fetchProjects]);
  
  /**
   * อัพโหลดไฟล์โปรเจค
   * @param {string|number} id - รหัสโปรเจค
   * @param {FormData} formData - ข้อมูลไฟล์
   * @param {Function} onProgress - ฟังก์ชันติดตามความคืบหน้า
   * @returns {Promise<Object>} - ผลลัพธ์การอัพโหลด
   */
  const uploadFileAction = useCallback(async (id, formData, onProgress) => {
    if (actionLoading) return { success: false, message: 'กำลังดำเนินการอยู่' };
    
    setActionLoading(true);
    
    try {
      if (!id) {
        message.error('ไม่ระบุรหัสโปรเจค');
        return { success: false, message: 'ไม่ระบุรหัสโปรเจค' };
      }
      
      const response = await uploadProjectFile(id, formData, onProgress);
      
      if (response.success) {
        message.success('อัพโหลดไฟล์สำเร็จ');
        
        // รีเฟรชข้อมูล
        if (initialModeRef.current === 'detail') {
          fetchingRef.current = false; // รีเซ็ตป้องกัน flag
          fetchProjectDetails(id);
        }
        
        return {
          success: true,
          data: response.data
        };
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
        return {
          success: false,
          message: response.message
        };
      }
    } catch (err) {
      console.error(`Error uploading file for project ${id}:`, err);
      message.error('เกิดข้อผิดพลาดในการอัพโหลดไฟล์ กรุณาลองใหม่อีกครั้ง');
      return {
        success: false,
        message: err.message
      };
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, fetchProjectDetails]);
  
  /**
   * อัพเดตข้อมูลโปรเจค
   * @param {string|number} id - รหัสโปรเจค 
   * @param {Object} projectData - ข้อมูลโปรเจคที่ต้องการอัพเดต
   * @returns {Promise<boolean>} - ผลลัพธ์การดำเนินการ
   */
  const updateProjectAction = useCallback(async (id, projectData) => {
    if (actionLoading) return false;
    
    setActionLoading(true);
    
    try {
      const response = await updateProject(id, projectData);
      
      if (response.success) {
        message.success('อัพเดตโปรเจคสำเร็จ');
        
        // รีเฟรชข้อมูล
        fetchingRef.current = false; // รีเซ็ตป้องกัน flag
        
        if (initialModeRef.current === 'detail') {
          fetchProjectDetails(id);
        } else {
          fetchProjects(paginationRef.current.current, paginationRef.current.pageSize);
        }
        
        return true;
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการอัพเดตโปรเจค');
        return false;
      }
    } catch (err) {
      console.error(`Error updating project ${id}:`, err);
      message.error('เกิดข้อผิดพลาดในการอัพเดตโปรเจค กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, fetchProjectDetails, fetchProjects]);
  
  /**
   * รีเฟรชข้อมูลโปรเจค (เรียกจากภายนอก)
   */
  const refreshProjectsData = useCallback(() => {
    fetchingRef.current = false; // รีเซ็ตป้องกัน flag
    
    if (initialModeRef.current === 'detail' && initialProjectIdRef.current) {
      fetchProjectDetails(initialProjectIdRef.current);
    } else {
      fetchProjects(paginationRef.current.current, paginationRef.current.pageSize);
    }
  }, [fetchProjectDetails, fetchProjects]);
  
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
    approveProject: (id, comment) => reviewProjectAction(id, 'approved', comment),
    rejectProject: (id, comment) => reviewProjectAction(id, 'rejected', comment),
    deleteProject: deleteProjectAction,
    uploadFile: uploadFileAction,
    updateProject: updateProjectAction,
    
    // รีเฟรชข้อมูล
    refreshProjects: refreshProjectsData,
    refreshProjectDetails: () => {
      fetchingRef.current = false; // รีเซ็ตป้องกัน flag
      fetchProjectDetails(initialProjectIdRef.current);
    }
  };
};

export default useProject;