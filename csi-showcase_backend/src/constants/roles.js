// constants/roles.js

/**
 * บทบาทของผู้ใช้ในระบบ
 */
const ROLES = {
  VISITOR: 'visitor',   // ผู้เยี่ยมชม
  STUDENT: 'student',   // นักศึกษา
  ADMIN: 'admin'        // ผู้ดูแลระบบ
};

/**
 * สิทธิ์การเข้าถึงตามบทบาท
 */
const ROLE_PERMISSIONS = {
  [ROLES.VISITOR]: {
    name: 'ผู้เยี่ยมชม',
    description: 'สามารถดูผลงานที่อนุมัติแล้วเท่านั้น',
    permissions: [
      'view_approved_projects'
    ]
  },
  [ROLES.STUDENT]: {
    name: 'นักศึกษา',
    description: 'สามารถดูผลงาน, อัปโหลดผลงานของตนเอง และแก้ไขโปรไฟล์ตัวเอง',
    permissions: [
      'view_approved_projects',
      'create_projects',
      'edit_own_projects',
      'delete_own_projects',
      'edit_own_profile'
    ]
  },
  [ROLES.ADMIN]: {
    name: 'ผู้ดูแลระบบ',
    description: 'สามารถจัดการทุกอย่างในระบบ',
    permissions: [
      'view_approved_projects',
      'view_pending_projects',
      'create_projects',
      'edit_any_projects',
      'delete_any_projects',
      'review_projects',
      'edit_own_profile',
      'view_users',
      'create_users',
      'edit_users',
      'delete_users',
      'view_statistics',
      'view_logs'
    ]
  }
};

/**
 * ตรวจสอบว่าเป็นบทบาทที่ถูกต้องหรือไม่
 * @param {string} role - บทบาทที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็นบทบาทที่ถูกต้อง, false ถ้าไม่ใช่
 */
const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

/**
 * ตรวจสอบว่าบทบาทมีสิทธิ์เข้าถึงการกระทำนั้นหรือไม่
 * @param {string} role - บทบาทที่ต้องการตรวจสอบ
 * @param {string} permission - สิทธิ์ที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
 */
const hasPermission = (role, permission) => {
  if (!isValidRole(role)) {
    return false;
  }
  
  return ROLE_PERMISSIONS[role].permissions.includes(permission);
};

/**
 * ดึงข้อมูลบทบาททั้งหมดสำหรับแสดงผล
 * @returns {Array} - รายการบทบาททั้งหมด
 */
const getRolesList = () => {
  return Object.values(ROLES).map(role => ({
    value: role,
    label: ROLE_PERMISSIONS[role].name,
    description: ROLE_PERMISSIONS[role].description
  }));
};

// Export constants และ functions
module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  isValidRole,
  hasPermission,
  getRolesList
};