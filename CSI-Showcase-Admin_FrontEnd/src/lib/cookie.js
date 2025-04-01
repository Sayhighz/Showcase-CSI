import Cookies from 'js-cookie';

// ชื่อคุกกี้สำหรับเก็บ auth token
const AUTH_COOKIE_NAME = 'admin_auth_token';

/**
 * ตั้งค่าคุกกี้สำหรับเก็บ auth token
 * @param {string} token - JWT token
 * @param {number} expires - จำนวนวันก่อนหมดอายุ (default: 1 วัน)
 */
export const setAuthCookie = (token, expires = 1) => {
  Cookies.set(AUTH_COOKIE_NAME, token, { 
    expires, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict' 
  });
};

/**
 * ดึง auth token จากคุกกี้
 * @returns {string|null} - token หรือ null ถ้าไม่มี
 */
export const getAuthCookie = () => {
  return Cookies.get(AUTH_COOKIE_NAME) || null;
};

/**
 * ลบคุกกี้ auth token
 */
export const removeAuthCookie = () => {
  Cookies.remove(AUTH_COOKIE_NAME);
};

/**
 * ตรวจสอบว่ามี auth token ในคุกกี้หรือไม่
 * @returns {boolean} - true ถ้ามี token, false ถ้าไม่มี
 */
export const hasAuthCookie = () => {
  return !!getAuthCookie();
};

/**
 * ตั้งค่าคุกกี้ทั่วไป
 * @param {string} name - ชื่อคุกกี้
 * @param {string} value - ค่าของคุกกี้
 * @param {number} expires - จำนวนวันก่อนหมดอายุ
 */
export const setCookie = (name, value, expires = 7) => {
  Cookies.set(name, value, { 
    expires, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });
};

/**
 * ดึงค่าคุกกี้ตามชื่อ
 * @param {string} name - ชื่อคุกกี้
 * @returns {string|null} - ค่าของคุกกี้หรือ null ถ้าไม่มี
 */
export const getCookie = (name) => {
  return Cookies.get(name) || null;
};

/**
 * ลบคุกกี้ตามชื่อ
 * @param {string} name - ชื่อคุกกี้
 */
export const removeCookie = (name) => {
  Cookies.remove(name);
};

/**
 * ลบคุกกี้ทั้งหมด
 */
export const removeAllCookies = () => {
  Object.keys(Cookies.get()).forEach(cookieName => {
    Cookies.remove(cookieName);
  });
};

/**
 * ตั้งค่าคุกกี้ที่มีการเข้ารหัส
 * @param {string} name - ชื่อคุกกี้
 * @param {string} value - ค่าของคุกกี้
 * @param {number} expires - จำนวนวันก่อนหมดอายุ
 */
export const setEncryptedCookie = (name, value, expires = 7) => {
  // สำหรับการใช้งานจริง ควรเข้ารหัสค่าก่อนจัดเก็บ
  // เช่น ใช้ crypto-js หรือวิธีการเข้ารหัสที่เหมาะสม
  const encryptedValue = btoa(value); // simple base64 encoding (ไม่ปลอดภัยเพียงพอสำหรับการใช้งานจริง)
  setCookie(name, encryptedValue, expires);
};

/**
 * ดึงค่าคุกกี้ที่มีการเข้ารหัส
 * @param {string} name - ชื่อคุกกี้
 * @returns {string|null} - ค่าของคุกกี้ที่ถอดรหัสแล้ว หรือ null ถ้าไม่มี
 */
export const getEncryptedCookie = (name) => {
  const cookie = getCookie(name);
  if (!cookie) return null;
  
  try {
    // ถอดรหัสค่า
    return atob(cookie); // simple base64 decoding
  } catch (error) {
    console.error('Error decoding cookie:', error);
    return null;
  }
};