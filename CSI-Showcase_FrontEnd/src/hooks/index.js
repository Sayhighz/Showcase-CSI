/**
 * Export hooks ทั้งหมดจากไฟล์ hooks
 * ไฟล์นี้รวบรวม hooks ทั้งหมดที่ใช้ในแอปพลิเคชัน
 * เพื่อให้การ import hooks ทำได้ที่จุดเดียว
 */

import useAuth from './useAuth';
import useProject from './useProject';
import useSearch from './useSearch';
import useUpload from './useUpload';
import useNotification from './useNotification';

// Export แยกตามประเภท
export { 
  useAuth, 
  useProject, 
  useSearch, 
  useUpload, 
  useNotification 
};

// Export default สำหรับการ import โดยใช้ import hooks from './hooks'
export default {
  useAuth,
  useProject,
  useSearch,
  useUpload,
  useNotification
};