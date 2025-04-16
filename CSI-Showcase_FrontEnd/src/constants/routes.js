/**
 * คงค่าเส้นทาง (routes) สำหรับการนำทางภายในแอปพลิเคชัน
 * 
 * ไฟล์นี้รวบรวมเส้นทางทั้งหมดที่ใช้ในแอปพลิเคชัน
 * เพื่อให้การเปลี่ยนแปลงเส้นทางทำได้ที่จุดเดียว
 */

// หน้าหลัก
export const HOME = '/';

// การยืนยันตัวตน
export const AUTH = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

// หน้าข้อมูลผู้ใช้
export const USER = {
  PROFILE: '/user/profile',
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
  VIEW_PROFILE: (id) => `/user/${id}`,
  EDIT_PROFILE: '/user/edit',
};

// โปรเจค
export const PROJECT = {
  ALL: '/projects/all',
  MY_PROJECTS: '/projects/my',
  FEATURED: '/projects/featured',
  BY_TYPE: (type) => `/projects/type/${type}`,
  VIEW: (id) => `/projects/${id}`,
  EDIT: (id) => `/edit/project/${id}`,
  UPLOAD: {
    MAIN: '/upload',
    COURSEWORK: '/upload/coursework',
    ACADEMIC: '/upload/academic',
    COMPETITION: '/upload/competition',
  },
};

// การค้นหา
export const SEARCH = {
  RESULTS: '/search',
  ADVANCED: '/search/advanced',
  BY_TAG: (tag) => `/search/tag/${tag}`,
};

// หน้าทั่วไป
export const GENERAL = {
  ABOUT: '/about',
  CONTACT: '/contact',
  HELP: '/help',
  PRIVACY: '/privacy-policy',
  TERMS: '/terms-of-service',
  NOT_FOUND: '/404',
};

// Export ทั้งหมดในออบเจกต์เดียว
export default {
  HOME,
  AUTH,
  USER,
  PROJECT,
  SEARCH,
  ADMIN,
  GENERAL,
};