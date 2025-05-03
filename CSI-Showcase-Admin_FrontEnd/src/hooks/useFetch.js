// src/hooks/useFetch.js
import { useState, useCallback, useEffect, useRef } from 'react';
import _ from 'lodash';
import { message } from 'antd';
import { axiosGet } from '../lib/axios';

/**
 * Custom hook สำหรับการเรียกใช้ API โดยใช้ axios
 * @param {string} url - URL ที่ต้องการเรียก
 * @param {Object} params - พารามิเตอร์สำหรับ query string
 * @param {boolean} immediate - เรียกใช้ API ทันทีเมื่อ component mount หรือไม่
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {Object} - สถานะและฟังก์ชันสำหรับการเรียกใช้ API
 */
const useFetch = (url, params = {}, immediate = true, options = {}) => {
  // สถานะสำหรับเก็บข้อมูล
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // เก็บค่า params และ options ล่าสุด
  const latestParams = useRef(params);
  const latestOptions = useRef(options);
  const lastUrlRef = useRef(url);
  const fetchingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);
  
  // อัปเดตค่า params และ options ล่าสุดเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    latestParams.current = params;
  }, [params]);
  
  useEffect(() => {
    latestOptions.current = options;
  }, [options]);
  
  /**
   * เรียกใช้ API ด้วย GET method
   * @param {Object} customParams - พารามิเตอร์เพิ่มเติม (ถ้ามี)
   * @returns {Promise<any>} - ข้อมูลที่ได้จาก API
   */
  const fetchData = useCallback(
    _.debounce(async (customParams = {}) => {
      // ป้องกันการ fetch ซ้ำ
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      
      // รวม params ที่กำหนดไว้กับ params เพิ่มเติม
      const queryParams = {
        ...latestParams.current,
        ...customParams
      };
      
      setLoading(true);
      setError(null);
      
      try {
        // เรียกใช้ API
        const response = await axiosGet(lastUrlRef.current, queryParams);
        
        // จัดการกับผลลัพธ์
        if (latestOptions.current.onSuccess) {
          latestOptions.current.onSuccess(response);
        }
        
        setData(response);
        return response;
      } catch (err) {
        console.error(`Error fetching ${lastUrlRef.current}:`, err);
        
        // จัดการกับข้อผิดพลาด
        const errorMessage = err.message || 'เกิดข้อผิดพลาดในการเรียกข้อมูล';
        setError(errorMessage);
        
        if (latestOptions.current.onError) {
          latestOptions.current.onError(err);
        }
        
        // แสดงข้อความผิดพลาด (ถ้าไม่ได้กำหนด showErrorMessage เป็น false)
        if (latestOptions.current.showErrorMessage !== false) {
          message.error(errorMessage);
        }
        
        throw err;
      } finally {
        setLoading(false);
        setTimeout(() => {
          fetchingRef.current = false;
        }, 300);
      }
    }, 300),
    []
  );
  
  // เรียกใช้ API ทันทีเมื่อ component mount
  useEffect(() => {
    if (immediate && !initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      fetchData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // เรียกใช้ API เมื่อ url เปลี่ยน
  useEffect(() => {
    if (lastUrlRef.current !== url) {
      lastUrlRef.current = url;
      fetchData();
    }
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  
  /**
   * รีเฟรชข้อมูลโดยเรียกใช้ API อีกครั้ง
   * @param {Object} customParams - พารามิเตอร์เพิ่มเติม (ถ้ามี)
   * @returns {Promise<any>} - ข้อมูลที่ได้จาก API
   */
  const refresh = useCallback((customParams = {}) => {
    fetchingRef.current = false; // รีเซ็ตป้องกัน flag
    return fetchData(customParams);
  }, [fetchData]);
  
  return {
    data,
    loading,
    error,
    fetchData,
    refresh
  };
};

export default useFetch;