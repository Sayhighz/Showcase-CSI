import React, { useState, useEffect } from "react";
import { Layout, Input, Dropdown, Menu, Drawer, Button } from "antd";
import { Link, useLocation } from "react-router-dom";
import { UserOutlined, GiftOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext"; // นำเข้าฟังก์ชัน useAuth
import { removeAuthCookie } from "../lib/cookie";
import LogoCSI from "../assets/Logo_CSI.png";

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  const { isAuthenticated, authData } = useAuth(); // ดึงข้อมูลจาก AuthContext
  const { username } = authData; // ดึง username จาก authData
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOverlay, setIsOverlay] = useState(location.pathname === "/");
  const [visible, setVisible] = useState(false); // state for the sidebar visibility

  // Handle logout
  const handleLogout = () => {
    removeAuthCookie();
    window.location.href = "/login";
  };

  // Track scroll position to show/hide Navbar and set overlay
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false); // Hide Navbar when scrolling down
      } else {
        setIsVisible(true); // Show Navbar when scrolling up
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

  // Handle Drawer visibility toggle
  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  return (
    <>
      {/* Sidebar (Drawer) */}
      <Drawer
        title=""
        placement="left"
        closable={false}
        onClose={closeDrawer}
        open={visible}
        width={250}
      >
        <Menu>
          <Menu.Item key="home">
            <Link to="/" onClick={closeDrawer}>หน้าแรก</Link>
          </Menu.Item>
          <Menu.Item key="all-projects">
            <Link to="/projects/all" onClick={closeDrawer}>ผลงานทั้งหมด</Link>
          </Menu.Item>
          {isAuthenticated ? (
            <>
              <Menu.Item key="my-projects">
                <Link to="/projects/my" onClick={closeDrawer}>ผลงานของฉัน</Link>
              </Menu.Item>
              <Menu.Item key="logout">
                <span onClick={handleLogout}>ออกจากระบบ</span>
              </Menu.Item>
            </>
          ) : (
            <Menu.Item key="login">
              <Link to="/login" onClick={closeDrawer}>เข้าสู่ระบบ</Link>
            </Menu.Item>
          )}
        </Menu>
      </Drawer>

      {/* Navbar Header */}
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
          {/* Mobile only: Show search and profile in Drawer */}
          <div className="hidden md:flex items-center space-x-8">
            <Search placeholder="Search or jump to..." allowClear className="rounded-full text-gray-500 w-[300px]" />
          </div>
          
          {/* Mobile toggle button */}
          <Button
            type="text"
            className="text-white md:hidden"
            icon={<MenuOutlined />}
            onClick={showDrawer}
          />

          <Link to="/projects/all" className="hidden md:block">ผลงานทั้งหมด</Link>
          {isAuthenticated ? (
            <Dropdown menu={{ items: profileMenuItems }} trigger={["click"]} placement="bottomRight">
              <div className="flex items-center cursor-pointer space-x-2 hidden md:flex">
                <UserOutlined className="text-lg" />
                <span>สวัสดี {username}</span> {/* ใช้ username จาก authData */}
              </div>
            </Dropdown>
          ) : (
            <Link to="/login" className="hidden md:block">เข้าสู่ระบบ</Link>
          )}
        </div>
      </Header>
    </>
  );
};

export default Navbar;
