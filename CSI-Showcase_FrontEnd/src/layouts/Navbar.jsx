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
  DownOutlined,
  BookOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

// Suppress eslint warning for motion usage in JSX
// eslint-disable-next-line no-unused-vars
const _motion = motion;
import LogoCSI from "../assets/Logo_CSI.png";
import LogoSIT from "../assets/Logo_SIT.png";

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [visible, setVisible] = useState(false);
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
            {
              key: "project-types",
              icon: <ProjectOutlined />,
              label: "ประเภทผลงาน",
              children: [
                {
                  key: "coursework",
                  icon: <TeamOutlined />,
                  label: (
                    <Link to="/projects/coursework" onClick={closeDrawer}>
                      งานในชั้นเรียน
                    </Link>
                  ),
                },
                {
                  key: "academic",
                  icon: <BookOutlined />,
                  label: (
                    <Link to="/projects/academic" onClick={closeDrawer}>
                      ผลงานวิชาการ
                    </Link>
                  ),
                },
                {
                  key: "competition",
                  icon: <TrophyOutlined />,
                  label: (
                    <Link to="/projects/competition" onClick={closeDrawer}>
                      ผลงานการแข่งขัน
                    </Link>
                  ),
                },
              ],
            },
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
            {/* Left Section - Logos Only */}
            <div className="flex items-center space-x-3">
              {/* SIT Logo */}
              <motion.div
                className="flex items-center"
                variants={logoVariants}
                initial="normal"
                whileHover="hover"
              >
                <Link to="/">
                  <img src={LogoSIT} alt="SIT Logo" className="h-6 sm:h-7 md:h-8" />
                </Link>
              </motion.div>
              
              {/* CSI Logo */}
              <motion.div
                className="flex items-center"
                variants={logoVariants}
                initial="normal"
                whileHover="hover"
              >
                <Link to="/">
                  <img src={LogoCSI} alt="CSI Logo" className="h-6 sm:h-7 md:h-8" />
                </Link>
              </motion.div>
            </div>

            {/* Right Section - Navigation & Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6">
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

                {/* Project Types Dropdown */}
                <motion.div
                  variants={linkVariants}
                  whileHover="hover"
                  className="relative"
                >
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'coursework',
                          icon: <TeamOutlined className="text-[#90278E]" />,
                          label: (
                            <Link
                              to="/projects/coursework"
                              className="text-gray-700 hover:text-[#90278E] block w-full"
                            >
                              งานในชั้นเรียน
                            </Link>
                          ),
                        },
                        {
                          key: 'academic',
                          icon: <BookOutlined className="text-[#90278E]" />,
                          label: (
                            <Link
                              to="/projects/academic"
                              className="text-gray-700 hover:text-[#90278E] block w-full"
                            >
                              ผลงานวิชาการ
                            </Link>
                          ),
                        },
                        {
                          key: 'competition',
                          icon: <TrophyOutlined className="text-[#90278E]" />,
                          label: (
                            <Link
                              to="/projects/competition"
                              className="text-gray-700 hover:text-[#90278E] block w-full"
                            >
                              ผลงานการแข่งขัน
                            </Link>
                          ),
                        },
                      ],
                    }}
                    placement="bottom"
                    trigger={['hover']}
                    dropdownRender={(menu) => (
                      <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden py-1">
                        {menu}
                      </div>
                    )}
                  >
                    <span className={`hover:text-white transition-colors cursor-pointer flex items-center space-x-1 ${
                      ['/projects/academic', '/projects/coursework', '/projects/competition'].includes(location.pathname)
                        ? "text-white font-medium"
                        : "text-[#FFE6FF]"
                    }`}>
                      <span>ประเภทผลงาน</span>
                      <DownOutlined className="text-xs" />
                    </span>
                  </Dropdown>
                  {['/projects/academic', '/projects/coursework', '/projects/competition'].includes(location.pathname) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white rounded-full"
                      layoutId="navIndicator"
                    />
                  )}
                </motion.div>
              </div>
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