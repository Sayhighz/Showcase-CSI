// constants/routes.js

/**
 * เส้นทาง API ทั้งหมดในระบบ
 */
export const API_ROUTES = {
    // เส้นทางหลัก
    BASE: '/api',
    
    // การยืนยันตัวตนสำหรับผู้ใช้ทั่วไป
    AUTH: {
      BASE: '/api/auth',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REGISTER: '/api/auth/register',
      VERIFY_TOKEN: '/api/auth/verify-token',
      ME: '/api/auth/me',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password'
    },
    
    // การจัดการผู้ใช้
    USER: {
      BASE: '/api/users',
      GET_ALL: '/api/users/all',
      GET_BY_ID: '/api/users/:userId',
      UPDATE: '/api/users/:userId',
      UPLOAD_PROFILE_IMAGE: '/api/users/:userId/profile-image',
      CHANGE_PASSWORD: '/api/users/:userId/change-password',
      CHANGE_ROLE: '/api/users/:userId/role',
      DELETE: '/api/users/:userId',
      LOGIN_HISTORY: '/api/users/:userId/login-history',
      MY_PROJECTS: '/api/users/:userId/projects'
    },
    
    // การจัดการโครงการ
    PROJECT: {
      BASE: '/api/projects',
      GET_ALL: '/api/projects/all',
      TOP: '/api/projects/top9',
      LATEST: '/api/projects/latest',
      MY_PROJECTS: '/api/projects/myprojects/:user_id',
      GET_BY_ID: '/api/projects/project/:projectId',
      SEARCH: '/api/projects/search',
      TYPES: '/api/projects/types',
      YEARS: '/api/projects/years',
      STUDY_YEARS: '/api/projects/study-years',
      UPLOAD: '/api/projects/upload/:user_id',
      UPLOAD_FILE: '/api/projects/upload-file/:projectId',
      UPLOAD_STATUS: '/api/projects/upload-status/:sessionId',
      CANCEL_UPLOAD: '/api/projects/cancel-upload/:sessionId',
      UPDATE: '/api/projects/update/:projectId',
      DELETE: '/api/projects/delete/:projectId',
      COMPANY_VIEW: '/api/projects/view/company/:projectId',
      VISITOR_VIEW: '/api/projects/view/visitor/:projectId',
      PENDING: '/api/projects/pending',
      STATS: '/api/projects/stats',
      REVIEW: '/api/projects/review/:projectId'
    },
    
    // การค้นหา
    SEARCH: {
      BASE: '/api/search',
      PROJECTS: '/api/search/projects',
      USERS: '/api/search/users',
      TAGS: '/api/search/tags',
      POPULAR: '/api/search/popular'
    },
    
    // การอัปโหลดไฟล์
    UPLOAD: {
      BASE: '/api/upload',
      PROFILE_IMAGE: '/api/upload/profile-image',
      IMAGES: '/api/upload/images',
      VIDEO: '/api/upload/video',
      DOCUMENTS: '/api/upload/documents',
      FILES: '/api/upload/files',
      MULTIPLE: '/api/upload/multiple',
      DELETE: '/api/upload/delete',
      STORAGE_STATUS: '/api/upload/storage-status'
    },
    
    // การจัดการของผู้ดูแลระบบ
    ADMIN: {
      // การยืนยันตัวตนสำหรับผู้ดูแลระบบ
      AUTH: {
        BASE: '/api/admin/auth',
        LOGIN: '/api/admin/auth/login',
        LOGOUT: '/api/admin/auth/logout',
        VERIFY_TOKEN: '/api/admin/auth/verify-token',
        ME: '/api/admin/auth/me',
        CHANGE_PASSWORD: '/api/admin/auth/change-password/:adminId'
      },
      
      // การจัดการผู้ใช้โดยผู้ดูแลระบบ
      USER: {
        BASE: '/api/admin/users',
        ALL: '/api/admin/users/all',
        GET_BY_ID: '/api/admin/users/user/:userId',
        CREATE: '/api/admin/users/create',
        UPDATE: '/api/admin/users/update/:userId',
        DELETE: '/api/admin/users/delete/:userId',
        STATS: '/api/admin/users/stats'
      },
      
      // การจัดการโครงการโดยผู้ดูแลระบบ
      PROJECT: {
        BASE: '/api/admin/projects',
        ALL: '/api/admin/projects/all',
        PENDING: '/api/admin/projects/pending',
        GET_BY_ID: '/api/admin/projects/project/:projectId',
        REVIEW: '/api/admin/projects/review/:projectId',
        DELETE: '/api/admin/projects/delete/:projectId',
        UPDATE: '/api/admin/projects/update/:projectId',
        REVIEWS: '/api/admin/projects/reviews/:projectId',
        REVIEW_STATS: '/api/admin/projects/review-stats',
        STATS: '/api/admin/projects/stats',
        ALL_REVIEWS: '/api/admin/projects/all-reviews'
      },
      
      // สถิติ
      STATISTICS: {
        BASE: '/api/admin/stats',
        DASHBOARD: '/api/admin/stats/dashboard',
        TODAY: '/api/admin/stats/today',
        USERS: '/api/admin/stats/users',
        PROJECTS: '/api/admin/stats/projects',
        VIEWS: '/api/admin/stats/views',
        PROJECT_TYPES: '/api/admin/stats/project-types',
        STUDY_YEARS: '/api/admin/stats/study-years'
      },
      
      // ประวัติการใช้งาน
      LOGS: {
        BASE: '/api/admin/logs',
        LOGIN: '/api/admin/logs/login-logs',
        VIEWS: '/api/admin/logs/views',
        COMPANY_VIEWS: '/api/admin/logs/company-views',
        VISITOR_VIEWS: '/api/admin/logs/visitor-views',
        SYSTEM: '/api/admin/logs/system',
        DAILY: '/api/admin/logs/daily'
      }
    }
  };
  
  /**
   * เส้นทางที่ไม่ต้องยืนยันตัวตน
   */
  export const PUBLIC_ROUTES = [
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
    API_ROUTES.PROJECT.VISITOR_VIEW,
    API_ROUTES.SEARCH.PROJECTS,
    API_ROUTES.SEARCH.TAGS,
    API_ROUTES.SEARCH.POPULAR
  ];
  
  /**
   * เส้นทางที่ต้องมีสิทธิ์เป็นผู้ดูแลระบบ
   */
  export const ADMIN_ROUTES = [
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
  export const isAuthRequired = (path) => {
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
  export const isAdminRequired = (path) => {
    // ตรวจสอบว่าเป็นเส้นทางสำหรับผู้ดูแลระบบหรือไม่
    for (const adminPath of ADMIN_ROUTES) {
      // ตรวจสอบว่าเส้นทางเริ่มต้นด้วยเส้นทางผู้ดูแลระบบหรือไม่
      if (path.startsWith(adminPath)) {
        return true;
      }
    }
    
    return false;
  };