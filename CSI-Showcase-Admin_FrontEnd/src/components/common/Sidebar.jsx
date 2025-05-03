import React, { useState, useEffect } from 'react';
import { Menu, Typography, Layout } from 'antd';
import { 
  DashboardOutlined, 
  ProjectOutlined, 
  TeamOutlined, 
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  EyeOutlined,
  AuditOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Text } = Typography;
const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);

  // กำหนดค่าเริ่มต้นเมื่อ pathname เปลี่ยน
  useEffect(() => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const selectedKey = `/${pathSnippets.slice(0, 2).join('/')}`;
    
    setSelectedKeys([selectedKey]);
    
    if (pathSnippets.length > 0) {
      setOpenKeys([`/${pathSnippets[0]}`]);
    }
  }, [location.pathname]);

  // จัดการเมื่อ openKeys เปลี่ยน
  const onOpenChange = keys => {
    setOpenKeys(keys);
  };

  // จัดการเมื่อเลือกเมนู
  const onClick = ({ key }) => {
    setSelectedKeys([key]);
  };

  // รายการเมนู
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">แดชบอร์ด</Link>,
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'จัดการโครงงาน',
      children: [
        {
          key: '/projects/all',
          label: <Link to="/projects">โครงงานทั้งหมด</Link>,
        },
        {
          key: '/projects/pending',
          label: <Link to="/projects/pending">รอการอนุมัติ</Link>,
          icon: <ClockCircleOutlined style={{ fontSize: '12px' }} />,
        },
        {
          key: '/projects/stats',
          label: <Link to="/projects/stats">สถิติโครงงาน</Link>,
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
      label: 'บันทึกระบบ',
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

  return (
    <>
      <div className={`${collapsed ? 'p-4' : 'p-6'} flex items-center justify-center`}>
        <Link to="/dashboard">
          {collapsed ? (
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white">
              <img src="/images/logo-icon.png" alt="CSI Logo" className="h-6" />
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white mr-2">
                <img src="/images/logo-icon.png" alt="CSI Logo" className="h-6" />
              </div>
              <div>
                <Text strong className="text-white text-lg">CSI</Text>
                <Text className="text-white text-xs block">Showcase Admin</Text>
              </div>
            </div>
          )}
        </Link>
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        openKeys={openKeys}
        selectedKeys={selectedKeys}
        onOpenChange={onOpenChange}
        onClick={onClick}
        items={menuItems}
        style={{ 
          background: 'transparent',
          borderRight: 'none',
        }}
      />
    </>
  );
};

export default Sidebar;