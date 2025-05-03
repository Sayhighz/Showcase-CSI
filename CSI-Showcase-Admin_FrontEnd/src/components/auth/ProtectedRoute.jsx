import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * คอมโพเนนต์สำหรับป้องกันเส้นทางที่ต้องเข้าสู่ระบบก่อน
 * ถ้าผู้ใช้ยังไม่ได้เข้าสู่ระบบ จะถูกนำทางไปยังหน้าเข้าสู่ระบบ
 * และเก็บเส้นทางที่ต้องการเข้าถึงไว้ใน location state
 */
const ProtectedRoute = ({ redirectPath = '/login', requiredRoles = ['admin'] }) => {
  const { admin, loading, checkAuth } = useAuth();
  const location = useLocation();

  // ตรวจสอบการยืนยันตัวตน (หากยังไม่ได้ตรวจสอบ)
  useEffect(() => {
    if (!admin && !loading) {
      checkAuth();
    }
  }, [admin, loading, checkAuth]);

  // แสดง loading ในระหว่างตรวจสอบการยืนยันตัวตน
  if (loading) {
    return <LoadingSpinner fullScreen tip="กำลังตรวจสอบการเข้าสู่ระบบ..." />;
  }

  // ถ้ายังไม่ได้เข้าสู่ระบบ ให้นำทางไปยังหน้าเข้าสู่ระบบ
  if (!admin) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // ตรวจสอบบทบาท (ถ้ามีการระบุ)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(admin.role);
    
    if (!hasRequiredRole) {
      // ถ้าไม่มีบทบาทที่ต้องการ ให้นำทางไปยังหน้าที่ไม่มีสิทธิ์เข้าถึง
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ถ้าเข้าสู่ระบบแล้วและมีบทบาทที่ถูกต้อง ให้แสดงเนื้อหา
  return <Outlet />;
};

export default ProtectedRoute;