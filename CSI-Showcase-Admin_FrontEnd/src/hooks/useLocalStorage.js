// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook สำหรับจัดการข้อมูลใน local storage
 * @param {string} key - ชื่อ key ที่ใช้เก็บข้อมูลใน local storage
 * @param {any} initialValue - ค่าเริ่มต้นเมื่อไม่มีข้อมูลใน local storage
 * @returns {Array} - [value, setValue, removeValue]
 */
const useLocalStorage = (key, initialValue) => {
  // สร้างฟังก์ชันสำหรับอ่านค่าจาก local storage
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // ดึงข้อมูลจาก local storage
      const item = window.localStorage.getItem(key);
      
      // แปลงข้อมูลจาก JSON string เป็น JavaScript value
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);
  
  // สถานะสำหรับเก็บค่า
  const [storedValue, setStoredValue] = useState(readValue);
  
  // ฟังก์ชันสำหรับอัปเดตค่าใน state และ local storage
  const setValue = useCallback((value) => {
    if (typeof window === 'undefined') {
      console.warn(`Can't set localStorage key "${key}" outside browser`);
      return;
    }
    
    try {
      // ถ้า value เป็นฟังก์ชัน ให้เรียกใช้ฟังก์ชันนั้นเพื่อหาค่าใหม่
      const newValue = value instanceof Function ? value(storedValue) : value;
      
      // อัปเดต state
      setStoredValue(newValue);
      
      // อัปเดต local storage
      window.localStorage.setItem(key, JSON.stringify(newValue));
      
      // ส่ง event เพื่อแจ้งเตือนว่า local storage มีการเปลี่ยนแปลง
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // ฟังก์ชันสำหรับลบค่าออกจาก local storage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(`Can't remove localStorage key "${key}" outside browser`);
      return;
    }
    
    try {
      // ลบข้อมูลออกจาก local storage
      window.localStorage.removeItem(key);
      
      // รีเซ็ต state กลับเป็นค่า initialValue
      setStoredValue(initialValue);
      
      // ส่ง event เพื่อแจ้งเตือนว่า local storage มีการเปลี่ยนแปลง
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  // อัปเดตค่าใน state เมื่อ local storage มีการเปลี่ยนแปลงจากแท็บอื่น
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // ติดตามการเปลี่ยนแปลงของ local storage
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);
  
  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;