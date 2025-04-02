// hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Custom hook สำหรับ debounce ค่าที่มีการเปลี่ยนแปลงบ่อย เช่นค่าจาก input
 * 
 * @param {any} value - ค่าที่ต้องการ debounce
 * @param {number} delay - ระยะเวลาในการ debounce (มิลลิวินาที)
 * @returns {any} - ค่าที่ผ่านการ debounce แล้ว
 */
const useDebounce = (value, delay) => {
  // ใช้ state เพื่อเก็บค่าที่ debounce แล้ว
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // ตั้ง timeout เพื่อ delay การอัปเดตค่า
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // ยกเลิก timeout เมื่อ value หรือ delay เปลี่ยน
    // หรือเมื่อ component unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;