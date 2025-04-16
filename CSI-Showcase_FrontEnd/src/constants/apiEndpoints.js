/**
 * API endpoints สำหรับการเรียกใช้งาน API ของ CSI Showcase
 * 
 * ไฟล์นี้รวบรวม endpoints ทั้งหมดที่ใช้ในแอปพลิเคชัน
 * เพื่อให้การเปลี่ยนแปลง endpoint ทำได้ที่จุดเดียว
 */

// Base API URL (ปกติจะดึงจาก environment variable)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Authentication endpoints
export const AUTH = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify-token`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
};

// User endpoints
export const USER = {
  GET_ALL: `${API_BASE_URL}/users`,
  GET_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/users/${id}`,
  DELETE: (id) => `${API_BASE_URL}/users/${id}`,
  CHANGE_PASSWORD: (id) => `${API_BASE_URL}/users/${id}/change-password`,
  CHANGE_ROLE: (id) => `${API_BASE_URL}/users/${id}/change-role`,
  UPLOAD_PROFILE_IMAGE: (id) => `${API_BASE_URL}/users/${id}/profile-image`,
  LOGIN_HISTORY: (id) => `${API_BASE_URL}/users/${id}/login-history`,
  USER_PROJECTS: (id) => `${API_BASE_URL}/users/${id}/projects`,
};

// Project endpoints
export const PROJECT = {
  GET_ALL: `${API_BASE_URL}/projects/all`,
  GET_BY_ID: (id) => `${API_BASE_URL}/projects/project/${id}`,
  TOP: `${API_BASE_URL}/projects/top9`,
  LATEST: `${API_BASE_URL}/projects/latest`,
  MY_PROJECTS: (userId) => `${API_BASE_URL}/projects/myprojects/${userId}`,
  UPLOAD: (userId) => `${API_BASE_URL}/projects/upload/${userId}`,
  UPDATE: (id) => `${API_BASE_URL}/projects/${id}`,
  DELETE: (id) => `${API_BASE_URL}/projects/${id}`,
  SEARCH: `${API_BASE_URL}/projects/search`,
  UPLOAD_FILE: (id) => `${API_BASE_URL}/projects/${id}/upload`,
  PENDING: `${API_BASE_URL}/projects/pending`,
  REVIEW: (id) => `${API_BASE_URL}/projects/${id}/review`,
  STATS: `${API_BASE_URL}/projects/stats`,
  TYPES: `${API_BASE_URL}/projects/types`,
  YEARS: `${API_BASE_URL}/projects/years`,
  STUDY_YEARS: `${API_BASE_URL}/projects/study-years`,
  VISITOR_VIEW: (id) => `${API_BASE_URL}/projects/${id}/visitor-view`,
  COMPANY_VIEW: (id) => `${API_BASE_URL}/projects/${id}/company-view`,
};

// Search endpoints
export const SEARCH = {
  PROJECTS: `${API_BASE_URL}/search/projects`,
  USERS: `${API_BASE_URL}/search/users`,
  TAGS: `${API_BASE_URL}/search/tags`,
  POPULAR_TAGS: `${API_BASE_URL}/search/popular-tags`,
  POPULAR_SEARCHES: `${API_BASE_URL}/search/popular-searches`,
  LOG_SEARCH: `${API_BASE_URL}/search/log`,
  USER_HISTORY: `${API_BASE_URL}/search/user-history`,
};

// Upload endpoints
export const UPLOAD = {
  PROFILE_IMAGE: `${API_BASE_URL}/upload/profile-image`,
  IMAGES: `${API_BASE_URL}/upload/images`,
  VIDEO: `${API_BASE_URL}/upload/video`,
  DOCUMENTS: `${API_BASE_URL}/upload/documents`,
  FILES: `${API_BASE_URL}/upload/files`,
  MULTIPLE: `${API_BASE_URL}/upload/multiple`,
  DELETE: `${API_BASE_URL}/upload/delete`,
  STORAGE_STATUS: `${API_BASE_URL}/upload/storage-status`,
};

// Export ทั้งหมดในออบเจกต์เดียว
export default {
  BASE_URL: API_BASE_URL,
  AUTH,
  USER,
  PROJECT,
  SEARCH,
  UPLOAD,
};