import React, { useState, useMemo, useEffect, useRef } from "react";
import { Form, Input, Button, Card, Modal, Spin, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// นำเข้า hooks จากโปรเจค
import useAuth from "../../hooks/useAuth";
import useNotification from "../../hooks/useNotification";

// นำเข้า constants จากโปรเจค
import { HOME } from "../../constants/routes";

const { Title, Paragraph, Text } = Typography;

const Login = () => {
  // CSS Variables สำหรับสีหลักตามธีม
  const themeColors = {
    primary: '#90278E',        // สีม่วงเข้ม
    secondary: '#B252B0',      // สีม่วงอ่อน
    dark: '#5E1A5C',           // สีม่วงเข้มมาก
    lightPurple: '#F5EAFF',    // สีม่วงอ่อนมาก (background)
    mediumPurple: '#E0D1FF',   // สีม่วงกลาง
    textLight: '#FFE6FF',      // สีตัวอักษรบนพื้นเข้ม
    textSecondary: '#F8CDFF'   // สีตัวอักษรรอง
  };

  // ใช้ hooks จากโปรเจค
  const { login, isAuthLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  // state สำหรับ Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [isHovered, setIsHovered] = useState(false);
  
  // useRef สำหรับเก็บ stars เพื่อไม่ให้สร้างใหม่ทุกครั้ง
  const starsRef = useRef(null);

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

  // Animation variants for Card hover effect
  const cardHoverAnimation = {
    hover: {
      boxShadow: '0 12px 30px rgba(144, 39, 142, 0.15)',
      y: -5,
      transition: { duration: 0.3 }
    },
    initial: {
      boxShadow: '0 6px 20px rgba(144, 39, 142, 0.1)',
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Animation for the icon container
  const iconAnimation = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: { 
        duration: 0.5,
        rotate: { 
          repeat: 0,
          duration: 0.5 
        }
      }
    }
  };

  // สร้าง background stars แบบ useMemo เพื่อให้สร้างครั้งเดียว
  const backgroundStars = useMemo(() => {
    // สร้างดาวหลัก - ไม่มีการกระพริบ
    const stars = Array.from({ length: 40 }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.5 + 0.2;
      const left = Math.random() * 100;
      const top = Math.random() * 40;
      
      return (
        <div
          key={`star-${i}`}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            top: `${top}%`,
            backgroundColor: '#FFFFFF',
            opacity: opacity,
            boxShadow: `0 0 ${size}px rgba(255, 255, 255, ${opacity * 0.7})`
          }}
        />
      );
    });
    
    // เพิ่ม glow spots ขนาดใหญ่เพื่อความลึก
    const glowEffects = Array.from({ length: 5 }).map((_, i) => {
      const size = Math.random() * 10 + 5;
      const opacity = Math.random() * 0.15 + 0.05;
      const left = Math.random() * 100;
      const top = Math.random() * 40;
      
      return (
        <motion.div
          key={`glow-${i}`}
          className="absolute rounded-full blur-xl"
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            top: `${top}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            opacity: opacity
          }}
          animate={{ 
            opacity: [opacity * 0.7, opacity * 1.3, opacity * 0.7],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{ 
            duration: 8 + i * 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        />
      );
    });
    
    return [...glowEffects, ...stars];
  }, []); // empty dependency array = calculate only once

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Background with professional purple gradient */}
      <div className="absolute inset-0">
        <div className="h-2/5 bg-gradient-to-r from-[#90278E] to-[#5E1A5C] relative overflow-hidden">
          {/* Stars in background */}
          {backgroundStars}
          
          {/* Purple light orbs decoration */}
          <motion.div 
            className="absolute top-[-100px] left-[10%] w-64 h-64 rounded-full opacity-20 blur-3xl bg-[#B252B0]"
            animate={{ 
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute top-[-50px] right-[20%] w-80 h-80 rounded-full opacity-20 blur-3xl bg-[#B252B0]"
            animate={{ 
              y: [0, 30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          />
        </div>
        <div className="h-3/5 bg-white"></div>
      </div>
      
      {/* Center Container */}
      <div className="relative z-10 w-full max-w-md px-4 py-6 sm:px-0">
        <motion.div
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
          variants={cardHoverAnimation}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Card 
            className="w-full rounded-xl border"
            bordered={false}
            style={{ 
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(144, 39, 142, 0.1)',
            }}
          >
            <div className="text-center mb-6">
              <motion.div 
                className="flex justify-center mb-4"
                initial="initial"
                whileHover="hover"
                variants={iconAnimation}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    boxShadow: `0 10px 20px rgba(144, 39, 142, 0.3)`
                  }}
                >
                  <LoginOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
              </motion.div>
              <Title 
                level={2} 
                style={{ 
                  marginBottom: '4px', 
                  fontWeight: '600',
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                เข้าสู่ระบบ
              </Title>
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
                  label={<span style={{ color: themeColors.dark, fontWeight: '500' }}>ชื่อผู้ใช้</span>} 
                  name="username" 
                  rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
                > 
                  <Input 
                    prefix={<UserOutlined style={{ color: themeColors.primary }} />} 
                    placeholder="ชื่อผู้ใช้" 
                    size="large" 
                    className="rounded-lg"
                    style={{ 
                      borderColor: 'rgba(144, 39, 142, 0.2)',
                      boxShadow: 'none'
                    }}
                  />
                </Form.Item>

                {/* Password */}
                <Form.Item 
                  label={<span style={{ color: themeColors.dark, fontWeight: '500' }}>รหัสผ่าน</span>} 
                  name="password" 
                  rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
                > 
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: themeColors.primary }} />} 
                    placeholder="รหัสผ่าน" 
                    size="large" 
                    className="rounded-lg"
                    style={{ 
                      borderColor: 'rgba(144, 39, 142, 0.2)',
                      boxShadow: 'none'
                    }}
                  />
                </Form.Item>

                {/* Login Button */}
                <Form.Item className="mt-8">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      className="w-full rounded-lg h-12 flex items-center justify-center"
                      size="large"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                        boxShadow: '0 4px 12px rgba(144, 39, 142, 0.2)',
                        border: 'none'
                      }}
                      icon={<LoginOutlined />}
                    >
                      <span className="ml-1 text-base">เข้าสู่ระบบ</span>
                    </Button>
                  </motion.div>
                </Form.Item>
              </Form>
            </Spin>
            
            {/* Additional Buttons */}
            <Divider className="my-2" style={{ borderColor: 'rgba(144, 39, 142, 0.1)' }} />
            <div className="text-center mt-4">
              <motion.div 
                className="inline-block"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="link" 
                  onClick={showForgotPasswordModal} 
                  className="text-gray-600 hover:text-[#90278E]"
                >
                  ลืมรหัสผ่าน?
                </Button>
              </motion.div>
              <span className="mx-2 text-gray-300">|</span>
              <motion.div 
                className="inline-block"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="link" 
                  onClick={showRegisterModal} 
                  className="text-gray-600 hover:text-[#90278E]"
                >
                  ยังไม่มีบัญชี?
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Text style={{ color: '#666', fontSize: '12px' }}>
            © 2025 CSI Project Explorer. สงวนลิขสิทธิ์.
          </Text>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <Modal 
        title={
          <div 
            className="text-center text-lg font-medium py-2" 
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent' 
            }}
          >
            ลืมรหัสผ่าน
          </div>
        }
        open={isModalVisible} 
        onCancel={handleModalCancel} 
        centered
        footer={null}
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px' }}
        className="custom-modal"
        maskStyle={{ backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.2)' }}
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
                prefix={<MailOutlined style={{ color: themeColors.primary }} />} 
                placeholder="อีเมล" 
                size="large" 
                className="rounded-lg"
                style={{ 
                  borderColor: 'rgba(144, 39, 142, 0.2)',
                }}
              />
            </Form.Item>
            
            <div className="flex justify-end gap-3 mt-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleModalCancel}
                  className="rounded-lg border-[rgba(144,39,142,0.3)]"
                  style={{ color: themeColors.primary }}
                >
                  ยกเลิก
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    border: 'none',
                    boxShadow: '0 4px 8px rgba(144, 39, 142, 0.2)',
                  }}
                >
                  ส่งคำขอ
                </Button>
              </motion.div>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Register Modal */}
      <Modal 
        title={
          <div 
            className="text-center text-lg font-medium py-2" 
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent' 
            }}
          >
            แจ้งเตือน
          </div>
        }
        open={isRegisterModalVisible} 
        onCancel={handleRegisterModalCancel} 
        centered
        footer={null}
        bodyStyle={{ padding: '24px' }}
        className="custom-modal"
        maskStyle={{ backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="py-4 text-center">
          <Paragraph className="text-base text-gray-600">
            กรุณาติดต่อเจ้าหน้าที่หรือผู้ดูแลระบบเพื่อขอบัญชีผู้ใช้สำหรับเข้าใช้งานระบบ
          </Paragraph>
          <Paragraph className="mt-2" style={{ color: themeColors.primary, fontWeight: 'medium' }}>
            อีเมล: admin@example.com
          </Paragraph>
          
          <div className="mt-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button 
                type="primary" 
                onClick={handleRegisterModalCancel} 
                className="rounded-lg min-w-[100px]"
                style={{ 
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  border: 'none',
                  boxShadow: '0 4px 8px rgba(144, 39, 142, 0.2)',
                }}
              >
                ตกลง
              </Button>
            </motion.div>
          </div>
        </div>
      </Modal>
      
      {/* Global style overrides */}
      <style jsx global>{`
        .ant-input:focus, .ant-input-focused,
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: ${themeColors.primary} !important;
          box-shadow: 0 0 0 2px rgba(144, 39, 142, 0.2) !important;
        }
        
        .ant-input:hover, .ant-input-affix-wrapper:hover {
          border-color: ${themeColors.primary} !important;
        }
        
        .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(144, 39, 142, 0.15);
          border: 1px solid rgba(144, 39, 142, 0.1);
        }
        
        .ant-modal-header {
          border-bottom: 1px solid rgba(144, 39, 142, 0.1);
        }
        
        .ant-spin-dot i {
          background-color: ${themeColors.primary} !important;
        }
        
        .ant-btn-primary:hover {
          background: linear-gradient(135deg, ${themeColors.secondary}, ${themeColors.primary}) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;