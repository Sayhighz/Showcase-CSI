import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import ForgotPasswordForm from './ForgotPasswordForm';
import { colors } from '../../config/themeConfig';

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
      {/* Simplified error alert */}
      {error && (
        <Alert
          message="ไม่สามารถเข้าสู่ระบบได้"
          description={error}
          type="error"
          showIcon
          closable
          className="mb-6 rounded-lg"
          onClose={() => setError(null)}
        />
      )}
      
      {/* Simplified form */}
      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
        className="space-y-4"
      >
        <Form.Item
          label="อีเมล"
          name="username"
          rules={[{ required: true, message: 'กรุณากรอกอีเมล' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: colors.primary }} />}
            placeholder="hi@silm.vu@gmail.com"
            autoComplete="username"
            className="h-12 rounded-lg transition-all duration-300"
            style={{
              fontSize: '16px',
              borderColor: `${colors.primary}40`
            }}
          />
        </Form.Item>
        
        <Form.Item
          label="รหัสผ่าน"
          name="password"
          rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: colors.primary }} />}
            placeholder="รหัสผ่าน"
            autoComplete="current-password"
            className="h-12 rounded-lg transition-all duration-300"
            style={{
              fontSize: '16px',
              borderColor: `${colors.primary}40`
            }}
          />
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 text-base font-medium rounded-lg hover:scale-105 transition-all duration-300"
            loading={loading}
            style={{
              background: colors.primaryGradient,
              border: 'none',
              color: 'white',
              boxShadow: `0 4px 15px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.3)`
            }}
          >
            เข้าสู่ระบบเดี๋ยวนี้
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            type="default"
            className="w-full h-12 text-base font-medium rounded-lg border-2 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
            style={{
              backgroundColor: 'white',
              color: colors.textDark,
              borderColor: `${colors.primary}30`
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </Button>
        </Form.Item>
      </Form>

      {/* Simplified footer */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <span style={{ color: colors.textMuted }}>ลืมรหัสผ่าน</span>
        <button
          className="font-medium hover:scale-105 transition-transform duration-200"
          style={{ color: colors.primary }}
          onClick={() => setShowForgotPassword(true)}
        >
          คลิกที่นี่
        </button>
      </div>
    </div>
  );
};

export default LoginForm;