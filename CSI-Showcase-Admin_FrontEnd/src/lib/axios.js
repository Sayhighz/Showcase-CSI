import axios from 'axios';
import { message } from 'antd';
import { getAuthCookie, removeAuthCookie } from './cookie';

// Use import.meta.env instead of process.env for Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

// Create an axios instance with basic configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
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
    const token = getAuthCookie();
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

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    // For successful responses
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Remove token and notify user
      removeAuthCookie();
      message.error({
        content: 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่',
        duration: 3,
        style: {
          marginTop: '20vh'
        }
      });
      
      // Navigate to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden
    if (error.response && error.response.status === 403) {
      message.error({
        content: 'ไม่มีสิทธิ์เข้าถึงข้อมูล: ' + (error.response.data?.message || 'กรุณาตรวจสอบสิทธิ์การใช้งาน'),
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
    return await axiosInstance.get(url, { params });
  } catch (error) {
    console.error(`GET ${url} error:`, error);
    throw error;
  }
};

// HTTP POST function
export const axiosPost = async (url, data = {}) => {
  try {
    return await axiosInstance.post(url, data);
  } catch (error) {
    console.error(`POST ${url} error:`, error);
    throw error;
  }
};

// HTTP PUT function
export const axiosPut = async (url, data = {}) => {
  try {
    return await axiosInstance.put(url, data);
  } catch (error) {
    console.error(`PUT ${url} error:`, error);
    throw error;
  }
};

// HTTP DELETE function
export const axiosDelete = async (url) => {
  try {
    return await axiosInstance.delete(url);
  } catch (error) {
    console.error(`DELETE ${url} error:`, error);
    throw error;
  }
};

// File upload function
export const axiosUpload = async (url, formData, onProgress = () => {}) => {
  try {
    return await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    });
  } catch (error) {
    console.error(`UPLOAD ${url} error:`, error);
    throw error;
  }
};

export default axiosInstance;

// Function for login
export const axiosLogin = async (username, password) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`, 
        { username, password }, 
        { 
          headers: {
            'Content-Type': 'application/json',
            'secret_key': SECRET_KEY,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'LOGIN');
      
      // Format error for consistent handling
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
          data: error.response.data
        };
      } else if (error.request) {
        throw {
          status: 0,
          message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        };
      } else {
        throw {
          status: 500,
          message: error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
        };
      }
    }
  };

  const handleAxiosError = (error, requestType) => {
    if (error.response) {
      console.error(`${requestType} request error:`, {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error(`${requestType} request error: No response received`, error.request);
    } else {
      console.error(`${requestType} request error:`, error.message);
    }
  };