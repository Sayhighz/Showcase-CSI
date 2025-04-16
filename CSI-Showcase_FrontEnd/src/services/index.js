/**
 * Export ฟังก์ชันและ services ทั้งหมดจากไฟล์ services
 */

import * as apiService from './apiService';
import * as authService from './authService';
import * as projectService from './projectService';
import * as searchService from './searchService';
import * as uploadService from './uploadService';

// Export แยกตามประเภท
export { 
  apiService, 
  authService, 
  projectService, 
  searchService, 
  uploadService 
};

// Export ฟังก์ชันแต่ละฟังก์ชันสำหรับการ import โดยตรง
export * from './apiService';
export * from './authService';
export * from './projectService';
export * from './searchService';
export * from './uploadService';

// Export default สำหรับการ import โดยใช้ import services from './services'
export default {
  api: apiService.default,
  auth: authService.default,
  project: projectService.default,
  search: searchService.default,
  upload: uploadService.default,
};