import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Card } from 'antd';
import { LockOutlined, CheckOutlined } from '@ant-design/icons';
import { resetPassword } from '../../services/authService';

const { Title, Text } = Typography;

const ResetPasswordForm = ({ token, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const { password } = values;
      const response = await resetPassword(token, password);
      
      if (response.success) {
        setSuccess(true);
        form.resetFields();
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
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
              <CheckOutlined className="text-2xl text-green-600" />
            </div>
          </div>
          <Title level={4} className="text-green-600">รีเซ็ตรหัสผ่านเรียบร้อย</Title>
          <Text className="text-gray-600">
            รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว
            กำลังนำทางไปยังหน้าเข้าสู่ระบบ...
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-6">
        <Title level={3} style={{ color: '#90278E' }}>รีเซ็ตรหัสผ่าน</Title>
        <Text type="secondary">
          กรอกรหัสผ่านใหม่ของคุณ
        </Text>
      </div>
      
      {error && (
        <Alert
          message="ไม่สามารถรีเซ็ตรหัสผ่านได้"
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
        name="reset-password"
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'กรุณากรอกรหัสผ่านใหม่' },
            { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="รหัสผ่านใหม่"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="ยืนยันรหัสผ่านใหม่"
            autoComplete="new-password"
          />
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
            style={{ 
              height: '48px',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            ยืนยันการรีเซ็ตรหัสผ่าน
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ResetPasswordForm;