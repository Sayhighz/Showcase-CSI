// src/hooks/useDebounce.js
import { useState, useEffect, useRef } from 'react';
import _ from 'lodash';

/**
 * Hook สำหรับ debounce ค่าที่เปลี่ยนบ่อย
 * @param {any} value - ค่าที่ต้องการ debounce
 * @param {number} delay - หน่วงเวลา (ms)
 * @returns {any} - ค่าหลัง debounce
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const prevValueRef = useRef(value);
  
  useEffect(() => {
    // ไม่ต้องทำงานถ้าค่าไม่เปลี่ยนแปลง
    if (_.isEqual(prevValueRef.current, value)) {
      return;
    }
    
    prevValueRef.current = value;
    
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;