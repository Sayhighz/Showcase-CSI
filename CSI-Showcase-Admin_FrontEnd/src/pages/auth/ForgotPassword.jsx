import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Typography, Alert, message
} from 'antd';
import { 
  MailOutlined, KeyOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import Logo from '../../assets/Logo_CSI.png';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await forgotPassword(values.email);
      
      if (response && response.message) {
        setSuccess(true);
        message.success('ระบบได้ส่งคำแนะนำในการรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
        form.resetFields();
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการดำเนินการ โปรดลองอีกครั้งในภายหลัง');
    } finally {
      setLoading(false);
    }
  };

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
          <Title level={3} className="text-[#90278E]">ลืมรหัสผ่าน</Title>
          <Text type="secondary">
            กรอกอีเมลที่คุณใช้ลงทะเบียนเพื่อรีเซ็ตรหัสผ่าน
          </Text>
        </div>
        
        {/* Error message */}
        {error && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={error}
            type="error"
            showIcon
            closable
            className="mb-4"
          />
        )}
        
        {/* Success message */}
        {success && (
          <Alert
            message="สำเร็จ"
            description="เราได้ส่งอีเมลพร้อมคำแนะนำในการรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว โปรดตรวจสอบกล่องจดหมายของคุณ"
            type="success"
            showIcon
            className="mb-4"
          />
        )}
        
        <Form
          form={form}
          name="forgot_password_form"
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { 
                required: true, 
                message: 'กรุณากรอกอีเมล' 
              },
              {
                type: 'email',
                message: 'กรุณากรอกอีเมลที่ถูกต้อง'
              }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              size="large" 
              placeholder="กรอกอีเมลของคุณ"
              className="rounded-lg" 
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
              className="h-12 rounded-lg bg-gradient-to-r from-[#90278E] to-[#FF5E8C] border-0 hover:opacity-90"
              icon={<KeyOutlined />}
            >
              รีเซ็ตรหัสผ่าน
            </Button>
          </Form.Item>
          
          <div className="text-center mt-4">
            <Link 
              to="/login" 
              className="text-[#90278E] hover:text-[#FF5E8C] transition-colors flex items-center justify-center"
            >
              <ArrowLeftOutlined className="mr-1" /> กลับไปยังหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </Form>
        
        <div className="mt-8 text-xs text-center text-gray-500">
          <p>© 2025 CSI Showcase Admin. ระบบจัดการผลงานนักศึกษา</p>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;