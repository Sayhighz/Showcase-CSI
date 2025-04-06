// src/constants/projectConstants.js

/**
 * เก็บค่าคงที่ที่เกี่ยวข้องกับโปรเจค
 */

// ประเภทของโปรเจค
export const PROJECT_TYPES = {
    COURSEWORK: 'coursework',
    ACADEMIC: 'academic',
    COMPETITION: 'competition'
  };
  
  // ชื่อประเภทโปรเจคภาษาไทย
  export const PROJECT_TYPE_NAMES = {
    [PROJECT_TYPES.COURSEWORK]: 'ผลงานการเรียน',
    [PROJECT_TYPES.ACADEMIC]: 'บทความวิชาการ',
    [PROJECT_TYPES.COMPETITION]: 'การแข่งขัน'
  };
  
  // สีของประเภทโปรเจค
  export const PROJECT_TYPE_COLORS = {
    [PROJECT_TYPES.COURSEWORK]: 'green',
    [PROJECT_TYPES.ACADEMIC]: 'blue',
    [PROJECT_TYPES.COMPETITION]: 'gold'
  };
  
  // ไอคอนของประเภทโปรเจค
  export const PROJECT_TYPE_ICONS = {
    [PROJECT_TYPES.COURSEWORK]: 'TeamOutlined',
    [PROJECT_TYPES.ACADEMIC]: 'BookOutlined',
    [PROJECT_TYPES.COMPETITION]: 'TrophyOutlined'
  };
  
  // สถานะของโปรเจค
  export const PROJECT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  };
  
  // ชื่อสถานะโปรเจคภาษาไทย
  export const PROJECT_STATUS_NAMES = {
    [PROJECT_STATUS.PENDING]: 'รอตรวจสอบ',
    [PROJECT_STATUS.APPROVED]: 'อนุมัติแล้ว',
    [PROJECT_STATUS.REJECTED]: 'ถูกปฏิเสธ'
  };
  
  // สีของสถานะโปรเจค
  export const PROJECT_STATUS_COLORS = {
    [PROJECT_STATUS.PENDING]: 'warning',
    [PROJECT_STATUS.APPROVED]: 'success',
    [PROJECT_STATUS.REJECTED]: 'error'
  };
  
  // ไอคอนของสถานะโปรเจค
  export const PROJECT_STATUS_ICONS = {
    [PROJECT_STATUS.PENDING]: 'ClockCircleOutlined',
    [PROJECT_STATUS.APPROVED]: 'CheckCircleOutlined',
    [PROJECT_STATUS.REJECTED]: 'CloseCircleOutlined'
  };
  
  // ภาคการศึกษา
  export const SEMESTERS = {
    FIRST: '1',
    SECOND: '2',
    SUMMER: '3'
  };
  
  // ชื่อภาคการศึกษาภาษาไทย
  export const SEMESTER_NAMES = {
    [SEMESTERS.FIRST]: 'ภาคต้น',
    [SEMESTERS.SECOND]: 'ภาคปลาย',
    [SEMESTERS.SUMMER]: 'ภาคฤดูร้อน'
  };
  
  // ระดับการแข่งขัน
  export const COMPETITION_LEVELS = {
    DEPARTMENT: 'department',
    FACULTY: 'faculty',
    UNIVERSITY: 'university',
    NATIONAL: 'national',
    INTERNATIONAL: 'international'
  };
  
  // ชื่อระดับการแข่งขันภาษาไทย
  export const COMPETITION_LEVEL_NAMES = {
    [COMPETITION_LEVELS.DEPARTMENT]: 'ระดับภาควิชา',
    [COMPETITION_LEVELS.FACULTY]: 'ระดับคณะ',
    [COMPETITION_LEVELS.UNIVERSITY]: 'ระดับมหาวิทยาลัย',
    [COMPETITION_LEVELS.NATIONAL]: 'ระดับประเทศ',
    [COMPETITION_LEVELS.INTERNATIONAL]: 'ระดับนานาชาติ'
  };
  
  // ประเภทไฟล์ที่เกี่ยวข้องกับโปรเจค
  export const PROJECT_FILE_TYPES = {
    PDF: 'pdf',
    IMAGE: 'image',
    VIDEO: 'video',
    OTHER: 'other'
  };
  
  // ชื่อประเภทไฟล์ภาษาไทย
  export const PROJECT_FILE_TYPE_NAMES = {
    [PROJECT_FILE_TYPES.PDF]: 'เอกสาร PDF',
    [PROJECT_FILE_TYPES.IMAGE]: 'รูปภาพ',
    [PROJECT_FILE_TYPES.VIDEO]: 'วิดีโอ',
    [PROJECT_FILE_TYPES.OTHER]: 'ไฟล์อื่นๆ'
  };
  
  // ขนาดไฟล์สูงสุดที่อนุญาต (ในหน่วย bytes)
  export const MAX_FILE_SIZES = {
    [PROJECT_FILE_TYPES.PDF]: 10 * 1024 * 1024, // 10MB
    [PROJECT_FILE_TYPES.IMAGE]: 5 * 1024 * 1024, // 5MB
    [PROJECT_FILE_TYPES.VIDEO]: 100 * 1024 * 1024, // 100MB
    [PROJECT_FILE_TYPES.OTHER]: 20 * 1024 * 1024 // 20MB
  };
  
  // ประเภทของแท็กโปรเจค
  export const PROJECT_TAG_CATEGORIES = {
    TECHNOLOGY: 'technology',
    SUBJECT: 'subject',
    SKILL: 'skill',
    TOOL: 'tool'
  };
  
  // แท็กที่แนะนำสำหรับแต่ละประเภท
  export const SUGGESTED_TAGS = {
    [PROJECT_TYPES.COURSEWORK]: ['Programming', 'Database', 'Web Development', 'Mobile App', 'UI/UX', 'Project Management'],
    [PROJECT_TYPES.ACADEMIC]: ['Research', 'Artificial Intelligence', 'Data Science', 'Machine Learning', 'Algorithm', 'Networking'],
    [PROJECT_TYPES.COMPETITION]: ['Hackathon', 'Coding Contest', 'Innovation', 'Prototype', 'Startup', 'Business Model']
  };
  
  // ชั้นปีการศึกษา
  export const STUDY_YEARS = [1, 2, 3, 4];
  export const STUDY_YEAR_NAMES = STUDY_YEARS.reduce((acc, year) => {
    acc[year] = `ปี ${year}`;
    return acc;
  }, {});
  
  // จำนวนรายการต่อหน้า
  export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: ['10', '20', '50', '100']
  };
  
  // ข้อความสำหรับการตรวจสอบโปรเจค
  export const REVIEW_MESSAGES = {
    APPROVAL: [
      'อนุมัติผลงานเรียบร้อยแล้ว',
      'ผลงานสมบูรณ์และได้รับการอนุมัติ',
      'ผลงานผ่านการตรวจสอบและอนุมัติเรียบร้อยแล้ว'
    ],
    REJECTION_REASONS: [
      'ข้อมูลไม่ครบถ้วน กรุณาเพิ่มรายละเอียดให้สมบูรณ์',
      'รูปภาพหรือไฟล์ที่แนบมาไม่ชัดเจน กรุณาอัปโหลดใหม่',
      'เนื้อหาไม่เหมาะสมหรือไม่ตรงตามหลักเกณฑ์',
      'รายละเอียดโปรเจคไม่เพียงพอ กรุณาเพิ่มเติมข้อมูล',
      'พบข้อมูลที่ซ้ำซ้อนกับผลงานอื่น กรุณาตรวจสอบ'
    ]
  };
  
  export default {
    PROJECT_TYPES,
    PROJECT_TYPE_NAMES,
    PROJECT_TYPE_COLORS,
    PROJECT_TYPE_ICONS,
    PROJECT_STATUS,
    PROJECT_STATUS_NAMES,
    PROJECT_STATUS_COLORS,
    PROJECT_STATUS_ICONS,
    SEMESTERS,
    SEMESTER_NAMES,
    COMPETITION_LEVELS,
    COMPETITION_LEVEL_NAMES,
    PROJECT_FILE_TYPES,
    PROJECT_FILE_TYPE_NAMES,
    MAX_FILE_SIZES,
    PROJECT_TAG_CATEGORIES,
    SUGGESTED_TAGS,
    STUDY_YEARS,
    STUDY_YEAR_NAMES,
    PAGINATION,
    REVIEW_MESSAGES
  };