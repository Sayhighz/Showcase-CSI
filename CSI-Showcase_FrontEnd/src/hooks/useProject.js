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
  searchProjects
} from '../services/projectService';

// นำเข้า constants และ utilities
import { PROJECT } from '../constants/routes';
import { PROJECT_TYPE } from '../constants/projectTypes';
import { get } from '../services/apiService';

/**
 * Custom hook สำหรับจัดการข้อมูลโปรเจค
 * @param {string} projectId - ID ของโปรเจค (ถ้ามี)
 * @returns {Object} - state และฟังก์ชันสำหรับจัดการโปรเจค
 */
const useProject = (projectId = null) => {
  // State สำหรับการกรองตาม API documentation
  const [filters, setFilters] = useState({
    category: null,         // ประเภทโปรเจค (coursework, academic, competition)
    year: null,             // ปีการศึกษา
    level: null,            // ชั้นปีของผู้สร้างโปรเจค
    keyword: '',            // คำค้นหา
  });
  
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10
  });
  
  // State สำหรับเก็บข้อมูลตัวกรอง
  const [projectTypes, setProjectTypes] = useState([
    { value: PROJECT_TYPE.ACADEMIC, label: 'บทความวิชาการ' },
    { value: PROJECT_TYPE.COURSEWORK, label: 'งานในชั้นเรียน' },
    { value: PROJECT_TYPE.COMPETITION, label: 'การแข่งขัน' }
  ]);
  const [projectYears, setProjectYears] = useState([]);
  const [studyYears, setStudyYears] = useState([1, 2, 3, 4]);
  
  const navigate = useNavigate();

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
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดของโปรเจค');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดของโปรเจค:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * ดึงข้อมูลโปรเจคทั้งหมด
   * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
   */
  const fetchAllProjects = useCallback(async (params = {}) => {
    // console.log('📥 เรียกใช้ fetchAllProjects กับ params:', params);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // สร้าง queryParams โดยรวมค่าจาก pagination และ filters
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
      
      // console.log('🚀 ส่ง request ไปยัง API ด้วยพารามิเตอร์:', queryParams);
      
      const response = await getAllProjects(queryParams);
      
      if (response) {
        // console.log('✅ ได้รับข้อมูลจาก API:', response);
        setProjects(response.projects || []);
        setPagination({
          current: parseInt(response.pagination?.page || pagination.current),
          pageSize: parseInt(response.pagination?.limit || pagination.pageSize),
          total: parseInt(response.pagination?.totalItems || 0)
        });
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค');
      console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  /**
   * ดึงข้อมูลโปรเจคยอดนิยม
   */
  const fetchTopProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getTopProjects();
      
      if (response) {
        return response;
      }
      return [];
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคยอดนิยม');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคยอดนิยม:', err);
      return [];
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
        return response;
      }
      return [];
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ดึงข้อมูลโปรเจคของผู้ใช้
   * @param {string} userId - ID ของผู้ใช้
   * @param {Object} params - พารามิเตอร์การค้นหา (pagination)
   */
  const fetchMyProjects = useCallback(async (userId, params = {}) => {
    if (!userId) {
      setError('ไม่มีข้อมูลผู้ใช้');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // สร้าง queryParams จาก pagination
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...params
      };
      
      const response = await getMyProjects(userId, queryParams);
      
      if (response) {
        setProjects(response.projects || []);
        setPagination({
          current: parseInt(response.pagination?.page || pagination.current),
          pageSize: parseInt(response.pagination?.limit || pagination.pageSize),
          total: parseInt(response.pagination?.totalItems || 0)
        });
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  /**
   * ค้นหาโปรเจค
   * @param {Object} searchParams - พารามิเตอร์สำหรับการค้นหา
   */
  const handleSearch = useCallback(async (searchParams = {}) => {
    // console.log('🔍 เริ่มค้นหาด้วยพารามิเตอร์:', searchParams);
    setIsLoading(true);
    setError(null);
    
    try {
      // สร้าง queryParams โดยรวมค่าจาก pagination, filters และ searchParams
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        ...searchParams
      };
      
      // กรองค่า null และ undefined ออก
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      // console.log('🔍 ส่งคำขอค้นหาไปยัง API ด้วยพารามิเตอร์:', queryParams);
      
      const response = await searchProjects(queryParams);
      
      if (response) {
        // console.log('✅ ผลการค้นหา:', response);
        setProjects(response.projects || []);
        setPagination({
          current: parseInt(response.pagination?.page || pagination.current),
          pageSize: parseInt(response.pagination?.limit || pagination.pageSize),
          total: parseInt(response.pagination?.totalItems || 0)
        });
        
        // อัปเดต filters ด้วย searchParams
        if (Object.keys(searchParams).length > 0) {
          setFilters(prev => ({
            ...prev,
            ...searchParams
          }));
        }
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาโปรเจค');
      console.error('❌ เกิดข้อผิดพลาดในการค้นหาโปรเจค:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  /**
   * อัปเดตตัวกรอง
   * @param {Object} newFilters - ตัวกรองใหม่
   */
  const updateFilters = useCallback((newFilters) => {
    // console.log('🔄 อัปเดตตัวกรอง - ปัจจุบัน:', filters, 'ใหม่:', newFilters);
    
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    
    // รีเซ็ต pagination เป็นหน้าแรก
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
    // console.log('📄 เปลี่ยนหน้า:', { page, pageSize });
    
    // อัปเดต pagination
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  }, []);

  /**
   * สร้างโปรเจคใหม่
   * @param {string} userId - ID ของผู้ใช้
   * @param {Object} projectData - ข้อมูลของโปรเจค
   * @param {Object} files - ไฟล์ที่ต้องการอัปโหลด
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
        navigate(PROJECT.VIEW(response.projectId));
        
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
   * @param {Object} files - ไฟล์ที่ต้องการอัปโหลดใหม่
   * @returns {Promise} - ผลลัพธ์จากการอัปเดตโปรเจค
   */
  const updateProjectData = useCallback(async (id, projectData, files) => {
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
        
        // อัปเดต state ของโปรเจค (ถ้ามี)
        if (projectIdToUpdate === projectId) {
          setProject(prev => ({
            ...prev,
            ...response
          }));
        }
        
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
        
        // นำทางไปยังหน้าโปรเจคของฉัน (ถ้าลบโปรเจคปัจจุบัน)
        if (projectIdToDelete === projectId) {
          navigate(PROJECT.MY_PROJECTS);
        } else {
          // รีเฟรชรายการโปรเจค
          if (Array.isArray(projects)) {
            setProjects(projects.filter(p => p.id !== projectIdToDelete));
          }
        }
        
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
  }, [projectId, navigate, projects]);



  // สร้างข้อมูลปีโปรเจคย้อนหลัง 10 ปี
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    
    setProjectYears(years);
  }, []);

  // Effect สำหรับดึงข้อมูลรายละเอียดของโปรเจคเมื่อมี projectId
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, fetchProjectDetails]);

  // Effect สำหรับดึงข้อมูลโปรเจคเมื่อ pagination หรือ filters เปลี่ยนแปลง
  useEffect(() => {
    // ข้ามการดึงข้อมูลในครั้งแรกที่โหลดหน้า
    const skipInitialFetch = projectId; // ข้ามถ้ามี projectId (หน้ารายละเอียด)
    
    if (!skipInitialFetch) {
      // ใช้ setTimeout เพื่อจัดการกับกรณีที่อาจมีการเปลี่ยนแปลง state หลายตัวพร้อมกัน
      const debounceTimer = setTimeout(() => {
        fetchAllProjects();
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [pagination.current, pagination.pageSize, filters, projectId, fetchAllProjects]);

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
    changePage
  };
};

export default useProject;