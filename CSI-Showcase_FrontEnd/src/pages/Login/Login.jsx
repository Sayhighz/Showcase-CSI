import React, { useState } from "react";
import { Form, Input, Button, Card, Modal, Spin, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

// นำเข้า hooks จากโปรเจค
import useAuth from "../../hooks/useAuth";
import useNotification from "../../hooks/useNotification";

// นำเข้า constants จากโปรเจค
import { HOME } from "../../constants/routes";

const { Title, Paragraph, Text } = Typography;

const Login = () => {
  // ใช้ hooks จากโปรเจค
  const { login, isAuthLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  // state สำหรับ Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();

  // Modal handlers
  const showForgotPasswordModal = () => setIsModalVisible(true);
  const showRegisterModal = () => setIsRegisterModalVisible(true);
  
  const handleModalCancel = () => setIsModalVisible(false);
  const handleRegisterModalCancel = () => setIsRegisterModalVisible(false);

  // ฟังก์ชันสำหรับการเข้าสู่ระบบ
  const onFinish = async (values) => {
    try {
      const { username, password } = values;
      
      // เรียกใช้ฟังก์ชัน login จาก useAuth hook
      await login(username, password);
      
      // แสดงข้อความเมื่อเข้าสู่ระบบสำเร็จ
      showSuccess('เข้าสู่ระบบสำเร็จ กำลังนำทางไปยังหน้าหลัก...');
      
      // นำทางไปยังหน้าหลัก
      setTimeout(() => {
        navigate(HOME);
      }, 1000);
      
    } catch (error) {
      // จัดการข้อผิดพลาด
      if (error.status === 401) {
        showError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else if (error.message) {
        showError(`ข้อผิดพลาด: ${error.message}`);
      } else {
        showError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    }
  };

  // ฟังก์ชันสำหรับการขอรีเซ็ตรหัสผ่าน
  const handleForgotPassword = async (values) => {
    try {
      // ปิด Modal
      setIsModalVisible(false);
      
      // แสดงข้อความสำเร็จ
      showSuccess('ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
    } catch (error) {
      showError('เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Background with professional purple accent */}
      <div className="absolute inset-0">
        <div className="h-2/5 bg-gradient-to-r from-[#90278E] to-[#7A1C7A]"></div>
        <div className="h-3/5 bg-white"></div>
      </div>
      
      {/* Center Container */}
      <div className="relative z-10 w-full max-w-md px-4 py-6 sm:px-0">
        <Card 
          className="w-full shadow-lg rounded-lg border border-gray-100"
          bordered={false}
          style={{ 
            background: 'white',
          }}
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#90278E] flex items-center justify-center shadow-md">
                <LoginOutlined style={{ fontSize: '28px', color: 'white' }} />
              </div>
            </div>
            <Title level={2} style={{ color: '#333', marginBottom: '4px', fontWeight: '600' }}>เข้าสู่ระบบ</Title>
            <Text style={{ color: '#666' }}>กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ</Text>
          </div>
          
          <Spin spinning={isAuthLoading} tip="กำลังเข้าสู่ระบบ...">
            <Form 
              form={form}
              layout="vertical" 
              onFinish={onFinish}
              initialValues={{ remember: true }}
              className="pb-4"
            >
              {/* Username */}
              <Form.Item 
                label={<span style={{ color: '#333', fontWeight: '500' }}>ชื่อผู้ใช้</span>} 
                name="username" 
                rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
              > 
                <Input 
                  prefix={<UserOutlined style={{ color: '#90278E' }} />} 
                  placeholder="ชื่อผู้ใช้" 
                  size="large" 
                  className="rounded-lg"
                  style={{ 
                    borderColor: '#d9d9d9',
                    boxShadow: 'none'
                  }}
                />
              </Form.Item>

              {/* Password */}
              <Form.Item 
                label={<span style={{ color: '#333', fontWeight: '500' }}>รหัสผ่าน</span>} 
                name="password" 
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
              > 
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#90278E' }} />} 
                  placeholder="รหัสผ่าน" 
                  size="large" 
                  className="rounded-lg"
                  style={{ 
                    borderColor: '#d9d9d9',
                    boxShadow: 'none'
                  }}
                />
              </Form.Item>

              {/* Login Button */}
              <Form.Item className="mt-8">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full rounded-lg h-12 flex items-center justify-center"
                  size="large"
                  style={{ 
                    background: '#90278E',
                    boxShadow: '0 2px 0 rgba(144, 39, 142, 0.1)'
                  }}
                  icon={<LoginOutlined />}
                >
                  <span className="ml-1 text-base">เข้าสู่ระบบ</span>
                </Button>
              </Form.Item>
            </Form>
          </Spin>
          
          {/* Additional Buttons */}
          <Divider className="my-2" />
          <div className="text-center mt-4">
            <Button 
              type="link" 
              onClick={showForgotPasswordModal} 
              className="text-gray-600 hover:text-[#90278E]"
            >
              ลืมรหัสผ่าน?
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <Button 
              type="link" 
              onClick={showRegisterModal} 
              className="text-gray-600 hover:text-[#90278E]"
            >
              ยังไม่มีบัญชี?
            </Button>
          </div>
        </Card>

        <div className="text-center mt-4">
          <Text style={{ color: '#666', fontSize: '12px' }}>
            © 2025 ระบบจัดการข้อมูล. สงวนลิขสิทธิ์.
          </Text>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal 
        title={<div className="text-center text-lg font-medium">ลืมรหัสผ่าน</div>}
        open={isModalVisible} 
        onCancel={handleModalCancel} 
        centered
        footer={null}
        style={{ 
          top: 20 
        }}
      >
        <Form
          layout="vertical"
          onFinish={handleForgotPassword}
        >
          <div className="py-4">
            <Paragraph className="text-base text-center mb-4 text-gray-600">
              กรุณากรอกอีเมลของคุณเพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน
            </Paragraph>
            
            <Form.Item 
              name="email" 
              rules={[
                { required: true, message: 'กรุณากรอกอีเมล' },
                { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#90278E' }} />} 
                placeholder="อีเมล" 
                size="large" 
                className="rounded-lg"
              />
            </Form.Item>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                onClick={handleModalCancel}
                className="rounded-lg"
              >
                ยกเลิก
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                style={{ background: '#90278E' }}
                className="rounded-lg"
              >
                ส่งคำขอ
              </Button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Register Modal */}
      <Modal 
        title={<div className="text-center text-lg font-medium">แจ้งเตือน</div>}
        open={isRegisterModalVisible} 
        onCancel={handleRegisterModalCancel} 
        centered
        footer={[ 
          <Button 
            key="ok" 
            type="primary" 
            onClick={handleRegisterModalCancel} 
            style={{ background: '#90278E' }}
            className="rounded-lg"
          >
            ตกลง
          </Button>,
        ]}
      >
        <div className="py-4 text-center">
          <Paragraph className="text-base text-gray-600">
            กรุณาติดต่อเจ้าหน้าที่หรือผู้ดูแลระบบเพื่อขอบัญชีผู้ใช้สำหรับเข้าใช้งานระบบ
          </Paragraph>
          <Paragraph className="mt-2 text-[#90278E] font-medium">
            อีเมล: admin@example.com
          </Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default Login;