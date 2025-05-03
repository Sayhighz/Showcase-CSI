import React, { useState, useEffect } from 'react';
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

  // เมื่อเข้าสู่ระบบแล้ว นำทางไปยังหน้าก่อนหน้าหรือแดชบอร์ด
  useEffect(() => {
    if (admin) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [admin, navigate, location]);

  // แสดงข้อความผิดพลาดจาก context หรือ local
  const error = authError || localError;

  // กรณีกำลังโหลด
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="กำลังตรวจสอบการเข้าสู่ระบบ..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div 
        className="absolute inset-0 overflow-hidden z-0"
        style={{ 
          background: 'linear-gradient(135deg, #090116 0%, #10033A 100%)',
        }}
      >
        {/* พื้นหลังกาแล็กซี่แบบแอนิเมชัน */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/stars-bg.png)',
            backgroundRepeat: 'repeat',
            opacity: 0.3,
          }}
        ></div>
        
        {/* จุดเรืองแสงกระจายบนพื้นหลัง */}
        <div className="stars">
          {Array.from({ length: 20 }).map((_, index) => (
            <div 
              key={index}
              className="star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <img src="/images/csi-logo-white.png" alt="CSI Logo" className="h-16 mx-auto" />
          <Title level={2} className="mt-4 text-white">CSI Showcase Admin</Title>
          <Text className="text-gray-300">ระบบจัดการผลงานนักศึกษา</Text>
        </div>
        
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
        
        <Card 
          className="shadow-xl"
          style={{
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <LoginForm />
        </Card>
        
        <div className="text-center mt-6 text-white text-sm opacity-70">
          <p>สงวนลิขสิทธิ์ © {new Date().getFullYear()} ภาควิชาวิทยาการคอมพิวเตอร์</p>
        </div>
      </div>
      
      <style jsx>{`
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .star {
          position: absolute;
          background-color: #fff;
          border-radius: 50%;
          animation: pulse 3s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;