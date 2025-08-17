// constants/routes.js

/**
 * เส้นทาง API ทั้งหมดในระบบ
 */
const API_ROUTES = {
  // เส้นทางหลัก
  BASE: '/api',
  
  // การยืนยันตัวตนสำหรับผู้ใช้ทั่วไป
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    VERIFY_TOKEN: '/verify-token',
    ME: '/me',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password'
  },
  
  // การจัดการผู้ใช้
  USER: {
    BASE: '/api/users',
    GET_ALL: '/all',
    GET_BY_ID: '/:userId',
    UPDATE: '/:userId',
    UPLOAD_PROFILE_IMAGE: '/:userId/profile-image',
    CHANGE_PASSWORD: '/:userId/change-password',
    CHANGE_ROLE: '/:userId/role',
    DELETE: '/:userId',
    LOGIN_HISTORY: '/:userId/login-history',
    MY_PROJECTS: '/:userId/projects',
    REGISTER: '/register'
  },
  
  // การจัดการโครงการ
  PROJECT: {
    BASE: '/api/projects',
    GET_ALL: '/all',
    TOP: '/top9',
    LATEST: '/latest',
    MY_PROJECTS: '/myprojects/:user_id',
    GET_BY_ID: '/project/:projectId',
    SEARCH: '/search',
    TYPES: '/types',
    YEARS: '/years',
    STUDY_YEARS: '/study-years',
    UPLOAD: '/upload/:user_id',
    UPLOAD_FILE: '/upload-file/:projectId',
    UPLOAD_STATUS: '/upload-status/:sessionId',
    CANCEL_UPLOAD: '/cancel-upload/:sessionId',
    UPDATE: '/update/:projectId',
    DELETE: '/delete/:projectId',
    VIEW_COUNT: '/:projectId/view',
    COMPANY_VIEW: '/view/company/:projectId',
    VISITOR_VIEW: '/view/visitor/:projectId',
    PENDING: '/pending',
    STATS: '/stats',
    REVIEW: '/review/:projectId'
  },
  
  // การค้นหา
  SEARCH: {
    BASE: '/api/search',
    PROJECTS: '/projects',
    USERS: '/users',
    TAGS: '/tags',
    POPULAR: '/popular'
  },
  
  // การอัปโหลดไฟล์
  UPLOAD: {
    BASE: '/api/upload',
    PROFILE_IMAGE: '/profile-image',
    IMAGES: '/images',
    VIDEO: '/video',
    DOCUMENTS: '/documents',
    FILES: '/files',
    MULTIPLE: '/multiple',
    DELETE: '/delete',
    STORAGE_STATUS: '/storage-status'
  },
  
  // การจัดการของผู้ดูแลระบบ
  ADMIN: {
    // การยืนยันตัวตนสำหรับผู้ดูแลระบบ
    AUTH: {
      BASE: '/api/admin/auth',
      LOGIN: '/login',
      LOGOUT: '/logout',
      VERIFY_TOKEN: '/verify-token',
      ME: '/me',
      CHANGE_PASSWORD: '/change-password/:adminId',
      FORGOT_PASSWORD: '/forgot-password',
      RESET_PASSWORD: '/reset-password'
    },
    
    // การจัดการผู้ใช้โดยผู้ดูแลระบบ
    USER: {
      BASE: '/api/admin/users',
      ALL: '/all',
      GET_BY_ID: '/user/:userId',
      CREATE: '/create',
      UPDATE: '/update/:userId',
      DELETE: '/delete/:userId',
      STATS: '/stats',
      LOGIN_HISTORY: '/login-history',
      BATCH_IMPORT: '/batch-import',
      CSV_TEMPLATE: '/csv-template',
    },
    
    // การจัดการโครงการโดยผู้ดูแลระบบ
    PROJECT: {
      BASE: '/api/admin/projects',
      ALL: '/all',
      PENDING: '/pending',
      GET_BY_ID: '/project/:projectId',
      REVIEW: '/review/:projectId',
      DELETE: '/delete/:projectId',
      UPDATE: '/update/:projectId',
      REVIEWS: '/reviews/:projectId',
      REVIEW_STATS: '/review-stats',
      STATS: '/stats',
      ALL_REVIEWS: '/all-reviews'
    },
    
    // สถิติ
    STATISTICS: {
      BASE: '/api/admin/stats',
      DASHBOARD: '/dashboard',
      TODAY: '/today',
      PROJECT_TYPES: '/project-types',
      STUDY_YEARS: '/study-years'
    },
    
    // ประวัติการใช้งาน
    LOGS: {
      BASE: '/api/admin/logs',
      LOGIN_LOGS: '/login-logs',
      COMPANY_VIEWS: '/company-views',
      VISITOR_VIEWS: '/visitor-views',
      PROJECT_REVIEWS: '/project-reviews',
      SYSTEM_STATS: '/system-stats',
      DAILY_STATS: '/daily-stats'
    }
  }
};

/**
* เส้นทางที่ไม่ต้องยืนยันตัวตน
*/
const PUBLIC_ROUTES = [
API_ROUTES.BASE,
API_ROUTES.AUTH.LOGIN,
API_ROUTES.AUTH.REGISTER,
API_ROUTES.AUTH.FORGOT_PASSWORD,
API_ROUTES.AUTH.RESET_PASSWORD,
API_ROUTES.ADMIN.AUTH.LOGIN,
API_ROUTES.PROJECT.GET_ALL,
API_ROUTES.PROJECT.TOP,
API_ROUTES.PROJECT.LATEST,
API_ROUTES.PROJECT.GET_BY_ID,
API_ROUTES.PROJECT.SEARCH,
API_ROUTES.PROJECT.TYPES,
API_ROUTES.PROJECT.YEARS,
API_ROUTES.PROJECT.STUDY_YEARS,
API_ROUTES.PROJECT.VIEW_COUNT,
API_ROUTES.PROJECT.VISITOR_VIEW,
API_ROUTES.SEARCH.PROJECTS,
API_ROUTES.SEARCH.TAGS,
API_ROUTES.SEARCH.POPULAR
];

/**
* เส้นทางที่ต้องมีสิทธิ์เป็นผู้ดูแลระบบ
*/
const ADMIN_ROUTES = [
API_ROUTES.ADMIN.AUTH.BASE,
API_ROUTES.ADMIN.USER.BASE,
API_ROUTES.ADMIN.PROJECT.BASE,
API_ROUTES.ADMIN.STATISTICS.BASE,
API_ROUTES.ADMIN.LOGS.BASE,
API_ROUTES.PROJECT.PENDING,
API_ROUTES.PROJECT.STATS,
API_ROUTES.PROJECT.REVIEW,
API_ROUTES.USER.GET_ALL,
API_ROUTES.USER.CHANGE_ROLE,
API_ROUTES.USER.DELETE,
API_ROUTES.UPLOAD.STORAGE_STATUS
];

/**
* ตรวจสอบว่าเส้นทางต้องการยืนยันตัวตนหรือไม่
* @param {string} path - เส้นทางที่ต้องการตรวจสอบ
* @returns {boolean} - true ถ้าต้องการยืนยันตัวตน, false ถ้าไม่ต้องการ
*/
const isAuthRequired = (path) => {
// ตรวจสอบว่าเป็นเส้นทางสาธารณะหรือไม่
for (const publicPath of PUBLIC_ROUTES) {
  // ตรวจสอบเส้นทางพื้นฐาน (เช่น /api/auth/login)
  if (publicPath === path) {
    return false;
  }
  
  // ตรวจสอบเส้นทางแบบมีพารามิเตอร์ (เช่น /api/projects/project/123)
  if (publicPath.includes(':') && path.startsWith(publicPath.split(':')[0])) {
    return false;
  }
}

return true;
};

/**
* ตรวจสอบว่าเส้นทางต้องการสิทธิ์ผู้ดูแลระบบหรือไม่
* @param {string} path - เส้นทางที่ต้องการตรวจสอบ
* @returns {boolean} - true ถ้าต้องการสิทธิ์ผู้ดูแลระบบ, false ถ้าไม่ต้องการ
*/
const isAdminRequired = (path) => {
// ตรวจสอบว่าเป็นเส้นทางสำหรับผู้ดูแลระบบหรือไม่
for (const adminPath of ADMIN_ROUTES) {
  // ตรวจสอบว่าเส้นทางเริ่มต้นด้วยเส้นทางผู้ดูแลระบบหรือไม่
  if (path.startsWith(adminPath)) {
    return true;
  }
}

return false;
};

// Export constants และ functions
module.exports = {
API_ROUTES,
PUBLIC_ROUTES,
ADMIN_ROUTES,
isAuthRequired,
isAdminRequired
};