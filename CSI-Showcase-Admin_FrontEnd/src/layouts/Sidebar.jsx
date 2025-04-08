import React, { useState, useEffect } from "react";
import { Tooltip, Badge, Avatar, Divider, Typography } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  TeamOutlined,
  BookOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';


import LogoCSI from "../assets/Logo_CSI.png";

const { Text, Title } = Typography;

const Sidebar = ({ isMobile, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const { admin, handleLogout } = useAuth();

  // Set initial openKeys based on current path
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments.includes("users")) {
      setOpenKeys(["users"]);
    } else if (pathSegments.includes("projects")) {
      setOpenKeys(["projects"]);
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Current selected menu item
  const selectedKey = location.pathname;

  // Custom menu item component
  const MenuItem = ({ icon, label, badge, path, danger, submenu, isOpen, children }) => {
    const isActive = path === selectedKey;
    const isSubMenuOpen = submenu && openKeys.includes(submenu);
    
    return (
      <div className="px-3 mb-1">
        <div 
          onClick={() => path ? handleNavigation(path) : submenu ? handleSubmenuToggle(submenu) : null}
          className={`
            flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
            ${isActive ? 'bg-purple-50 text-purple-900 shadow-sm' : 'hover:bg-gray-50'}
            ${danger ? 'hover:bg-red-50 hover:text-red-600' : ''}
          `}
        >
          <div className={`${isActive ? 'text-purple-700' : 'text-gray-500'} text-xl`}
               style={{ color: isActive ? '#90278E' : '' }}>
            {icon}
          </div>
          
          {!collapsed && (
            <>
              <span className={`ml-3 flex-grow ${isActive ? 'font-medium' : 'text-gray-700'}`}
                    style={{ color: isActive ? '#90278E' : '' }}>
                {label}
              </span>
              
              {badge && (
                <Badge count={badge} size="small" className="ml-1" style={{ backgroundColor: '#90278E' }} />
              )}
              
              {submenu && (
                <RightOutlined 
                  className={`text-xs transition-transform duration-300 ${isSubMenuOpen ? 'rotate-90' : ''}`} 
                  style={{ color: isActive ? '#90278E' : '#9CA3AF' }}
                />
              )}
            </>
          )}
        </div>
        
        {/* Submenu items */}
        {submenu && isSubMenuOpen && !collapsed && children && (
          <div className="ml-4 mt-1 pl-4 border-l border-gray-200">
            {children.map((item) => (
              <div
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={`
                  flex items-center px-3 py-2 my-1 rounded-lg cursor-pointer
                  ${item.key === selectedKey ? 'bg-purple-50 font-medium' : 'hover:bg-gray-50 text-gray-600'}
                  transition-all duration-200
                `}
                style={{ color: item.key === selectedKey ? '#90278E' : '' }}
              >
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleSubmenuToggle = (key) => {
    setOpenKeys(openKeys.includes(key) ? openKeys.filter(k => k !== key) : [...openKeys, key]);
  };

  // Sidebar width based on collapse state
  const sidebarWidth = collapsed ? 80 : 250;

  // Profile component - shows differently based on collapse state
  const ProfileComponent = () => (
    <div className={`px-3 ${collapsed ? 'flex justify-center' : ''}`}>
      <div className={`
        relative rounded-xl overflow-hidden
        ${collapsed ? 'p-1' : 'p-3 bg-purple-50'}
      `}>
        {collapsed ? (
          <Tooltip title="อาจารย์ ดร.สมชาย - ผู้ดูแลระบบ" placement="right">
            <Avatar 
              src="https://randomuser.me/api/portraits/men/85.jpg"
              size={46} 
              className="border-2 border-white shadow-md"
            />
          </Tooltip>
        ) : (
          <div className="flex items-center">
            <Avatar 
              src="https://randomuser.me/api/portraits/men/85.jpg" 
              size={46}
              className="border-2 border-white shadow-md" 
            />
            <div className="ml-3">
              <Text className="text-gray-800 text-sm font-medium m-0 block">{admin?.username}</Text>
              <Text className="text-gray-500 text-xs m-0 block">{admin?.role == 'admin' ? 'ผู้ดูแลระบบ' : ''}</Text>
            </div>
            {/* <div className="absolute right-2 top-2">
              <Tooltip title="การแจ้งเตือน">
                <Badge dot style={{ backgroundColor: '#90278E' }}>
                  <BellOutlined className="text-gray-500 hover:text-purple-700 cursor-pointer" style={{ color: '#90278E' }} />
                </Badge>
              </Tooltip>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );

  // Logo component - shows differently based on collapse state
  const LogoComponent = () => (
    <div className={`text-center mb-3 p-3 ${collapsed ? 'px-1' : 'px-3'}`}>
      {/* <img 
        src={LogoCSI} 
        alt="Logo" 
        className={`mx-auto transition-all duration-300 ${collapsed ? 'max-w-[50px]' : 'max-w-[140px]'}`} 
      /> */}
      {!collapsed && (
        <div className="flex flex-col items-center justify-center mt-2 bg-purple-50 py-2 rounded-xl">
          <Text className="text-gray-800 text-sm m-0 font-medium">Showcase Management</Text>
          <Text style={{ color: '#90278E' }} className="text-xs">ระบบจัดการผลงานนักศึกษา</Text>
        </div>
      )}
    </div>
  );

  // Menu items array - for defining the structure
  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "แดชบอร์ด",
    },
    {
      key: "projects",
      icon: <FileTextOutlined />,
      label: "จัดการผลงาน",
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "จัดการบัญชี",
      submenu: "users",
      children: [
        {
          key: "/users/student",
          label: "บัญชีนักศึกษา",
        },
        {
          key: "/users/admin",
          label: "บัญชีผู้ดูแลระบบ",
        },
      ]
    },
    {
      key: "/login-info",
      icon: <ClockCircleOutlined />,
      label: "ข้อมูลการเข้าสู่ระบบ",
    },
  ];

  const bottomMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      danger: true,
      onClick: () => handleLogout(),
    }
  ];

  // Add CSS for animations and visual improvements
  useEffect(() => {
    const sidebarStyle = document.createElement('style');
    sidebarStyle.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(-20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .sidebar-animation-enter {
        animation: slideIn 0.3s ease forwards;
      }
      
      /* Custom scrollbar */
      .sidebar-scroll::-webkit-scrollbar {
        width: 5px;
      }
      
      .sidebar-scroll::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
      }
      
      .sidebar-scroll::-webkit-scrollbar-thumb {
        background: rgba(144, 39, 142, 0.3);
        border-radius: 10px;
      }
      
      .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(144, 39, 142, 0.5);
      }
      
      /* White sidebar background */
      .sidebar-white {
        background: #ffffff;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
      }
    `;
    document.head.appendChild(sidebarStyle);

    return () => {
      document.head.removeChild(sidebarStyle);
    };
  }, []);

  // Sidebar content - reused for both mobile and desktop
  const SidebarContent = () => (
    <>
      <LogoComponent />
      
      {/* User Profile */}
      <div className="mb-4">
        <ProfileComponent />
      </div>
      
      {/* Main Menu Items */}
      <div className="mb-3">
        {menuItems.map((item) => (
          <MenuItem 
            key={item.key}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            path={!item.submenu ? item.key : null}
            submenu={item.submenu}
            isOpen={item.submenu && openKeys.includes(item.submenu)}
            children={item.children}
          />
        ))}
      </div>
      
      {/* Divider */}
      <Divider className="my-2 bg-white bg-opacity-20" style={{ margin: '10px 16px' }} />
      
      {/* Bottom Menu Items */}
      <div className="mt-auto">
        {bottomMenuItems.map((item) => (
          <MenuItem 
            key={item.key}
            icon={item.icon}
            label={item.label}
            path={item.key}
            danger={item.danger}
          />
        ))}
      </div>
      
      {/* Collapse Toggle Button */}
      {!isMobile && (
        <div className="mt-3 mb-4 flex justify-center">
          <Tooltip title={collapsed ? "ขยายเมนู" : "ย่อเมนู"} placement="right">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-full transition-all hover:shadow-md"
              style={{ backgroundColor: '#90278E', color: 'white' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </Tooltip>
        </div>
      )}
    </>
  );

  return isMobile ? (
    // Mobile Sidebar (inside Drawer)
    <div className="h-full sidebar-white flex flex-col sidebar-scroll overflow-y-auto shadow-lg">
      <SidebarContent />
    </div>
  ) : (
    // Desktop Sidebar
    <div
      className="h-screen sidebar-white flex flex-col sidebar-scroll overflow-y-auto transition-all duration-300 shadow-md border-r border-gray-100"
      style={{ width: sidebarWidth }}
    >
      <SidebarContent />
    </div>
  );
};

export default Sidebar;