import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Alert, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const { Title, Text } = Typography;

const LoginPage = () => {
  const { admin, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [localError, setLocalError] = useState(null);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (admin && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [admin, navigate, location]);

  // Display error from context or local
  const error = authError || localError;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="กำลังตรวจสอบการเข้าสู่ระบบ..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Simplified background */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f9f0fc 100%)',
        }}
      />
      
      {/* Content Container */}
      <div className="w-full max-w-lg z-10 relative">
        
        {/* Error Alert */}
        {error && (
          <Alert
            message="เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
            description={error}
            type="error"
            showIcon
            className="mb-6"
            closable
            onClose={() => setLocalError(null)}
          />
        )}
        
        {/* Login Card */}
        <Card 
          className="shadow-md rounded-md overflow-hidden"
          style={{
            border: '1px solid rgba(144, 39, 142, 0.2)',
          }}
        >
          <div className="pt-6 pb-8 px-8">
            {/* Logo or Brand Element */}
            <div className="flex justify-center mb-6">
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#90278E' }}
              >
                <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
            </div>
            
            <Title 
              level={2} 
              className="text-center mb-6"
              style={{ color: '#90278E' }}
            >
              เข้าสู่ระบบ
            </Title>
            <LoginForm />
          </div>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>สงวนลิขสิทธิ์ © {new Date().getFullYear()} ภาควิชาวิทยาการคอมพิวเตอร์</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;