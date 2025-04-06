// src/constants/thaiMessages.js

/**
 * เก็บข้อความภาษาไทยสำหรับการแสดงผลในระบบ
 */

// ข้อความหัวข้อหลัก
export const HEADERS = {
    DASHBOARD: 'แดชบอร์ด',
    PROJECTS: 'จัดการผลงาน',
    PROJECT_REVIEW: 'รายการรอตรวจสอบ',
    PROJECT_DETAIL: 'รายละเอียดผลงาน',
    USERS: 'จัดการบัญชี',
    STUDENT_USERS: 'จัดการบัญชีนักศึกษา',
    ADMIN_USERS: 'จัดการบัญชีผู้ดูแลระบบ',
    LOGIN_INFO: 'ข้อมูลการเข้าสู่ระบบ',
    SETTINGS: 'ตั้งค่าระบบ',
    PROFILE: 'ข้อมูลส่วนตัว'
  };
  
  // ข้อความคำอธิบายหัวข้อหลัก
  export const HEADER_DESCRIPTIONS = {
    DASHBOARD: 'ภาพข้อมูลรวมผลงาน',
    PROJECTS: 'จัดการผลงานนักศึกษาทั้งหมด',
    PROJECT_REVIEW: 'ตรวจสอบและอนุมัติผลงานที่รอการตรวจสอบ',
    PROJECT_DETAIL: 'ดูรายละเอียดผลงานของนักศึกษา',
    USERS: 'จัดการบัญชีผู้ใช้ทั้งหมด',
    STUDENT_USERS: 'จัดการบัญชีผู้ใช้นักศึกษา',
    ADMIN_USERS: 'จัดการบัญชีผู้ดูแลระบบ',
    LOGIN_INFO: 'ดูข้อมูลการเข้าสู่ระบบของผู้ใช้',
    SETTINGS: 'ตั้งค่าการใช้งานระบบ',
    PROFILE: 'แก้ไขข้อมูลส่วนตัวของคุณ'
  };
  
  // ข้อความปุ่มและการกระทำ
  export const ACTIONS = {
    VIEW: 'ดูรายละเอียด',
    EDIT: 'แก้ไข',
    DELETE: 'ลบ',
    APPROVE: 'อนุมัติ',
    REJECT: 'ปฏิเสธ',
    SAVE: 'บันทึก',
    CANCEL: 'ยกเลิก',
    ADD: 'เพิ่ม',
    SEARCH: 'ค้นหา',
    FILTER: 'กรอง',
    RESET: 'รีเซ็ต',
    SUBMIT: 'ยืนยัน',
    UPLOAD: 'อัปโหลด',
    DOWNLOAD: 'ดาวน์โหลด',
    LOGIN: 'เข้าสู่ระบบ',
    LOGOUT: 'ออกจากระบบ',
    BACK: 'กลับ',
    NEXT: 'ถัดไป',
    PREVIOUS: 'ก่อนหน้า',
    REFRESH: 'รีเฟรช'
  };
  
  // ข้อความสถานะการทำงาน
  export const STATUS_MESSAGES = {
    LOADING: 'กำลังโหลด...',
    SUCCESS: 'ดำเนินการสำเร็จ',
    ERROR: 'เกิดข้อผิดพลาด',
    NOT_FOUND: 'ไม่พบข้อมูล',
    SAVED: 'บันทึกข้อมูลเรียบร้อย',
    DELETED: 'ลบข้อมูลเรียบร้อย',
    UPDATED: 'อัปเดตข้อมูลเรียบร้อย',
    APPROVED: 'อนุมัติเรียบร้อย',
    REJECTED: 'ปฏิเสธเรียบร้อย',
    ADDED: 'เพิ่มข้อมูลเรียบร้อย',
    UPLOADED: 'อัปโหลดไฟล์เรียบร้อย',
    DOWNLOADED: 'ดาวน์โหลดไฟล์เรียบร้อย',
    INVALID_INPUT: 'ข้อมูลไม่ถูกต้อง'
  };
  
  // ข้อความยืนยันการดำเนินการ
  export const CONFIRM_MESSAGES = {
    DELETE: 'คุณแน่ใจหรือไม่ที่ต้องการลบรายการนี้?',
    DELETE_PROJECT: 'คุณแน่ใจหรือไม่ที่ต้องการลบโปรเจคนี้? การลบข้อมูลไม่สามารถเรียกคืนได้',
    DELETE_USER: 'คุณแน่ใจหรือไม่ที่ต้องการลบบัญชีผู้ใช้นี้? การลบข้อมูลไม่สามารถเรียกคืนได้',
    APPROVE_PROJECT: 'คุณแน่ใจหรือไม่ที่ต้องการอนุมัติโปรเจคนี้? โปรเจคจะแสดงในหน้าเว็บไซต์หลัก',
    REJECT_PROJECT: 'คุณแน่ใจหรือไม่ที่ต้องการปฏิเสธโปรเจคนี้? โปรเจคจะไม่แสดงในหน้าเว็บไซต์หลัก',
    LOGOUT: 'คุณแน่ใจหรือไม่ที่ต้องการออกจากระบบ?'
  };
  
  // ข้อความแสดงความผิดพลาด
  export const ERROR_MESSAGES = {
    GENERAL: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    NETWORK: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อของคุณ',
    UNAUTHORIZED: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
    SESSION_EXPIRED: 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่',
    NOT_FOUND: 'ไม่พบข้อมูลที่คุณต้องการ',
    VALIDATION: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
    SERVER_ERROR: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง',
    DUPLICATE: 'ข้อมูลซ้ำกับข้อมูลที่มีอยู่แล้ว',
    FILE_SIZE: 'ขนาดไฟล์ใหญ่เกินไป',
    FILE_TYPE: 'ประเภทไฟล์ไม่ได้รับอนุญาต'
  };
  
  // ข้อความแสดงการว่างเปล่า
  export const EMPTY_MESSAGES = {
    NO_PROJECTS: 'ไม่พบข้อมูลโปรเจค',
    NO_PROJECTS_PENDING: 'ไม่มีโปรเจคที่รอการตรวจสอบ',
    NO_PROJECTS_APPROVED: 'ไม่มีโปรเจคที่อนุมัติแล้ว',
    NO_PROJECTS_REJECTED: 'ไม่มีโปรเจคที่ถูกปฏิเสธ',
    NO_USERS: 'ไม่พบข้อมูลผู้ใช้',
    NO_STUDENTS: 'ไม่พบข้อมูลนักศึกษา',
    NO_ADMINS: 'ไม่พบข้อมูลผู้ดูแลระบบ',
    NO_LOGS: 'ไม่พบข้อมูลการเข้าสู่ระบบ',
    NO_FILES: 'ไม่มีไฟล์ที่เกี่ยวข้อง',
    NO_COLLABORATORS: 'ไม่มีผู้ร่วมงานที่ระบุไว้',
    NO_REVIEWS: 'ไม่มีประวัติการตรวจสอบ',
    NO_RESULTS: 'ไม่พบผลลัพธ์การค้นหา',
    NO_DATA: 'ไม่พบข้อมูล'
  };
  
  // ข้อความกรองข้อมูล
  export const FILTER_LABELS = {
    SEARCH_PROJECT: 'ค้นหาโปรเจค',
    SEARCH_USER: 'ค้นหาผู้ใช้',
    SEARCH_STUDENT: 'ค้นหานักศึกษา',
    SEARCH_ADMIN: 'ค้นหาผู้ดูแลระบบ',
    PROJECT_TYPE: 'ประเภทโปรเจค',
    PROJECT_STATUS: 'สถานะโปรเจค',
    ACADEMIC_YEAR: 'ปีการศึกษา',
    STUDY_YEAR: 'ชั้นปี',
    SEMESTER: 'ภาคการศึกษา',
    START_DATE: 'วันที่เริ่มต้น',
    END_DATE: 'วันที่สิ้นสุด',
    DATE_RANGE: 'ช่วงวันที่',
    RESET_FILTER: 'ล้างตัวกรอง'
  };
  
  // ข้อความฟอร์ม
  export const FORM_LABELS = {
    // ข้อมูลทั่วไป
    USERNAME: 'ชื่อผู้ใช้',
    PASSWORD: 'รหัสผ่าน',
    CONFIRM_PASSWORD: 'ยืนยันรหัสผ่าน',
    FULL_NAME: 'ชื่อ-นามสกุล',
    EMAIL: 'อีเมล',
    PHONE: 'เบอร์โทรศัพท์',
    ROLE: 'บทบาท',
    STATUS: 'สถานะ',
    PROFILE_IMAGE: 'รูปโปรไฟล์',
    
    // ข้อมูลโปรเจค
    PROJECT_TITLE: 'ชื่อโปรเจค',
    PROJECT_TYPE: 'ประเภทโปรเจค',
    PROJECT_DESCRIPTION: 'รายละเอียดโปรเจค',
    PROJECT_STATUS: 'สถานะโปรเจค',
    PROJECT_YEAR: 'ปีการศึกษา',
    PROJECT_SEMESTER: 'ภาคการศึกษา',
    STUDY_YEAR: 'ชั้นปี',
    PROJECT_TAGS: 'แท็ก',
    PROJECT_VISIBILITY: 'การแสดงผล',
    PROJECT_COVER_IMAGE: 'รูปภาพหน้าปก',
    
    // การตรวจสอบ
    REVIEW_COMMENT: 'ความคิดเห็น',
    REJECT_REASON: 'เหตุผลที่ปฏิเสธ',
    
    // ข้อมูลเฉพาะประเภท
    // - บทความวิชาการ
    PUBLICATION_DATE: 'วันที่ตีพิมพ์',
    PUBLISHED_YEAR: 'ปีที่ตีพิมพ์',
    PUBLICATION_VENUE: 'แหล่งตีพิมพ์',
    AUTHORS: 'ผู้เขียน',
    ABSTRACT: 'บทคัดย่อ',
    
    // - การแข่งขัน
    COMPETITION_NAME: 'ชื่อการแข่งขัน',
    COMPETITION_YEAR: 'ปีที่จัดการแข่งขัน',
    COMPETITION_LEVEL: 'ระดับการแข่งขัน',
    ACHIEVEMENT: 'ผลงานที่ได้รับ',
    TEAM_MEMBERS: 'สมาชิกในทีม',
    
    // - ผลงานการเรียน
    COURSE_CODE: 'รหัสวิชา',
    COURSE_NAME: 'ชื่อวิชา',
    INSTRUCTOR: 'อาจารย์ผู้สอน'
  };
  
  // ข้อความตั้งค่า
  export const SETTINGS = {
    SYSTEM_SETTINGS: 'ตั้งค่าระบบ',
    ACCOUNT_SETTINGS: 'ตั้งค่าบัญชี',
    NOTIFICATION_SETTINGS: 'ตั้งค่าการแจ้งเตือน',
    LANGUAGE_SETTINGS: 'ตั้งค่าภาษา',
    DISPLAY_SETTINGS: 'ตั้งค่าการแสดงผล',
    SECURITY_SETTINGS: 'ตั้งค่าความปลอดภัย',
    CHANGE_PASSWORD: 'เปลี่ยนรหัสผ่าน',
    EMAIL_NOTIFICATIONS: 'การแจ้งเตือนทางอีเมล',
    SYSTEM_NOTIFICATIONS: 'การแจ้งเตือนในระบบ',
    THEME: 'ธีม',
    DARK_MODE: 'โหมดกลางคืน',
    LIGHT_MODE: 'โหมดกลางวัน',
    ITEMS_PER_PAGE: 'จำนวนรายการต่อหน้า'
  };
  
  // ข้อความคำอธิบาย Placeholder
  export const PLACEHOLDERS = {
    SEARCH_PROJECT: 'ค้นหาโปรเจคตามชื่อ, คำอธิบาย, แท็ก...',
    SEARCH_USER: 'ค้นหาผู้ใช้ตามชื่อ, อีเมล, ชื่อผู้ใช้...',
    USERNAME: 'กรอกชื่อผู้ใช้',
    PASSWORD: 'กรอกรหัสผ่าน',
    CONFIRM_PASSWORD: 'กรอกรหัสผ่านอีกครั้ง',
    FULL_NAME: 'กรอกชื่อ-นามสกุล',
    EMAIL: 'กรอกอีเมล',
    PHONE: 'กรอกเบอร์โทรศัพท์',
    PROJECT_TITLE: 'กรอกชื่อโปรเจค',
    PROJECT_DESCRIPTION: 'กรอกรายละเอียดโปรเจค...',
    PROJECT_TAGS: 'เช่น Programming, Database, AI...',
    REVIEW_COMMENT: 'กรอกความคิดเห็นหรือข้อเสนอแนะ...',
    REJECT_REASON: 'กรอกเหตุผลที่ปฏิเสธโปรเจคนี้...'
  };
  
  // ข้อความเมนู
  export const MENU_ITEMS = {
    DASHBOARD: 'แดชบอร์ด',
    PROJECTS: 'จัดการผลงาน',
    PENDING_PROJECTS: 'รายการรอตรวจสอบ',
    USERS: 'จัดการบัญชี',
    STUDENT_ACCOUNTS: 'บัญชีนักศึกษา',
    ADMIN_ACCOUNTS: 'บัญชีผู้ดูแลระบบ',
    LOGIN_INFO: 'ข้อมูลการเข้าสู่ระบบ',
    REPORTS: 'รายงาน',
    SETTINGS: 'ตั้งค่า',
    PROFILE: 'โปรไฟล์',
    LOGOUT: 'ออกจากระบบ'
  };
  
  // ข้อความแท็บ
  export const TABS = {
    ALL: 'ทั้งหมด',
    PENDING: 'รออนุมัติ',
    APPROVED: 'อนุมัติแล้ว',
    REJECTED: 'ถูกปฏิเสธ',
    GENERAL_INFO: 'ข้อมูลทั่วไป',
    FILES: 'ไฟล์และรูปภาพ',
    COLLABORATORS: 'ผู้ร่วมงาน',
    REVIEW_HISTORY: 'ประวัติการตรวจสอบ',
    PROJECT_OVERVIEW: 'ภาพรวมโปรเจค',
    USER_ACTIVITY: 'กิจกรรมผู้ใช้',
    REPORTS: 'รายงาน'
  };
  
  export default {
    HEADERS,
    HEADER_DESCRIPTIONS,
    ACTIONS,
    STATUS_MESSAGES,
    CONFIRM_MESSAGES,
    ERROR_MESSAGES,
    EMPTY_MESSAGES,
    FILTER_LABELS,
    FORM_LABELS,
    SETTINGS,
    PLACEHOLDERS,
    MENU_ITEMS,
    TABS
  };