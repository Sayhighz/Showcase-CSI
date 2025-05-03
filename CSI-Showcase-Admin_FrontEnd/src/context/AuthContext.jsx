import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { message } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { setAdminAuthCookie, getAdminAuthCookie, removeAdminAuthCookie } from '../lib/cookie';
import { adminLogin, verifyAdminToken } from '../services/authService';

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
    
    // สร้างตัวแปรเพื่อตรวจสอบว่าทำการตรวจสอบ token แล้วหรือยัง
    const verifyAuthRef = useRef(false);
    // เพิ่ม ref เพื่อป้องกันการ redirect ซ้ำซ้อน
    const redirectInProgressRef = useRef(false);
    // เพิ่ม ref เพื่อควบคุมการตรวจสอบ cookie
    const cookieCheckRef = useRef(0);
    // เพิ่ม ref เพื่อตรวจสอบว่าได้จัดการ token ที่หมดอายุแล้วหรือไม่
    const expiredTokenHandledRef = useRef(false);

    // Verify token and set authentication state
    useEffect(() => {
        // ป้องกันการทำงานซ้ำ
        if (verifyAuthRef.current) return;
        verifyAuthRef.current = true;
        
        const verifyAuth = async () => {
            try {
                const token = getAdminAuthCookie();
                
                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // ตรวจสอบการหมดอายุของ token ก่อน
                try {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;
                    
                    // ถ้า token หมดอายุแล้ว ให้ลบและจัดการ
                    if (decodedToken.exp < currentTime) {
                        console.log("Token expired during initial verification");
                        removeAdminAuthCookie();
                        setIsAuthenticated(false);
                        setIsLoading(false);
                        
                        // เตรียม redirect ไปหน้า login ในกรณีที่ token หมดอายุ
                        if (!redirectInProgressRef.current && !expiredTokenHandledRef.current) {
                            expiredTokenHandledRef.current = true;
                            message.error("เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่");
                            
                            setTimeout(() => {
                                window.location.href = '/login';
                            }, 500);
                        }
                        return;
                    }
                } catch (err) {
                    console.error("Error decoding token:", err);
                    removeAdminAuthCookie();
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Verify token with backend - ทำเพียงครั้งเดียวเมื่อโหลดแอพ
                cookieCheckRef.current += 1;
                if (cookieCheckRef.current > 1) {
                    console.log("ป้องกันการตรวจสอบ cookie ซ้ำซ้อน");
                    setIsLoading(false);
                    return;
                }
                
                const response = await verifyAdminToken(token);
                
                if (response.valid) {
                    // If valid, decode and set admin data
                    const decodedToken = jwtDecode(token);
                    setAdmin({
                      id: decodedToken.id,
                      username: response.user.fullName,
                      role: decodedToken.role,
                      avatar: response.user.image || null
                    });
                    setIsAuthenticated(true);
                } else {
                    // If invalid, clear auth data
                    console.log("Token invalid from server response");
                    removeAdminAuthCookie();
                    setIsAuthenticated(false);
                    
                    // เตรียม redirect ไปหน้า login ในกรณีที่ token ไม่ถูกต้อง
                    if (!redirectInProgressRef.current && !expiredTokenHandledRef.current) {
                        expiredTokenHandledRef.current = true;
                        message.error("เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่");
                        
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 500);
                    }
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                removeAdminAuthCookie();
                setIsAuthenticated(false);
                
                // เตรียม redirect ไปหน้า login ในกรณีที่มีข้อผิดพลาด
                if (!redirectInProgressRef.current && !expiredTokenHandledRef.current) {
                    expiredTokenHandledRef.current = true;
                    message.error("เกิดข้อผิดพลาดในการตรวจสอบสถานะ กรุณาเข้าสู่ระบบใหม่");
                    
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 500);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        verifyAuth();
    }, []); // เพิ่ม array ว่างเพื่อให้ทำงานเพียงครั้งเดียว
    
    // Login function - แก้ไขให้มีชื่อที่ไม่ซ้ำกับ import
    const handleLogin = useCallback(async (username, password) => {
        setIsLoading(true);
        try {
            const response = await adminLogin(username, password);
            
            if (response.success && response.data && response.data.token) {
                // Fixed: Get token from response.data.token
                const token = response.data.token;
                const decodedToken = jwtDecode(token);
                
                // Check if user is admin
                if (decodedToken.role !== 'admin') {
                    message.error('คุณไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล');
                    setIsLoading(false);
                    return false;
                }
                
                // Set token in cookie
                setAdminAuthCookie(token);
                // รีเซ็ตตัวนับการตรวจสอบ cookie
                cookieCheckRef.current = 0;
                verifyAuthRef.current = false;
                expiredTokenHandledRef.current = false;
                
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

    // Logout function - ปรับปรุงการ redirect และเพิ่ม force parameter
    const handleLogout = useCallback((force = false) => {
        // ป้องกันการเรียกซ้ำ
        if (redirectInProgressRef.current && !force) return;
        redirectInProgressRef.current = true;
        
        removeAdminAuthCookie();
        setIsAuthenticated(false);
        setAdmin({
            id: null,
            username: '',
            role: '',
            avatar: null
        });
        
        // แสดงข้อความเฉพาะกรณีไม่ได้ถูกบังคับออกจากระบบ (session หมดอายุ)
        if (!force) {
            message.success('ออกจากระบบสำเร็จ');
        }
        
        // รีเซ็ตตัวนับการตรวจสอบ cookie
        cookieCheckRef.current = 0;
        verifyAuthRef.current = false;
        
        // ใช้ setTimeout เพื่อป้องกัน infinite loop
        setTimeout(() => {
            // ใช้ replace state แทน window.location.href เพื่อป้องกันปัญหากับ React Router
            window.history.replaceState(null, '', '/login');
            window.location.reload();
            
            // รีเซ็ต ref หลังจากเริ่มกระบวนการ redirect
            setTimeout(() => {
                redirectInProgressRef.current = false;
            }, 300);
        }, 100);
    }, []);

    // Check if token is expired - ปรับปรุงให้แสดง log เพื่อการ debug
    const isTokenExpired = useCallback((token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            // เพิ่ม log เพื่อเช็คการทำงาน
            const isExpired = decoded.exp < currentTime;
            if (isExpired) {
                console.log("Token is expired! Current time:", currentTime, "Expiry time:", decoded.exp);
            }
            
            return isExpired;
        } catch (error) {
            console.error("Error checking token expiry:", error);
            return true;
        }
    }, []);

    // Refresh auth state - ปรับปรุงเพื่อการจัดการ token ที่หมดอายุ
    const refreshAuth = useCallback(async () => {
        // ป้องกันการเรียกหลายครั้ง
        if (cookieCheckRef.current > 10) {
            console.warn("การตรวจสอบ cookie มากเกินไป!");
            return isAuthenticated;
        }
        
        cookieCheckRef.current += 1;
        
        // ตรวจสอบว่ามี token หรือไม่
        const token = getAdminAuthCookie();
        if (!token) {
            console.log("No token found during refresh auth");
            
            if (!redirectInProgressRef.current && !expiredTokenHandledRef.current) {
                expiredTokenHandledRef.current = true;
                handleLogout(true); // force logout
            }
            return false;
        }
        
        // ตรวจสอบว่า token หมดอายุหรือไม่
        if (isTokenExpired(token)) {
            console.log("Token expired during refresh auth");
            
            // ลบ token และรีเซ็ต state
            removeAdminAuthCookie();
            setIsAuthenticated(false);
            setAdmin({
                id: null,
                username: '',
                role: '',
                avatar: null
            });
            
            if (!redirectInProgressRef.current && !expiredTokenHandledRef.current) {
                expiredTokenHandledRef.current = true;
                message.error("เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่");
                
                // ทำการ redirect ไปยังหน้า login
                setTimeout(() => {
                    window.history.replaceState(null, '', '/login');
                    window.location.reload();
                }, 500);
            }
            return false;
        }
        
        // ในกรณีที่ token ยังไม่หมดอายุ
        return true;
    }, [isTokenExpired, handleLogout, isAuthenticated]);

    // เพิ่ม useEffect เพื่อตรวจสอบ token ทุก 5 นาที
    useEffect(() => {
        // ตั้งเวลาตรวจสอบ token เป็นระยะ
        const interval = setInterval(async () => {
            await refreshAuth();
        }, 5 * 60 * 1000); // 5 นาที
        
        return () => clearInterval(interval);
    }, [refreshAuth]);

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