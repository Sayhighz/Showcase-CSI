import React, { useState } from "react";
import { Form, Input, Button, Card, Modal, message, Spin } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { axiosLogin } from "../../lib/axios";
import { setAuthCookie } from "../../lib/cookie";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import Logo from '../../assets/Logo_CSI_Color.png';

const Login = () => {
  const { setAuthData } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Modal handlers
  const showModal = () => setIsModalVisible(true);
  const handleOk = () => setIsModalVisible(false);
  const handleCancel = () => setIsModalVisible(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { username, password } = values;

      // เรียกใช้ฟังก์ชัน login จาก axios
      const response = await axiosLogin(username, password);

      if (response.token) {
        // ถอดรหัส token เพื่อดึงข้อมูลผู้ใช้
        const decoded = jwtDecode(response.token);
        
        // เก็บ token ใน cookies
        setAuthCookie(response.token);
        
        // อัปเดตข้อมูลผู้ใช้ใน context
        setAuthData({
          username: decoded.username,
          role: decoded.role,
          token: response.token,
          userId: decoded.id // ต้องตรงกับ payload ที่ถูกสร้างในฝั่ง server
        });

        message.success({
          content: "เข้าสู่ระบบสำเร็จ!",
          icon: <LoginOutlined style={{ color: '#52c41a' }} />
        });
        
        // redirect ไปยังหน้าหลัก
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // แสดงข้อผิดพลาดผ่าน Ant Design message
      if (error.status === 401) {
        message.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else if (error.message) {
        message.error(`ข้อผิดพลาด: ${error.message}`);
      } else {
        message.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section - Logo & Text */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <div className="max-w-lg text-center">
          <img src={Logo} alt="Logo" className="w-96 mx-auto mb-8 transition-all hover:scale-105 duration-300" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">CSI Showcase</h1>
          <p className="text-xl text-gray-700 mb-6">
            คลังเก็บผลงานนักศึกษาคณะเทคโนโลยีสารสนเทศ
          </p>
          <p className="text-lg text-gray-600">
            สาขาวิชาการคอมพิวเตอร์และนวัตกรรมพัฒนาซอฟต์แวร์
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-1/2 flex justify-center items-center bg-gradient-to-r from-purple-800 to-purple-600">
        <Card 
          className="w-96 p-4 shadow-2xl rounded-lg" 
          bordered={false}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
            <p className="text-gray-600">กรอกข้อมูลเพื่อเข้าใช้งานระบบ</p>
          </div>
          
          <Spin spinning={loading} tip="กำลังเข้าสู่ระบบ...">
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
                  placeholder="username" 
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
          <div className="text-center mt-4 border-t pt-4">
            <Button 
              type="link" 
              onClick={showModal} 
              className="text-gray-600 hover:text-purple-700"
            >
              ลืมรหัสผ่าน?
            </Button>
            <span className="mx-2 text-gray-400">|</span>
            <Button 
              type="link" 
              onClick={showModal} 
              className="text-gray-600 hover:text-purple-700"
            >
              ยังไม่มีบัญชี?
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Modal 
        title={<div className="text-center text-lg">แจ้งเตือน</div>}
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel} 
        centered
        footer={[ 
          <Button key="ok" type="primary" onClick={handleOk} className="bg-purple-700 hover:bg-purple-800">
            ตกลง
          </Button>,
        ]}
      >
        <div className="py-4 text-center">
          <p className="text-base">กรุณาติดต่อเจ้าหน้าที่หรือผู้ดูแลระบบเพื่อขอรับความช่วยเหลือ</p>
          <p className="mt-2 text-gray-500">อีเมล: admin@csi-showcase.com</p>
        </div>
      </Modal>
    </div>
  );
};

export default Login;