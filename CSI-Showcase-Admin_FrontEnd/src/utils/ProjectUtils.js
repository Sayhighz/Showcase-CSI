/**
 * Utility functions สำหรับการจัดการข้อมูลโปรเจค
 */

/**
 * แปลงประเภทโปรเจคเป็นภาษาไทย
 * @param {string} category - ประเภทโปรเจค
 * @returns {string} - ชื่อประเภทโปรเจคภาษาไทย
 */
export const getCategoryName = (category) => {
  switch (category) {
    case 'academic':
      return 'บทความวิชาการ';
    case 'coursework':
      return 'ผลงานการเรียน';
    case 'competition':
      return 'การแข่งขัน';
    default:
      return category;
  }
};

/**
 * กำหนดสีสำหรับแท็กประเภทโปรเจค
 * @param {string} category - ประเภทโปรเจค
 * @returns {string} - รหัสสี
 */
export const getCategoryColor = (category) => {
  switch (category) {
    case 'academic':
      return 'blue';
    case 'coursework':
      return 'green';
    case 'competition':
      return 'gold';
    default:
      return 'default';
  }
};

/**
 * กำหนดชื่อไอคอนสำหรับประเภทโปรเจค (ใช้ชื่อแทนการเรียกใช้ React Component โดยตรง)
 * @param {string} category - ประเภทโปรเจค
 * @returns {string} - ชื่อไอคอน
 */
export const getCategoryIconName = (category) => {
  switch (category) {
    case 'academic':
      return 'BookOutlined';
    case 'coursework':
      return 'TeamOutlined';
    case 'competition':
      return 'TrophyOutlined';
    default:
      return null;
  }
};

/**
 * แปลงสถานะโปรเจคเป็นภาษาไทย
 * @param {string} status - สถานะโปรเจค
 * @returns {string} - ชื่อสถานะโปรเจคภาษาไทย
 */
export const getStatusName = (status) => {
  switch (status) {
    case 'approved':
      return 'อนุมัติแล้ว';
    case 'pending':
      return 'รอตรวจสอบ';
    case 'rejected':
      return 'ถูกปฏิเสธ';
    default:
      return status;
  }
};

/**
 * กำหนดสีสำหรับแท็กสถานะโปรเจค
 * @param {string} status - สถานะโปรเจค
 * @returns {string} - รหัสสี
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * จัดรูปแบบวันที่ให้เป็นรูปแบบไทย
 * @param {string} dateStr - วันที่ในรูปแบบ ISO
 * @param {Object} options - ตัวเลือกการจัดรูปแบบ
 * @returns {string} - วันที่ที่จัดรูปแบบแล้ว
 */
export const formatThaiDate = (dateStr, options = {}) => {
  if (!dateStr) return 'ไม่ระบุ';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(dateStr).toLocaleDateString('th-TH', defaultOptions);
};

/**
 * แปลงข้อมูลโปรเจคให้อยู่ในรูปแบบที่เหมาะสมสำหรับแสดงผล
 * @param {Array} projects - ข้อมูลโปรเจคจาก API
 * @returns {Array} - ข้อมูลโปรเจคที่จัดรูปแบบแล้ว
 */
export const formatProjectData = (projects) => {
  if (!projects || !Array.isArray(projects)) return [];
  
  return projects.map(project => ({
    ...project,
    level: project.study_year ? `ปี ${project.study_year}` : 'ไม่ระบุ',
    formattedCreatedAt: formatThaiDate(project.created_at)
  }));
};

/**
 * กรองข้อมูลโปรเจคตามเงื่อนไข
 * @param {Array} projects - ข้อมูลโปรเจค
 * @param {string} searchTerm - คำค้นหา
 * @param {string} currentTab - แท็บปัจจุบัน
 * @param {Object} filters - ตัวกรองอื่นๆ
 * @returns {Array} - ข้อมูลโปรเจคที่ผ่านการกรอง
 */
export const filterProjects = (projects, searchTerm, currentTab, filters) => {
  if (!projects || !Array.isArray(projects)) return [];
  
  let result = [...projects];
  
  // กรองตามคำค้นหา
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    result = result.filter(project => 
      (project.title && project.title.toLowerCase().includes(searchLower)) || 
      (project.description && project.description.toLowerCase().includes(searchLower)) ||
      (project.tags && project.tags.toLowerCase().includes(searchLower))
    );
  }
  
  // กรองตามแท็บ (สถานะ)
  if (currentTab !== 'all') {
    result = result.filter(project => project.status === currentTab);
  }
  
  // กรองตามประเภท
  if (filters.type) {
    result = result.filter(project => project.type === filters.type);
  }
  
  // กรองตามปีการศึกษา
  if (filters.year) {
    result = result.filter(project => project.year.toString() === filters.year);
  }
  
  // กรองตามชั้นปี
  if (filters.studyYear) {
    result = result.filter(project => project.study_year.toString() === filters.studyYear);
  }
  
  return result;
};