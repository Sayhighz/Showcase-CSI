// hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useAuth from './useAuth';
import { notification } from 'antd';

/**
 * Custom hook สำหรับการดึงข้อมูลจาก API
 * 
 * @param {string} url - URL ที่ต้องการดึงข้อมูล
 * @param {Object} options - ตัวเลือกเพิ่มเติม เช่น headers, method, body
 * @param {boolean} immediate - ต้องการให้ดึงข้อมูลทันทีหรือไม่ (default: true)
 * @returns {Object} ข้อมูลที่ดึงมา, สถานะการโหลด, ข้อผิดพลาด และฟังก์ชัน refetch
 */
const useFetch = (url, options = {}, immediate = true) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, logout } = useAuth();

  // สร้าง fetch function ที่สามารถเรียกใช้ซ้ำได้
  const fetchData = useCallback(async (overrideOptions = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // รวม options ที่ส่งเข้ามา
      const requestOptions = {
        ...options,
        ...overrideOptions,
        headers: {
          'Content-Type': 'application/json',
          // เพิ่ม Authorization header ถ้ามีการล็อกอิน
          ...(isAuthenticated && { 
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            'secret_key': import.meta.env.VITE_SECRET_KEY || '9a73a892-06f4-4ae1-8767-c1ff07a3823f',
            'admin_secret_key': import.meta.env.VITE_SECRET_KEY || '9a73a892-06f4-4ae1-8767-c1ff07a3823f'
          }),
          ...options.headers,
          ...overrideOptions.headers
        }
      };
      
      const response = await axios(url, requestOptions);
      
      if (response.status >= 200 && response.status < 300) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      setError(err);
      
      // จัดการกรณี Unauthorized (401)
      if (err.response && err.response.status === 401) {
        notification.error({
          message: 'เซสชันหมดอายุ',
          description: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
        });
        
        // ล็อกเอาท์อัตโนมัติกรณีเซสชันหมดอายุ
        if (logout) logout();
      } else {
        notification.error({
          message: 'เกิดข้อผิดพลาด',
          description: err.message || 'ไม่สามารถดึงข้อมูลได้',
        });
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [url, options, isAuthenticated, logout]);
  
  // เรียกใช้ fetchData เมื่อ component mount หรือเมื่อ dependencies เปลี่ยน
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);
  
  return { data, isLoading, error, refetch: fetchData };
};

export default useFetch;