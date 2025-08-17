import React, { useRef, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const { Content } = Layout;

const AuthLayout = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Reference to prevent processing the authentication check multiple times
  const authCheckCompleted = useRef(false);

  useEffect(() => {
    // Only run this once when loading completes
    if (!isLoading && !authCheckCompleted.current) {
      authCheckCompleted.current = true;
    //   console.log('Auth check completed. isAuthenticated:', isAuthenticated);
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
      <Content
        className="flex items-center justify-center min-h-screen relative"
      >
        {/* Simple professional background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(to right, #ffffff, #f9f0fc)',
            borderLeft: '8px solid #90278E',
          }}
        />
        
        {/* Optional subtle header accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-10"
          style={{ backgroundColor: '#90278E' }}
        />
        
        {/* Content Container */}
        <div className="p-6 w-full max-w-lg z-10">
          {children || <Outlet />}
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;