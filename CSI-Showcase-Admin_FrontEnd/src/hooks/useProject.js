// src/hooks/useProject.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  getAllProjects,
  getPendingProjects,
  getProjectDetails,
  reviewProject,
  getMyProjects,
  getProjectStats,
  updateProject,
  updateProjectWithFiles
} from '../services/projectService';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';

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
 * Optimized Custom hook for project management with improved performance
 * and reduced duplicate fetching
 */
const useProject = (mode = 'all', _viewMode = 'list', initialFilters = {}, projectId = null) => {
  const { user, admin } = useAuth();
  const currentUser = user || admin;
  
  // Stable references to prevent unnecessary re-renders
  const initialModeRef = useRef(mode);
  const initialProjectIdRef = useRef(projectId);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  
  // State management
  const [projects, setProjects] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [projectReviews] = useState([]);
  const [reviewStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [allReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    year: '',
    level: '',
    adminId: '',
    startDate: '',
    endDate: '',
    ...initialFilters
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  // Request management
  const cancelPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  // Cache management
  const getCacheKey = useCallback((type, params) => {
    return `${type}_${JSON.stringify(params)}`;
  }, []);

  const getFromCache = useCallback((key, maxAge = 5 * 60 * 1000) => { // 5 minutes
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }, []);

  const setCache = useCallback((key, data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Optimized fetch functions with caching and request cancellation
  const fetchProjects = useCallback(async (page = 1, pageSize = 10, useCache = true) => {
    const queryParams = {
      page,
      limit: pageSize,
      search: debouncedSearch,
      type: filters.type,
      status: filters.status,
      year: filters.year,
      level: filters.level
    };

    const cacheKey = getCacheKey(`projects_${initialModeRef.current}`, queryParams);
    
    if (useCache) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        setProjects(cached.projects || []);
        setPagination(cached.pagination || pagination);
        return;
      }
    }

    const signal = cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const apiFunction = initialModeRef.current === 'pending' ? getPendingProjects : getAllProjects;
      const response = await apiFunction(queryParams);

      if (signal.aborted) return;

      if (response.success) {
        const data = {
          projects: response.data.projects || response.data || [],
          pagination: {
            current: response.pagination?.page || page,
            pageSize: response.pagination?.limit || pageSize,
            total: response.pagination?.totalItems || 0
          }
        };

        setProjects(data.projects);
        setPagination(data.pagination);
        setCache(cacheKey, data);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error('Error fetching projects:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจค กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, filters.type, filters.status, filters.year, filters.level, getCacheKey, getFromCache, setCache, cancelPreviousRequest]);

  const fetchProjectDetails = useCallback(async (id, useCache = true) => {
    if (!id) return;

    const cacheKey = getCacheKey('project_detail', { id });
    
    if (useCache) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        setProjectDetails(cached);
        return;
      }
    }

    const signal = cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const response = await getProjectDetails(id);
      
      if (signal.aborted) return;

      if (response.success) {
        setProjectDetails(response.data);
        setCache(cacheKey, response.data);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจค');
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error(`Error fetching project ${id}:`, err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจค กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [getCacheKey, getFromCache, setCache, cancelPreviousRequest]);

  const fetchMyProjects = useCallback(async (userId, filterParams = {}) => {
    if (!userId) return;

    const signal = cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const response = await getMyProjects(userId, filterParams);
      
      if (signal.aborted) return;

      if (response.success) {
        setProjects(response.data.projects || response.data || []);
        setPagination({
          current: response.pagination?.page || filterParams.page || 1,
          pageSize: response.pagination?.limit || filterParams.limit || 10,
          total: response.pagination?.totalItems || 0
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจคของคุณ');
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error('Error fetching my projects:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรเจคของคุณ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [cancelPreviousRequest]);

  // Fetch project stats
  const fetchProjectStats = useCallback(async (useCache = true) => {
    const cacheKey = getCacheKey('project_stats', {});
    
    if (useCache) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        setProjectStats(cached);
        return;
      }
    }

    const signal = cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const response = await getProjectStats();
      
      if (signal.aborted) return;

      if (response.success) {
        setProjectStats(response.data);
        setCache(cacheKey, response.data);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติโปรเจค');
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error('Error fetching project stats:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติโปรเจค กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [getCacheKey, getFromCache, setCache, cancelPreviousRequest]);

  // Memoized handlers
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      // Only update if there are actual changes
      if (JSON.stringify(updatedFilters) === JSON.stringify(prev)) {
        return prev;
      }
      return updatedFilters;
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: '',
      status: '',
      year: '',
      level: '',
      adminId: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const handlePaginationChange = useCallback((page, pageSize) => {
    setPagination(prev => {
      // Prevent unnecessary updates
      if (page === prev.current && pageSize === prev.pageSize) {
        return prev;
      }
      return {
        ...prev,
        current: page,
        pageSize
      };
    });
  }, []);

  // Action functions with optimistic updates
  const reviewProjectAction = useCallback(async (id, status, comment) => {
    if (actionLoading || !id) return false;

    setActionLoading(true);

    try {
      if (status !== 'approved' && status !== 'rejected') {
        message.error('สถานะไม่ถูกต้อง');
        return false;
      }

      if (status === 'rejected' && !comment?.trim()) {
        message.error('กรุณาระบุเหตุผลที่ปฏิเสธ');
        return false;
      }

      const response = await reviewProject(id, status, comment);

      if (response.success) {
        message.success(response.message || (status === 'approved' ? 'อนุมัติโปรเจคสำเร็จ' : 'ปฏิเสธโปรเจคสำเร็จ'));
        
        // Invalidate cache and refresh
        cacheRef.current.clear();
        
        if (initialModeRef.current === 'detail' && initialProjectIdRef.current) {
          fetchProjectDetails(initialProjectIdRef.current, false);
        } else {
          fetchProjects(pagination.current, pagination.pageSize, false);
        }
        
        return true;
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการตรวจสอบโปรเจค');
        return false;
      }
    } catch (err) {
      message.error('เกิดข้อผิดพลาดในการตรวจสอบโปรเจค กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, pagination.current, pagination.pageSize, fetchProjectDetails, fetchProjects]);

  // Update project with files (poster + video URL/file)
  const updateProjectAction = useCallback(async (id, payload) => {
    if (!id) return false;
    setActionLoading(true);
    try {
      let formData;
      if (typeof FormData !== 'undefined' && payload instanceof FormData) {
        formData = payload;
      } else {
        formData = new FormData();
        const fields = payload?.fields || payload || {};
        Object.keys(fields).forEach((k) => {
          const v = fields[k];
          if (v !== undefined && v !== null && v !== '') {
            formData.append(k, v);
          }
        });

        const files = payload?.files || {};
        if (files.posterFile) {
          // Pick poster field name by type (fallback to coursework)
          const t = fields.type || projectDetails?.type || '';
          const posterKey = t === 'competition' ? 'competitionPoster' : 'courseworkPoster';
          formData.append(posterKey, files.posterFile);
        }
        if (files.videoFile) {
          formData.append('courseworkVideo', files.videoFile);
        }
      }

      const resp = await updateProjectWithFiles(id, formData);
      if (resp.success) {
        message.success(resp.message || 'อัปเดตโปรเจคสำเร็จ');
        cacheRef.current.clear();
        if (initialModeRef.current === 'detail' && initialProjectIdRef.current) {
          await fetchProjectDetails(initialProjectIdRef.current, false);
        } else {
          await fetchProjects(pagination.current, pagination.pageSize, false);
        }
        return true;
      }
      message.error(resp.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรเจค');
      return false;
    } catch (_err) {
      message.error('เกิดข้อผิดพลาดในการอัปเดตโปรเจค กรุณาลองใหม่อีกครั้ง');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchProjectDetails, fetchProjects, pagination.current, pagination.pageSize, projectDetails]);

  // Consolidated data fetching effect - prevents multiple simultaneous API calls
  useEffect(() => {
    const fetchData = async () => {
      // Skip if already loading to prevent race conditions
      if (loading) return;

      // Initial load on mount - only run once
      if (pagination.current === 1 && !debouncedSearch && !filters.type && !filters.status && !filters.year && !filters.level) {
        if (initialModeRef.current === 'detail' && initialProjectIdRef.current) {
          await fetchProjectDetails(initialProjectIdRef.current);
          return;
        } else if (initialModeRef.current === 'my-projects' && currentUser?.id) {
          await fetchMyProjects(currentUser.id, { page: 1, limit: pagination.pageSize });
          return;
        } else if (initialModeRef.current === 'stats') {
          await fetchProjectStats();
          return;
        } else {
          await fetchProjects(1, pagination.pageSize);
          return;
        }
      }

      // Handle filter changes or pagination changes - only when there are actual changes
      if (initialModeRef.current !== 'detail' && initialModeRef.current !== 'stats') {
        const fetchParams = {
          page: pagination.current,
          limit: pagination.pageSize,
          search: debouncedSearch,
          type: filters.type,
          status: filters.status,
          year: filters.year,
          level: filters.level
        };

        if (initialModeRef.current === 'my-projects' && currentUser?.id) {
          await fetchMyProjects(currentUser.id, fetchParams);
        } else {
          await fetchProjects(fetchParams.page, fetchParams.limit, false);
        }
      }
    };

    // Debounce the fetch to prevent rapid fire API calls
    const timeoutId = setTimeout(fetchData, 300);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    pagination.current,
    pagination.pageSize,
    debouncedSearch,
    filters.type,
    filters.status,
    filters.year,
    filters.level,
    currentUser?.id
  ]); // Consolidated dependencies

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cacheRef.current.clear();
    };
  }, []);

  // Memoized return object
  const returnValue = useMemo(() => ({
    // State
    projects,
    projectDetails,
    projectReviews,
    reviewStats,
    projectStats,
    allReviews,
    loading,
    error,
    actionLoading,
    pagination,
    filters,
    
    // User info
    admin: currentUser,
    user: currentUser,
    
    // Handlers
    handleFilterChange,
    resetFilters,
    handlePaginationChange,
    
    // Actions
    updateProject: (id, payload) => updateProjectAction(id, payload),
    approveProject: (id, comment = '') => reviewProjectAction(id, 'approved', comment),
    rejectProject: (id, comment) => reviewProjectAction(id, 'rejected', comment),
    
    // Fetch functions
    fetchProjects: (page, pageSize, useCache) => fetchProjects(page, pageSize, useCache),
    fetchProjectDetails: (id, useCache) => fetchProjectDetails(id, useCache),
    fetchMyProjects,
    fetchProjectStats: (useCache) => fetchProjectStats(useCache),
    
    // Utilities
    refreshProjects: () => {
      cacheRef.current.clear();
      if (initialModeRef.current === 'stats') {
        fetchProjectStats(false);
      } else if (initialModeRef.current === 'my-projects' && currentUser?.id) {
        fetchMyProjects(currentUser.id, { limit: pagination.pageSize });
      } else {
        fetchProjects(pagination.current, pagination.pageSize, false);
      }
    },
    clearCache: () => cacheRef.current.clear()
  }), [
    projects,
    projectDetails,
    loading,
    error,
    pagination,
    filters,
    currentUser,
    handleFilterChange,
    resetFilters,
    handlePaginationChange,
    reviewProjectAction,
    fetchProjects,
    fetchProjectDetails,
    fetchMyProjects,
    fetchProjectStats
  ]);

  return returnValue;
};

export default useProject;