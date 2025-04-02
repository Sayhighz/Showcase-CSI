// hooks/useAuth.js
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook เพื่อเข้าถึง AuthContext
 * 
 * ใช้สำหรับเข้าถึงข้อมูลและฟังก์ชันที่เกี่ยวข้องกับการยืนยันตัวตน เช่น 
 * สถานะการล็อกอิน, ข้อมูลผู้ใช้, ฟังก์ชันล็อกอิน/ล็อกเอาท์ เป็นต้น
 * 
 * @returns {Object} ค่าทั้งหมดที่อยู่ใน AuthContext
 */
const useAuth = () => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return auth;
};

export default useAuth;