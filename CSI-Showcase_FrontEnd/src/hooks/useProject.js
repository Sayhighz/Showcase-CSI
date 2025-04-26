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
  // State สำหรับการกรองตาม API documentation
  const [filters, setFilters] = useState({
    category: null,         // แทน 'type' เดิม (coursework, academic, competition)
    year: null,             // ปีการศึกษา
    level: null,            // แทน 'studyYear' เดิม
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
  const [projectTypes, setProjectTypes] = useState([]);
  const [projectYears, setProjectYears] = useState([]);
  const [studyYears, setStudyYears] = useState([]);
  
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
    console.log('📥 เรียกใช้ fetchAllProjects กับ params:', params);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // สร้าง queryParams โดยรวมค่าจาก pagination
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...params
      };
      
      // เพิ่มค่าจาก filters ที่ไม่เป็น null หรือ empty string
      Object.entries(filters).forEach(([key, value]) => {
        // ข้าม key ที่มีใน params แล้ว เพื่อไม่ให้เขียนทับ
        if (!(key in params) && value !== null && value !== undefined && value !== '') {
          queryParams[key] = value;
        }
      });
      
      // หากมี type ใน filters หรือ params แต่ไม่มี category 
      // ให้เพิ่ม category และเอา type ออก (เนื่องจาก API ใช้ category)
      if ((queryParams.type || filters.type) && !queryParams.category) {
        queryParams.category = queryParams.type || filters.type;
        delete queryParams.type;
      }
      
      // หากมี studyYear ใน filters หรือ params แต่ไม่มี level
      // ให้เพิ่ม level และเอา studyYear ออก (เนื่องจาก API ใช้ level)
      if ((queryParams.studyYear || filters.studyYear) && !queryParams.level) {
        queryParams.level = queryParams.studyYear || filters.studyYear;
        delete queryParams.studyYear;
      }
      
      console.log('🚀 ส่ง request ไปยัง API ด้วยพารามิเตอร์:', queryParams);
      
      const response = await getAllProjects(queryParams);
      
      if (response) {
        console.log('✅ ได้รับข้อมูลจาก API:', response);
        setProjects(response.projects || []);
        setPagination({
          current: parseInt(response.pagination?.current || pagination.current),
          pageSize: parseInt(response.pagination?.pageSize || pagination.pageSize),
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
        setProjects(response);
        return response;
      }
      return null;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคยอดนิยม');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคยอดนิยม:', err);
      return null;
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
        setProjects(response);
        return response;
      }
      return null;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด:', err);
      return null;
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
   * ค้นหาโปรเจค
   * @param {Object} searchParams - พารามิเตอร์สำหรับการค้นหา
   */
  const handleSearch = useCallback(async (searchParams = {}) => {
    console.log('🔍 เริ่มค้นหาด้วยพารามิเตอร์:', searchParams);
    setIsLoading(true);
    setError(null);
    
    try {
      // แปลง type เป็น category ถ้าจำเป็น
      if (searchParams.type && !searchParams.category) {
        searchParams.category = searchParams.type;
        delete searchParams.type;
      }
      
      // แปลง studyYear เป็น level ถ้าจำเป็น
      if (searchParams.studyYear && !searchParams.level) {
        searchParams.level = searchParams.studyYear;
        delete searchParams.studyYear;
      }
      
      // สร้าง queryParams โดยรวมค่าจาก pagination
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...searchParams
      };
      
      // เพิ่มค่าจาก filters ที่ไม่มีใน searchParams
      Object.entries(filters).forEach(([key, value]) => {
        if (!(key in searchParams) && value !== null && value !== undefined && value !== '') {
          queryParams[key] = value;
        }
      });
      
      console.log('🔍 ส่งคำขอค้นหาไปยัง API ด้วยพารามิเตอร์:', queryParams);
      
      const response = await searchProjects(queryParams);
      
      if (response) {
        console.log('✅ ผลการค้นหา:', response);
        setProjects(response.projects || []);
        setPagination({
          current: parseInt(response.pagination?.current || pagination.current),
          pageSize: parseInt(response.pagination?.pageSize || pagination.pageSize),
          total: parseInt(response.pagination?.totalItems || 0)
        });
        
        // อัปเดต filters ด้วย searchParams ที่ได้จัดรูปแบบแล้ว
        const newFilters = { ...filters };
        
        // จัดการกับการแปลงชื่อพารามิเตอร์
        if ('category' in searchParams) {
          newFilters.category = searchParams.category;
        } else if ('type' in searchParams) {
          newFilters.category = searchParams.type;
        }
        
        if ('level' in searchParams) {
          newFilters.level = searchParams.level;
        } else if ('studyYear' in searchParams) {
          newFilters.level = searchParams.studyYear;
        }
        
        if ('year' in searchParams) {
          newFilters.year = searchParams.year;
        }
        
        if ('keyword' in searchParams) {
          newFilters.keyword = searchParams.keyword;
        }
        
        setFilters(newFilters);
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
    console.log('🔄 อัปเดตตัวกรอง - ปัจจุบัน:', filters, 'ใหม่:', newFilters);
    
    // สร้างชุดตัวกรองใหม่
    const updatedFilters = { ...filters };
    
    // จัดการกับ type/category และ studyYear/level
    if ('type' in newFilters) {
      updatedFilters.category = newFilters.type;
    } else if ('category' in newFilters) {
      updatedFilters.category = newFilters.category;
    }
    
    if ('studyYear' in newFilters) {
      updatedFilters.level = newFilters.studyYear;
    } else if ('level' in newFilters) {
      updatedFilters.level = newFilters.level;
    }
    
    // อัปเดต year และ keyword (ถ้ามี)
    if ('year' in newFilters) {
      updatedFilters.year = newFilters.year;
    }
    
    if ('keyword' in newFilters) {
      updatedFilters.keyword = newFilters.keyword;
    }
    
    console.log('🔄 ตัวกรองหลังอัปเดต:', updatedFilters);
    
    // อัปเดต state filters
    setFilters(updatedFilters);
    
    // รีเซ็ต pagination เป็นหน้าแรก
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  }, [filters]);

  /**
   * เปลี่ยนหน้าของการแสดงผลโปรเจค
   * @param {number} page - หน้าที่ต้องการ
   * @param {number} pageSize - จำนวนรายการต่อหน้า
   */
  const changePage = useCallback((page, pageSize) => {
    console.log('📄 เปลี่ยนหน้า:', { page, pageSize });
    
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
   * @param {File[]} files - ไฟล์ที่ต้องการอัปโหลดใหม่
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

  // Effect สำหรับดึงข้อมูลตัวกรองเมื่อ hook ถูกเรียกใช้
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

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
    changePage,
    
    // Utilities
    fetchFilterOptions
  };
};

export default useProject;