/**
 * Custom hook สำหรับจัดการการยืนยันตัวตน
 * จัดการ state และฟังก์ชันที่เกี่ยวข้องกับการล็อกอิน ล็อกเอาท์ การลงทะเบียน และการตรวจสอบสถานะการยืนยันตัวตน
 */
import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

// นำเข้า services ที่เกี่ยวข้อง
import { login, register, logout, getCurrentUser, verifyToken } from '../services/authService';
import { getAuthCookie, setAuthCookie, removeAuthCookie } from '../lib/cookie';
import { AUTH } from '../constants/routes';

// นำเข้า context (ต้องสร้างก่อนใช้งาน)
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook สำหรับจัดการการยืนยันตัวตน
 * @returns {Object} - ฟังก์ชันและสถานะที่เกี่ยวข้องกับการยืนยันตัวตน
 */
const useAuth = () => {
  // ใช้ AuthContext ถ้ามี (ไม่จำเป็นถ้าใช้ hooks โดยตรง)
  // ในกรณีนี้ให้เลือกใช้อย่างใดอย่างหนึ่ง
  const authContext = useContext(AuthContext);

  // ถ้าใช้ AuthContext ให้ return ค่าจาก context ได้เลย
  if (authContext) {
    return authContext;
  }

  // ถ้าไม่ใช้ context ให้จัดการ state และฟังก์ชันภายใน hook
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  /**
   * ตรวจสอบสถานะการยืนยันตัวตนเมื่อ hook ถูกเรียกใช้
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsAuthLoading(true);
      setError(null);
      
      try {
        // ตรวจสอบว่ามี token หรือไม่
        const token = getAuthCookie();
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setIsAuthLoading(false);
          return;
        }
        
        // ตรวจสอบความถูกต้องของ token และดึงข้อมูลผู้ใช้
        try {
          await verifyToken();
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          // ถ้า token ไม่ถูกต้องหรือหมดอายุ
          removeAuthCookie();
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        setError('ไม่สามารถตรวจสอบสถานะการยืนยันตัวตนได้');
        console.error('เกิดข้อผิดพลาดในการตรวจสอบสถานะการยืนยันตัวตน:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  /**
   * ฟังก์ชันสำหรับการล็อกอิน
   * @param {string} username - ชื่อผู้ใช้
   * @param {string} password - รหัสผ่าน
   * @returns {Promise} - ผลลัพธ์จากการล็อกอิน
   */
  const handleLogin = async (username, password) => {
    setIsAuthLoading(true);
    setError(null);
    
    try {
      const userData = await login(username, password);
      setUser(userData.user);
      setIsAuthenticated(true);
      message.success('เข้าสู่ระบบสำเร็จ');
      return userData;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * ฟังก์ชันสำหรับการลงทะเบียน
   * @param {Object} userData - ข้อมูลผู้ใช้สำหรับการลงทะเบียน
   * @returns {Promise} - ผลลัพธ์จากการลงทะเบียน
   */
  const handleRegister = async (userData) => {
    setIsAuthLoading(true);
    setError(null);
    
    try {
      const newUser = await register(userData);
      setUser(newUser.user);
      setIsAuthenticated(true);
      message.success('ลงทะเบียนและเข้าสู่ระบบสำเร็จ');
      return newUser;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * ฟังก์ชันสำหรับการล็อกเอาท์
   * @returns {Promise} - ผลลัพธ์จากการล็อกเอาท์
   */
  const handleLogout = async () => {
    setIsAuthLoading(true);
    
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      removeAuthCookie();
      message.success('ออกจากระบบสำเร็จ');
      navigate(AUTH.LOGIN);
      return true;
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการออกจากระบบ:', err);
      // แม้จะเกิดข้อผิดพลาดในการเรียก API ล็อกเอาท์
      // เราก็ยังต้องลบ token และ state ผู้ใช้ออก
      setUser(null);
      setIsAuthenticated(false);
      removeAuthCookie();
      navigate(AUTH.LOGIN);
      return true;
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้มีสิทธิ์ในการใช้งานฟีเจอร์หรือไม่
   * @param {string} permission - สิทธิ์ที่ต้องการตรวจสอบ
   * @returns {boolean} - ผลการตรวจสอบสิทธิ์
   */
  const hasPermission = useCallback((permission) => {
    if (!user || !user.role) return false;
    
    // ใช้ฟังก์ชันจาก userRoles เพื่อตรวจสอบสิทธิ์
    const { hasPermission } = require('../constants/userRoles');
    return hasPermission(user.role, permission);
  }, [user]);

  /**
   * ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้มีบทบาทที่ต้องการหรือไม่
   * @param {string|Array} roles - บทบาทที่ต้องการตรวจสอบ (string หรือ array ของ string)
   * @returns {boolean} - ผลการตรวจสอบบทบาท
   */
  const hasRole = useCallback((roles) => {
    if (!user || !user.role) return false;
    
    // ถ้า roles เป็น string ให้แปลงเป็น array
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    return roleArray.includes(user.role);
  }, [user]);

  /**
   * ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้
   * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการอัปเดต
   */
  const updateUserData = useCallback((userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  }, []);

  /**
   * ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ปัจจุบันใหม่
   */
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsAuthLoading(true);
    
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', err);
      
      // ถ้าเกิดข้อผิดพลาด 401 (Unauthorized) แสดงว่า token หมดอายุหรือไม่ถูกต้อง
      if (err.status === 401) {
        removeAuthCookie();
        setIsAuthenticated(false);
        setUser(null);
        navigate(AUTH.LOGIN);
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, [isAuthenticated, navigate]);

  return {
    user,
    isAuthenticated,
    isAuthLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    hasPermission,
    hasRole,
    updateUserData,
    refreshUserData
  };
};

export default useAuth;