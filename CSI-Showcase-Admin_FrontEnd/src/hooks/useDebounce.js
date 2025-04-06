// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Custom hook สำหรับการทำ debounce ค่าที่มีการเปลี่ยนแปลงบ่อย
 * ใช้เพื่อลดจำนวนการทำงานที่ไม่จำเป็น เช่น การค้นหาขณะพิมพ์
 * 
 * @param {any} value - ค่าที่ต้องการทำ debounce
 * @param {number} delay - ระยะเวลาที่ต้องรอหลังจากการเปลี่ยนแปลงล่าสุด (มิลลิวินาที)
 * @returns {any} - ค่าที่ผ่านการทำ debounce แล้ว
 */
const useDebounce = (value, delay = 500) => {
  // สถานะสำหรับเก็บค่าที่ผ่านการทำ debounce แล้ว
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // ตั้งค่า timeout เพื่อรอให้ผู้ใช้หยุดพิมพ์
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // ยกเลิก timeout เดิม ถ้ามีการเปลี่ยนแปลงค่าใหม่
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export default useDebounce;