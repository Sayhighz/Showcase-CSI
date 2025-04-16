/**
 * Context สำหรับจัดการข้อมูลโปรเจค
 * ใช้สำหรับจัดการและแชร์ state ที่เกี่ยวข้องกับโปรเจคระหว่าง component ต่างๆ
 */
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
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

// นำเข้า AuthContext เพื่อใช้ข้อมูลผู้ใช้
import { AuthContext } from './AuthContext';

// สร้าง Context
export const ProjectContext = createContext();

/**
 * Provider สำหรับ ProjectContext
 * @param {Object} props - Props ของ component
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - Provider component
 */
export const ProjectProvider = ({ children }) => {
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
  const { user } = useContext(AuthContext) || {};

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
   * @param {string} userId - ID ของผู้ใช้ (ถ้าไม่ระบุจะใช้ ID ของผู้ใช้ปัจจุบัน)
   */
  const fetchMyProjects = useCallback(async (userId = null) => {
    const currentUserId = userId || (user ? user.id : null);
    
    if (!currentUserId) {
      setError('ไม่มีข้อมูลผู้ใช้');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getMyProjects(currentUserId);
      
      if (response) {
        setProjects(response || []);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * ดึงข้อมูลรายละเอียดของโปรเจค
   * @param {string} projectId - ID ของโปรเจค
   */
  const fetchProjectDetails = useCallback(async (projectId) => {
    if (!projectId) {
      setError('ไม่มีข้อมูล ID ของโปรเจค');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProjectDetails(projectId);
      
      if (response) {
        setProject(response);
        
        // บันทึกการเข้าชมโปรเจค
        recordVisitorView(projectId).catch(err => {
          console.error('เกิดข้อผิดพลาดในการบันทึกการเข้าชมโปรเจค:', err);
        });
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดของโปรเจค');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดของโปรเจค:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * สร้างโปรเจคใหม่
   * @param {Object} projectData - ข้อมูลของโปรเจค
   * @param {File[]} files - ไฟล์ที่ต้องการอัปโหลด
   * @returns {Promise} - ผลลัพธ์จากการสร้างโปรเจค
   */
  const createProject = useCallback(async (projectData, files) => {
    if (!user || !user.id) {
      message.error('ไม่มีข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบก่อนสร้างโปรเจค');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await uploadProject(user.id, projectData, files);
      
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
  }, [user, navigate]);

  /**
   * อัปเดตข้อมูลโปรเจค
   * @param {string} projectId - ID ของโปรเจค
   * @param {Object} projectData - ข้อมูลที่ต้องการอัปเดต
   * @param {File[]} files - ไฟล์ที่ต้องการอัปโหลดใหม่
   * @returns {Promise} - ผลลัพธ์จากการอัปเดตโปรเจค
   */
  const updateProjectData = useCallback(async (projectId, projectData, files) => {
    if (!projectId) {
      message.error('ไม่มีข้อมูล ID ของโปรเจค');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await updateProject(projectId, projectData, files);
      
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
  }, []);

  /**
   * ลบโปรเจค
   * @param {string} projectId - ID ของโปรเจคที่ต้องการลบ
   * @returns {Promise} - ผลลัพธ์จากการลบโปรเจค
   */
  const removeProject = useCallback(async (projectId) => {
    if (!projectId) {
      message.error('ไม่มีข้อมูล ID ของโปรเจค');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await deleteProject(projectId);
      
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
  }, [navigate]);

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

  /**
   * รีเซ็ตสถานะของ ProjectContext
   */
  const resetProjectState = useCallback(() => {
    setProjects([]);
    setProject(null);
    setError(null);
    setPagination({
      total: 0,
      current: 1,
      pageSize: 10
    });
    setFilters({
      type: null,
      year: null,
      studyYear: null,
      keyword: '',
    });
  }, []);

  // ดึงข้อมูลตัวกรองเมื่อ component mount
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // สร้าง value object สำหรับ context
  const value = {
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
    resetProjectState,
    
    // Utilities
    fetchFilterOptions
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

/**
 * Custom hook สำหรับใช้งาน ProjectContext
 * @returns {Object} - Project context
 */
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error('useProjectContext ต้องใช้ภายใน ProjectProvider');
  }
  
  return context;
};

export default { ProjectContext, ProjectProvider, useProjectContext };