// src/components/auth/RoleBasedRoute.jsx
import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Memoize role check to prevent unnecessary re-renders
  const roleCheck = useMemo(() => {
    if (isLoading) {
      return { status: 'loading' };
    }

    if (!isAuthenticated || !user) {
      return { status: 'unauthenticated' };
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return { 
        status: 'unauthorized', 
        redirectPath: user.role === 'student' ? '/student/dashboard' : '/dashboard'
      };
    }

    return { status: 'authorized' };
  }, [isAuthenticated, user, isLoading, allowedRoles]);

  // Handle different status cases
  switch (roleCheck.status) {
    case 'loading':
      return <LoadingSpinner />;

    case 'unauthenticated':
      console.log('🔄 RoleBasedRoute: Redirecting unauthenticated user to login');
      return <Navigate to="/login" state={{ from: location }} replace />;

    case 'unauthorized':
      console.log(`⛔ RoleBasedRoute: User role "${user?.role}" not authorized for roles:`, allowedRoles);
      return (
        <Result
          status="403"
          title="403 - ไม่มีสิทธิ์เข้าถึง"
          subTitle={`คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบด้วยบัญชีที่เหมาะสม`}
          extra={[
            <Button 
              key="home" 
              type="primary" 
              onClick={() => window.location.href = roleCheck.redirectPath}
            >
              กลับสู่หน้าหลัก
            </Button>,
            <Button 
              key="logout" 
              onClick={() => {
                // Force logout and redirect to login
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              }}
            >
              ออกจากระบบ
            </Button>
          ]}
        />
      );

    case 'authorized':
    default:
      return children;
  }
};

export default RoleBasedRoute;