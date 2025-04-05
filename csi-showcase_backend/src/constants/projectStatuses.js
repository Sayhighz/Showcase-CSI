// constants/projectStatuses.js

/**
 * สถานะของโครงการในระบบ
 */
export const PROJECT_STATUSES = {
    PENDING: 'pending',     // รอการอนุมัติ
    APPROVED: 'approved',   // อนุมัติแล้ว
    REJECTED: 'rejected'    // ถูกปฏิเสธ
  };
  
  /**
   * ประเภทของโครงการในระบบ
   */
  export const PROJECT_TYPES = {
    COURSEWORK: 'coursework',     // งานเรียน
    ACADEMIC: 'academic',         // บทความวิชาการ
    COMPETITION: 'competition'    // การแข่งขัน
  };
  
  /**
   * ภาคการศึกษา
   */
  export const SEMESTERS = {
    FIRST: '1',      // ภาคต้น
    SECOND: '2',     // ภาคปลาย
    SUMMER: '3'      // ภาคฤดูร้อน
  };
  
  /**
   * ระดับของการแข่งขัน
   */
  export const COMPETITION_LEVELS = {
    DEPARTMENT: 'department',     // ระดับภาควิชา
    FACULTY: 'faculty',           // ระดับคณะ
    UNIVERSITY: 'university',     // ระดับมหาวิทยาลัย
    NATIONAL: 'national',         // ระดับประเทศ
    INTERNATIONAL: 'international' // ระดับนานาชาติ
  };
  
  /**
   * รายละเอียดสถานะโครงการ
   */
  export const PROJECT_STATUS_DETAILS = {
    [PROJECT_STATUSES.PENDING]: {
      label: 'รอการอนุมัติ',
      color: 'warning',
      description: 'โครงการกำลังรอการตรวจสอบจากผู้ดูแลระบบ'
    },
    [PROJECT_STATUSES.APPROVED]: {
      label: 'อนุมัติแล้ว',
      color: 'success',
      description: 'โครงการได้รับการอนุมัติและเผยแพร่แล้ว'
    },
    [PROJECT_STATUSES.REJECTED]: {
      label: 'ถูกปฏิเสธ',
      color: 'danger',
      description: 'โครงการถูกปฏิเสธจากผู้ดูแลระบบ'
    }
  };
  
  /**
   * รายละเอียดประเภทโครงการ
   */
  export const PROJECT_TYPE_DETAILS = {
    [PROJECT_TYPES.COURSEWORK]: {
      label: 'งานเรียน',
      description: 'ผลงานที่เกี่ยวข้องกับการเรียนการสอน',
      icon: 'book'
    },
    [PROJECT_TYPES.ACADEMIC]: {
      label: 'บทความวิชาการ',
      description: 'บทความหรือผลงานวิชาการที่ได้รับการตีพิมพ์',
      icon: 'file-text'
    },
    [PROJECT_TYPES.COMPETITION]: {
      label: 'การแข่งขัน',
      description: 'ผลงานจากการเข้าร่วมการแข่งขันต่างๆ',
      icon: 'award'
    }
  };
  
  /**
   * รายละเอียดภาคการศึกษา
   */
  export const SEMESTER_DETAILS = {
    [SEMESTERS.FIRST]: {
      label: 'ภาคต้น',
      period: 'สิงหาคม - ธันวาคม'
    },
    [SEMESTERS.SECOND]: {
      label: 'ภาคปลาย',
      period: 'มกราคม - พฤษภาคม'
    },
    [SEMESTERS.SUMMER]: {
      label: 'ภาคฤดูร้อน',
      period: 'มิถุนายน - กรกฎาคม'
    }
  };
  
/**
 * รายละเอียดระดับการแข่งขัน
 */
export const COMPETITION_LEVEL_DETAILS = {
    [COMPETITION_LEVELS.DEPARTMENT]: {
      label: 'ระดับภาควิชา',
      description: 'การแข่งขันภายในภาควิชา',
      order: 1
    },
    [COMPETITION_LEVELS.FACULTY]: {
      label: 'ระดับคณะ',
      description: 'การแข่งขันภายในคณะ',
      order: 2
    },
    [COMPETITION_LEVELS.UNIVERSITY]: {
      label: 'ระดับมหาวิทยาลัย',
      description: 'การแข่งขันภายในมหาวิทยาลัย',
      order: 3
    },
    [COMPETITION_LEVELS.NATIONAL]: {
      label: 'ระดับประเทศ',
      description: 'การแข่งขันระดับประเทศ',
      order: 4
    },
    [COMPETITION_LEVELS.INTERNATIONAL]: {
      label: 'ระดับนานาชาติ',
      description: 'การแข่งขันระดับนานาชาติ',
      order: 5
    }
  };
  
  /**
   * ตรวจสอบว่าเป็นสถานะที่ถูกต้องหรือไม่
   * @param {string} status - สถานะที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นสถานะที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidStatus = (status) => {
    return Object.values(PROJECT_STATUSES).includes(status);
  };
  
  /**
   * ตรวจสอบว่าเป็นประเภทโครงการที่ถูกต้องหรือไม่
   * @param {string} type - ประเภทที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นประเภทที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidType = (type) => {
    return Object.values(PROJECT_TYPES).includes(type);
  };
  
  /**
   * ตรวจสอบว่าเป็นภาคการศึกษาที่ถูกต้องหรือไม่
   * @param {string} semester - ภาคการศึกษาที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นภาคการศึกษาที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidSemester = (semester) => {
    return Object.values(SEMESTERS).includes(semester);
  };
  
  /**
   * ตรวจสอบว่าเป็นระดับการแข่งขันที่ถูกต้องหรือไม่
   * @param {string} level - ระดับการแข่งขันที่ต้องการตรวจสอบ
   * @returns {boolean} - true ถ้าเป็นระดับการแข่งขันที่ถูกต้อง, false ถ้าไม่ใช่
   */
  export const isValidCompetitionLevel = (level) => {
    return Object.values(COMPETITION_LEVELS).includes(level);
  };
  
  /**
   * ดึงข้อมูลประเภทโครงการทั้งหมดสำหรับแสดงผล
   * @returns {Array} - รายการประเภทโครงการทั้งหมด
   */
  export const getProjectTypesList = () => {
    return Object.values(PROJECT_TYPES).map(type => ({
      value: type,
      label: PROJECT_TYPE_DETAILS[type].label,
      description: PROJECT_TYPE_DETAILS[type].description,
      icon: PROJECT_TYPE_DETAILS[type].icon
    }));
  };
  
  /**
   * ดึงข้อมูลภาคการศึกษาทั้งหมดสำหรับแสดงผล
   * @returns {Array} - รายการภาคการศึกษาทั้งหมด
   */
  export const getSemestersList = () => {
    return Object.values(SEMESTERS).map(semester => ({
      value: semester,
      label: SEMESTER_DETAILS[semester].label,
      period: SEMESTER_DETAILS[semester].period
    }));
  };
  
  /**
   * ดึงข้อมูลระดับการแข่งขันทั้งหมดสำหรับแสดงผล
   * @returns {Array} - รายการระดับการแข่งขันทั้งหมด
   */
  export const getCompetitionLevelsList = () => {
    return Object.values(COMPETITION_LEVELS)
      .map(level => ({
        value: level,
        label: COMPETITION_LEVEL_DETAILS[level].label,
        description: COMPETITION_LEVEL_DETAILS[level].description,
        order: COMPETITION_LEVEL_DETAILS[level].order
      }))
      .sort((a, b) => a.order - b.order);
  };