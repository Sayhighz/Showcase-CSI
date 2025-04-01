import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthCookie, removeAuthCookie } from "../lib/cookie"; // ฟังก์ชันการจัดการ cookie
import { jwtDecode } from "jwt-decode"; // ใช้ในการถอดรหัส JWT token

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // ใช้ `null` แทนสถานะการโหลด
  const [authData, setAuthData] = useState({ username: "", role: "", token: "", userId: "" }); // ข้อมูลผู้ใช้ รวมถึง userId

  // ฟังก์ชันตรวจสอบว่า token หมดอายุหรือยัง
  const checkTokenExpiration = (token) => {
    try {
      const decoded = jwtDecode(token); // ถอดรหัส token
      const currentTime = Date.now() / 1000; // เวลาปัจจุบันในวินาที
      return decoded.exp < currentTime; // หากหมดอายุจะคืนค่า true
    } catch (error) {
      return true; // หากไม่สามารถถอดรหัสได้ให้ถือว่า token หมดอายุ
    }
  };

  // ฟังก์ชัน logout
  const logout = () => {
    removeAuthCookie(); // ลบ cookie ของ authentication
    setAuthData({ username: "", role: "", token: "", userId: "" }); // รีเซ็ตข้อมูลผู้ใช้
    setIsAuthenticated(false); // เปลี่ยนสถานะเป็นไม่ล็อกอิน
  };

  useEffect(() => {
    const authToken = getAuthCookie(); // ดึง token จาก cookie
    
    if (authToken) {
      // ตรวจสอบว่า token หมดอายุหรือไม่
      if (checkTokenExpiration(authToken)) {
        logout(); // ถ้า token หมดอายุให้ logout
        return; // ออกจาก useEffect
      }

      // ถอดรหัส token และเก็บข้อมูลผู้ใช้
      const decoded = jwtDecode(authToken);
      setAuthData({
        username: decoded.username,
        role: decoded.role,
        token: authToken,
        userId: decoded.id, // เพิ่ม userId จาก token
      });
    }

    setIsAuthenticated(!!authToken); // อัปเดตสถานะการยืนยันตัวตน

    // ตั้งเวลาให้ตรวจสอบ token ทุกๆ 1 นาที
    const intervalId = setInterval(() => {
      const token = getAuthCookie();
      if (token && checkTokenExpiration(token)) {
        logout(); // ถ้า token หมดอายุให้ logout
      }
    }, 60000); // ตรวจสอบทุก 1 นาที

    // ทำความสะอาดเมื่อ component ถูก unmount
    return () => clearInterval(intervalId);

  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, authData, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
