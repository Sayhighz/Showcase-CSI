// src/components/auth/ProtectedRoute.jsx
import React, { useRef, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, admin } = useAuth();
  const location = useLocation();
  const hasRedirected = useRef(false);

  // รีเซ็ต hasRedirected เมื่อมีการเข้าสู่ระบบสำเร็จ
  useEffect(() => {
    if (isAuthenticated && admin) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, admin]);

  // กรณีกำลังโหลด
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // กรณียังไม่ได้เข้าสู่ระบบ และยังไม่ได้ redirect
  if (!isAuthenticated && !admin && !hasRedirected.current) {
    hasRedirected.current = true;
    // ส่งข้อมูลเส้นทางปัจจุบันไปด้วยเพื่อกลับมายังหน้านี้หลังจากเข้าสู่ระบบ
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // กรณีเข้าสู่ระบบแล้ว
  return <Outlet />;
};

export default ProtectedRoute;