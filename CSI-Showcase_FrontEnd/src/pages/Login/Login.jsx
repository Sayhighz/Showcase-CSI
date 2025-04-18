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
    <div className="min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-900 via-indigo-900 to-black">
      {/* Space theme animation overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      
      {/* Center Container */}
      <div className="relative z-10 w-full max-w-md px-4 py-6 sm:px-0">
        <Card 
          className="w-full shadow-2xl rounded-lg border-0 overflow-hidden backdrop-blur-sm"
          style={{ 
            background: 'rgba(16, 16, 35, 0.85)',
            boxShadow: '0 8px 32px 0 rgba(144, 39, 142, 0.5)'
          }}
          bordered={false}
        >
          {/* Card Header with planet effect */}
          <div className="absolute top-0 left-0 w-full h-2" style={{ background: '#90278E' }}></div>
          
          <div className="text-center mb-8 pt-2">
            <div className="flex justify-center mb-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-800 to-purple-500 flex items-center justify-center shadow-lg">
                  <LoginOutlined style={{ fontSize: '28px', color: 'white' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-400 opacity-75 animate-pulse"></div>
              </div>
            </div>
            <Title level={2} style={{ color: 'white', marginBottom: '4px' }}>เข้าสู่ระบบ</Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>กรอกข้อมูลเพื่อเข้าใช้งานระบบ</Text>
          </div>
          
          <Spin spinning={isAuthLoading} tip="กำลังเข้าสู่ระบบ..." style={{ color: 'white' }}>
            <Form 
              form={form}
              layout="vertical" 
              onFinish={onFinish}
              initialValues={{ remember: true }}
              className="pb-4"
            >
              {/* Username */}
              <Form.Item 
                label={<span style={{ color: 'white' }}>ชื่อผู้ใช้</span>} 
                name="username" 
                rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
              > 
                <Input 
                  prefix={<UserOutlined style={{ color: '#90278E' }} />} 
                  placeholder="ชื่อผู้ใช้" 
                  size="large" 
                  className="rounded-md text-white"
                  style={{ 
                    backgroundColor: '#1e1e3a', 
                    borderColor: '#90278E',
                    caretColor: '#fff'
                  }}
                />
              </Form.Item>

              {/* Password */}
              <Form.Item 
                label={<span style={{ color: 'white' }}>รหัสผ่าน</span>} 
                name="password" 
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
              > 
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#90278E' }} />} 
                  placeholder="รหัสผ่าน" 
                  size="large" 
                  className="rounded-md text-white"
                  style={{ 
                    backgroundColor: '#1e1e3a', 
                    borderColor: '#90278E',
                    caretColor: '#fff'
                  }}/>
              </Form.Item>

              {/* Login Button */}
              <Form.Item className="mt-8">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full rounded-md h-12 flex items-center justify-center"
                  size="large"
                  style={{ 
                    background: '#90278E',
                    boxShadow: '0 4px 10px rgba(144, 39, 142, 0.3)'
                  }}
                  icon={<LoginOutlined />}
                >
                  <span className="ml-1 text-base">เข้าสู่ระบบ</span>
                </Button>
              </Form.Item>
            </Form>
          </Spin>
          
          {/* Additional Buttons */}
          <Divider className="my-2 border-gray-700" />
          <div className="text-center mt-4">
            <Button 
              type="link" 
              onClick={showForgotPasswordModal} 
              className="text-gray-300 hover:text-purple-400"
            >
              ลืมรหัสผ่าน?
            </Button>
            <span className="mx-2 text-gray-600">|</span>
            <Button 
              type="link" 
              onClick={showRegisterModal} 
              className="text-gray-300 hover:text-purple-400"
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
        style={{ 
          top: 20 
        }}
        bodyStyle={{ 
          background: '#1a1a2e',
          color: 'white'
        }}
        headerStyle={{ 
          background: '#1a1a2e',
          color: 'white',
          borderBottom: '1px solid rgba(144, 39, 142, 0.3)'
        }}
      >
        <Form
          layout="vertical"
          onFinish={handleForgotPassword}
        >
          <div className="py-4">
            <Paragraph className="text-base text-center mb-4 text-gray-300">
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
                className="rounded-md text-white"
                style={{ 
                  backgroundColor: '#1e1e3a', 
                  borderColor: '#90278E',
                  caretColor: '#fff'
                }}
              />
            </Form.Item>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleModalCancel} style={{ borderColor: '#90278E', color: '#d0d0d0' }}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit" style={{ background: '#90278E' }}>
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
        bodyStyle={{ 
          background: '#1a1a2e',
          color: 'white'
        }}
        headerStyle={{ 
          background: '#1a1a2e',
          color: 'white',
          borderBottom: '1px solid rgba(144, 39, 142, 0.3)'
        }}
        footer={[ 
          <Button key="ok" type="primary" onClick={handleRegisterModalCancel} style={{ background: '#90278E' }}>
            ตกลง
          </Button>,
        ]}
      >
        <div className="py-4 text-center">
          <Paragraph className="text-base text-gray-300">
            กรุณาติดต่อเจ้าหน้าที่หรือผู้ดูแลระบบเพื่อขอบัญชีผู้ใช้สำหรับเข้าใช้งานระบบ
          </Paragraph>
          <Paragraph className="mt-2 text-purple-400">
            อีเมล: admin@csi-showcase.com
          </Paragraph>
        </div>
      </Modal>

      {/* CSS for space theme */}
      <style jsx global>{`
        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .stars {
          background: transparent url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjAuNSIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIwLjMiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMC40IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iODAiIHI9IjAuMiIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjE1IiByPSIwLjMiIGZpbGw9IndoaXRlIi8+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIi8+PC9zdmc+') repeat top center;
          animation: stars 100s linear infinite;
        }
        
        .stars2 {
          background: transparent url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXR0ZXJuIGlkPSJzdGFyczIiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idHJhbnNwYXJlbnQiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjMwIiByPSIwLjgiIGZpbGw9IiNkNGQ0ZmYiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSI3MCIgcj0iMC40IiBmaWxsPSIjYjlkNGZmIi8+PGNpcmNsZSBjeD0iOTAiIGN5PSIxNTAiIHI9IjAuNiIgZmlsbD0iI2Q0ZDRmZiIvPjxjaXJjbGUgY3g9IjE4MCIgY3k9IjMwIiByPSIwLjMiIGZpbGw9IiNiOWQ0ZmYiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjE4MCIgcj0iMC43IiBmaWxsPSIjZDRkNGZmIi8+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMyKSIvPjwvc3ZnPg==') repeat top center;
          animation: stars2 140s linear infinite;
        }
        
        .stars3 {
          background: transparent url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXR0ZXJuIGlkPSJzdGFyczMiIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idHJhbnNwYXJlbnQiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSI4MCIgcj0iMSIgZmlsbD0iIzkwMjc4RSIvPjxjaXJjbGUgY3g9IjI2MCIgY3k9IjE5MCIgcj0iMC44IiBmaWxsPSIjOTAyNzhFIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSIyMzAiIHI9IjAuOSIgZmlsbD0iIzkwMjc4RSIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjQwIiByPSIwLjciIGZpbGw9IiM5MDI3OEUiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjEyMCIgcj0iMS4yIiBmaWxsPSIjOTAyNzhFIi8+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMzKSIvPjwvc3ZnPg==') repeat top center;
          animation: stars3 180s linear infinite;
        }
        
        @keyframes stars {
          0% { background-position: 0 0; }
          100% { background-position: 0 1000px; }
        }
        
        @keyframes stars2 {
          0% { background-position: 0 0; }
          100% { background-position: 0 1000px; }
        }
        
        @keyframes stars3 {
          0% { background-position: 0 0; }
          100% { background-position: 0 1000px; }
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .stars, .stars2, .stars3 {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;