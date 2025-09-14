import React, { useRef, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { colors } from '../config/themeConfig';

const { Content } = Layout;

const AuthLayout = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Reference to prevent processing the authentication check multiple times
  const authCheckCompleted = useRef(false);

  useEffect(() => {
    // Only run this once when loading completes
    if (!isLoading && !authCheckCompleted.current) {
      authCheckCompleted.current = true;
    }
    
    // Reset the flag when component unmounts
    return () => {
      authCheckCompleted.current = false;
    };
  }, [isLoading, isAuthenticated]);

  // While loading, show spinner
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // If authenticated, redirect to role-based dashboard
  if (isAuthenticated) {
    const dashboardPath = user?.role === 'student' ? '/student/dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Clean, professional admin layout
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="flex items-center justify-center min-h-screen p-4">
        {/* Clean background with subtle gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          }}
        />
        
        {/* Subtle brand accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: colors.primaryGradient }}
        />
        
        {/* Main content container */}
        <div className="relative z-10 w-full max-w-md">
          <div
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
            style={{
              boxShadow: '0 4px 25px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(144, 39, 142, 0.05)',
            }}
          >
            {children || <Outlet />}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;