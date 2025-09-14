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


    // Wait for auth check to complete
    if (isLoading) {
      setRedirectState('checking');
      return;
    }

    // Check authentication and user data
    if (!isAuthenticated || !user) {
      setRedirectState('unauthenticated');
    } else {
      setRedirectState('authenticated');
    }
  }, [isLoading, isAuthenticated, user, location.pathname]);

  // Show loading while checking authentication
  if (isLoading || redirectState === 'checking') {
    return <LoadingSpinner fullScreen />;
  }

  // Handle unauthenticated users
  if (redirectState === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle authenticated users on login page or root
  if (redirectState === 'authenticated' && (location.pathname === '/' || location.pathname === '/login')) {
    const dashboardPath = user.role === 'student' ? '/student/dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Render protected content
  if (redirectState === 'authenticated') {
    return <Outlet />;
  }

  // Fallback - show loading
  return <LoadingSpinner fullScreen />;
};

export default ProtectedRoute;