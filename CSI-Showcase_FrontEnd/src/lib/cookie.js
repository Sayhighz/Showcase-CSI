import Cookies from "js-cookie";

const AUTH_COOKIE_NAME = "authToken";

/**
 * ตั้งค่าคุกกี้สำหรับการล็อกอิน
 * @param {string} token - ค่า token หรือ session ที่ต้องการเก็บ
 * @param {number} expires - จำนวนวันก่อนหมดอายุ (default: 1 วัน)
 */
export const setAuthCookie = (token, expires = 1) => {
  // ตรวจสอบว่าใช้ HTTPS หรือไม่ แต่ในกรณีนี้เราจะตั้งเป็น false เพื่อให้ใช้ได้กับ HTTP
  const isSecure = window.location.protocol === 'https:';
  Cookies.set(AUTH_COOKIE_NAME, token, { 
    expires, 
    secure: isSecure, 
    sameSite: 'Lax' // เปลี่ยนจาก Strict เป็น Lax เพื่อความยืดหยุ่นมากขึ้น
  });
};

/**
 * ดึงค่า token จากคุกกี้
 * @returns {string|null} - ค่า token หรือ null ถ้าไม่มี
 */
export const getAuthCookie = () => {
  return Cookies.get(AUTH_COOKIE_NAME) || null;
};

/**
 * ลบคุกกี้การล็อกอิน (ใช้เมื่อล็อกเอาต์)
 */
export const removeAuthCookie = () => {
  Cookies.remove(AUTH_COOKIE_NAME);
};

/**
 * ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
 * @returns {boolean} - true ถ้ามี token, false ถ้าไม่มี
 */
export const isAuthenticated = () => {
  return !!getAuthCookie();
};

/**
 * ตั้งค่าคุกกี้ทั่วไป
 * @param {string} name - ชื่อคุกกี้
 * @param {string} value - ค่าของคุกกี้
 * @param {number} expires - อายุคุกกี้ (วัน)
 */
export const setCookie = (name, value, expires = 7) => {
  // ตรวจสอบว่าใช้ HTTPS หรือไม่ แต่ในกรณีนี้เราจะทำให้มันยืดหยุ่นมากขึ้น
  const isSecure = window.location.protocol === 'https:';
  Cookies.set(name, value, { 
    expires, 
    secure: isSecure, 
    sameSite: 'Lax' // เปลี่ยนจาก Strict เป็น Lax เพื่อความยืดหยุ่นมากขึ้น
  });
};

/**
 * ดึงค่าคุกกี้ทั่วไป
 * @param {string} name - ชื่อคุกกี้
 * @returns {string|null} - ค่าของคุกกี้ หรือ null ถ้าไม่มี
 */
export const getCookie = (name) => {
  return Cookies.get(name) || null;
};

/**
 * ลบคุกกี้ทั่วไป
 * @param {string} name - ชื่อคุกกี้
 */
export const removeCookie = (name) => {
  Cookies.remove(name);
};