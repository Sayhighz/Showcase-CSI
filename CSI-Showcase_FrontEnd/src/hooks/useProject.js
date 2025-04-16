/**
 * Custom hook สำหรับจัดการข้อมูลโปรเจค
 * จัดการ state และฟังก์ชันที่เกี่ยวข้องกับการดึงข้อมูล, สร้าง, แก้ไข, ลบโปรเจค
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

// นำเข้า services ที่เกี่ยวข้อง
import {
  getAllProjects,
  getTopProjects,
  getLatestProjects,
  getMyProjects,
  getProjectDetails,
  uploadProject,
  updateProject,
  deleteProject,
  searchProjects,
  getProjectTypes,
  getProjectYears,
  getStudyYears,
  recordVisitorView
} from '../services/projectService';

// นำเข้า routes
import { PROJECT } from '../constants/routes';

/**
 * Custom hook สำหรับจัดการข้อมูลโปรเจค
 * @param {string} projectId - ID ของโปรเจค (ถ้ามี)
 * @returns {Object} - state และฟังก์ชันสำหรับจัดการโปรเจค
 */
const useProject = (projectId = null) => {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10
  });
  const [filters, setFilters] = useState({
    type: null,
    year: null,
    studyYear: null,
    keyword: '',
  });
  const [projectTypes, setProjectTypes] = useState([]);
  const [projectYears, setProjectYears] = useState([]);
  const [studyYears, setStudyYears] = useState([]);
  
  const navigate = useNavigate();

  /**
   * ดึงข้อมูลตัวกรองสำหรับโปรเจค (ประเภท, ปี, ชั้นปี)
   */
  const fetchFilterOptions = useCallback(async () => {
    try {
      // ดึงข้อมูลประเภทโปรเจค
      const typesResponse = await getProjectTypes();
      if (typesResponse) {
        setProjectTypes(typesResponse);
      }
      
      // ดึงข้อมูลปีของโปรเจค
      const yearsResponse = await getProjectYears();
      if (yearsResponse) {
        setProjectYears(yearsResponse);
      }
      
      // ดึงข้อมูลชั้นปีของผู้สร้างโปรเจค
      const studyYearsResponse = await getStudyYears();
      if (studyYearsResponse) {
        setStudyYears(studyYearsResponse);
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลตัวกรอง:', err);
    }
  }, []);

  /**
   * ดึงข้อมูลโปรเจคทั้งหมด
   * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
   */
  const fetchAllProjects = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // รวมพารามิเตอร์จาก state filters และพารามิเตอร์ที่ส่งมา
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        ...params
      };
      
      // กรองค่า null และ undefined ออก
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const response = await getAllProjects(queryParams);
      
      if (response) {
        setProjects(response.projects || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
          current: response.page || 1,
        });
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize, pagination]);

  /**
   * ดึงข้อมูลโปรเจคยอดนิยม
   */
  const fetchTopProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getTopProjects();
      
      if (response) {
        setProjects(response || []);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคยอดนิยม');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคยอดนิยม:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ดึงข้อมูลโปรเจคล่าสุด
   * @param {number} limit - จำนวนโปรเจคที่ต้องการ
   */
  const fetchLatestProjects = useCallback(async (limit = 9) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getLatestProjects(limit);
      
      if (response) {
        setProjects(response || []);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ดึงข้อมูลโปรเจคของผู้ใช้
   * @param {string} userId - ID ของผู้ใช้
   */
  const fetchMyProjects = useCallback(async (userId) => {
    if (!userId) {
      setError('ไม่มีข้อมูลผู้ใช้');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getMyProjects(userId);
      
      if (response) {
        setProjects(response || []);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ดึงข้อมูลรายละเอียดของโปรเจค
   * @param {string} id - ID ของโปรเจค
   */
  const fetchProjectDetails = useCallback(async (id = null) => {
    // ใช้ id ที่ส่งมา หรือใช้ projectId จาก parameter ของ hook
    const projectIdToFetch = id || projectId;
    
    if (!projectIdToFetch) {
      setError('ไม่มีข้อมูล ID ของโปรเจค');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProjectDetails(projectIdToFetch);
      
      if (response) {
        setProject(response);
        
        // บันทึกการเข้าชมโปรเจค
        recordVisitorView(projectIdToFetch).catch(err => {
          console.error('เกิดข้อผิดพลาดในการบันทึกการเข้าชมโปรเจค:', err);
        });
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดของโปรเจค');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดของโปรเจค:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * สร้างโปรเจคใหม่
   * @param {string} userId - ID ของผู้ใช้
   * @param {Object} projectData - ข้อมูลของโปรเจค
   * @param {File[]} files - ไฟล์ที่ต้องการอัปโหลด
   * @returns {Promise} - ผลลัพธ์จากการสร้างโปรเจค
   */
  const createProject = useCallback(async (userId, projectData, files) => {
    if (!userId) {
      message.error('ไม่มีข้อมูลผู้ใช้');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await uploadProject(userId, projectData, files);
      
      if (response) {
        message.success('สร้างโปรเจคสำเร็จ');
        
        // นำทางไปยังหน้าโปรเจคที่สร้าง
        navigate(PROJECT.VIEW(response.id));
        
        return response;
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างโปรเจค');
      console.error('เกิดข้อผิดพลาดในการสร้างโปรเจค:', err);
      message.error(err.message || 'เกิดข้อผิดพลาดในการสร้างโปรเจค');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * อัปเดตข้อมูลโปรเจค
   * @param {string} id - ID ของโปรเจค
   * @param {Object} projectData - ข้อมูลที่ต้องการอัปเดต
   * @param {File[]} files - ไฟล์ที่ต้องการอัปโหลดใหม่
   * @returns {Promise} - ผลลัพธ์จากการอัปเดตโปรเจค
   */
  const updateProjectData = useCallback(async (id, projectData, files) => {
    // ใช้ id ที่ส่งมา หรือใช้ projectId จาก parameter ของ hook
    const projectIdToUpdate = id || projectId;
    
    if (!projectIdToUpdate) {
      message.error('ไม่มีข้อมูล ID ของโปรเจค');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await updateProject(projectIdToUpdate, projectData, files);
      
      if (response) {
        message.success('อัปเดตโปรเจคสำเร็จ');
        
        // อัปเดต state ของโปรเจค
        setProject(response);
        
        return response;
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรเจค');
      console.error('เกิดข้อผิดพลาดในการอัปเดตโปรเจค:', err);
      message.error(err.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรเจค');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * ลบโปรเจค
   * @param {string} id - ID ของโปรเจคที่ต้องการลบ
   * @returns {Promise} - ผลลัพธ์จากการลบโปรเจค
   */
  const removeProject = useCallback(async (id) => {
    // ใช้ id ที่ส่งมา หรือใช้ projectId จาก parameter ของ hook
    const projectIdToDelete = id || projectId;
    
    if (!projectIdToDelete) {
      message.error('ไม่มีข้อมูล ID ของโปรเจค');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await deleteProject(projectIdToDelete);
      
      if (response) {
        message.success('ลบโปรเจคสำเร็จ');
        
        // นำทางไปยังหน้าโปรเจคของฉัน
        navigate(PROJECT.MY_PROJECTS);
        
        return response;
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบโปรเจค');
      console.error('เกิดข้อผิดพลาดในการลบโปรเจค:', err);
      message.error(err.message || 'เกิดข้อผิดพลาดในการลบโปรเจค');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, navigate]);

  /**
   * ค้นหาโปรเจค
   * @param {Object} searchParams - พารามิเตอร์สำหรับการค้นหา
   */
  const handleSearch = useCallback(async (searchParams = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // รวมพารามิเตอร์จาก state filters และพารามิเตอร์ที่ส่งมา
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        ...searchParams
      };
      
      // อัปเดต state filters ด้วยพารามิเตอร์ที่ส่งมา
      setFilters(prevFilters => ({
        ...prevFilters,
        ...searchParams
      }));
      
      // กรองค่า null และ undefined ออก
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const response = await searchProjects(queryParams);
      
      if (response) {
        setProjects(response.projects || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
          current: response.page || 1,
        });
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาโปรเจค');
      console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจค:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  /**
   * อัปเดตตัวกรอง
   * @param {Object} newFilters - ตัวกรองใหม่
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    
    // Reset pagination to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  }, []);

  /**
   * เปลี่ยนหน้าของการแสดงผลโปรเจค
   * @param {number} page - หน้าที่ต้องการ
   * @param {number} pageSize - จำนวนรายการต่อหน้า
   */
  const changePage = useCallback((page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  }, []);

  // ดึงข้อมูลรายละเอียดของโปรเจคเมื่อ projectId เปลี่ยนแปลง
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, fetchProjectDetails]);

  // ดึงข้อมูลตัวกรองเมื่อ hook ถูกเรียกใช้
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return {
    // State
    projects,
    project,
    isLoading,
    error,
    pagination,
    filters,
    projectTypes,
    projectYears,
    studyYears,
    
    // Actions
    fetchAllProjects,
    fetchTopProjects,
    fetchLatestProjects,
    fetchMyProjects,
    fetchProjectDetails,
    createProject,
    updateProject: updateProjectData,
    deleteProject: removeProject,
    searchProjects: handleSearch,
    updateFilters,
    changePage,
    
    // Utilities
    fetchFilterOptions
  };
};

export default useProject;