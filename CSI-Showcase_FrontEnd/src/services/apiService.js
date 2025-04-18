/**
 * Service สำหรับการเรียกใช้งาน API ทั่วไป
 * ให้บริการฟังก์ชันพื้นฐานสำหรับการสื่อสารกับ API
 */
import axiosInstance from '../config/axiosConfig';
import { message } from 'antd';
import { STATUS_CODES } from '../constants/statusCodes';
import { getErrorMessage } from '../constants/statusCodes';

/**
 * ทำการเรียก API ด้วยเมธอด GET
 * @param {string} endpoint - endpoint ของ API
 * @param {Object} params - พารามิเตอร์สำหรับ query string
 * @param {Object} config - ตัวเลือกเพิ่มเติมสำหรับ axios
 * @returns {Promise} - ผลลัพธ์จาก API
 */
export const get = async (endpoint, params = {}, config = {}) => {
  try {
    const response = await axiosInstance.get(endpoint, { 
      params,
      ...config
    });
    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ทำการเรียก API ด้วยเมธอด POST
 * @param {string} endpoint - endpoint ของ API
 * @param {Object} data - ข้อมูลที่จะส่งไปกับคำขอ
 * @param {Object} config - ตัวเลือกเพิ่มเติมสำหรับ axios
 * @returns {Promise} - ผลลัพธ์จาก API
 */
export const post = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.post(endpoint, data, config);
    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ทำการเรียก API ด้วยเมธอด PUT
 * @param {string} endpoint - endpoint ของ API
 * @param {Object} data - ข้อมูลที่จะส่งไปกับคำขอ
 * @param {Object} config - ตัวเลือกเพิ่มเติมสำหรับ axios
 * @returns {Promise} - ผลลัพธ์จาก API
 */
export const put = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.put(endpoint, data, config);
    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ทำการเรียก API ด้วยเมธอด DELETE
 * @param {string} endpoint - endpoint ของ API
 * @param {Object} config - ตัวเลือกเพิ่มเติมสำหรับ axios
 * @returns {Promise} - ผลลัพธ์จาก API
 */
export const del = async (endpoint, config = {}) => {
  try {
    const response = await axiosInstance.delete(endpoint, config);
    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ทำการเรียก API ด้วยเมธอด PATCH
 * @param {string} endpoint - endpoint ของ API
 * @param {Object} data - ข้อมูลที่จะส่งไปกับคำขอ
 * @param {Object} config - ตัวเลือกเพิ่มเติมสำหรับ axios
 * @returns {Promise} - ผลลัพธ์จาก API
 */
export const patch = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.patch(endpoint, data, config);
    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ทำการอัปโหลดไฟล์ไปยัง API
 * @param {string} endpoint - endpoint ของ API
 * @param {FormData} formData - FormData ที่มีไฟล์และข้อมูลอื่นๆ
 * @param {Object} config - ตัวเลือกเพิ่มเติมสำหรับ axios
 * @returns {Promise} - ผลลัพธ์จาก API
 */
export const uploadFile = async (endpoint, formData, config = {}) => {
  try {
    // กำหนดค่า headers สำหรับการอัปโหลดไฟล์
    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    };
    
    const response = await axiosInstance.post(endpoint, formData, uploadConfig);
    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateFile = async (endpoint, formData, config = {}) => {
  try {
    // กำหนดค่า headers สำหรับการอัปโหลดไฟล์
    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    };
    
    const response = await axiosInstance.put(endpoint, formData, uploadConfig);
    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * จัดการข้อผิดพลาดจาก API
 * @param {Object} error - ข้อผิดพลาดที่เกิดขึ้น
 */
export const handleApiError = (error) => {
  // ถ้ามีข้อความผิดพลาดจาก API ให้แสดงข้อความนั้น
  if (error.status && error.message) {
    message.error(error.message);
    return;
  }
  
  // ถ้าไม่มีข้อความผิดพลาดเฉพาะเจาะจง ให้แสดงข้อความทั่วไปตามรหัสสถานะ
  if (error.status) {
    message.error(getErrorMessage(error.status));
    return;
  }
  
  // กรณีไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์
  message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดลองอีกครั้งในภายหลัง');
};

/**
 * สร้าง URL จาก endpoint และพารามิเตอร์
 * @param {string} endpoint - endpoint ของ API
 * @param {Object} params - พารามิเตอร์สำหรับ query string
 * @returns {string} - URL ที่สมบูรณ์
 */
export const buildUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint, window.location.origin);
  
  // เพิ่มพารามิเตอร์เข้าไปใน URL
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });
  
  return url.toString();
};

export default {
  get,
  post,
  put,
  del,
  patch,
  uploadFile,
  updateFile,
  handleApiError,
  buildUrl,
};