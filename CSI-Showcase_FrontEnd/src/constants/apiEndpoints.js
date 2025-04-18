/**
 * API endpoints สำหรับการเรียกใช้งาน API ของ CSI Showcase
 * 
 * ไฟล์นี้รวบรวม endpoints ทั้งหมดที่ใช้ในแอปพลิเคชัน
 * เพื่อให้การเปลี่ยนแปลง endpoint ทำได้ที่จุดเดียว
 */

// Base API URL (ปกติจะดึงจาก environment variable)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * เส้นทาง API ทั้งหมดในระบบ
 */
export const API_ENDPOINTS = {
  // เส้นทางหลัก
  BASE: API_BASE_URL,
  
  // การยืนยันตัวตนสำหรับผู้ใช้ทั่วไป
  AUTH: {
    BASE: `${API_BASE_URL}/auth`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY_TOKEN: `${API_BASE_URL}/auth/verify-token`,
    ME: `${API_BASE_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`
  },
  
  // การจัดการผู้ใช้
  USER: {
    BASE: `${API_BASE_URL}/users`,
    GET_ALL: `${API_BASE_URL}/users/all`,
    GET_BY_ID: (userId) => `${API_BASE_URL}/users/${userId}`,
    UPDATE: (userId) => `${API_BASE_URL}/users/${userId}`,
    UPLOAD_PROFILE_IMAGE: (userId) => `${API_BASE_URL}/users/${userId}/profile-image`,
    CHANGE_PASSWORD: (userId) => `${API_BASE_URL}/users/${userId}/change-password`,
    CHANGE_ROLE: (userId) => `${API_BASE_URL}/users/${userId}/role`,
    DELETE: (userId) => `${API_BASE_URL}/users/${userId}`,
    LOGIN_HISTORY: (userId) => `${API_BASE_URL}/users/${userId}/login-history`,
    MY_PROJECTS: (userId) => `${API_BASE_URL}/users/${userId}/projects`,
    REGISTER: `${API_BASE_URL}/users/register`
  },
  
  // การจัดการโครงการ
  PROJECT: {
    BASE: `${API_BASE_URL}/projects`,
    GET_ALL: `${API_BASE_URL}/projects/all`,
    TOP: `${API_BASE_URL}/projects/top9`,
    LATEST: `${API_BASE_URL}/projects/latest`,
    MY_PROJECTS: (userId) => `${API_BASE_URL}/projects/myprojects/${userId}`,
    GET_BY_ID: (projectId) => `${API_BASE_URL}/projects/project/${projectId}`,
    SEARCH: `${API_BASE_URL}/projects/search`,
    TYPES: `${API_BASE_URL}/projects/types`,
    YEARS: `${API_BASE_URL}/projects/years`,
    STUDY_YEARS: `${API_BASE_URL}/projects/study-years`,
    UPLOAD: (userId) => `${API_BASE_URL}/projects/user/${userId}`,
    UPLOAD_FILE: (projectId) => `${API_BASE_URL}/projects/upload-file/${projectId}`,
    UPLOAD_STATUS: (sessionId) => `${API_BASE_URL}/projects/upload-status/${sessionId}`,
    CANCEL_UPLOAD: (sessionId) => `${API_BASE_URL}/projects/cancel-upload/${sessionId}`,
    UPDATE: (projectId) => `${API_BASE_URL}/projects/update/${projectId}`,
    DELETE: (projectId) => `${API_BASE_URL}/projects/delete/${projectId}`,
    COMPANY_VIEW: (projectId) => `${API_BASE_URL}/projects/view/company/${projectId}`,
    VISITOR_VIEW: (projectId) => `${API_BASE_URL}/projects/view/visitor/${projectId}`,
    PENDING: `${API_BASE_URL}/projects/pending`,
    STATS: `${API_BASE_URL}/projects/stats`,
    REVIEW: (projectId) => `${API_BASE_URL}/projects/review/${projectId}`
  },
  
  // การค้นหา
  SEARCH: {
    BASE: `${API_BASE_URL}/search`,
    PROJECTS: `${API_BASE_URL}/search/projects`,
    USERS: `${API_BASE_URL}/search/users`,
    TAGS: `${API_BASE_URL}/search/tags`,
    POPULAR: `${API_BASE_URL}/search/popular`,
    POPULAR_TAGS: `${API_BASE_URL}/search/popular-tags`,
    POPULAR_SEARCHES: `${API_BASE_URL}/search/popular-searches`,
    LOG_SEARCH: `${API_BASE_URL}/search/log`,
    USER_HISTORY: `${API_BASE_URL}/search/user-history`
  },
  
  // การอัปโหลดไฟล์
  UPLOAD: {
    BASE: `${API_BASE_URL}/upload`,
    PROFILE_IMAGE: `${API_BASE_URL}/upload/profile-image`,
    IMAGES: `${API_BASE_URL}/upload/images`,
    VIDEO: `${API_BASE_URL}/upload/video`,
    DOCUMENTS: `${API_BASE_URL}/upload/documents`,
    FILES: `${API_BASE_URL}/upload/files`,
    MULTIPLE: `${API_BASE_URL}/upload/multiple`,
    DELETE: `${API_BASE_URL}/upload/delete`,
    STORAGE_STATUS: `${API_BASE_URL}/upload/storage-status`
  }
};

/**
 * Helper functions เพื่อตรวจสอบประเภทของเส้นทาง API
 */

/**
 * ตรวจสอบว่าเส้นทางต้องการยืนยันตัวตนหรือไม่
 * @param {string} path - เส้นทางที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าต้องการยืนยันตัวตน, false ถ้าไม่ต้องการ
 */
export const isAuthRequired = (path) => {
  // Define public routes
  const PUBLIC_ROUTES = [
    API_ENDPOINTS.BASE,
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REGISTER,
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    API_ENDPOINTS.PROJECT.GET_ALL,
    API_ENDPOINTS.PROJECT.TOP,
    API_ENDPOINTS.PROJECT.LATEST,
    API_ENDPOINTS.PROJECT.SEARCH,
    API_ENDPOINTS.PROJECT.TYPES,
    API_ENDPOINTS.PROJECT.YEARS,
    API_ENDPOINTS.PROJECT.STUDY_YEARS,
    API_ENDPOINTS.PROJECT.VISITOR_VIEW,
    API_ENDPOINTS.SEARCH.PROJECTS,
    API_ENDPOINTS.SEARCH.TAGS,
    API_ENDPOINTS.SEARCH.POPULAR
  ];
  
  // Check if path is public
  for (const publicPath of PUBLIC_ROUTES) {
    if (path === publicPath) {
      return false;
    }
    
    // Check dynamic routes
    if (typeof publicPath === 'string' && 
        publicPath.includes(':') && 
        path.startsWith(publicPath.split(':')[0])) {
      return false;
    }
  }
  
  return true;
};

// Export ทั้งหมดในออบเจกต์เดียว
export default {
  BASE_URL: API_BASE_URL,
  ...API_ENDPOINTS,
  isAuthRequired
};