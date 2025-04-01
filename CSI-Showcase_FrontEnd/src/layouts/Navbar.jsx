import React, { useState, useEffect } from "react";
import { Layout, Input, Dropdown, Menu, Drawer, Button, Avatar, Badge, Tooltip } from "antd";
import { Link, useLocation } from "react-router-dom";
import { 
  UserOutlined, 
  GiftOutlined, 
  LogoutOutlined, 
  MenuOutlined,
  BellOutlined,
  SearchOutlined,
  HomeOutlined,
  ProjectOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { removeAuthCookie } from "../lib/cookie";
import LogoCSI from "../assets/Logo_CSI.png";

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  const { isAuthenticated, authData } = useAuth();
  const { username } = authData || {}; // ใช้ optional chaining เพื่อป้องกันกรณี authData เป็น null
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOverlay, setIsOverlay] = useState(location.pathname === "/");
  const [visible, setVisible] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(Math.random() > 0.5); // สุ่มว่ามีการแจ้งเตือนหรือไม่

  // Handle logout
  const handleLogout = () => {
    removeAuthCookie();
    window.location.href = "/login";
  };

  // Toggle search field expansion
  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
  };

  // Track scroll position to show/hide Navbar and set overlay
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false); // Hide Navbar when scrolling down and not at top
      } else {
        setIsVisible(true); // Show Navbar when scrolling up or at top
      }
      setLastScrollY(window.scrollY);
      
      // Set overlay only on Home page and when at the very top
      if (location.pathname === "/") {
        setIsOverlay(window.scrollY === 0);
      } else {
        setIsOverlay(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, location.pathname]);

  // Ensure overlay resets when navigating to a different page
  useEffect(() => {
    // Set isOverlay to true only if we're on the home page and at the top
    if (location.pathname === "/") {
      setIsOverlay(window.scrollY === 0);
    } else {
      setIsOverlay(false);
    }
  }, [location.pathname]);

  // Dropdown menu items with icons and animations
  const items = [
    {
      key: '1',
      label: (
        <Link to="/projects/my" className="flex items-center space-x-2 p-1">
          <ProjectOutlined />
          <span>ผลงานของฉัน</span>
        </Link>
      ),
    },
    {
      key: '2',
      label: (
        <Link to="/settings" className="flex items-center space-x-2 p-1">
          <SettingOutlined />
          <span>ตั้งค่าโปรไฟล์</span>
        </Link>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: (
        <div onClick={handleLogout} className="flex items-center space-x-2 text-red-500 p-1">
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

  // Animation variants
  const navbarVariants = {
    visible: { 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    hidden: { 
      y: "-100%",
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const logoVariants = {
    normal: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  const linkVariants = {
    normal: { y: 0 },
    hover: { y: -2, transition: { duration: 0.2 } }
  };

  return (
    <>
      {/* Sidebar (Drawer) with enhanced design */}
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <img src={LogoCSI} alt="CSI Logo" className="h-10" />
            <Button 
              type="text" 
              onClick={closeDrawer}
              icon={<CloseOutlined />} 
              className="border-none text-gray-600"
            />
          </div>
        }
        placement="left"
        closable={false}
        onClose={closeDrawer}
        open={visible}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-4">
          {isAuthenticated && (
            <div className="flex items-center space-x-3 mb-6 p-3 bg-purple-50 rounded-lg">
              <Avatar icon={<UserOutlined />} className="bg-[#90278E]" size="large" />
              <div>
                <div className="font-medium text-[#90278E]">{username}</div>
                <div className="text-xs text-gray-500">นักศึกษา CSI</div>
              </div>
            </div>
          )}
        </div>
        
        <Menu
          mode="inline"
          className="border-none custom-drawer-menu"
          items={[
            {
              key: 'home',
              icon: <HomeOutlined />,
              label: <Link to="/" onClick={closeDrawer}>หน้าแรก</Link>,
            },
            {
              key: 'all-projects',
              icon: <AppstoreOutlined />,
              label: <Link to="/projects/all" onClick={closeDrawer}>ผลงานทั้งหมด</Link>,
            },
            ...(isAuthenticated ? [
              {
                key: 'my-projects',
                icon: <ProjectOutlined />,
                label: <Link to="/projects/my" onClick={closeDrawer}>ผลงานของฉัน</Link>,
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: <Link to="/settings" onClick={closeDrawer}>ตั้งค่าโปรไฟล์</Link>,
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: <span onClick={handleLogout} className="text-red-500">ออกจากระบบ</span>,
                className: 'mt-4 text-red-500',
              }
            ] : [
              {
                key: 'login',
                icon: <UserOutlined />,
                label: <Link to="/login" onClick={closeDrawer}>เข้าสู่ระบบ</Link>,
              }
            ])
          ]}
        />
      </Drawer>

      {/* Navbar Header with animations */}
      <AnimatePresence>
        <motion.div
          variants={navbarVariants}
          initial="visible"
          animate={isVisible ? "visible" : "hidden"}
          className={`fixed top-0 left-0 w-full z-50`}
        >
          <Header
            className={`px-4 md:px-8 flex justify-between items-center h-16 transition-all duration-500 ${isOverlay ? "bg-transparent" : "bg-gradient-to-r from-[#90278E] to-[#1F1F5C] shadow-md"}`}
          >
            {/* Logo with hover animation */}
            <motion.div 
              className="flex items-center"
              variants={logoVariants}
              initial="normal"
              whileHover="hover"
            >
              <Link to="/">
                <img src={LogoCSI} alt="CSI Logo" className="h-10 md:h-12" />
              </Link>
            </motion.div>

            {/* Right Section - Menu & Search */}
            <div className="flex items-center ml-auto space-x-3 md:space-x-6 text-white">
              {/* Search Button (Mobile) / Search Bar (Desktop) */}
              <AnimatePresence>
                {searchExpanded ? (
                  <motion.div
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden"
                  >
                    <Search 
                      placeholder="ค้นหา..." 
                      allowClear 
                      onBlur={() => setSearchExpanded(false)}
                      className="searchbar-custom"
                      autoFocus
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="md:hidden"
                  >
                    <Button 
                      type="text" 
                      icon={<SearchOutlined className="text-white text-xl" />} 
                      onClick={toggleSearch}
                      className="flex items-center justify-center"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Mobile Menu Button */}
              <Button
                type="text"
                className="text-white md:hidden"
                icon={<MenuOutlined className="text-xl" />}
                onClick={showDrawer}
              />

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
                      location.pathname === "/" ? "text-white font-medium" : "text-gray-200"
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
                      location.pathname === "/projects/all" ? "text-white font-medium" : "text-gray-200"
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
                        location.pathname === "/projects/my" ? "text-white font-medium" : "text-gray-200"
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

              {/* Notification Icon (for authenticated users) */}
              {isAuthenticated && (
                <Tooltip title="การแจ้งเตือน">
                  <Badge dot={hasNotifications} offset={[-2, 3]}>
                    <Button 
                      type="text" 
                      icon={<BellOutlined className="text-white text-lg" />} 
                      className="flex items-center justify-center"
                    />
                  </Badge>
                </Tooltip>
              )}

              {/* User Profile / Login Button */}
              {isAuthenticated ? (
                <Dropdown 
                  menu={{ items }} 
                  placement="bottomRight" 
                  arrow={{ pointAtCenter: true }}
                  trigger={['click']}
                >
                  <motion.div
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center cursor-pointer space-x-2 bg-white/10 px-3 py-1.5 rounded-full transition-all hover:bg-white/20"
                  >
                    <Avatar 
                      icon={<UserOutlined />} 
                      size="small" 
                      className="bg-[#1F1F5C]"
                    />
                    <span className="hidden md:inline">{username}</span>
                  </motion.div>
                </Dropdown>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/login" 
                    className="hidden md:flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-all"
                  >
                    <UserOutlined />
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </Header>
        </motion.div>
      </AnimatePresence>

      {/* Spacer for content below the fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;