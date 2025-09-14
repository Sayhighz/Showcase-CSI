// src/components/auth/RoleBasedRoute.jsx
import React, { useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
      return <Navigate to="/login" state={{ from: location }} replace />;

    case 'unauthorized':
      return (
        <Result
          status="403"
          title="403 - ไม่มีสิทธิ์เข้าถึง"
          subTitle={`คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบด้วยบัญชีที่เหมาะสม`}
          extra={[
            <Button 
              key="home" 
              type="primary" 
              onClick={() => navigate(roleCheck.redirectPath, { replace: true })}
            >
              กลับสู่หน้าหลัก
            </Button>,
            <Button 
              key="logout" 
              onClick={() => {
                logout();
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