import React, { useState, useEffect } from "react";
import { Layout, Input, Dropdown, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { UserOutlined, GiftOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { removeAuthCookie } from "../lib/cookie";
import LogoCSI from "../assets/Logo_CSI.png";

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const username = "คุณชื่อผู้ใช้"; 
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOverlay, setIsOverlay] = useState(location.pathname === "/");

  // Handle logout
  const handleLogout = () => {
    removeAuthCookie();
    window.location.href = "/login";
  };

  // Track scroll position to show/hide Navbar and set overlay
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false); // ซ่อน Navbar เมื่อ scroll ลง
      } else {
        setIsVisible(true); // แสดง Navbar เมื่อ scroll ขึ้น
      }
      setLastScrollY(window.scrollY);
      
      // Set overlay only on Home page
      if (location.pathname === "/") {
        setIsOverlay(window.scrollY < window.innerHeight * 0.1);
      } else {
        setIsOverlay(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, location.pathname]);

  // Ensure overlay resets when navigating to a different page
  useEffect(() => {
    if (location.pathname !== "/") {
      setIsOverlay(false);
    }
  }, [location.pathname]);

  // Dropdown menu items
  const profileMenuItems = [
    { key: "my-projects", icon: <GiftOutlined />, label: <Link to="/projects/my">ผลงานของฉัน</Link> },
    { key: "logout", icon: <LogoutOutlined />, label: <span onClick={handleLogout}>ออกจากระบบ</span> },
  ];

  return (
    <Header
      className={`px-8 flex justify-between items-center h-16 fixed top-0 left-0 w-full z-50 transition-transform duration-300 
        ${isVisible ? "translate-y-0" : "-translate-y-full"} 
        ${isOverlay ? "bg-transparent backdrop-blur-md" : "bg-[#90278E]"}`}
    >
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/">
          <img src={LogoCSI} alt="CSI Logo" className="h-12" />
        </Link>
      </div>

      {/* Right Section - Menu & Search */}
      <div className="flex items-center ml-auto space-x-8 text-white">
        <Search placeholder="Search or jump to..." allowClear className="rounded-full text-gray-500 w-[300px]" />
        <Link to="/projects/all">ผลงานทั้งหมด</Link>

        {isAuthenticated ? (
          <Dropdown menu={{ items: profileMenuItems }} trigger={["click"]} placement="bottomRight">
            <div className="flex items-center cursor-pointer space-x-2">
              <UserOutlined className="text-lg" />
              <span>สวัสดี {username}...</span>
            </div>
          </Dropdown>
        ) : (
          <Link to="/login">เข้าสู่ระบบ</Link>
        )}
      </div>
    </Header>
  );
};

export default Navbar;