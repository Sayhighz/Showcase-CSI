// hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Custom hook สำหรับการ debounce ค่าที่มีการเปลี่ยนแปลงบ่อย
 * ใช้เพื่อลดจำนวนการทำงานที่ไม่จำเป็น เช่น การค้นหาขณะพิมพ์
 * 
 * @param {any} value - ค่าที่ต้องการ debounce
 * @param {number} delay - ระยะเวลาในการรอ (มิลลิวินาที) ก่อนที่จะอัปเดตค่า
 * @returns {any} ค่าที่ผ่านการ debounce แล้ว
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // ตั้งค่า timeout เพื่อรอให้ผู้ใช้หยุดพิมพ์
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // ยกเลิก timeout เดิม ถ้ามีการเปลี่ยนแปลงค่าใหม่
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export default useDebounce;