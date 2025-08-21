import axios from 'axios';
import { message } from 'antd';
import { getAuthToken, removeAuthToken } from './cookie-simple';

// Env-driven base API URL resolver
const getBaseApiUrl = () => {
  const isProd = import.meta.env.PROD;
  const base =
    (isProd ? (import.meta.env.VITE_API_URL_PROD || import.meta.env.VITE_API_URL) : import.meta.env.VITE_API_URL)
    || '';
  // Optional prefix if only path is configured
  const apiPrefix = import.meta.env.VITE_API_BASE_PREFIX || '/csie/backend2';
  const resolved = base || `${window.location.origin}${apiPrefix}`;
  // Ensure no trailing slash
  return resolved.replace(/\/+$/, '');
};
const BASE_API_URL = `${getBaseApiUrl()}/api`;
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || '9a73a892-06f4-4ae1-8767-c1ff07a3823f';
const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/csif';

// Create an axios instance with basic configuration
const axiosInstance = axios.create({
    baseURL: BASE_API_URL,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to add headers
axiosInstance.interceptors.request.use(
    (config) => {
        // Add secret key to every API call
        config.headers['secret_key'] = SECRET_KEY;
        
        // Add token if available
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and normalize responses
axiosInstance.interceptors.response.use(
  (response) => {
    // Check if response has data property and return it
    if (response && response.data) {
      // Check if response.data has a data property (nested data structure)
      if (response.data.data) {
        return response.data;
      }
      return response.data;
    }
    
    // If no data property, return response as is
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      const reqUrl = (originalRequest?.url || '').toString();
      const method = (originalRequest?.method || '').toLowerCase();
      const isLoginRequest =
        method === 'post' && (reqUrl.includes('/auth/login') || reqUrl.includes('/admin/auth/login'));
      
      // ถ้าเป็นการล็อกอินแล้วรหัสไม่ถูกต้อง -> ไม่ต้องแสดง "เซสชั่นหมดอายุ"
      if (isLoginRequest) {
        return Promise.reject(error);
      }
      
      // ป้องกันลูป retry ที่ไม่จำเป็น
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Remove token and notify user (เฉพาะกรณี token หมดอายุจริงๆ)
        removeAuthToken();
        message.error({
          content: 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่',
          duration: 3,
          style: {
            marginTop: '20vh'
          }
        });
        
        // Navigate to login page with correct BASE_PATH
        setTimeout(() => {
          window.location.href = `${BASE_PATH}/login`;
        }, 1500);
      }
      
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden
    if (error.response && error.response.status === 403) {
      const reqUrl = (originalRequest?.url || '').toString();
      const token = getAuthToken();
      let role = null;
      let backendMsg = error.response?.data?.message || '';
      try {
        if (token) {
          const { jwtDecode } = await import('jwt-decode');
          const decoded = jwtDecode(token);
          role = decoded?.role || null;
        }
      } catch (_) {}

      const isAdminApi = reqUrl.includes('/admin/');
      const isAdminOnlyMsg = typeof backendMsg === 'string' && backendMsg.toLowerCase().includes('admin privileges required');

      // กรณี student เรียก admin api -> ไม่เด้ง error (ให้หน้าที่ใช้ RoleBasedRoute แสดง 403 UI แทน)
      if (role === 'student' && isAdminApi) {
        return Promise.reject(error);
      }

      // กรณี student แต่ backend ตอบกลับว่าต้องเป็น admin (ข้อความเฉพาะ)
      // บางครั้ง endpoint ฝั่งผู้ใช้อาจตอบข้อความนี้จาก middleware ฝั่ง admin (เช่น reverse proxy ผิดเส้น)
      // เพื่อไม่รบกวน UX นักศึกษา ให้เงียบข้อความ popup
      if (role === 'student' && isAdminOnlyMsg) {
        return Promise.reject(error);
      }

      message.error({
        content: 'ไม่มีสิทธิ์เข้าถึงข้อมูล: ' + (backendMsg || 'กรุณาตรวจสอบสิทธิ์การใช้งาน'),
        duration: 3
      });
      return Promise.reject(error);
    }
    
    // Handle 404 Not Found
    if (error.response && error.response.status === 404) {
      message.error({
        content: 'ไม่พบข้อมูล: ' + (error.response.data?.message || 'ไม่พบข้อมูลที่ร้องขอ'),
        duration: 3
      });
      return Promise.reject(error);
    }
    
    // Handle 500 Server Error
    if (error.response && error.response.status === 500) {
      message.error({
        content: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์: ' + (error.response.data?.message || 'โปรดลองอีกครั้งในภายหลัง'),
        duration: 3
      });
      return Promise.reject(error);
    }
    
    // Other errors
    if (error.response && error.response.data && error.response.data.message) {
      message.error({
        content: error.response.data.message,
        duration: 3
      });
    } else if (error.message === 'Network Error') {
      message.error({
        content: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่อเครือข่ายของคุณ',
        duration: 3
      });
    } else {
      message.error({
        content: 'เกิดข้อผิดพลาด: ' + (error.message || 'โปรดลองอีกครั้งในภายหลัง'),
        duration: 3
      });
    }
    
    return Promise.reject(error);
  }
);

// HTTP GET function
export const axiosGet = async (url, params = {}) => {
  try {
    const response = await axiosInstance.get(url, { params });
    // ตรวจสอบและจัดรูปแบบข้อมูล
    if (Array.isArray(response)) {
      return response;
    } else if (response && response.data) {
      return response.data;
    } else if (response && typeof response === 'object') {
      return response;
    }
    return [];
  } catch (error) {
    console.error(`GET ${url} error:`, error);
    throw error;
  }
};

// HTTP POST function
export const axiosPost = async (url, data = {}) => {
  try {
    const response = await axiosInstance.post(url, data);
    return response;
  } catch (error) {
    console.error(`POST ${url} error:`, error);
    throw error;
  }
};

// HTTP PUT function
export const axiosPut = async (url, data = {}) => {
  try {
    const response = await axiosInstance.put(url, data);
    console.log(response)
    return response;
  } catch (error) {
    console.error(`PUT ${url} error:`, error);
    throw error;
  }
};

// HTTP DELETE function
export const axiosDelete = async (url) => {
  try {
    const response = await axiosInstance.delete(url);
    return response;
  } catch (error) {
    console.error(`DELETE ${url} error:`, error);
    throw error;
  }
};

// File upload function
// File upload function
export const axiosUpload = async (url, formData, onProgress = () => {}) => {
  try {
    const response = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    });
    return response;
  } catch (error) {
    console.error(`UPLOAD ${url} error:`, error);
    throw error;
  }
};

export default axiosInstance;