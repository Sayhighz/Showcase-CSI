import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import ForgotPasswordForm from './ForgotPasswordForm';
import { colors } from '../../config/themeConfig';

const { Title, Text } = Typography;

const LoginForm = () => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const { username, password, remember } = values;
      
      // เรียกใช้ฟังก์ชัน login จาก AuthContext
      const success = await login(username, password, remember);
      
      if (success) {
        console.log("✅ LoginForm: Login successful, letting LoginPage handle navigation");
        // Don't navigate here - let the LoginPage's useEffect handle navigation based on user role
        // The navigation will be handled by LoginPage after auth state is updated
      } else {
        throw new Error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (err) {
      console.error("❌ LoginForm: Login error:", err);
      setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      form.setFields([
        {
          name: 'password',
          errors: [''],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div>
      {/* Enhanced header with gradient text */}
      <div className="text-center mb-8">
        {/* Logo/Icon with enhanced styling */}
        <div className="flex justify-center mb-6">
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: colors.primaryGradient,
              boxShadow: `0 8px 25px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.3)`
            }}
          >
            <svg viewBox="0 0 24 24" fill="white" width="40" height="40">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
        </div>

        <Title
          level={2}
          className="mb-3 font-sukhumvit"
          style={{
            background: colors.primaryGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 600
          }}
        >
          เข้าสู่ระบบ
        </Title>
        <Text className="text-base text-gray-600 font-sukhumvit">
          ระบบจัดการผลงาน CSI ProjectManage
        </Text>
      </div>
      
      {/* Enhanced error alert */}
      {error && (
        <Alert
          message="ไม่สามารถเข้าสู่ระบบได้"
          description={error}
          type="error"
          showIcon
          closable
          className="mb-6 rounded-xl border-0 shadow-sm"
          style={{
            backgroundColor: '#fff2f0',
            border: `1px solid ${colors.error}30`
          }}
        />
      )}
      
      {/* Enhanced form */}
      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
        className="space-y-6"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
        >
          <Input
            prefix={
              <UserOutlined
                style={{
                  color: colors.primary,
                  fontSize: '16px'
                }}
              />
            }
            placeholder="ชื่อผู้ใช้"
            autoComplete="username"
            className="h-12 rounded-xl border-2 hover:border-primary focus:border-primary transition-all duration-300"
            style={{
              fontSize: '16px',
              borderColor: `${colors.primary}20`
            }}
          />
        </Form.Item>
        
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
        >
          <Input.Password
            prefix={
              <LockOutlined
                style={{
                  color: colors.primary,
                  fontSize: '16px'
                }}
              />
            }
            placeholder="รหัสผ่าน"
            autoComplete="current-password"
            className="h-12 rounded-xl border-2 hover:border-primary focus:border-primary transition-all duration-300"
            style={{
              fontSize: '16px',
              borderColor: `${colors.primary}20`
            }}
          />
        </Form.Item>
        
        <Form.Item className="mb-6">
          <div className="flex justify-between items-center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox
                className="font-sukhumvit text-gray-600"
                style={{
                  color: colors.textDark
                }}
              >
                จดจำฉัน
              </Checkbox>
            </Form.Item>
            <Button
              type="link"
              className="p-0 h-auto font-sukhumvit hover:scale-105 transition-transform duration-200"
              style={{
                color: colors.primary,
                textDecoration: 'none'
              }}
              onClick={() => setShowForgotPassword(true)}
            >
              ลืมรหัสผ่าน?
            </Button>
          </div>
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-14 text-lg font-sukhumvit font-medium hover:scale-105 hover:shadow-lg transition-all duration-300"
            loading={loading}
            icon={<LoginOutlined className="text-lg" />}
            style={{
              background: colors.primaryGradient,
              border: 'none',
              borderRadius: '12px',
              boxShadow: `0 4px 15px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.3)`
            }}
          >
            เข้าสู่ระบบ
          </Button>
        </Form.Item>
      </Form>
      
      {/* Enhanced footer */}
      <div className="mt-8 text-center">
        <Space direction="vertical" size="large" align="center" className="w-full">
          <div className="text-gray-500 font-sukhumvit">
            สำหรับนักศึกษาและผู้ดูแลระบบ
          </div>
          <div
            className="px-6 py-3 rounded-full text-xs font-sukhumvit border"
            style={{
              background: `linear-gradient(45deg, ${colors.primary}10, ${colors.secondary}10)`,
              border: `1px solid ${colors.primary}20`,
              color: colors.textMuted
            }}
          >
            © {new Date().getFullYear()} CSI ProjectManage System
          </div>
        </Space>
      </div>
    </div>
  );
};

export default LoginForm;