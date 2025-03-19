import React, { useState } from "react";
import { Form, Input, Button, Card, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { axiosLogin } from "../../lib/axios";  // นำเข้าฟังก์ชัน axiosLogin
import { setAuthCookie } from "../../lib/cookie";
import { useAuth } from "../../context/AuthContext"; // ใช้ context สำหรับจัดการข้อมูลล็อกอิน
import Logo from '../../assets/Logo_CSI_Color.png';

const Login = () => {
  const { setAuthData } = useAuth(); // ใช้ฟังก์ชันจาก AuthContext
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values) => {
    try {
      const { email, password } = values;

      // เรียกใช้ฟังก์ชัน login จาก axios.js
      const response = await axiosLogin(email, password);

      if (response.token) {
        // ถ้ามี token ให้เก็บใน cookies
        setAuthCookie(response.token);

        message.success("ล็อกอินสำเร็จ!");
        window.location.href = "/"; // เปลี่ยนหน้าไปที่หน้าแรกหลังจาก login สำเร็จ
      }
    } catch (error) {
      // แสดงข้อผิดพลาดผ่าน Ant Design message
      if (error.status) {
        message.error(`ข้อผิดพลาด: ${error.message}`);
      } else {
        message.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Logo & Text */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <img src={Logo} alt="Logo" className="w-96 mb-4" />
        <p className="text-center text-gray-700 mt-2">
          คลังเก็บผลงานนักศึกษาคณะเทคโนโลยีสารสนเทศ
          <br />
          สาขาวิชาการคอมพิวเตอร์และนวัตกรรมพัฒนาซอฟต์แวร์
        </p>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-1/2 flex justify-center items-center bg-[#90278E]">
        <Card className="w-96 p-6 shadow-lg" variant="outlined">
          <h2 className="text-center text-lg font-semibold mb-4">เข้าสู่ระบบ</h2>
          <Form layout="vertical" onFinish={onFinish}>
            {/* Email */}
            <Form.Item label="ที่อยู่อีเมล" name="email" rules={[{ required: true, message: "กรุณากรอกอีเมล" }]}> 
              <Input placeholder="อีเมล" size="large" />
            </Form.Item>

            {/* Password */}
            <Form.Item label="รหัสผ่าน" name="password" rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}> 
              <Input.Password placeholder="รหัสผ่าน" size="large" />
            </Form.Item>

            {/* Login Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full bg-[#90278E] hover:bg-purple-800" size="large">
                เข้าสู่ระบบ
              </Button>
            </Form.Item>
          </Form>
          
          {/* Additional Buttons */}
          <div className="text-center mt-4">
            <Button type="link" onClick={showModal} className="text-white">ลืมรหัสผ่าน?</Button>
            <span className="mx-2 text-white">|</span>
            <Button type="link" onClick={showModal} className="text-white">ยังไม่มีบัญชี?</Button>
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Modal title="แจ้งเตือน" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={[ 
        <Button key="ok" type="primary" onClick={handleOk}>
          ตกลง
        </Button>,
      ]}>
        <p>โปรดติดต่อเจ้าหน้าที่เพื่อขอรับความช่วยเหลือ</p>
      </Modal>
    </div>
  );
};

export default Login;
