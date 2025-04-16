/**
 * Context สำหรับจัดการการยืนยันตัวตน
 * ใช้สำหรับจัดการและแชร์ state ที่เกี่ยวข้องกับการล็อกอิน ล็อกเอาท์ การลงทะเบียน และการตรวจสอบสิทธิ์ของผู้ใช้
 */
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

// นำเข้า services ที่เกี่ยวข้อง
import { 
  login, 
  register, 
  logout, 
  getCurrentUser, 
  verifyToken, 
  forgotPassword, 
  resetPassword, 
  changePassword 
} from '../services/authService';
import { getAuthCookie, setAuthCookie, removeAuthCookie } from '../lib/cookie';
import { AUTH } from '../constants/routes';

// นำเข้า constants เกี่ยวกับสิทธิ์ของผู้ใช้
import { hasPermission, hasRolePriority, ROLES } from '../constants/userRoles';

// สร้าง Context
export const AuthContext = createContext();

/**
 * Provider สำหรับ AuthContext
 * @param {Object} props - Props ของ component
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - Provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  /**
   * ตรวจสอบสถานะการยืนยันตัวตน
   */
  const checkAuthStatus = useCallback(async () => {
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
  }, []);

  /**
   * ล็อกอินเข้าสู่ระบบ
   * @param {string} username - ชื่อผู้ใช้
   * @param {string} password - รหัสผ่าน
   * @returns {Promise} - ผลลัพธ์จากการล็อกอิน
   */
  const handleLogin = useCallback(async (username, password) => {
    setIsAuthLoading(true);
    setError(null);
    
    try {
      const userData = await login(username, password);
      setUser(userData.user);
      setIsAuthenticated(true);
      message.success('เข้าสู่ระบบสำเร็จ');
      
      // นำทางไปยังหน้าแรกหรือหน้าที่ต้องการหลังจากล็อกอิน
      navigate('/');
      
      return userData;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, [navigate]);

  /**
   * ลงทะเบียนผู้ใช้ใหม่
   * @param {Object} userData - ข้อมูลผู้ใช้สำหรับการลงทะเบียน
   * @returns {Promise} - ผลลัพธ์จากการลงทะเบียน
   */
  const handleRegister = useCallback(async (userData) => {
    setIsAuthLoading(true);
    setError(null);
    
    try {
      const newUser = await register(userData);
      setUser(newUser.user);
      setIsAuthenticated(true);
      message.success('ลงทะเบียนและเข้าสู่ระบบสำเร็จ');
      
      // นำทางไปยังหน้าแรกหรือหน้าที่ต้องการหลังจากลงทะเบียน
      navigate('/');
      
      return newUser;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, [navigate]);

  /**
   * ล็อกเอาท์จากระบบ
   * @returns {Promise} - ผลลัพธ์จากการล็อกเอาท์
   */
  const handleLogout = useCallback(async () => {
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
  }, [navigate]);

  /**
   * ขอรีเซ็ตรหัสผ่าน
   * @param {string} email - อีเมลที่ต้องการรีเซ็ตรหัสผ่าน
   * @returns {Promise} - ผลลัพธ์จากการขอรีเซ็ตรหัสผ่าน
   */
  const handleForgotPassword = useCallback(async (email) => {
    setIsAuthLoading(true);
    setError(null);
    
    try {
      const result = await forgotPassword(email);
      message.success('กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน');
      return result;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  /**
   * รีเซ็ตรหัสผ่าน
   * @param {string} token - token สำหรับรีเซ็ตรหัสผ่าน
   * @param {string} newPassword - รหัสผ่านใหม่
   * @param {string} confirmPassword - ยืนยันรหัสผ่านใหม่
   * @returns {Promise} - ผลลัพธ์จากการรีเซ็ตรหัสผ่าน
   */
  const handleResetPassword = useCallback(async (token, newPassword, confirmPassword) => {
    setIsAuthLoading(true);
    setError(null);
    
    try {
      const result = await resetPassword(token, newPassword, confirmPassword);
      message.success('รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้');
      navigate(AUTH.LOGIN);
      return result;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, [navigate]);

  /**
   * เปลี่ยนรหัสผ่าน
   * @param {string} currentPassword - รหัสผ่านปัจจุบัน
   * @param {string} newPassword - รหัสผ่านใหม่
   * @returns {Promise} - ผลลัพธ์จากการเปลี่ยนรหัสผ่าน
   */
  const handleChangePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user || !user.id) {
      message.error('ไม่มีข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน');
      return null;
    }
    
    setIsAuthLoading(true);
    setError(null);
    
    try {
      const result = await changePassword(user.id, currentPassword, newPassword);
      message.success('เปลี่ยนรหัสผ่านสำเร็จ');
      return result;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, [user]);

  /**
   * ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการใช้งานฟีเจอร์หรือไม่
   * @param {string} permission - สิทธิ์ที่ต้องการตรวจสอบ
   * @returns {boolean} - ผลการตรวจสอบสิทธิ์
   */
  const checkPermission = useCallback((permission) => {
    if (!user || !user.role) return false;
    return hasPermission(user.role, permission);
  }, [user]);

  /**
   * ตรวจสอบว่าผู้ใช้มีบทบาทที่ต้องการหรือไม่
   * @param {string|Array} roles - บทบาทที่ต้องการตรวจสอบ (string หรือ array ของ string)
   * @returns {boolean} - ผลการตรวจสอบบทบาท
   */
  const checkRole = useCallback((roles) => {
    if (!user || !user.role) return false;
    
    // ถ้า roles เป็น string ให้แปลงเป็น array
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    return roleArray.includes(user.role);
  }, [user]);

  /**
   * ตรวจสอบว่าผู้ใช้มีระดับสิทธิ์มากกว่าหรือเท่ากับบทบาทที่กำหนดหรือไม่
   * @param {string} requiredRole - บทบาทที่ต้องการตรวจสอบ
   * @returns {boolean} - ผลการตรวจสอบระดับสิทธิ์
   */
  const checkRolePriority = useCallback((requiredRole) => {
    if (!user || !user.role) return false;
    return hasRolePriority(user.role, requiredRole);
  }, [user]);

  /**
   * อัปเดตข้อมูลผู้ใช้
   * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการอัปเดต
   */
  const updateUserData = useCallback((userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  }, []);

  /**
   * ดึงข้อมูลผู้ใช้ปัจจุบันใหม่
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

  // ตรวจสอบสถานะการยืนยันตัวตนเมื่อ component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // สร้าง value object สำหรับ context
  const value = {
    // State
    user,
    isAuthenticated,
    isAuthLoading,
    error,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    changePassword: handleChangePassword,
    updateUserData,
    refreshUserData,
    
    // Helper functions
    hasPermission: checkPermission,
    hasRole: checkRole,
    hasRolePriority: checkRolePriority,
    
    // Constants
    ROLES,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook สำหรับใช้งาน AuthContext
 * @returns {Object} - Auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth ต้องใช้ภายใน AuthProvider');
  }
  
  return context;
};

export default { AuthContext, AuthProvider, useAuth };