// src/utils/projectUtils.js
import { PROJECT_TYPES, PROJECT_TYPE_NAMES, PROJECT_TYPE_COLORS, PROJECT_STATUS, PROJECT_STATUS_NAMES, PROJECT_STATUS_COLORS } from '../constants/projectConstants';

/**
 * แปลงชื่อประเภทโปรเจคเป็นภาษาไทย
 * @param {string} category - ชื่อประเภท
 * @returns {string} - ชื่อประเภทภาษาไทย
 */
export const getCategoryName = (category) => {
  return PROJECT_TYPE_NAMES[category] || category;
};

/**
 * รับค่าสีสำหรับประเภทโปรเจค
 * @param {string} category - ชื่อประเภท
 * @returns {string} - รหัสสี
 */
export const getCategoryColor = (category) => {
  return PROJECT_TYPE_COLORS[category] || 'default';
};

/**
 * แปลงชื่อสถานะโปรเจคเป็นภาษาไทย
 * @param {string} status - ชื่อสถานะ
 * @returns {string} - ชื่อสถานะภาษาไทย
 */
export const getStatusName = (status) => {
  return PROJECT_STATUS_NAMES[status] || status;
};

/**
 * รับค่าสีสำหรับสถานะโปรเจค
 * @param {string} status - ชื่อสถานะ
 * @returns {string} - รหัสสี
 */
export const getStatusColor = (status) => {
  return PROJECT_STATUS_COLORS[status] || 'default';
};

/**
 * กรองโปรเจคตามเงื่อนไข
 * @param {Array} projects - รายการโปรเจคทั้งหมด
 * @param {string} searchTerm - คำค้นหา
 * @param {string} tabFilter - ประเภทแท็บ ('all', 'pending', 'approved', 'rejected')
 * @param {Object} filters - ฟิลเตอร์อื่นๆ
 * @returns {Array} - รายการโปรเจคที่กรองแล้ว
 */
export const filterProjects = (projects, searchTerm, tabFilter, filters) => {
  return projects.filter(project => {
    // กรองตามแท็บ
    if (tabFilter !== 'all' && project.status !== tabFilter) {
      return false;
    }
    
    // กรองตามคำค้นหา
    if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      // ถ้ามีแท็ก ให้ค้นหาในแท็กด้วย
      if (!project.tags || !project.tags.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    // กรองตามประเภทโปรเจค
    if (filters.type && project.type !== filters.type) {
      return false;
    }
    
    // กรองตามปีการศึกษา
    if (filters.year && project.year && String(project.year) !== String(filters.year)) {
      return false;
    }
    
    // กรองตามชั้นปี
    if (filters.studyYear && project.study_year && String(project.study_year) !== String(filters.studyYear)) {
      return false;
    }
    
    return true;
  });
};

/**
 * แปลงข้อมูลโปรเจคเพื่อใช้ในคอมโพเนนต์
 * @param {Array|Object} data - ข้อมูลโปรเจคจาก API
 * @returns {Array} - ข้อมูลโปรเจคที่แปลงแล้ว
 */
export const formatProjectData = (data) => {
  if (!data) return [];
  
  // ถ้าข้อมูลไม่ใช่อาร์เรย์ แต่เป็นออบเจ็กต์ที่มี data property
  if (!Array.isArray(data) && data.data) {
    data = data.data;
    // console.log("Data is an object with data property:", data);
  }
  
  // ถ้าไม่ใช่อาร์เรย์ ให้แปลงเป็นอาร์เรย์เปล่า
  if (!Array.isArray(data)) {
    // console.log("Data is not an array:", data);
    return [];
  }
  
  return data.map(project => ({
    ...project,
    key: project.project_id
  }));
};

/**
 * สร้างข้อมูลสำหรับแผนภูมิประเภทโปรเจค
 * @param {Array} projects - รายการโปรเจคทั้งหมด
 * @returns {Array} - ข้อมูลสำหรับแผนภูมิ
 */
export const createProjectTypeChartData = (projects) => {
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return [];
  }
  
  // นับจำนวนโปรเจคแต่ละประเภท
  const countByType = projects.reduce((acc, project) => {
    const type = project.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // แปลงเป็นรูปแบบที่ใช้กับ Chart
  return Object.keys(countByType).map(type => ({
    name: getCategoryName(type),
    value: countByType[type],
    fill: getCategoryColor(type)
  }));
};

/**
 * สร้างข้อมูลสำหรับแผนภูมิสถานะโปรเจค
 * @param {Array} projects - รายการโปรเจคทั้งหมด
 * @returns {Array} - ข้อมูลสำหรับแผนภูมิ
 */
export const createProjectStatusChartData = (projects) => {
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return [];
  }
  
  // นับจำนวนโปรเจคแต่ละสถานะ
  const countByStatus = projects.reduce((acc, project) => {
    const status = project.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  // แปลงเป็นรูปแบบที่ใช้กับ Chart
  return Object.keys(countByStatus).map(status => ({
    name: getStatusName(status),
    value: countByStatus[status],
    fill: getStatusColor(status)
  }));
};

/**
 * จัดกลุ่มโปรเจคตามปีการศึกษา
 * @param {Array} projects - รายการโปรเจคทั้งหมด
 * @returns {Object} - โปรเจคที่จัดกลุ่มตามปีการศึกษา
 */
export const groupProjectsByYear = (projects) => {
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return {};
  }
  
  return projects.reduce((acc, project) => {
    const year = project.year || 'unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(project);
    return acc;
  }, {});
};

/**
 * สร้างลิงก์สำหรับดาวน์โหลดไฟล์
 * @param {string} filePath - พาธของไฟล์
 * @returns {string} - URL สำหรับดาวน์โหลด
 */
export const getFileDownloadUrl = (filePath) => {
  if (!filePath) return null;
  
  // ถ้าเป็น URL เต็มอยู่แล้ว ให้ใช้เลย
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // ถ้าไม่ใช่ ให้ต่อกับ API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  return `${apiUrl}/files/${filePath}`;
};