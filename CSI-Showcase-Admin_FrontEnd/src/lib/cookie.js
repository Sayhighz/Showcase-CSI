import Cookies from 'js-cookie';

// ชื่อคุกกี้สำหรับเก็บ auth token
const AUTH_COOKIE_NAME = 'admin_auth_token';

/**
 * ตั้งค่าคุกกี้สำหรับเก็บ auth token
 * @param {string} token - JWT token
 * @param {number} expires - จำนวนวันก่อนหมดอายุ (default: 7 วัน)
 */
export const setAdminAuthCookie = (token, expires = 7) => {
  // console.log('🔐 Setting admin auth cookie with expiry:', expires, 'days');
  Cookies.set(AUTH_COOKIE_NAME, token, { 
    expires: expires, // เพิ่มเวลาหมดอายุเป็น 7 วัน (จากเดิม 1 วัน)
    path: '/', // กำหนด path ให้ชัดเจน
    secure: false,
    sameSite: 'Lax' 
  });
};

/**
 * ดึง auth token จากคุกกี้
 * @returns {string|null} - token หรือ null ถ้าไม่มี
 */
export const getAdminAuthCookie = () => {
  const token = Cookies.get(AUTH_COOKIE_NAME) || null;
  // console.log('🔍 Retrieved admin auth cookie:', token ? 'Found' : 'Not found');
  return token;
};

/**
 * ลบคุกกี้ auth token
 */
export const removeAdminAuthCookie = () => {
  // console.log('🗑️ Removing admin auth cookie');
  Cookies.remove(AUTH_COOKIE_NAME, { 
    path: '/' // ต้องระบุ path เดียวกับตอนสร้าง
  });
};

/**
 * ตรวจสอบว่ามี auth token ในคุกกี้หรือไม่
 * @returns {boolean} - true ถ้ามี token, false ถ้าไม่มี
 */
export const hasAuthCookie = () => {
  return !!getAdminAuthCookie();
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
    path: '/', // กำหนด path ให้ชัดเจน
    secure: false,
    sameSite: 'Lax'
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
  Cookies.remove(name, { 
    path: '/' // ต้องระบุ path เดียวกับตอนสร้าง
  });
};

/**
 * ลบคุกกี้ทั้งหมด
 */
export const removeAllCookies = () => {
  Object.keys(Cookies.get()).forEach(cookieName => {
    Cookies.remove(cookieName, { 
      path: '/' // ต้องระบุ path เดียวกับตอนสร้าง
    });
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