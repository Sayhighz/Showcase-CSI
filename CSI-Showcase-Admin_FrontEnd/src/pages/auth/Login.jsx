import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Typography, Spin, Alert, message,
  Divider, Space
} from 'antd';
import { 
  UserOutlined, LockOutlined, LoginOutlined, SafetyOutlined,
  EyeInvisibleOutlined, EyeTwoTone
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../assets/Logo_CSI.png';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [secureLogin, setSecureLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // ดึง path ที่ต้องการ redirect หลังจากเข้าสู่ระบบสำเร็จ
  const from = location.state?.from || '/dashboard';

  // ตรวจสอบว่าเข้าสู่ระบบแล้วหรือไม่ ถ้าเข้าสู่ระบบแล้วให้ redirect ไปยังหน้า dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // จัดการ form submit
  const handleSubmit = async (values) => {
    const { username, password } = values;
    setLoginLoading(true);
    setLoginError(null);
    
    try {
      const success = await login(username, password);
      if (success) {
        // เข้าสู่ระบบสำเร็จ
        message.success('เข้าสู่ระบบสำเร็จ กำลังนำท่านไปยังหน้าแดชบอร์ด...');
        
        // นำทางไปยังหน้าที่ต้องการ (เช่น dashboard หรือหน้าที่พยายามเข้าถึงก่อนหน้า)
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        // เข้าสู่ระบบไม่สำเร็จ (ผลการ login เป็น false)
        setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง');
    } finally {
      setLoginLoading(false);
    }
  };

  // แสดง loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Spin size="large" tip="กำลังตรวจสอบการเข้าสู่ระบบ..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0D0221] via-[#90278E] to-[#FF5E8C] py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated stars in background */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {Array.from({ length: 50 }).map((_, index) => (
          <div 
            key={index}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.8,
              animationDuration: Math.random() * 4 + 1 + 's',
            }}
          />
        ))}
      </div>
      
      <Card 
        className="w-full max-w-md shadow-2xl border-0"
        style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="text-center mb-6">
          <img src={Logo} alt="CSI Logo" className="h-20 mx-auto mb-4" />
          <Title level={2} className="text-[#90278E]">CSI Showcase</Title>
          <Title level={4} className="m-0">ระบบผู้ดูแล</Title>
          <Text type="secondary">
            กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ
          </Text>
        </div>
        
        {/* Display login error alert if there is an error */}
        {loginError && (
          <Alert
            message="เข้าสู่ระบบไม่สำเร็จ"
            description={loginError}
            type="error"
            showIcon
            closable
            className="mb-4"
          />
        )}
        
        <Form
          form={form}
          name="login_form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="username"
            label="ชื่อผู้ใช้"
            rules={[
              { 
                required: true, 
                message: 'กรุณากรอกชื่อผู้ใช้' 
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              size="large" 
              placeholder="กรอกชื่อผู้ใช้"
              className="rounded-lg" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[
              { 
                required: true, 
                message: 'กรุณากรอกรหัสผ่าน' 
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              size="large" 
              placeholder="กรอกรหัสผ่าน"
              className="rounded-lg"
              iconRender={visible => (
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              )}
            />
          </Form.Item>
          
          <Form.Item>
            <div className="flex justify-between items-center">
              <Button
                type="link"
                onClick={() => message.info('กรุณาติดต่อผู้ดูแลระบบหลักเพื่อรีเซ็ตรหัสผ่าน')}
                className="p-0 text-[#90278E]"
              >
                ลืมรหัสผ่าน?
              </Button>
              
              <span 
                onClick={() => setSecureLogin(!secureLogin)}
                className="flex items-center text-xs cursor-pointer text-[#90278E] hover:text-[#FF5E8C] transition-colors"
              >
                <SafetyOutlined className="mr-1" /> 
                การเข้าสู่ระบบแบบปลอดภัย
              </span>
            </div>
          </Form.Item>
          
          {secureLogin && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <Text type="secondary" className="text-xs">
                การเข้าสู่ระบบแบบปลอดภัยจะมีการเข้ารหัสข้อมูลเพิ่มเติมเพื่อปกป้องรหัสผ่านของคุณ
                และป้องกันการโจมตีแบบ man-in-the-middle
              </Text>
            </div>
          )}
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loginLoading}
              className="h-12 rounded-lg bg-gradient-to-r from-[#90278E] to-[#FF5E8C] border-0 hover:opacity-90"
            >
              <div className="flex items-center justify-center">
                <LoginOutlined className="mr-2" />
                <span>เข้าสู่ระบบผู้ดูแล</span>
              </div>
            </Button>
          </Form.Item>
        </Form>
        
        <Divider>หรือ</Divider>
        
        <div className="text-center">
          <Button 
            type="default" 
            onClick={() => window.location.href = '/'}
            className="rounded-lg border-[#90278E] text-[#90278E] hover:bg-[#90278E] hover:text-white transition-all"
          >
            กลับไปยังหน้าแรก
          </Button>
        </div>
        
        <div className="mt-6 text-xs text-center text-gray-500">
          <p>© 2025 CSI Showcase Admin. ระบบจัดการผลงานนักศึกษา</p>
          <p>สงวนลิขสิทธิ์โดย คณะเทคโนโลยีสารสนเทศ</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;