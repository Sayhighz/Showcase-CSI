import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { message } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { setAuthCookie, getAuthCookie, removeAuthCookie } from '../lib/cookie';
import { login, verifyToken } from '../services/authService';

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
    // ลบ console.log ที่ไม่จำเป็น
    
    // สร้างตัวแปรเพื่อตรวจสอบว่าทำการตรวจสอบ token แล้วหรือยัง
    const verifyAuthRef = React.useRef(false);

    // Verify token and set authentication state
    useEffect(() => {
        // ป้องกันการทำงานซ้ำ
        if (verifyAuthRef.current) return;
        verifyAuthRef.current = true;
        
        const verifyAuth = async () => {
            try {
                const token = getAuthCookie();
                
                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Verify token with backend
                const response = await verifyToken(token);
                console.log("response",response)
                
                if (response.valid) {
                    // If valid, decode and set admin data
                    const decodedToken = jwtDecode(token);
                    setAdmin({
                      id: decodedToken.id,
                      username: response.user.fullName,
                      role: decodedToken.role,
                      avatar: response.user.image || null
                    });
                    console.log("asd",admin)
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
            
            // Login function - แก้ไขให้มีชื่อที่ไม่ซ้ำกับ import
            const handleLogin = useCallback(async (username, password) => {
              setIsLoading(true);
              try {
                const response = await login(username, password);
                console.log(response)
                
                if (response.success && response.data && response.data.token) {
                  // Fixed: Get token from response.data.token
                  const token = response.data.token;
                  const decodedToken = jwtDecode(token);
                  console.log(decodedToken);
                  
                  // Check if user is admin
                  if (decodedToken.role !== 'admin') {
                    message.error('คุณไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล');
                    setIsLoading(false);
                    return false;
                  }
                  
                // Set token in cookie
                setAuthCookie(token);
                
                // Set admin data
                setAdmin({
                    id: decodedToken.id,
                    username: response.data.user.fullName,
                    role: decodedToken.role,
                    avatar: response.data.user.image || null
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
    }, []);

    // Logout function
    const handleLogout = useCallback(() => {
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
    }, []);

    // Check if token is expired
    const isTokenExpired = useCallback((token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch {
            return true;
        }
    }, []);

    // Refresh auth state
    const refreshAuth = useCallback(async () => {
        const token = getAuthCookie();
        if (!token || isTokenExpired(token)) {
            handleLogout();
            return false;
        }
        return true;
    }, [isTokenExpired, handleLogout]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = React.useMemo(() => ({
        isAuthenticated,
        isLoading,
        admin,
        login: handleLogin,
        logout: handleLogout,
        refreshAuth
    }), [isAuthenticated, isLoading, admin, handleLogin, handleLogout, refreshAuth]);

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