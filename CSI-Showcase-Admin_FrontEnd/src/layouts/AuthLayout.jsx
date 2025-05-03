import React, { useRef, useEffect } from 'react';
import { Layout, theme } from 'antd';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const { Content } = Layout;

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Reference to prevent processing the authentication check multiple times
  const authCheckCompleted = useRef(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Only run this once when loading completes
    if (!isLoading && !authCheckCompleted.current) {
      authCheckCompleted.current = true;
      console.log('Auth check completed. isAuthenticated:', isAuthenticated);
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

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not authenticated, show the login form
  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="flex items-center justify-center min-h-screen" style={{ 
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(144, 39, 142, 0.2) 0%, rgba(5, 1, 20, 0.5) 90.2%),
            url('/images/galaxy-background.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div className="p-8 md:p-12 w-full max-w-md mt-8"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: borderRadiusLG,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="flex justify-center mb-8">
              <img src="/images/csi-logo.png" alt="CSI Showcase Logo" className="h-16" />
            </div>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AuthLayout;