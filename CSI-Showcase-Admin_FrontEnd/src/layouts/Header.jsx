import React from "react";
import { useLocation } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";

const Header = () => {
  const location = useLocation();

  // Map routes to titles and descriptions
  const pageDetails = {
    "/dashboard": {
      title: "แดชบอร์ด",
      description: "ภาพข้อมูลรวมผลงาน",
    },
    "/projects": {
      title: "จัดการผลงาน",
      description: "จัดการผลงานนักศึกษาทั้งหมด",
    },
    "/users/student": {
      title: "จัดการบัญชี",
      description: "จัดการบัญชีผู้ใช้นักศึกษา",
    },
    "/users/admin": {
      title: "จัดการบัญชี",
      description: "จัดการบัญชีผู้ดูแลระบบ",
    },
    "/login-info": {
      title: "ข้อมูลการเข้าสู่ระบบ",
      description: "ดูข้อมูลการเข้าสู่ระบบของผู้ใช้",
    },
  };

  const { title, description } = pageDetails[location.pathname] || {
    title: "หน้าหลัก",
    description: "ยินดีต้อนรับ",
  };

  // User details for dropdown
  const userDetails = {
    name: "คุณสมชาย",
    email: "somchai@example.com",
    role: "ผู้ดูแลระบบ",
  };

  // Menu for dropdown
  const userMenu = (
    <Menu>
      <Menu.Item>
        <strong>ชื่อ:</strong> {userDetails.name}
      </Menu.Item>
      <Menu.Item>
        <strong>อีเมล:</strong> {userDetails.email}
      </Menu.Item>
      <Menu.Item>
        <strong>ตำแหน่ง:</strong> {userDetails.role}
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>

      {/* User Info with Dropdown */}
      <div className="flex items-center text-gray-600">
        <Dropdown menu={userMenu} trigger={['hover']} className="cursor-pointer">
          <div className="flex items-center">
            <UserOutlined className="text-xl mr-2" />
            <span className="text-sm">สวัสดีคุณ {userDetails.name}</span>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
