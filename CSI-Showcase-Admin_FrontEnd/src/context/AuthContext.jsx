import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { message } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { setAdminAuthCookie, getAdminAuthCookie, removeAdminAuthCookie } from '../lib/cookie';
import { adminLogin, verifyAdminToken } from '../services/authService';

// Create Auth Context
const AuthContext = createContext(null);

// ฟังก์ชันสำหรับตรวจสอบว่า token หมดอายุหรือไม่
const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const isExpired = decoded.exp < currentTime;
        
        if (isExpired) {
            console.log("Token is expired! Current time:", currentTime, "Expiry time:", decoded.exp);
        }
        
        return isExpired;
    } catch (error) {
        console.error("Error checking token expiry:", error);
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [admin, setAdmin] = useState({
        id: null,
        username: '',
        role: '',
        avatar: null
    });
    
    // เพิ่ม userInfoRef เพื่อเก็บข้อมูลผู้ใช้เพิ่มเติมที่ไม่ได้อยู่ใน token
    const userInfoRef = useRef({
        username: '',
        avatar: null
    });
    
    // ใช้ Ref เพียงอันเดียวเพื่อป้องกันการทำงานซ้ำซ้อน
    const authInProgressRef = useRef(false);
    
    // ฟังก์ชันตั้งค่าข้อมูลผู้ใช้จาก token
    const setUserFromToken = useCallback((token) => {
        try {
            if (!token) return false;
            
            const decodedToken = jwtDecode(token);
            console.log("Decoded token in setUserFromToken:", decodedToken);
            
            // ตรวจสอบการหมดอายุของ token
            if (isTokenExpired(token)) {
                console.log("Token expired when setting user");
                return false;
            }
            
            // ดึงข้อมูลจาก userInfoRef ที่เก็บไว้ตอน login
            const savedUserInfo = userInfoRef.current;
            console.log("Saved user info:", savedUserInfo);
            
            // ตั้งค่าข้อมูลผู้ใช้โดยใช้ข้อมูลจาก userInfoRef ก่อน
            // ถ้าไม่มีค่อยใช้ข้อมูลจาก token
            setAdmin({
                id: decodedToken.id || decodedToken.userId || null,
                // ใช้ username ที่เก็บไว้ในตอน login ก่อน
                username: savedUserInfo.username || 
                         decodedToken.user?.fullName || 
                         decodedToken.fullName || 
                         decodedToken.username || 
                         decodedToken.name || 
                         '',
                role: decodedToken.role,
                // ใช้ avatar ที่เก็บไว้ในตอน login ก่อน
                avatar: savedUserInfo.avatar || 
                       decodedToken.user?.image || 
                       decodedToken.image || 
                       decodedToken.user?.avatar || 
                       decodedToken.avatar || 
                       null
            });
            
            setIsAuthenticated(true);
            
            console.log("User set from token:", {
                id: decodedToken.id || decodedToken.userId || null,
                username: savedUserInfo.username || decodedToken.username || '',
                role: decodedToken.role,
                avatar: savedUserInfo.avatar || null
            });
            
            return true;
        } catch (error) {
            console.error("Error setting user from token:", error);
            return false;
        }
    }, []);
    
    // ตรวจสอบ token เมื่อโหลดแอพ - ทำงานเพียงครั้งเดียว
    useEffect(() => {
        console.log("🚀 Initial auth check on app load");
        
        const initialAuthCheck = async () => {
            // ป้องกันการทำงานซ้ำซ้อน
            if (authInProgressRef.current) {
                console.log("Auth check already in progress, skipping");
                return;
            }
            
            authInProgressRef.current = true;
            setIsLoading(true);
            
            try {
                const token = getAdminAuthCookie();
                console.log("Token from cookie:", token ? "exists" : "not found");
                
                if (!token) {
                    console.log("No token found, setting unauthenticated");
                    setIsAuthenticated(false);
                    return;
                }
                
                // ตรวจสอบ token หมดอายุหรือไม่
                if (isTokenExpired(token)) {
                    console.log("Token is expired, removing");
                    removeAdminAuthCookie();
                    setIsAuthenticated(false);
                    return;
                }
                
                // ตั้งค่าผู้ใช้จาก token โดยไม่เรียก API
                const success = setUserFromToken(token);
                
                if (success) {
                    console.log("Successfully authenticated from token");
                } else {
                    console.log("Failed to authenticate from token");
                    removeAdminAuthCookie();
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Initial auth check error:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
                authInProgressRef.current = false;
            }
        };
        
        initialAuthCheck();
    }, [setUserFromToken]);
    
    // ฟังก์ชันเข้าสู่ระบบ
    const handleLogin = useCallback(async (username, password) => {
        console.log("Login attempt for:", username);
        setIsLoading(true);
        
        try {
            const response = await adminLogin(username, password);
            console.log("Login response:", response);
            
            if (response.success && response.data && response.data.token) {
                const token = response.data.token;
                
                // ตรวจสอบบทบาทของผู้ใช้
                const decodedToken = jwtDecode(token);
                console.log("Decoded token:", decodedToken);
                
                if (decodedToken.role !== 'admin') {
                    message.error('คุณไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล');
                    setIsLoading(false);
                    return false;
                }
                
                // ตั้งค่า token ใน cookie (เพิ่มเวลาหมดอายุเป็น 7 วัน)
                setAdminAuthCookie(token, 7);
                
                // กำหนดค่า username และ avatar ที่ต้องการใช้
                const userFullName = response.data.user?.fullName || 
                                     response.data.user?.username || 
                                     decodedToken.user?.fullName || 
                                     decodedToken.fullName || 
                                     decodedToken.username || 
                                     decodedToken.name || 
                                     username || '';
                
                const userAvatar = response.data.user?.image || 
                                  response.data.user?.avatar || 
                                  decodedToken.user?.image || 
                                  decodedToken.image || 
                                  decodedToken.avatar || 
                                  null;
                
                // เก็บข้อมูล username และ avatar ไว้ใน userInfoRef
                // เพื่อใช้ในกรณี refresh
                userInfoRef.current = {
                    username: userFullName,
                    avatar: userAvatar
                };
                console.log("Saved user info to ref:", userInfoRef.current);
                
                // ตั้งค่าข้อมูลผู้ดูแล
                setAdmin({
                    id: decodedToken.id || decodedToken.userId || null,
                    username: userFullName,
                    role: decodedToken.role,
                    avatar: userAvatar
                });
                
                setIsAuthenticated(true);
                message.success('เข้าสู่ระบบสำเร็จ');
                
                console.log("User set after login:", {
                    id: decodedToken.id || decodedToken.userId || null,
                    username: userFullName,
                    role: decodedToken.role,
                    avatar: userAvatar
                });
                
                // เพิ่ม: บันทึกข้อมูลผู้ใช้ลงใน localStorage
                try {
                    localStorage.setItem('admin_user_info', JSON.stringify({
                        username: userFullName,
                        avatar: userAvatar
                    }));
                    console.log("User info saved to localStorage");
                } catch (storageError) {
                    console.error("Could not save to localStorage:", storageError);
                }
                
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
    
    // ฟังก์ชันออกจากระบบ
    const handleLogout = useCallback(() => {
        console.log("Logging out");
        
        // ลบ token และรีเซ็ตสถานะ
        removeAdminAuthCookie();
        
        // รีเซ็ต userInfoRef
        userInfoRef.current = {
            username: '',
            avatar: null
        };
        
        // ลบข้อมูลจาก localStorage
        try {
            localStorage.removeItem('admin_user_info');
        } catch (error) {
            console.error("Error removing from localStorage:", error);
        }
        
        setIsAuthenticated(false);
        setAdmin({
            id: null,
            username: '',
            role: '',
            avatar: null
        });
        
        message.success('ออกจากระบบสำเร็จ');
        
        // ทำการ redirect
        setTimeout(() => {
            window.location.href = '/login';
        }, 100);
    }, []);
    
    // ดึงข้อมูลผู้ใช้จาก localStorage เมื่อเริ่มต้น
    useEffect(() => {
        try {
            const savedUserInfo = localStorage.getItem('admin_user_info');
            if (savedUserInfo) {
                const parsedInfo = JSON.parse(savedUserInfo);
                userInfoRef.current = parsedInfo;
                console.log("Loaded saved user info from localStorage:", parsedInfo);
            }
        } catch (error) {
            console.error("Error loading from localStorage:", error);
        }
    }, []);
    
    // ฟังก์ชันรีเฟรชสถานะการยืนยันตัวตน (ใช้เมื่อต้องการตรวจสอบ token ซ้ำ)
    const refreshAuth = useCallback(async () => {
        console.log("Manual refresh auth requested");
        
        if (authInProgressRef.current) {
            console.log("Auth refresh already in progress");
            return isAuthenticated;
        }
        
        authInProgressRef.current = true;
        
        try {
            const token = getAdminAuthCookie();
            
            if (!token) {
                console.log("No token found during refresh");
                setIsAuthenticated(false);
                return false;
            }
            
            if (isTokenExpired(token)) {
                console.log("Token expired during refresh");
                removeAdminAuthCookie();
                setIsAuthenticated(false);
                return false;
            }
            
            // ตรวจสอบกับ backend เฉพาะเมื่อจำเป็น (ไม่ตรวจสอบทุกครั้ง)
            if (!isAuthenticated) {
                return setUserFromToken(token);
            }
            
            return true;
        } catch (error) {
            console.error("Refresh auth error:", error);
            return isAuthenticated; // คงสถานะเดิมในกรณีที่มีข้อผิดพลาด
        } finally {
            authInProgressRef.current = false;
        }
    }, [isAuthenticated, setUserFromToken]);
    
    // สร้าง context value ที่มี performance ดี
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

// Custom hook สำหรับใช้ context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;