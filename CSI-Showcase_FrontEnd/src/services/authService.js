/**
 * Service สำหรับการจัดการ authentication
 * ให้บริการฟังก์ชันเกี่ยวกับการยืนยันตัวตน, การล็อกอิน, การลงทะเบียน เป็นต้น
 */
import { get, post } from './apiService';
import { setAuthCookie, removeAuthCookie } from '../lib/cookie';
import { AUTH } from '../constants/apiEndpoints';
import { message } from 'antd';

/**
 * ล็อกอินเข้าสู่ระบบ
 * @param {string} username - ชื่อผู้ใช้
 * @param {string} password - รหัสผ่าน
 * @returns {Promise} - ผลลัพธ์จากการล็อกอิน
 */
export const login = async (username, password) => {
  try {
    const response = await post(AUTH.LOGIN, { username, password });
    
    // ถ้าล็อกอินสำเร็จและได้รับ token
    if (response && response.success && response.data && response.data.token) {
      // บันทึก token ลงใน cookie
      setAuthCookie(response.data.token);
      
      // แสดงข้อความแจ้งเตือนว่าล็อกอินสำเร็จ
      message.success('เข้าสู่ระบบสำเร็จ');
      
      return response.data;
    } else {
      // ถ้าไม่มี token ในข้อมูลตอบกลับ
      throw new Error('ไม่ได้รับ token จากเซิร์ฟเวอร์');
    }
  } catch (error) {
    // จัดการข้อผิดพลาดที่อาจเกิดขึ้น
    if (error.status === 401) {
      message.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } else {
      message.error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
    
    throw error;
  }
};

/**
 * ลงทะเบียนผู้ใช้ใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้
 * @param {string} userData.username - ชื่อผู้ใช้
 * @param {string} userData.password - รหัสผ่าน
 * @param {string} userData.fullName - ชื่อ-นามสกุล
 * @param {string} userData.email - อีเมล
 * @returns {Promise} - ผลลัพธ์จากการลงทะเบียน
 */
export const register = async (userData) => {
  try {
    const { username, password, fullName, email } = userData;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !fullName || !email) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    
    const response = await post(AUTH.REGISTER, {
      username,
      password,
      full_name: fullName,
      email,
    });
    
    // ถ้าลงทะเบียนสำเร็จและได้รับ token
    if (response && response.success && response.data && response.data.token) {
      // บันทึก token ลงใน cookie
      setAuthCookie(response.data.token);
      
      // แสดงข้อความแจ้งเตือนว่าลงทะเบียนสำเร็จ
      message.success('ลงทะเบียนและเข้าสู่ระบบสำเร็จ');
      
      return response.data;
    } else {
      // ถ้าไม่มี token ในข้อมูลตอบกลับ
      throw new Error('ไม่ได้รับ token จากเซิร์ฟเวอร์');
    }
  } catch (error) {
    // จัดการข้อผิดพลาดที่อาจเกิดขึ้น
    if (error.status === 409) {
      message.error('ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว');
    } else {
      message.error(error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    }
    
    throw error;
  }
};

/**
 * ล็อกเอาท์จากระบบ
 * @returns {Promise} - ผลลัพธ์จากการล็อกเอาท์
 */
export const logout = async () => {
  try {
    // เรียก API ล็อกเอาท์
    await post(AUTH.LOGOUT);
    
    // ลบ token จาก cookie
    removeAuthCookie();
    
    // แสดงข้อความแจ้งเตือนว่าล็อกเอาท์สำเร็จ
    message.success('ออกจากระบบสำเร็จ');
    
    return true;
  } catch (error) {
    // ถึงแม้จะเกิดข้อผิดพลาดในการเรียก API ล็อกเอาท์
    // แต่เราก็ยังต้องลบ token จาก cookie
    removeAuthCookie();
    
    // ไม่ต้องแสดงข้อความผิดพลาด เพราะไม่มีผลกระทบกับผู้ใช้
    console.error('เกิดข้อผิดพลาดในการล็อกเอาท์:', error);
    
    // ถือว่าล็อกเอาท์สำเร็จเพราะได้ลบ token แล้ว
    return true;
  }
};

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 * @returns {Promise} - ข้อมูลผู้ใช้ปัจจุบัน
 */
export const getCurrentUser = async () => {
  try {
    const response = await get(AUTH.ME);
    
    if (response && response.success && response.data) {
      return response.data;
    } else {
      throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    }
  } catch (error) {
    // ถ้าเกิดข้อผิดพลาด 401 (Unauthorized) แสดงว่า token หมดอายุหรือไม่ถูกต้อง
    if (error.status === 401) {
      // ลบ token จาก cookie
      removeAuthCookie();
      
      // กรณีนี้ไม่ต้องแสดงข้อความผิดพลาด เพราะจะมีการเปลี่ยนหน้าไปที่หน้าล็อกอินอยู่แล้ว
    } else {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
    }
    
    throw error;
  }
};

/**
 * ตรวจสอบความถูกต้องของ token
 * @returns {Promise} - ผลลัพธ์จากการตรวจสอบ token
 */
export const verifyToken = async () => {
  try {
    const response = await get(AUTH.VERIFY_TOKEN);
    
    if (response && response.success && response.data && response.data.valid) {
      return response.data;
    } else {
      removeAuthCookie();
      throw new Error('Token ไม่ถูกต้องหรือหมดอายุ');
    }
  } catch (error) {
    // ลบ token จาก cookie
    removeAuthCookie();
    
    // กรณีนี้ไม่ต้องแสดงข้อความผิดพลาด เพราะจะมีการเปลี่ยนหน้าไปที่หน้าล็อกอินอยู่แล้ว
    console.error('เกิดข้อผิดพลาดในการตรวจสอบ token:', error);
    
    throw error;
  }
};

/**
 * ขอรีเซ็ตรหัสผ่าน
 * @param {string} email - อีเมลที่ต้องการรีเซ็ตรหัสผ่าน
 * @returns {Promise} - ผลลัพธ์จากการขอรีเซ็ตรหัสผ่าน
 */
export const forgotPassword = async (email) => {
  try {
    const response = await post(AUTH.FORGOT_PASSWORD, { email });
    
    if (response && response.success) {
      message.success('กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน');
      return response.data;
    } else {
      throw new Error('ไม่สามารถดำเนินการรีเซ็ตรหัสผ่านได้');
    }
  } catch (error) {
    // ไม่แสดงข้อความผิดพลาดเพื่อป้องกันการรั่วไหลของข้อมูล
    message.success('หากอีเมลของคุณอยู่ในระบบ คุณจะได้รับอีเมลสำหรับรีเซ็ตรหัสผ่าน');
    
    console.error('เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน:', error);
    throw error;
  }
};

/**
 * รีเซ็ตรหัสผ่าน
 * @param {string} token - token สำหรับรีเซ็ตรหัสผ่าน
 * @param {string} newPassword - รหัสผ่านใหม่
 * @param {string} confirmPassword - ยืนยันรหัสผ่านใหม่
 * @returns {Promise} - ผลลัพธ์จากการรีเซ็ตรหัสผ่าน
 */
export const resetPassword = async (token, newPassword, confirmPassword) => {
  try {
    // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกัน
    if (newPassword !== confirmPassword) {
      throw new Error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    }
    
    const response = await post(AUTH.RESET_PASSWORD, {
      token,
      newPassword,
      confirmPassword,
    });
    
    if (response && response.success) {
      message.success('รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้');
      return response.data;
    } else {
      throw new Error('ไม่สามารถรีเซ็ตรหัสผ่านได้');
    }
  } catch (error) {
    // แสดงข้อความผิดพลาด
    message.error(error.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    
    throw error;
  }
};

/**
 * เปลี่ยนรหัสผ่าน
 * @param {string} userId - ID ของผู้ใช้
 * @param {string} currentPassword - รหัสผ่านปัจจุบัน
 * @param {string} newPassword - รหัสผ่านใหม่
 * @returns {Promise} - ผลลัพธ์จากการเปลี่ยนรหัสผ่าน
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await post(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
    
    if (response && response.success) {
      message.success('เปลี่ยนรหัสผ่านสำเร็จ');
      return response.data;
    } else {
      throw new Error('ไม่สามารถเปลี่ยนรหัสผ่านได้');
    }
  } catch (error) {
    // แสดงข้อความผิดพลาด
    if (error.status === 401) {
      message.error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    } else {
      message.error(error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
    
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  verifyToken,
  forgotPassword,
  resetPassword,
  changePassword,
};