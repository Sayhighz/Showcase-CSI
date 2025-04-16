/**
 * คงค่าบทบาทของผู้ใช้ในระบบ
 * 
 * ไฟล์นี้รวบรวมบทบาทของผู้ใช้ทั้งหมดในระบบ
 * พร้อมคำอธิบายและสิทธิ์ที่เกี่ยวข้อง
 */

// ค่าคงที่สำหรับบทบาทผู้ใช้
export const ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    VISITOR: 'visitor', // สำหรับผู้ใช้ที่ไม่ได้ล็อกอิน
  };
  
  // ค่าคงที่สำหรับชื่อที่แสดงผลของบทบาทผู้ใช้
  export const ROLE_DISPLAY = {
    [ROLES.ADMIN]: 'ผู้ดูแลระบบ',
    [ROLES.TEACHER]: 'อาจารย์',
    [ROLES.STUDENT]: 'นักศึกษา',
    [ROLES.VISITOR]: 'ผู้เยี่ยมชม',
  };
  
  // ค่าคงที่สำหรับไอคอนของบทบาทผู้ใช้
  export const ROLE_ICON = {
    [ROLES.ADMIN]: 'SettingOutlined',
    [ROLES.TEACHER]: 'BookOutlined',
    [ROLES.STUDENT]: 'UserOutlined',
    [ROLES.VISITOR]: 'EyeOutlined',
  };
  
  // ค่าคงที่สำหรับสีของบทบาทผู้ใช้
  export const ROLE_COLOR = {
    [ROLES.ADMIN]: '#1890ff', // น้ำเงิน
    [ROLES.TEACHER]: '#52c41a', // เขียว
    [ROLES.STUDENT]: '#722ed1', // ม่วง
    [ROLES.VISITOR]: '#bfbfbf', // เทา
  };
  
  // ค่าคงที่สำหรับคำอธิบายของบทบาทผู้ใช้
  export const ROLE_DESCRIPTION = {
    [ROLES.ADMIN]: 'มีสิทธิ์ในการจัดการระบบทั้งหมด',
    [ROLES.TEACHER]: 'มีสิทธิ์ในการตรวจสอบและอนุมัติโปรเจค',
    [ROLES.STUDENT]: 'มีสิทธิ์ในการอัปโหลดและจัดการโปรเจคของตนเอง',
    [ROLES.VISITOR]: 'มีสิทธิ์ในการดูโปรเจคที่เผยแพร่',
  };
  
  // ค่าคงที่สำหรับลำดับความสำคัญของบทบาท (ใช้สำหรับการตรวจสอบสิทธิ์)
  export const ROLE_PRIORITY = {
    [ROLES.ADMIN]: 100,
    [ROLES.TEACHER]: 50,
    [ROLES.STUDENT]: 10,
    [ROLES.VISITOR]: 1,
  };
  
  // ค่าคงที่สำหรับสิทธิ์ที่แต่ละบทบาทสามารถทำได้
  export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
      'view_all_projects',
      'manage_all_projects',
      'approve_projects',
      'manage_users',
      'view_statistics',
      'upload_project',
      'edit_own_project',
      'delete_project',
      'view_system_logs',
      'change_system_settings',
    ],
    [ROLES.TEACHER]: [
      'view_all_projects',
      'approve_projects',
      'upload_project',
      'edit_own_project',
      'delete_own_project',
      'view_statistics',
    ],
    [ROLES.STUDENT]: [
      'view_public_projects',
      'upload_project',
      'edit_own_project',
      'delete_own_project',
      'contribute_to_project',
    ],
    [ROLES.VISITOR]: [
      'view_public_projects',
    ],
  };
  
  // บทบาทผู้ใช้ทั้งหมดในรูปแบบอาร์เรย์ที่พร้อมใช้งาน
  export const USER_ROLES = [
    {
      value: ROLES.ADMIN,
      label: ROLE_DISPLAY[ROLES.ADMIN],
      icon: ROLE_ICON[ROLES.ADMIN],
      color: ROLE_COLOR[ROLES.ADMIN],
      description: ROLE_DESCRIPTION[ROLES.ADMIN],
      priority: ROLE_PRIORITY[ROLES.ADMIN],
      permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
    },
    {
      value: ROLES.TEACHER,
      label: ROLE_DISPLAY[ROLES.TEACHER],
      icon: ROLE_ICON[ROLES.TEACHER],
      color: ROLE_COLOR[ROLES.TEACHER],
      description: ROLE_DESCRIPTION[ROLES.TEACHER],
      priority: ROLE_PRIORITY[ROLES.TEACHER],
      permissions: ROLE_PERMISSIONS[ROLES.TEACHER],
    },
    {
      value: ROLES.STUDENT,
      label: ROLE_DISPLAY[ROLES.STUDENT],
      icon: ROLE_ICON[ROLES.STUDENT],
      color: ROLE_COLOR[ROLES.STUDENT],
      description: ROLE_DESCRIPTION[ROLES.STUDENT],
      priority: ROLE_PRIORITY[ROLES.STUDENT],
      permissions: ROLE_PERMISSIONS[ROLES.STUDENT],
    },
    {
      value: ROLES.VISITOR,
      label: ROLE_DISPLAY[ROLES.VISITOR],
      icon: ROLE_ICON[ROLES.VISITOR],
      color: ROLE_COLOR[ROLES.VISITOR],
      description: ROLE_DESCRIPTION[ROLES.VISITOR],
      priority: ROLE_PRIORITY[ROLES.VISITOR],
      permissions: ROLE_PERMISSIONS[ROLES.VISITOR],
    },
  ];
  
  // ฟังก์ชันสำหรับแปลงค่าบทบาทผู้ใช้เป็นชื่อที่แสดงผล
  export const getRoleDisplay = (role) => {
    return ROLE_DISPLAY[role] || role;
  };
  
  // ฟังก์ชันสำหรับตรวจสอบว่าบทบาทผู้ใช้ถูกต้องหรือไม่
  export const isValidRole = (role) => {
    return Object.values(ROLES).includes(role);
  };
  
  // ฟังก์ชันสำหรับดึงข้อมูลของบทบาทผู้ใช้
  export const getRoleInfo = (role) => {
    return USER_ROLES.find(item => item.value === role) || null;
  };
  
  // ฟังก์ชันสำหรับตรวจสอบว่าบทบาทมีสิทธิ์ทำสิ่งที่ต้องการหรือไม่
  export const hasPermission = (role, permission) => {
    if (!role || !permission || !ROLE_PERMISSIONS[role]) {
      return false;
    }
    
    return ROLE_PERMISSIONS[role].includes(permission);
  };
  
  // ฟังก์ชันสำหรับตรวจสอบว่าบทบาทมีสิทธิ์มากกว่าหรือเท่ากับอีกบทบาทหรือไม่
  export const hasRolePriority = (currentRole, requiredRole) => {
    if (!currentRole || !requiredRole) {
      return false;
    }
    
    return ROLE_PRIORITY[currentRole] >= ROLE_PRIORITY[requiredRole];
  };
  
  // Export ทั้งหมดในออบเจกต์เดียว
  export default {
    ROLES,
    ROLE_DISPLAY,
    ROLE_ICON,
    ROLE_COLOR,
    ROLE_DESCRIPTION,
    ROLE_PRIORITY,
    ROLE_PERMISSIONS,
    USER_ROLES,
    getRoleDisplay,
    isValidRole,
    getRoleInfo,
    hasPermission,
    hasRolePriority,
  };