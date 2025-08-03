import React, { useState, useEffect } from "react";
import {
  Layout,
  Dropdown,
  Menu,
  Drawer,
  Button,
  Avatar,
  Badge,
  Tooltip,
} from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined,
  HomeOutlined,
  ProjectOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { removeAuthCookie } from "../lib/cookie";
import LogoCSI from "../assets/Logo_CSI.png";
import { API_ENDPOINTS } from "../constants";

const { Header } = Layout;

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { fullName, image } = user || {}; 
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ตรวจสอบขนาดหน้าจอว่าเป็นโมบายหรือไม่
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    removeAuthCookie();
    window.location.href = "/csie/login";
  };

  // Track scroll position to show/hide Navbar and set transparency state
  useEffect(() => {
    const handleScroll = () => {
      // Hide/show navbar based on scroll direction
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false); // Hide Navbar when scrolling down and not at top
      } else {
        setIsVisible(true); // Show Navbar when scrolling up or at top
      }
      setLastScrollY(window.scrollY);
      
      // Check if we're at the top of the page (less than 20px to allow small movement)
      setIsAtTop(window.scrollY < 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, location.pathname]);

  // Reset isAtTop when navigating to different pages
  useEffect(() => {
    setIsAtTop(window.scrollY < 20);
  }, [location.pathname]);

  // Dropdown menu items with icons and animations
  const items = [
    {
      key: "1",
      label: (
        <Link to="/projects/my" className="flex items-center space-x-2 p-2">
          <ProjectOutlined />
          <span>ผลงานของฉัน</span>
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: (
        <div
          onClick={handleLogout}
          className="flex items-center space-x-2 text-red-500 p-2"
        >
          <LogoutOutlined />
          <span>ออกจากระบบ</span>
        </div>
      ),
    },
  ];

  // Handle Drawer visibility toggle
  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  // Animation variants - Github style with smooth transitions
  const navbarVariants = {
    visible: {
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
    hidden: {
      y: "-100%",
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const logoVariants = {
    normal: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const linkVariants = {
    normal: { y: 0 },
    hover: { y: -2, transition: { duration: 0.2 } },
  };
  
  // Generate notification dot
  const NotificationDot = () => (
    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
  );

  // ตรวจสอบว่าเป็นหน้า Home และอยู่ที่ด้านบนของหน้าเว็บหรือไม่
  const isHomeAndAtTop = location.pathname === "/" && isAtTop;

  return (
    <>
      {/* Sidebar (Drawer) with updated theme styling */}
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <Button
              type="text"
              onClick={closeDrawer}
              icon={<CloseOutlined />}
              className="border-none text-[#90278E]"
            />
          </div>
        }
        placement="left"
        closable={false}
        onClose={closeDrawer}
        open={visible}
        width={isMobile ? "80%" : 280}
        style={{ padding: 0 }}
        styles={{
          header: { 
            borderBottom: '1px solid rgba(144, 39, 142, 0.2)',
            padding: '16px 24px' 
          },
          body: {
            background: 'linear-gradient(135deg, rgba(245, 234, 255, 0.8), rgba(255, 255, 255, 0.9))'
          },
          mask: {
            background: 'rgba(94, 26, 92, 0.2)',
            backdropFilter: 'blur(2px)'
          }
        }}
      >
        <div className="p-4">
          {isAuthenticated && (
            <div className="flex items-center space-x-3 mb-6 p-3 bg-[#90278E] bg-opacity-5 rounded-lg border border-[#90278E] border-opacity-10">
              <Avatar
                src={image ? API_ENDPOINTS.BASE + "/" + image : null}
                icon={!image && <UserOutlined />}
                className="bg-[#90278E]"
                size={isMobile ? "default" : "large"}
              />
              <div>
                <div className="font-medium text-[#90278E] text-sm sm:text-base truncate max-w-[150px]">{fullName}</div>
                <div className="text-xs text-[#8b949e]">นักศึกษา CSI</div>
              </div>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          className="border-none custom-drawer-menu bg-transparent"
          items={[
            {
              key: "home",
              icon: <HomeOutlined />,
              label: (
                <Link to="/" onClick={closeDrawer}>
                  หน้าแรก
                </Link>
              ),
            },
            {
              key: "all-projects",
              icon: <AppstoreOutlined />,
              label: (
                <Link to="/projects/all" onClick={closeDrawer}>
                  ผลงานทั้งหมด
                </Link>
              ),
            },
            ...(isAuthenticated
              ? [
                  {
                    key: "my-projects",
                    icon: <ProjectOutlined />,
                    label: (
                      <Link to="/projects/my" onClick={closeDrawer}>
                        ผลงานของฉัน
                      </Link>
                    ),
                  },
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: (
                      <span onClick={handleLogout} className="text-red-500">
                        ออกจากระบบ
                      </span>
                    ),
                    className: "mt-4 text-red-500",
                  },
                ]
              : [
                  {
                    key: "login",
                    icon: <UserOutlined />,
                    label: (
                      <Link to="/login" onClick={closeDrawer}>
                        เข้าสู่ระบบ
                      </Link>
                    ),
                  },
                ]),
          ]}
        />
      </Drawer>

      {/* Navbar Header with updated theme styling */}
      <AnimatePresence>
        <motion.div
          variants={navbarVariants}
          initial="visible"
          animate={isVisible ? "visible" : "hidden"}
          className={`fixed top-0 left-0 w-full z-50`}
        >
          <Header
            className={`px-2 sm:px-4 md:px-8 flex justify-between items-center h-14 sm:h-16 transition-all duration-500 ${
              isHomeAndAtTop 
                ? "bg-transparent shadow-none" 
                : "bg-[#90278E] shadow-md backdrop-filter backdrop-blur-md bg-opacity-90"
            }`}
          >
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center space-x-3 sm:space-x-8">
              {/* Logo with hover animation */}
              <motion.div
                className="flex items-center"
                variants={logoVariants}
                initial="normal"
                whileHover="hover"
              >
                <Link to="/">
                  <img src={LogoCSI} alt="CSI Logo" className="h-8 sm:h-10 md:h-12" />
                </Link>
              </motion.div>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <motion.div
                  variants={linkVariants}
                  whileHover="hover"
                  className="relative"
                >
                  <Link
                    to="/"
                    className={`hover:text-white transition-colors ${
                      location.pathname === "/"
                        ? "text-white font-medium"
                        : "text-[#FFE6FF]"
                    }`}
                  >
                    หน้าแรก
                  </Link>
                  {location.pathname === "/" && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white rounded-full"
                      layoutId="navIndicator"
                    />
                  )}
                </motion.div>

                <motion.div
                  variants={linkVariants}
                  whileHover="hover"
                  className="relative"
                >
                  <Link
                    to="/projects/all"
                    className={`hover:text-white transition-colors ${
                      location.pathname === "/projects/all"
                        ? "text-white font-medium"
                        : "text-[#FFE6FF]"
                    }`}
                  >
                    ผลงานทั้งหมด
                  </Link>
                  {location.pathname === "/projects/all" && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white rounded-full"
                      layoutId="navIndicator"
                    />
                  )}
                </motion.div>

                {isAuthenticated && (
                  <motion.div
                    variants={linkVariants}
                    whileHover="hover"
                    className="relative"
                  >
                    <Link
                      to="/projects/my"
                      className={`hover:text-white transition-colors ${
                        location.pathname === "/projects/my"
                          ? "text-white font-medium"
                          : "text-[#FFE6FF]"
                      }`}
                    >
                      ผลงานของฉัน
                    </Link>
                    {location.pathname === "/projects/my" && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white rounded-full"
                        layoutId="navIndicator"
                      />
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Section - Action Buttons & User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              {/* Mobile Menu Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden"
              >
                <Button
                  type="text"
                  className="text-white flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-20 border-0 rounded-full w-8 h-8 sm:w-9 sm:h-9"
                  icon={<MenuOutlined />}
                  onClick={showDrawer}
                />
              </motion.div>

              {/* User Profile / Login Button */}
              {isAuthenticated ? (
                <Dropdown
                  menu={{ items }}
                  placement="bottomRight"
                  arrow={{ pointAtCenter: true }}
                  trigger={["click"]}
                >
                  <motion.div
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center cursor-pointer space-x-2 bg-white bg-opacity-10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white border-opacity-10 transition-all hover:bg-opacity-20"
                  >
                    <Avatar
                      src={image ? API_ENDPOINTS.BASE + "/" + image : null}
                      icon={!image && <UserOutlined />}
                      className="bg-[#B252B0]"
                      size="small"
                    />
                    <span className="hidden sm:inline max-w-16 md:max-w-24 truncate text-xs sm:text-sm text-white">{fullName}</span>
                  </motion.div>
                </Dropdown>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 bg-white hover:bg-[#F5EAFF] text-[#90278E] font-medium px-2 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300 border border-transparent shadow-sm text-xs sm:text-sm"
                  >
                    <UserOutlined className="mr-0 sm:mr-1" />
                    <span className="hidden xs:inline">เข้าสู่ระบบ</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </Header>
        </motion.div>
      </AnimatePresence>

      {/* Spacer for content below the fixed navbar */}
      <div className={isHomeAndAtTop ? "h-0" : "h-14 sm:h-16"}></div>
    </>
  );
};

export default Navbar;