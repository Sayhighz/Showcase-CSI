/**
 * Export ฟังก์ชันและค่าคงที่ทั้งหมดจากไฟล์ constants
 */

import * as apiEndpoints from './apiEndpoints';
import * as routes from './routes';
import * as projectTypes from './projectTypes';
import * as userRoles from './userRoles';
import * as statusCodes from './statusCodes';

// Export แยกตามประเภท
export { 
  apiEndpoints, 
  routes, 
  projectTypes, 
  userRoles, 
  statusCodes 
};

// Export ฟังก์ชันและค่าคงที่แต่ละตัวสำหรับการ import โดยตรง
export * from './apiEndpoints';
export * from './routes';
export * from './projectTypes';
export * from './userRoles';
export * from './statusCodes';

// Export default สำหรับการ import โดยใช้ import constants from './constants'
export default {
  // API Endpoints
  api: apiEndpoints.default,
  
  // Application Routes
  routes: routes.default,
  
  // Project Types
  projectTypes: projectTypes.default,
  
  // User Roles
  userRoles: userRoles.default,
  
  // HTTP Status Codes
  statusCodes: statusCodes.default,
};