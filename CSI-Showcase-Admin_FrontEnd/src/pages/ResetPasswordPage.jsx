import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      setError('ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน กรุณาตรวจสอบลิงก์ที่ได้รับจากอีเมล');
      return;
    }
    
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleSuccess = () => {
    // Navigate back to login after successful reset
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <Alert
            message="เกิดข้อผิดพลาด"
            description={error}
            type="error"
            showIcon
            action={
              <a 
                href="/login" 
                className="text-blue-600 hover:underline"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </a>
            }
          />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="กำลังตรวจสอบ..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f9f0fc 100%)',
        }}
      />
      
      {/* Content Container */}
      <div className="w-full max-w-lg z-10 relative">
        <ResetPasswordForm 
          token={token} 
          onSuccess={handleSuccess}
        />
        
        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>สงวนลิขสิทธิ์ © {new Date().getFullYear()} ภาควิชาวิทยาการคอมพิวเตอร์</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;