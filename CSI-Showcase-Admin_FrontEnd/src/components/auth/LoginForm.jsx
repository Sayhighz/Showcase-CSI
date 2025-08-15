import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const LoginForm = () => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const { username, password, remember } = values;
      
      // เรียกใช้ฟังก์ชัน login จาก AuthContext
      const success = await login(username, password, remember);
      
      if (success) {
        // นำทางไปยังหน้าแดชบอร์ด
        navigate('/dashboard');
      } else {
        throw new Error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (err) {
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

  return (
    <div>
      <div className="text-center mb-6">
        <Title level={3} style={{ color: '#90278E' }}>เข้าสู่ระบบ</Title>
        <Text type="secondary">
          เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านของคุณ
        </Text>
      </div>
      
      {error && (
        <Alert
          message="ไม่สามารถเข้าสู่ระบบได้"
          description={error}
          type="error"
          showIcon
          closable
          className="mb-4"
        />
      )}
      
      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="ชื่อผู้ใช้"
            autoComplete="username"
          />
        </Form.Item>
        
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="รหัสผ่าน"
            autoComplete="current-password"
          />
        </Form.Item>
        
        <Form.Item>
          <div className="flex justify-between items-center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>จดจำฉัน</Checkbox>
            </Form.Item>
            <a 
              href="#"
              style={{ color: '#90278E' }}
              onClick={(e) => {
                e.preventDefault();
                // TODO: แสดงฟอร์มลืมรหัสผ่าน หรือนำทางไปยังหน้าลืมรหัสผ่าน
                console.log('Forgot password clicked');
              }}
            >
              ลืมรหัสผ่าน?
            </a>
          </div>
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
            icon={<LoginOutlined />}
            style={{ 
              height: '48px',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            เข้าสู่ระบบ
          </Button>
        </Form.Item>
      </Form>
      
      <div className="mt-8 text-center">
        <Space direction="vertical" size="middle" align="center">
          <div className="text-gray-500">
            สำหรับผู้ดูแลระบบเท่านั้น
          </div>
          <div className="text-gray-400 text-xs">
            © {new Date().getFullYear()} CSI Showcase Admininistration
          </div>
        </Space>
      </div>
    </div>
  );
};

export default LoginForm;