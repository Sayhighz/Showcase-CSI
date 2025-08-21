import axios from 'axios';
import { getAuthCookie } from '../lib/cookie';

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
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || '';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Allow cookies to be sent with requests
});

// Add a request interceptor to include auth token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookie
    const token = getAuthCookie();
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add secret key to headers if available
    if (SECRET_KEY) {
      config.headers['secret_key'] = SECRET_KEY;
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common response cases
axiosInstance.interceptors.response.use(
  (response) => {
    // Return just the data part of the response
    return response.data;
  },
  (error) => {
    // Handle response error
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      
      // Handle authentication errors (401)
      if (error.response.status === 401) {
        // You might want to redirect to login page or refresh token
        console.warn('Authentication error: User is not authenticated');
        
        // Dispatch an event that can be caught by the AuthContext
        window.dispatchEvent(new CustomEvent('auth:unauthenticated'));
      }
      
      // Return a structured error object
      return Promise.reject({
        status: error.response.status,
        message: error.response.data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error: No response received', error.request);
      return Promise.reject({
        status: 0,
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      return Promise.reject({
        status: 500,
        message: error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      });
    }
  }
);

// Export the customized axios instance
export default axiosInstance;