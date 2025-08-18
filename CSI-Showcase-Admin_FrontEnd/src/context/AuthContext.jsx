import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { message } from 'antd';
import { jwtDecode } from 'jwt-decode';
import {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  hasValidAuthCookies,
  getCSRFToken,
  initializeCookieSecurity
} from '../lib/cookie-simple';
import { adminLogin, userLogin } from '../services/authService';

// Environment configuration
const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/csif';
const APP_NAME = import.meta.env.VITE_APP_NAME || 'CSI ProjectManage';

// Helper function to create full path for external redirects
const getFullPath = (path) => {
  if (!path) return `${BASE_PATH}/login`;
  if (path === '/') return `${BASE_PATH}/login`; // Root login should be BASE_PATH/login
  if (path === '/login') return `${BASE_PATH}/login`;
  if (path.startsWith('/')) {
    return `${BASE_PATH}${path}`;
  }
  return `${BASE_PATH}/${path}`;
};


// Create Auth Context
const AuthContext = createContext(null);

/**
 * Simple token expiry check
 */
const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const bufferTime = 60; // 1 minute buffer
    return decoded.exp < (currentTime + bufferTime);
  } catch (error) {
    console.error("❌ Error checking token expiry:", error);
    return true;
  }
};

/**
 * Simple token validation
 */
const validateToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    
    // Check required fields
    if (!decoded.id && !decoded.userId) return false;
    if (!decoded.role) return false;
    if (!['admin', 'student'].includes(decoded.role)) return false;
    
    return true;
  } catch (error) {
    console.error("❌ Error validating token:", error);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const initCompleteRef = useRef(false);

  /**
   * Initialize security system
   */
  useEffect(() => {
    initializeCookieSecurity();
  }, []);

  /**
   * Initial authentication check - runs only once
   */
  useEffect(() => {
    if (initCompleteRef.current) return;
    
    console.log("🚀 Initial authentication check");
    
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const token = getAuthToken();
        console.log("Token check:", token ? "found" : "not found");
        
        if (!token) {
          console.log("No token, setting unauthenticated");
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          initCompleteRef.current = true;
          return;
        }
        
        if (isTokenExpired(token)) {
          console.log("Token expired, clearing");
          removeAuthToken();
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          initCompleteRef.current = true;
          return;
        }
        
        if (!validateToken(token)) {
          console.log("Token invalid, clearing");
          removeAuthToken();
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          initCompleteRef.current = true;
          return;
        }
        
        // Token is valid, set user
        const decoded = jwtDecode(token);
        const userData = {
          id: decoded.id || decoded.userId,
          username: decoded.user?.fullName || decoded.fullName || decoded.username || decoded.name || 'User',
          role: decoded.role,
          avatar: decoded.user?.image || decoded.image || decoded.avatar || null
        };
        
        console.log("✅ Setting authenticated user:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        initCompleteRef.current = true;
        
      } catch (error) {
        console.error("❌ Auth check error:", error);
        removeAuthToken();
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        initCompleteRef.current = true;
      }
    };
    
    checkAuth();
  }, []);

  /**
   * Login function
   */
  const handleLogin = useCallback(async (username, password) => {
    console.log("🔐 Login attempt for:", username);
    setIsLoading(true);
    
    try {
      // พยายามล็อกอินเป็นแอดมินก่อน
      let response = await adminLogin(username, password);
      console.log("Admin login response received");
      
      // ถ้าไม่สำเร็จ ลองล็อกอินด้วย endpoint ผู้ใช้ทั่วไป (สำหรับ student)
      if (!(response && response.success && response.data && response.data.token)) {
        console.log("Admin login failed or no token, trying user login...");
        response = await userLogin(username, password);
      }
      
      if (response && response.success && response.data && response.data.token) {
        const token = response.data.token;
        
        if (!validateToken(token)) {
          message.error('โทเค็นไม่ถูกต้อง');
          setIsLoading(false);
          return false;
        }
        
        const decoded = jwtDecode(token);
        
        if (!['admin', 'student'].includes(decoded.role)) {
          message.error('คุณไม่มีสิทธิ์เข้าถึงระบบ');
          setIsLoading(false);
          return false;
        }
        
        // Save token
        const cookieSet = setAuthToken(token, 7);
        if (!cookieSet) {
          message.error('ไม่สามารถบันทึกข้อมูลการเข้าสู่ระบบได้');
          setIsLoading(false);
          return false;
        }
        
        // Set user data
        const userData = {
          id: decoded.id || decoded.userId,
          username: response.data.user?.fullName ||
                   response.data.user?.username ||
                   decoded.user?.fullName ||
                   decoded.fullName ||
                   decoded.username ||
                   decoded.name ||
                   username,
          role: decoded.role,
          avatar: response.data.user?.image ||
                 response.data.user?.avatar ||
                 decoded.user?.image ||
                 decoded.image ||
                 decoded.avatar ||
                 null
        };
        
        console.log("✅ Login successful, setting user:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        
        message.success('เข้าสู่ระบบสำเร็จ');
        
        // Force a small delay to ensure state is updated before navigation
        setTimeout(() => {
          console.log("🔄 Post-login: Authentication state set", {
            isAuthenticated: true,
            user: userData
          });
        }, 100);
        
        return true;
      } else {
        message.error((response && response.message) || 'เข้าสู่ระบบล้มเหลว');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      message.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      setIsLoading(false);
      return false;
    }
  }, []);
  
  /**
   * Logout function
   */
  const handleLogout = useCallback(() => {
    console.log("🚪 Logging out");
    
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    
    message.success('ออกจากระบบสำเร็จ');
    
    // For session timeout or logout, redirect to external login path
    setTimeout(() => {
      console.log("Redirecting to login with full path:", getFullPath('/login'));
      window.location.replace(getFullPath('/login'));
    }, 100);
  }, []);
  
  /**
   * Refresh authentication status
   */
  const refreshAuth = useCallback(async () => {
    console.log("🔄 Refreshing auth");
    
    try {
      const token = getAuthToken();
      
      if (!token || isTokenExpired(token) || !validateToken(token)) {
        console.log("Token invalid during refresh");
        removeAuthToken();
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("❌ Refresh error:", error);
      return false;
    }
  }, []);
  
  // Create context value
  const contextValue = React.useMemo(() => ({
    isAuthenticated,
    isLoading,
    user,
    // Backward compatibility
    admin: user,
    // Security features
    csrfToken: getCSRFToken(),
    // Core functions
    login: handleLogin,
    logout: handleLogout,
    refreshAuth,
    // Additional info
    securityInfo: {
      hasValidCookies: hasValidAuthCookies(),
      appName: APP_NAME
    }
  }), [isAuthenticated, isLoading, user, handleLogin, handleLogout, refreshAuth]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;