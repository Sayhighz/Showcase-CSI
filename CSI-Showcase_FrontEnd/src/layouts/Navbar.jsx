import React from "react";
import { Layout, Input, Dropdown, Menu } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined, EditOutlined, GiftOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { removeAuthCookie } from "../lib/cookie";
import LogoCSI from "../assets/Logo_CSI.png";

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  // Get authentication status from AuthContext
  const { isAuthenticated } = useAuth();
  
  // User's name (Can be fetched dynamically from API or context)
  const username = "คุณชื่อผู้ใช้"; 

  // Function to handle logout
  const handleLogout = () => {
    removeAuthCookie(); // Remove authentication cookie
    window.location.href = "/login"; // Redirect to login page
  };

  // Dropdown menu items for authenticated users
  const profileMenuItems = [
    {
      key: "edit-profile",
      icon: <EditOutlined />,
      label: <Link to="/profile/edit">แก้ไขข้อมูลส่วนตัว</Link>, // Edit profile link
    },
    {
      key: "my-projects",
      icon: <GiftOutlined />,
      label: <Link to="/projects/my">ผลงานของฉัน</Link>, // Link to user's projects
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>ออกจากระบบ</span>, // Logout action
    },
  ];

  return (
    // Navbar container with background color and padding
    <Header className="bg-[#90278E] px-8 flex justify-between items-center h-16">
      
      {/* Left Section - Logo */}
      <div className="flex items-center">
        <Link to="/">
          <img src={LogoCSI} alt="CSI Logo" className="h-12" /> {/* Logo image */}
        </Link>
      </div>

      {/* Right Section - Menu & Search */}
      <div className="flex items-center ml-auto space-x-8 text-white">
        
        {/* Search Bar */}
        <Search
          placeholder="Search or jump to..."
          allowClear
          className="rounded-full text-gray-500 w-[300px]"
        />

        {/* Link to all projects */}
        <Link to="/projects/all">ผลงานทั้งหมด</Link>

        {/* User Authentication Check */}
        {isAuthenticated ? (
          // If user is authenticated, show dropdown profile menu
          <Dropdown menu={{ items: profileMenuItems }} trigger={["click"]} placement="bottomRight">
            <div className="flex items-center cursor-pointer space-x-2">
              <UserOutlined className="text-lg" /> {/* User icon */}
              <span>สวัสดี {username}...</span> {/* Greeting with username */}
            </div>
          </Dropdown>
        ) : (
          // If not authenticated, show login link
          <Link to="/login">เข้าสู่ระบบ</Link>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
