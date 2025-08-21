import React from 'react';
import { Menu, Avatar, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  EyeOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  PlusOutlined,
  FolderOutlined
} from '@ant-design/icons';
import './Sidebar.css'
import { URL } from '../../constants/apiEndpoints';

const { Text } = Typography;

// Define menu items based on user role
const getMenuItems = (userRole) => {
  // Admin-specific project items (no personal projects)
  const adminProjectItems = [];

  if (userRole === 'student') {
    // Student menu items - includes dashboard, upload, projects, and analytics
    return [
      {
        key: '/student/dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/student/dashboard">แดชบอร์ด</Link>,
      },
      {
        key: '/projects/upload',
        icon: <PlusOutlined />,
        label: <Link to="/projects/upload">อัปโหลดผลงาน</Link>,
      },
      {
        key: '/projects/my-projects',
        icon: <FolderOutlined />,
        label: <Link to="/projects/my-projects">ผลงานของฉัน</Link>,
      },
      {
        key: '/student/analytics',
        icon: <BarChartOutlined />,
        label: <Link to="/student/analytics">สถิติของฉัน</Link>,
      },
    ];
  } else {
    // Admin menu items (default)
    return [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">แดชบอร์ด</Link>,
      },
      {
        key: '/projects',
        icon: <ProjectOutlined />,
        label: 'จัดการผลงาน',
        children: [
          {
            key: '/projects/all',
            label: <Link to="/projects">ผลงานทั้งหมด</Link>,
          },
          {
            key: '/projects/pending',
            label: <Link to="/projects/pending">รอการอนุมัติ</Link>,
            icon: <ClockCircleOutlined style={{ fontSize: '12px' }} />,
          },
          ...adminProjectItems,
          {
            key: '/projects/stats',
            label: <Link to="/projects/stats">สถิติผลงาน</Link>,
            icon: <BarChartOutlined style={{ fontSize: '12px' }} />,
          },
        ],
      },
      {
        key: '/users',
        icon: <TeamOutlined />,
        label: 'จัดการผู้ใช้',
        children: [
          {
            key: '/users/all',
            label: <Link to="/users">ผู้ใช้ทั้งหมด</Link>,
          },
          {
            key: '/users/students',
            label: <Link to="/users/students">นักศึกษา</Link>,
          },
          {
            key: '/users/admins',
            label: <Link to="/users/admins">ผู้ดูแลระบบ</Link>,
          },
          {
            key: '/users/stats',
            label: <Link to="/users/stats">สถิติผู้ใช้</Link>,
            icon: <BarChartOutlined style={{ fontSize: '12px' }} />,
          },
        ],
      },
      {
        key: '/logs',
        icon: <FileTextOutlined />,
        label: 'รายงานระบบ',
        children: [
          {
            key: '/logs/login',
            label: <Link to="/logs/login">การเข้าสู่ระบบ</Link>,
            icon: <AuditOutlined style={{ fontSize: '12px' }} />,
          },
          {
            key: '/logs/visitor-views',
            label: <Link to="/logs/visitor-views">การเข้าชม</Link>,
            icon: <EyeOutlined style={{ fontSize: '12px' }} />,
          },
          {
            key: '/logs/reviews',
            label: <Link to="/logs/reviews">การตรวจสอบ</Link>,
            icon: <CheckCircleOutlined style={{ fontSize: '12px' }} />,
          },
          {
            key: '/logs/system-stats',
            label: <Link to="/logs/system-stats">สถิติระบบ</Link>,
            icon: <BarChartOutlined style={{ fontSize: '12px' }} />,
          },
        ],
      },
    ];
  }
};

/**
 * Sidebar component for both desktop and mobile views
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.collapsed - Whether sidebar is collapsed (desktop mode)
 * @param {boolean} props.isMobile - Whether current view is mobile
 * @param {Array} props.selectedKeys - Currently selected menu keys
 * @param {Array} props.openKeys - Currently open submenu keys
 * @param {Function} props.onOpenChange - Callback when open keys change
 * @param {Function} props.onClick - Callback when menu item is clicked
 * @param {Function} props.onLogout - Callback for logout action
 * @param {Object} props.admin - Admin user object
 */
const Sidebar = ({
  collapsed,
  isMobile,
  selectedKeys,
  openKeys,
  onOpenChange,
  onClick,
  onLogout,
  admin
}) => {
    // console.log(admin)
  return (
    <>
      {/* User avatar and information */}
      <div className={`${collapsed ? 'py-4' : 'py-5'} flex items-center ${collapsed ? 'justify-center' : 'px-4'}`}>
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar 
              size={40} 
              src={admin?.avatar ? `${URL}/${admin.avatar}` : null}
              icon={!admin?.avatar && <UserOutlined />}
              style={{ 
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            />
          </div>
        ) : (
          <div className="flex items-center w-full bg-white bg-opacity-10 p-3 rounded-lg">
            <Avatar 
              size={45} 
              src={admin?.avatar ? `${URL}/${admin.avatar}` : null}
              icon={!admin?.avatar && <UserOutlined />}
              style={{ 
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'  
              }}
            />
            <div className="ml-3 overflow-hidden">
              <Text strong className="text-white block truncate">
                {admin?.full_name || admin?.username || (admin?.role === 'student' ? 'นักศึกษา' : 'ผู้ดูแลระบบ')}
              </Text>
              <Text className="text-white text-opacity-70 text-xs block">
                {admin?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
              </Text>
            </div>
          </div>
        )}
      </div>
      
      {/* Menu section */}
      <Menu
        theme="dark"
        mode="inline"
        openKeys={!collapsed ? openKeys : []}
        selectedKeys={selectedKeys}
        onOpenChange={onOpenChange}
        onClick={onClick}
        items={getMenuItems(admin?.role)}
        style={{ 
          background: 'transparent',
          borderRight: 'none',
        }}
        className="custom-sidebar-menu"
      />
      
      {/* Logout button section */}
      <div className="logout-section" style={{ 
        position: isMobile ? 'relative' : 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: collapsed ? '16px 8px' : '16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        marginTop: isMobile ? '20px' : '0'
      }}>
        {collapsed ? (
          <Button 
            type="text" 
            icon={<LogoutOutlined style={{ color: '#fff' }} />} 
            onClick={onLogout}
            className="w-full flex justify-center hover:bg-white hover:bg-opacity-10 transition-all duration-300"
            style={{ color: '#fff' }}
          />
        ) : (
          <Button 
            type="text" 
            icon={<LogoutOutlined style={{ color: '#fff' }} />} 
            onClick={onLogout}
            className="w-full flex items-center justify-start hover:bg-white hover:bg-opacity-10 transition-all duration-300"
            style={{ color: '#fff' }}
          >
            <span>ออกจากระบบ</span>
          </Button>
        )}
      </div>
    </>
  );
};

export default Sidebar;