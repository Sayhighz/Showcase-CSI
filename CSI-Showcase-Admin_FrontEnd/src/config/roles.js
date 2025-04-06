// src/config/roles.js

/**
 * กำหนดบทบาทและสิทธิ์การเข้าถึงในระบบ
 */

// บทบาทในระบบ
export const ROLES = {
    ADMIN: 'admin',
    STUDENT: 'student',
    VISITOR: 'visitor'
  };
  
  // สิทธิ์การเข้าถึงสำหรับแต่ละบทบาท
  export const PERMISSIONS = {
    // สิทธิ์การเข้าถึงหน้าต่าง ๆ
    PAGES: {
      // แดชบอร์ด
      DASHBOARD: 'page:dashboard',
      // การจัดการโปรเจค
      PROJECTS: 'page:projects',
      PROJECT_REVIEW: 'page:project_review',
      PROJECT_DETAIL: 'page:project_detail',
      // การจัดการผู้ใช้
      USERS: 'page:users',
      STUDENT_USERS: 'page:student_users',
      ADMIN_USERS: 'page:admin_users',
      // ประวัติการเข้าสู่ระบบ
      LOGIN_INFO: 'page:login_info',
      // การตั้งค่า
      SETTINGS: 'page:settings',
      // โปรไฟล์
      PROFILE: 'page:profile'
    },
    
    // สิทธิ์การดำเนินการกับโปรเจค
    PROJECTS: {
      CREATE: 'project:create',
      VIEW: 'project:view',
      VIEW_OWN: 'project:view_own',
      EDIT: 'project:edit',
      EDIT_OWN: 'project:edit_own',
      DELETE: 'project:delete',
      DELETE_OWN: 'project:delete_own',
      REVIEW: 'project:review'
    },
    
    // สิทธิ์การดำเนินการกับผู้ใช้
    USERS: {
      CREATE: 'user:create',
      VIEW: 'user:view',
      EDIT: 'user:edit',
      DELETE: 'user:delete',
      CHANGE_ROLE: 'user:change_role'
    },
    
    // สิทธิ์การดำเนินการกับรายงาน
    REPORTS: {
      VIEW: 'report:view',
      EXPORT: 'report:export',
      GENERATE: 'report:generate'
    }
  };
  
  // กำหนดสิทธิ์การเข้าถึงสำหรับแต่ละบทบาท
  export const ROLE_PERMISSIONS = {
    // สิทธิ์สำหรับผู้ดูแลระบบ (admin)
    [ROLES.ADMIN]: [
      // สิทธิ์การเข้าถึงหน้าต่าง ๆ
      PERMISSIONS.PAGES.DASHBOARD,
      PERMISSIONS.PAGES.PROJECTS,
      PERMISSIONS.PAGES.PROJECT_REVIEW,
      PERMISSIONS.PAGES.PROJECT_DETAIL,
      PERMISSIONS.PAGES.USERS,
      PERMISSIONS.PAGES.STUDENT_USERS,
      PERMISSIONS.PAGES.ADMIN_USERS,
      PERMISSIONS.PAGES.LOGIN_INFO,
      PERMISSIONS.PAGES.SETTINGS,
      PERMISSIONS.PAGES.PROFILE,
      
      // สิทธิ์การดำเนินการกับโปรเจค
      PERMISSIONS.PROJECTS.CREATE,
      PERMISSIONS.PROJECTS.VIEW,
      PERMISSIONS.PROJECTS.VIEW_OWN,
      PERMISSIONS.PROJECTS.EDIT,
      PERMISSIONS.PROJECTS.EDIT_OWN,
      PERMISSIONS.PROJECTS.DELETE,
      PERMISSIONS.PROJECTS.DELETE_OWN,
      PERMISSIONS.PROJECTS.REVIEW,
      
      // สิทธิ์การดำเนินการกับผู้ใช้
      PERMISSIONS.USERS.CREATE,
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.USERS.EDIT,
      PERMISSIONS.USERS.DELETE,
      PERMISSIONS.USERS.CHANGE_ROLE,
      
      // สิทธิ์การดำเนินการกับรายงาน
      PERMISSIONS.REPORTS.VIEW,
      PERMISSIONS.REPORTS.EXPORT,
      PERMISSIONS.REPORTS.GENERATE
    ],
    
    // สิทธิ์สำหรับนักศึกษา (student)
    [ROLES.STUDENT]: [
      // สิทธิ์การเข้าถึงหน้าต่าง ๆ
      PERMISSIONS.PAGES.PROFILE,
      
      // สิทธิ์การดำเนินการกับโปรเจค
      PERMISSIONS.PROJECTS.CREATE,
      PERMISSIONS.PROJECTS.VIEW_OWN,
      PERMISSIONS.PROJECTS.EDIT_OWN,
      PERMISSIONS.PROJECTS.DELETE_OWN
    ],
    
    // สิทธิ์สำหรับผู้เยี่ยมชม (visitor)
    [ROLES.VISITOR]: [
      // สิทธิ์การเข้าถึงหน้าต่าง ๆ
      PERMISSIONS.PAGES.PROFILE,
      
      // สิทธิ์การดำเนินการกับโปรเจค
      PERMISSIONS.PROJECTS.VIEW
    ]
  };
  
  /**
   * ตรวจสอบว่าบทบาทมีสิทธิ์การเข้าถึงหรือไม่
   * @param {string} role - บทบาทที่ต้องการตรวจสอบ
   * @param {string} permission - สิทธิ์การเข้าถึงที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
   */
  export const hasPermission = (role, permission) => {
    // ตรวจสอบว่าบทบาทมีอยู่ในระบบหรือไม่
    if (!ROLE_PERMISSIONS[role]) {
      return false;
    }
    
    // ตรวจสอบว่าบทบาทมีสิทธิ์การเข้าถึงหรือไม่
    return ROLE_PERMISSIONS[role].includes(permission);
  };
  
  /**
   * ตรวจสอบว่าบทบาทมีสิทธิ์การเข้าถึงหน้าหรือไม่
   * @param {string} role - บทบาทที่ต้องการตรวจสอบ
   * @param {string} page - หน้าที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
   */
  export const canAccessPage = (role, page) => {
    return hasPermission(role, `page:${page}`);
  };
  
  /**
   * ตรวจสอบว่าบทบาทมีสิทธิ์ดำเนินการกับโปรเจคหรือไม่
   * @param {string} role - บทบาทที่ต้องการตรวจสอบ
   * @param {string} action - การดำเนินการที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
   */
  export const canPerformProjectAction = (role, action) => {
    return hasPermission(role, `project:${action}`);
  };
  
  /**
   * ตรวจสอบว่าบทบาทมีสิทธิ์ดำเนินการกับผู้ใช้หรือไม่
   * @param {string} role - บทบาทที่ต้องการตรวจสอบ
   * @param {string} action - การดำเนินการที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
   */
  export const canPerformUserAction = (role, action) => {
    return hasPermission(role, `user:${action}`);
  };
  
  /**
   * ตรวจสอบว่าบทบาทมีสิทธิ์ดำเนินการกับรายงานหรือไม่
   * @param {string} role - บทบาทที่ต้องการตรวจสอบ
   * @param {string} action - การดำเนินการที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
   */
  export const canPerformReportAction = (role, action) => {
    return hasPermission(role, `report:${action}`);
  };
  
  export default {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    hasPermission,
    canAccessPage,
    canPerformProjectAction,
    canPerformUserAction,
    canPerformReportAction
  };