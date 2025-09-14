import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Card } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { forgotPassword } from '../../services/authService';

const { Title, Text } = Typography;

const ForgotPasswordForm = ({ onBack }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const { email } = values;
      const response = await forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        form.resetFields();
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('เกิดข้อผิดพลาดในการส่งคำขอรีเซ็ตรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <div className="text-center">
          <div className="mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <MailOutlined className="text-2xl text-green-600" />
            </div>
          </div>
          <Title level={4} className="text-green-600">ส่งคำขอเรียบร้อยแล้ว</Title>
          <Text className="text-gray-600">
            เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว
            กรุณาตรวจสอบอีเมลของคุณและทำตามคำแนะนำ
          </Text>
          <div className="mt-6">
            <Button 
              type="default" 
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="w-full"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-6">
        <Title level={3} style={{ color: '#90278E' }}>ลืมรหัสผ่าน?</Title>
        <Text type="secondary">
          กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน
        </Text>
      </div>
      
      {error && (
        <Alert
          message="ไม่สามารถส่งคำขอได้"
          description={error}
          type="error"
          showIcon
          closable
          className="mb-4"
          onClose={() => setError(null)}
        />
      )}
      
      <Form
        form={form}
        name="forgot-password"
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'กรุณากรอกอีเมล' },
            { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="อีเมลของคุณ"
            autoComplete="email"
          />
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full mb-4"
            loading={loading}
            style={{ 
              height: '48px',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            ส่งลิงก์รีเซ็ตรหัสผ่าน
          </Button>
          
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="w-full"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ForgotPasswordForm;