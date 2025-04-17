import React, { useState } from "react";
import { Form, Input, Button, Card, Modal, Spin, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

// นำเข้า hooks จากโปรเจค
import useAuth from "../../hooks/useAuth";
import useNotification from "../../hooks/useNotification";

// นำเข้า constants จากโปรเจค
import { HOME } from "../../constants/routes";

// นำเข้ารูปโลโก้
import Logo from '../../assets/Logo_CSI_Color.png';

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
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Left Section - Logo & Text */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <div className="max-w-lg text-center">
          <img 
            src={Logo} 
            alt="CSI Showcase Logo" 
            className="w-96 mx-auto mb-8 transition-all hover:scale-105 duration-300" 
          />
          <Title level={2} className="text-gray-800 mb-2">CSI Showcase</Title>
          <Paragraph className="text-xl text-gray-700 mb-6">
            คลังเก็บผลงานนักศึกษาคณะเทคโนโลยีสารสนเทศ
          </Paragraph>
          <Paragraph className="text-lg text-gray-600">
            สาขาวิชาการคอมพิวเตอร์และนวัตกรรมพัฒนาซอฟต์แวร์
          </Paragraph>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-1/2 flex justify-center items-center bg-gradient-to-r from-purple-800 to-purple-600">
        <Card 
          className="w-96 p-4 shadow-2xl rounded-lg" 
          bordered={false}
        >
          <div className="text-center mb-6">
            <Title level={2} className="text-gray-800">เข้าสู่ระบบ</Title>
            <Text className="text-gray-600">กรอกข้อมูลเพื่อเข้าใช้งานระบบ</Text>
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
                label="ชื่อผู้ใช้" 
                name="username" 
                rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
              > 
                <Input 
                  prefix={<UserOutlined className="site-form-item-icon" />} 
                  placeholder="ชื่อผู้ใช้" 
                  size="large" 
                  className="rounded-md"
                />
              </Form.Item>

              {/* Password */}
              <Form.Item 
                label="รหัสผ่าน" 
                name="password" 
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
              > 
                <Input.Password 
                  prefix={<LockOutlined className="site-form-item-icon" />} 
                  placeholder="รหัสผ่าน" 
                  size="large" 
                  className="rounded-md"
                />
              </Form.Item>

              {/* Login Button */}
              <Form.Item className="mt-6">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full rounded-md h-12 bg-purple-700 hover:bg-purple-800 flex items-center justify-center"
                  size="large"
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
              className="text-gray-600 hover:text-purple-700"
            >
              ลืมรหัสผ่าน?
            </Button>
            <span className="mx-2 text-gray-400">|</span>
            <Button 
              type="link" 
              onClick={showRegisterModal} 
              className="text-gray-600 hover:text-purple-700"
            >
              ยังไม่มีบัญชี?
            </Button>
          </div>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      <Modal 
        title={<div className="text-center text-lg">ลืมรหัสผ่าน</div>}
        open={isModalVisible} 
        onCancel={handleModalCancel} 
        centered
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleForgotPassword}
        >
          <div className="py-4">
            <Paragraph className="text-base text-center mb-4">
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
                prefix={<MailOutlined />} 
                placeholder="อีเมล" 
                size="large" 
              />
            </Form.Item>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleModalCancel}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit" className="bg-purple-700 hover:bg-purple-800">
                ส่งคำขอ
              </Button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Register Modal */}
      <Modal 
        title={<div className="text-center text-lg">แจ้งเตือน</div>}
        open={isRegisterModalVisible} 
        onCancel={handleRegisterModalCancel} 
        centered
        footer={[ 
          <Button key="ok" type="primary" onClick={handleRegisterModalCancel} className="bg-purple-700 hover:bg-purple-800">
            ตกลง
          </Button>,
        ]}
      >
        <div className="py-4 text-center">
          <Paragraph className="text-base">
            กรุณาติดต่อเจ้าหน้าที่หรือผู้ดูแลระบบเพื่อขอบัญชีผู้ใช้สำหรับเข้าใช้งานระบบ
          </Paragraph>
          <Paragraph className="mt-2 text-gray-500">
            อีเมล: admin@csi-showcase.com
          </Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default Login;