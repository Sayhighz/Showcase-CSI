import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Checkbox, Typography, Divider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, SafetyOutlined } from '@ant-design/icons';
import Logo from '../assets/Logo_CSI.png';
import { colors } from '../config/themeConfig';

const { Title, Text } = Typography;

const LoginPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = user.role === 'student' ? '/student/dashboard' : '/dashboard';
      const from = location.state?.from?.pathname || dashboardPath;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await login(values.username, values.password, values.remember);
      
      if (!success) {
        throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-xl">
          กำลังเข้าสู่ระบบ...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          }}
        >
          <img src={Logo} alt="CSI Logo" className="w-10 h-10 object-contain" />
        </div>
        
        <Title level={2} className="mb-2" style={{ color: colors.primary, fontWeight: 600 }}>
          CSI Showcase
        </Title>
        <Text type="secondary" className="text-base">
          ระบบจัดการผลงานักศึกษา
        </Text>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-6"
          style={{
            borderRadius: '8px',
          }}
        />
      )}

      {/* Login Form */}
      <Form
        form={form}
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="username"
          label={<span className="font-medium text-gray-700">ชื่อผู้ใช้</span>}
          rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
          className="mb-6"
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="กรอกชื่อผู้ใช้ของคุณ"
            className="h-12 rounded-lg"
            style={{
              fontSize: '16px',
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="font-medium text-gray-700">รหัสผ่าน</span>}
          rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
          className="mb-6"
        >
          <Input
            prefix={<LockOutlined className="text-gray-400" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            }
            type={showPassword ? 'text' : 'password'}
            placeholder="กรอกรหัสผ่านของคุณ"
            className="h-12 rounded-lg"
            style={{
              fontSize: '16px',
            }}
          />
        </Form.Item>

        <Form.Item name="remember" className="mb-6">
          <div className="flex items-center justify-between">
            <Checkbox>จดจำการเข้าสู่ระบบ</Checkbox>
            <a
              href="#"
              className="text-sm hover:underline"
              style={{ color: colors.primary }}
            >
              ลืมรหัสผ่าน?
            </a>
          </div>
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-12 rounded-lg font-medium text-base shadow-sm hover:shadow-md transition-all duration-200"
            style={{
              background: colors.primaryGradient,
              border: 'none',
            }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </Form.Item>
      </Form>

      <Divider className="my-8" />
    </div>
  );
};

export default LoginPage;