// src/utils/authUtils.js
import { jwtDecode } from 'jwt-decode';
import { getAuthCookie } from '../lib/cookie';

/**
 * ตรวจสอบว่า token หมดอายุหรือไม่
 * @param {string} token - JWT token
 * @returns {boolean} - true ถ้า token หมดอายุ, false ถ้ายังไม่หมดอายุ
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Token decoding error:', error);
    return true;  // ถ้าเกิดข้อผิดพลาดในการถอดรหัส ให้ถือว่า token หมดอายุ
  }
};

/**
 * ดึงข้อมูลผู้ใช้จาก token
 * @returns {Object|null} - ข้อมูลผู้ใช้ หรือ null ถ้าไม่มี token หรือ token ไม่ถูกต้อง
 */
export const getUserFromToken = () => {
  try {
    const token = getAuthCookie();
    if (!token || isTokenExpired(token)) {
      return null;
    }
    return jwtDecode(token);
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์ admin หรือไม่
 * @returns {boolean} - true ถ้าผู้ใช้เป็น admin, false ถ้าไม่ใช่
 */
export const isAdmin = () => {
  const user = getUserFromToken();
  return user && user.role === 'admin';
};

/**
 * ตรวจสอบสิทธิ์การเข้าถึงตามบทบาท
 * @param {string[]} allowedRoles - บทบาทที่อนุญาตให้เข้าถึง
 * @returns {boolean} - true ถ้ามีสิทธิ์เข้าถึง, false ถ้าไม่มีสิทธิ์
 */
export const hasPermission = (allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true; // ถ้าไม่ระบุบทบาท ให้อนุญาตทั้งหมด
  }
  
  const user = getUserFromToken();
  if (!user) {
    return false;
  }
  
  return allowedRoles.includes(user.role);
};

/**
 * ตรวจสอบว่า URL ต้องการการยืนยันตัวตนหรือไม่
 * @param {string} url - URL ที่ต้องการตรวจสอบ
 * @param {Array} publicPaths - เส้นทางที่ไม่ต้องยืนยันตัวตน
 * @returns {boolean} - true ถ้าต้องการยืนยันตัวตน, false ถ้าไม่ต้องการ
 */
export const isAuthRequired = (url, publicPaths = ['/login', '/register', '/forgot-password']) => {
  return !publicPaths.some(path => url.startsWith(path));
};

/**
 * ตรวจสอบว่าต้องเปลี่ยน path ไปยังหน้า login หรือไม่
 * @returns {boolean} - true ถ้าต้องเปลี่ยน path, false ถ้าไม่ต้อง
 */
export const shouldRedirectToLogin = () => {
  const token = getAuthCookie();
  return !token || isTokenExpired(token);
};