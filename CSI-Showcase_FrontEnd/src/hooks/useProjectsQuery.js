/**
 * React Query hooks สำหรับจัดการข้อมูลโปรเจค
 * ปรับปรุงจาก useProject.js เดิมให้มี caching และ performance ดีขึ้น
 */
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllProjects,
  getTopProjects,
  getLatestProjects,
  getProjectDetails,
  searchProjects
} from '../services/projectService';

// Query keys
export const PROJECT_QUERY_KEYS = {
  all: ['projects'],
  lists: () => [...PROJECT_QUERY_KEYS.all, 'list'],
  list: (filters) => [...PROJECT_QUERY_KEYS.lists(), filters],
  details: () => [...PROJECT_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...PROJECT_QUERY_KEYS.details(), id],
  top: () => [...PROJECT_QUERY_KEYS.all, 'top'],
  latest: (limit) => [...PROJECT_QUERY_KEYS.all, 'latest', limit],
  search: (params) => [...PROJECT_QUERY_KEYS.all, 'search', params]
};

/**
 * Hook สำหรับดึงข้อมูลโปรเจคทั้งหมด
 */
export const useProjects = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.list(filters),
    queryFn: () => getAllProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });
};

/**
 * Hook สำหรับดึงข้อมูลโปรเจคด้วย infinite scroll
 */
export const useInfiniteProjects = (filters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: PROJECT_QUERY_KEYS.list({ ...filters, infinite: true }),
    queryFn: ({ pageParam = 1 }) => getAllProjects({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const { pagination } = lastPage;
      if (!pagination) return undefined;
      
      const { page, totalPages } = pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    ...options
  });
};

/**
 * Hook สำหรับดึงข้อมูลรายละเอียดโปรเจค
 */
export const useProject = (projectId, options = {}) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(projectId),
    queryFn: () => getProjectDetails(projectId),
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    ...options
  });
};

/**
 * Hook สำหรับดึงข้อมูลโปรเจคยอดนิยม
 */
export const useTopProjects = (options = {}) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.top(),
    queryFn: getTopProjects,
    staleTime: 15 * 60 * 1000, // 15 minutes - ข้อมูลนี้เปลี่ยนไม่บ่อย
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Hook สำหรับดึงข้อมูลโปรเจคล่าสุด
 */
export const useLatestProjects = (limit = 9, options = {}) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.latest(limit),
    queryFn: () => getLatestProjects(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...options
  });
};

/**
 * Hook สำหรับค้นหาโปรเจค
 */
export const useSearchProjects = (searchParams = {}, options = {}) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.search(searchParams),
    queryFn: () => searchProjects(searchParams),
    enabled: !!(searchParams.keyword || searchParams.category || searchParams.year || searchParams.level),
    staleTime: 2 * 60 * 1000, // 2 minutes - search results change more frequently
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options
  });
};

/**
 * Hook สำหรับ prefetch ข้อมูลโปรเจค (สำหรับ optimization)
 */
export const usePrefetchProject = () => {
  const queryClient = useQueryClient();

  const prefetchProject = (projectId) => {
    if (!projectId) return;

    queryClient.prefetchQuery({
      queryKey: PROJECT_QUERY_KEYS.detail(projectId),
      queryFn: () => getProjectDetails(projectId),
      staleTime: 10 * 60 * 1000
    });
  };

  const prefetchProjects = (filters = {}) => {
    queryClient.prefetchQuery({
      queryKey: PROJECT_QUERY_KEYS.list(filters),
      queryFn: () => getAllProjects(filters),
      staleTime: 5 * 60 * 1000
    });
  };

  return {
    prefetchProject,
    prefetchProjects
  };
};

/**
 * Hook สำหรับ invalidate queries (ใช้หลังจาก mutations)
 */
export const useInvalidateProjects = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
  };

  const invalidateProject = (projectId) => {
    queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.detail(projectId) });
  };

  const invalidateProjectsList = () => {
    queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.lists() });
  };

  return {
    invalidateAll,
    invalidateProject,
    invalidateProjectsList
  };
};

/**
 * Mutation hooks สำหรับการแก้ไขข้อมูล (สำหรับอนาคต)
 */
export const useCreateProject = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData) => {
      // ฟังก์ชันนี้จะต้องสร้างขึ้นใน projectService
      throw new Error('Create project API not implemented yet');
    },
    onSuccess: (data, variables) => {
      // Invalidate และ refetch
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.latest() });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.top() });
      
      // Add the new project to cache
      queryClient.setQueryData(
        PROJECT_QUERY_KEYS.detail(data.id), 
        data
      );
    },
    ...options
  });
};

export const useUpdateProject = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, projectData }) => {
      // ฟังก์ชันนี้จะต้องสร้างขึ้นใน projectService
      throw new Error('Update project API not implemented yet');
    },
    onSuccess: (data, { projectId }) => {
      // Update specific project cache
      queryClient.setQueryData(
        PROJECT_QUERY_KEYS.detail(projectId), 
        data
      );
      
      // Invalidate lists to show updated data
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.lists() });
    },
    ...options
  });
};

export default {
  useProjects,
  useInfiniteProjects,
  useProject,
  useTopProjects,
  useLatestProjects,
  useSearchProjects,
  usePrefetchProject,
  useInvalidateProjects,
  useCreateProject,
  useUpdateProject
};