import React, { useState } from "react";
import { Menu } from "antd"; // Import Menu from Ant Design
import { DashboardOutlined, FileTextOutlined, UserOutlined, ClockCircleOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

import LogoCSI from "../assets/Logo_CSI.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Use this to track the current route

  const [openKeys, setOpenKeys] = useState([]);

  const handleLogout = () => {
    console.log("Logout");
    // Insert your logout function here
  };

  const handleToggle = (keys) => {
    setOpenKeys(keys); // Update openKeys with the new value
  };

  // Dynamically set the selected menu item based on the current location
  const selectedKey = location.pathname;

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "แดชบอร์ด",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "/projects",
      icon: <FileTextOutlined />,
      label: "จัดการผลงาน",
      onClick: () => navigate("/projects"),
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "จัดการบัญชี",
      children: [
        {
          key: "/users/student",
          label: "บัญชีนักศึกษา",
          onClick: () => navigate("/users/student"),
        },
        {
          key: "/users/admin",
          label: "บัญชีผู้ดูแลระบบ",
          onClick: () => navigate("/users/admin"),
        },
      ],
    },
    {
      key: "/login-info",
      icon: <ClockCircleOutlined />,
      label: "ข้อมูลการเข้าสู่ระบบ",
      onClick: () => navigate("/login-info"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      onClick: handleLogout,
    },
  ];

  return (
    <div className="w-64 h-screen bg-[#90278E] text-white flex flex-col p-4">
      {/* Logo Section */}
      <div className="text-center mb-6">
        <img src={LogoCSI} alt="Logo" />
        <p className="text-sm">Showcase Management</p>
        <p className="text-xs">ระบบจัดการผลงานนักศึกษา</p>
      </div>

      {/* Menu Section */}
      <Menu
        theme="light"
        mode="inline" // Use inline mode for side navigation
        className="bg-transparent text-white border-none"
        openKeys={openKeys} // Control open state of submenus
        onOpenChange={handleToggle} // Handle toggle of submenus
        selectedKeys={[selectedKey]} // Highlight selected menu item
        items={menuItems} // Set menu items
        style={{ paddingTop: 10 }}
      />
    </div>
  );
};

export default Sidebar;
