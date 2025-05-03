// src/constants/apiEndpoints.js

/**
 * เก็บ endpoint ของ API ทั้งหมดในระบบ
 * แยกตามกลุ่มการใช้งาน
 */

// Base URL
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const ADMIN_BASE_URL = `${BASE_URL}/admin`;

// การยืนยันตัวตนของแอดมิน (Admin Authentication)
export const ADMIN = {
  AUTH: {
    LOGIN: `${ADMIN_BASE_URL}/auth/login`,
    LOGOUT: `${ADMIN_BASE_URL}/auth/logout`,
    VERIFY_TOKEN: `${ADMIN_BASE_URL}/auth/verify-token`,
    ME: `${ADMIN_BASE_URL}/auth/me`
  },
  USER: {
    ALL: `${ADMIN_BASE_URL}/users/all`,
    GET_BY_ID: (userId) => `${ADMIN_BASE_URL}/users/user/${userId}`,
    CREATE: `${ADMIN_BASE_URL}/users/create`,
    UPDATE: (userId) => `${ADMIN_BASE_URL}/users/update/${userId}`,
    DELETE: (userId) => `${ADMIN_BASE_URL}/users/delete/${userId}`,
    STATS: `${ADMIN_BASE_URL}/users/stats`
  },
  PROJECT: {
    ALL: `${ADMIN_BASE_URL}/projects/all`,
    PENDING: `${ADMIN_BASE_URL}/projects/pending`,
    GET_BY_ID: (projectId) => `${ADMIN_BASE_URL}/projects/project/${projectId}`,
    REVIEW: (projectId) => `${ADMIN_BASE_URL}/projects/review/${projectId}`,
    DELETE: (projectId) => `${ADMIN_BASE_URL}/projects/delete/${projectId}`,
    UPDATE: (projectId) => `${ADMIN_BASE_URL}/projects/update/${projectId}`,
    REVIEWS: (projectId) => `${ADMIN_BASE_URL}/projects/reviews/${projectId}`,
    REVIEW_STATS: `${ADMIN_BASE_URL}/projects/review-stats`,
    STATS: `${ADMIN_BASE_URL}/projects/stats`,
    ALL_REVIEWS: `${ADMIN_BASE_URL}/projects/all-reviews`
  },
  STATISTICS: {
    DASHBOARD: `${ADMIN_BASE_URL}/stats/dashboard`,
    TODAY: `${ADMIN_BASE_URL}/stats/today`,
    PROJECT_TYPES: `${ADMIN_BASE_URL}/stats/project-types`,
    STUDY_YEARS: `${ADMIN_BASE_URL}/stats/study-years`
  },
  LOGS: {
    LOGIN_LOGS: `${ADMIN_BASE_URL}/logs/login-logs`,
    VISITOR_VIEWS: `${ADMIN_BASE_URL}/logs/visitor-views`,
    PROJECT_REVIEWS: `${ADMIN_BASE_URL}/logs/project-reviews`,
    SYSTEM_STATS: `${ADMIN_BASE_URL}/logs/system-stats`,
    DAILY_STATS: `${ADMIN_BASE_URL}/logs/daily-stats`
  }
};

// การยืนยันตัวตน (Authentication) สำหรับผู้ใช้ทั่วไป
export const AUTH = {
  LOGIN: `${BASE_URL}/auth/login`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  VERIFY_TOKEN: `${BASE_URL}/auth/verify-token`,
  ME: `${BASE_URL}/auth/me`,
};

// การจัดการผู้ใช้งาน (User Management)
export const USER = {
  GET_ALL: `${BASE_URL}/users/all`,
  GET_BY_ID: (userId) => `${BASE_URL}/users/user/${userId}`,
  CREATE: `${BASE_URL}/users/create`,
  UPDATE: (userId) => `${BASE_URL}/users/update/${userId}`,
  DELETE: (userId) => `${BASE_URL}/users/delete/${userId}`,
  STATS: `${BASE_URL}/users/stats`,
  LOGIN_HISTORY: `${BASE_URL}/users/login-history`,
  REGISTER: `${BASE_URL}/users/register`
};

// การจัดการโปรเจค (Project Management)
export const PROJECT = {
  GET_ALL: `${BASE_URL}/projects/all`,
  PENDING: `${BASE_URL}/projects/pending`,
  GET_BY_ID: (projectId) => `${BASE_URL}/projects/project/${projectId}`,
  REVIEW: (projectId) => `${BASE_URL}/projects/review/${projectId}`,
  DELETE: (projectId) => `${BASE_URL}/projects/delete/${projectId}`,
  UPDATE: (projectId) => `${BASE_URL}/projects/update/${projectId}`,
  REVIEWS: (projectId) => `${BASE_URL}/projects/reviews/${projectId}`,
  REVIEW_STATS: `${BASE_URL}/projects/review-stats`,
  STATS: `${BASE_URL}/projects/stats`,
  ALL_REVIEWS: `${BASE_URL}/projects/all-reviews`
};

// สถิติและการวิเคราะห์ (Statistics & Analytics)
export const STATISTICS = {
  DASHBOARD: `${BASE_URL}/stats/dashboard`,
  TODAY: `${BASE_URL}/stats/today`,
  PROJECT_TYPES: `${BASE_URL}/stats/project-types`,
  STUDY_YEARS: `${BASE_URL}/stats/study-years`,
  USER_ACTIVITY: `${BASE_URL}/stats/user-activity`
};

// ประวัติการใช้งาน (Logs)
export const LOGS = {
  LOGIN_LOGS: `${BASE_URL}/logs/login-logs`,
  COMPANY_VIEWS: `${BASE_URL}/logs/company-views`,
  VISITOR_VIEWS: `${BASE_URL}/logs/visitor-views`,
  PROJECT_REVIEWS: `${BASE_URL}/logs/project-reviews`,
  SYSTEM_STATS: `${BASE_URL}/logs/system-stats`,
  DAILY_STATS: `${BASE_URL}/logs/daily-stats`
};

// การอัปโหลดไฟล์ (File Upload)
export const UPLOAD = {
  PROFILE_IMAGE: (userId) => `${BASE_URL}/upload/profile-image/${userId}`,
  PROJECT_IMAGE: (projectId) => `${BASE_URL}/upload/project-image/${projectId}`,
  PROJECT_FILE: (projectId) => `${BASE_URL}/upload/project-file/${projectId}`,
  DELETE_FILE: (fileId) => `${BASE_URL}/upload/delete/${fileId}`,
  STORAGE_STATUS: `${BASE_URL}/upload/storage-status`
};

// การค้นหา (Search)
export const SEARCH = {
  PROJECTS: `${BASE_URL}/search/projects`,
  USERS: `${BASE_URL}/search/users`,
  TAGS: `${BASE_URL}/search/tags`
};

/**
 * สร้าง URL พร้อม query parameters
 * @param {string} baseUrl - URL พื้นฐาน
 * @param {Object} params - พารามิเตอร์
 * @returns {string} - URL ที่สมบูรณ์
 */
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export default {
  BASE_URL,
  ADMIN_BASE_URL,
  ADMIN,
  AUTH,
  USER,
  PROJECT,
  STATISTICS,
  LOGS,
  UPLOAD,
  SEARCH,
  buildUrl
};