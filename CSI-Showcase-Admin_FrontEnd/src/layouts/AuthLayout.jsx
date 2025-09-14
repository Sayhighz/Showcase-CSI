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

  // If authenticated, redirect to role-based dashboard
  if (isAuthenticated) {
    const dashboardPath = user?.role === 'student' ? '/student/dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Not authenticated, show the enhanced login form
  return (
    <Layout className="min-h-screen relative overflow-hidden">
      <Content
        className="flex items-center justify-center min-h-screen relative z-10"
      >
        {/* Enhanced space-themed background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${colors.lightBackground} 0%, #ffffff 50%, #f0e6ff 100%)`,
          }}
        />
        
        {/* Animated background particles */}
        <div
          className="absolute inset-0 opacity-20 z-0"
          style={{
            backgroundImage: `radial-gradient(circle, ${colors.primary} 2px, transparent 2px)`,
            backgroundSize: '50px 50px',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        
        {/* Gradient accent border */}
        <div
          className="absolute top-0 left-0 right-0 h-2 z-20"
          style={{ background: colors.primaryGradient }}
        />
        
        {/* Side accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 z-20"
          style={{ background: colors.primaryGradient }}
        />
        
        {/* Content Container with glass effect */}
        <div className="p-8 w-full max-w-lg z-30 relative">
          {/* Glass card effect */}
          <div
            className="absolute inset-0 rounded-2xl backdrop-blur-sm border shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              border: `1px solid rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.2)`,
              boxShadow: `0 20px 60px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.1)`,
            }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            {children || <Outlet />}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div
          className="absolute bottom-10 right-10 w-20 h-20 rounded-full opacity-10 z-0"
          style={{
            background: colors.primaryGradient,
            filter: 'blur(10px)',
          }}
        />
        <div
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-5 z-0"
          style={{
            background: colors.primaryGradient,
            filter: 'blur(20px)',
          }}
        />
      </Content>
      
      {/* Custom CSS for animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
      `}</style>
    </Layout>
  );
};

export default AuthLayout;