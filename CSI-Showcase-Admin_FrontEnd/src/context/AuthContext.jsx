import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { setAuthCookie, getAuthCookie, removeAuthCookie } from '../lib/cookie';
import { authLogin, authVerify } from '../services/authService';

// Create Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState({
    id: null,
    username: '',
    role: '',
    avatar: null
  });

  // Verify token and set authentication state
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = getAuthCookie();
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify token with backend
        const response = await authVerify(token);
        
        if (response.valid) {
          // If valid, decode and set admin data
          const decodedToken = jwtDecode(token);
          setAdmin({
            id: decodedToken.id,
            username: decodedToken.username,
            role: decodedToken.role,
            avatar: decodedToken.avatar || null
          });
          setIsAuthenticated(true);
        } else {
          // If invalid, clear auth data
          removeAuthCookie();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        removeAuthCookie();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await authLogin(username, password);
      
      if (response.success && response.token) {
        const decodedToken = jwtDecode(response.token);
        
        // Check if user is admin
        if (decodedToken.role !== 'admin') {
          message.error('คุณไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล');
          setIsLoading(false);
          return false;
        }
        
        // Set token in cookie
        setAuthCookie(response.token);
        
        // Set admin data
        setAdmin({
          id: decodedToken.id,
          username: decodedToken.username,
          role: decodedToken.role,
          avatar: decodedToken.avatar || null
        });
        
        setIsAuthenticated(true);
        message.success('เข้าสู่ระบบสำเร็จ');
        return true;
      } else {
        message.error(response.message || 'เข้าสู่ระบบล้มเหลว');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    removeAuthCookie();
    setIsAuthenticated(false);
    setAdmin({
      id: null,
      username: '',
      role: '',
      avatar: null
    });
    message.success('ออกจากระบบสำเร็จ');
    window.location.href = '/login';
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Refresh auth state
  const refreshAuth = async () => {
    const token = getAuthCookie();
    if (!token || isTokenExpired(token)) {
      logout();
      return false;
    }
    return true;
  };

  // Export context value
  const contextValue = {
    isAuthenticated,
    isLoading,
    admin,
    login,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;