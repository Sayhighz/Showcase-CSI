// src/constants/userConstants.js

/**
 * เก็บค่าคงที่ที่เกี่ยวข้องกับผู้ใช้งาน
 */

// บทบาทของผู้ใช้
export const USER_ROLES = {
    ADMIN: 'admin',
    STUDENT: 'student',
    VISITOR: 'visitor'
  };
  
  // ชื่อบทบาทผู้ใช้ภาษาไทย
  export const USER_ROLE_NAMES = {
    [USER_ROLES.ADMIN]: 'ผู้ดูแลระบบ',
    [USER_ROLES.STUDENT]: 'นักศึกษา',
    [USER_ROLES.VISITOR]: 'ผู้เยี่ยมชม'
  };
  
  // สีของบทบาทผู้ใช้
  export const USER_ROLE_COLORS = {
    [USER_ROLES.ADMIN]: 'purple',
    [USER_ROLES.STUDENT]: 'blue',
    [USER_ROLES.VISITOR]: 'green'
  };
  
  // ไอคอนของบทบาทผู้ใช้
  export const USER_ROLE_ICONS = {
    [USER_ROLES.ADMIN]: 'CrownOutlined',
    [USER_ROLES.STUDENT]: 'UserOutlined',
    [USER_ROLES.VISITOR]: 'GlobalOutlined'
  };
  
  // สถานะของผู้ใช้
  export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  };
  
  // ชื่อสถานะผู้ใช้ภาษาไทย
  export const USER_STATUS_NAMES = {
    [USER_STATUS.ACTIVE]: 'ใช้งานอยู่',
    [USER_STATUS.INACTIVE]: 'ไม่ได้ใช้งาน',
    [USER_STATUS.SUSPENDED]: 'ถูกระงับการใช้งาน'
  };
  
  // สีของสถานะผู้ใช้
  export const USER_STATUS_COLORS = {
    [USER_STATUS.ACTIVE]: 'success',
    [USER_STATUS.INACTIVE]: 'default',
    [USER_STATUS.SUSPENDED]: 'error'
  };
  
  // สิทธิ์การเข้าถึงตามบทบาท
  export const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
      'dashboard.view',
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.delete',
      'projects.review',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'settings.view',
      'settings.edit',
      'logs.view'
    ],
    [USER_ROLES.STUDENT]: [
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.delete_own',
      'profile.view',
      'profile.edit'
    ],
    [USER_ROLES.VISITOR]: [
      'projects.view'
    ]
  };
  
  // กฎการตั้งรหัสผ่าน
  export const PASSWORD_RULES = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  };
  
  // ข้อความข้อผิดพลาดสำหรับการตั้งรหัสผ่าน
  export const PASSWORD_ERROR_MESSAGES = {
    MIN_LENGTH: `รหัสผ่านต้องมีความยาวอย่างน้อย ${PASSWORD_RULES.MIN_LENGTH} ตัวอักษร`,
    REQUIRE_UPPERCASE: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว',
    REQUIRE_LOWERCASE: 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว',
    REQUIRE_NUMBER: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว',
    REQUIRE_SPECIAL: 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว'
  };
  
  // กฎการตั้งชื่อผู้ใช้
  export const USERNAME_RULES = {
    MIN_LENGTH: 4,
    MAX_LENGTH: 20,
    ALLOWED_CHARS: 'ตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย _ เท่านั้น'
  };
  
  // ข้อความข้อผิดพลาดสำหรับการตั้งชื่อผู้ใช้
  export const USERNAME_ERROR_MESSAGES = {
    MIN_LENGTH: `ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย ${USERNAME_RULES.MIN_LENGTH} ตัวอักษร`,
    MAX_LENGTH: `ชื่อผู้ใช้ต้องมีความยาวไม่เกิน ${USERNAME_RULES.MAX_LENGTH} ตัวอักษร`,
    ALLOWED_CHARS: `ชื่อผู้ใช้ต้องประกอบด้วย${USERNAME_RULES.ALLOWED_CHARS}`
  };
  
  // สถานะการเข้าสู่ระบบ
  export const LOGIN_STATUS = {
    SUCCESS: 'success',
    FAILED: 'failed'
  };
  
  // ชื่อสถานะการเข้าสู่ระบบภาษาไทย
  export const LOGIN_STATUS_NAMES = {
    [LOGIN_STATUS.SUCCESS]: 'สำเร็จ',
    [LOGIN_STATUS.FAILED]: 'ล้มเหลว'
  };
  
  // สีของสถานะการเข้าสู่ระบบ
  export const LOGIN_STATUS_COLORS = {
    [LOGIN_STATUS.SUCCESS]: 'success',
    [LOGIN_STATUS.FAILED]: 'error'
  };
  
  // ระยะเวลาหมดอายุของ token (ในหน่วยวัน)
  export const TOKEN_EXPIRATION = 1;
  
  // จำนวนครั้งสูงสุดที่อนุญาตให้เข้าสู่ระบบผิดพลาด
  export const MAX_LOGIN_ATTEMPTS = 5;
  
  // ระยะเวลาล็อคบัญชีเมื่อเข้าสู่ระบบผิดพลาดเกินกำหนด (ในหน่วยนาที)
  export const ACCOUNT_LOCK_DURATION = 30;
  
  // ข้อมูลการติดต่อผู้ดูแลระบบ
  export const ADMIN_CONTACT = {
    EMAIL: 'admin@csi-showcase.com',
    PHONE: '02-123-4567',
    HOURS: '9:00 - 17:00 น. (จันทร์ - ศุกร์)'
  };
  
  export default {
    USER_ROLES,
    USER_ROLE_NAMES,
    USER_ROLE_COLORS,
    USER_ROLE_ICONS,
    USER_STATUS,
    USER_STATUS_NAMES,
    USER_STATUS_COLORS,
    ROLE_PERMISSIONS,
    PASSWORD_RULES,
    PASSWORD_ERROR_MESSAGES,
    USERNAME_RULES,
    USERNAME_ERROR_MESSAGES,
    LOGIN_STATUS,
    LOGIN_STATUS_NAMES,
    LOGIN_STATUS_COLORS,
    TOKEN_EXPIRATION,
    MAX_LOGIN_ATTEMPTS,
    ACCOUNT_LOCK_DURATION,
    ADMIN_CONTACT
  };