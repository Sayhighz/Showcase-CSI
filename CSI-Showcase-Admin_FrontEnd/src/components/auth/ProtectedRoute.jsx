// src/components/auth/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [redirectState, setRedirectState] = useState('checking'); // checking, authenticated, unauthenticated, redirecting

  useEffect(() => {
    console.log('🔍 ProtectedRoute state check:', {
      path: location.pathname,
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role
    });

    // Wait for auth check to complete
    if (isLoading) {
      setRedirectState('checking');
      return;
    }

    // Check authentication and user data
    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated, will redirect to login');
      setRedirectState('unauthenticated');
    } else {
      console.log('✅ User authenticated:', user.role);
      setRedirectState('authenticated');
    }
  }, [isLoading, isAuthenticated, user, location.pathname]);

  // Show loading while checking authentication
  if (isLoading || redirectState === 'checking') {
    console.log('⏳ Still checking authentication...');
    return <LoadingSpinner fullScreen />;
  }

  // Handle unauthenticated users
  if (redirectState === 'unauthenticated') {
    console.log('🔄 Redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle authenticated users on login page or root
  if (redirectState === 'authenticated' && (location.pathname === '/' || location.pathname === '/login')) {
    const dashboardPath = user.role === 'student' ? '/student/dashboard' : '/dashboard';
    console.log('🔄 Redirecting authenticated user to:', dashboardPath);
    return <Navigate to={dashboardPath} replace />;
  }

  // Render protected content
  if (redirectState === 'authenticated') {
    console.log('✅ Rendering protected content for:', location.pathname);
    return <Outlet />;
  }

  // Fallback - show loading
  return <LoadingSpinner fullScreen />;
};

export default ProtectedRoute;