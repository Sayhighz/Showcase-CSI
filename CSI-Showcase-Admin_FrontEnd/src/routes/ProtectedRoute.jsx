import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../context/AuthContext';

/**
 * Component สำหรับป้องกันการเข้าถึงหน้าที่ต้องมีการยืนยันตัวตน
 * รองรับ:
 * - ตรวจสอบการเข้าสู่ระบบ
 * - แสดง loading ขณะตรวจสอบ
 * - บันทึกหน้าที่พยายามเข้าถึงเพื่อ redirect กลับหลังเข้าสู่ระบบ
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - เนื้อหาของหน้าที่ต้องการแสดง
 * @param {string[]} [props.allowedRoles] - บทบาทที่อนุญาตให้เข้าถึงหน้านี้
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({ children, allowedRoles = ['admin'] }) => {
  const { isAuthenticated, isLoading, admin, refreshAuth } = useAuth();
  const location = useLocation();

  // Refresh auth state when component mounts
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Check authentication state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated but not authorized for this role
  if (allowedRoles.length > 0 && !allowedRoles.includes(admin.role)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-red-500 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="text-gray-600 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-[#90278E] text-white rounded-md hover:bg-[#7B1A73] transition-colors"
        >
          กลับไปหน้าก่อนหน้า
        </button>
      </div>
    );
  }

  // If authenticated and authorized, render children
  return children;
};

export default ProtectedRoute;