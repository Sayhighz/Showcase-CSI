import React, { useState, useEffect, useRef } from 'react';
import { Layout, Button, Drawer, Grid, Spin } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import Footer from '../components/common/Footer';
import Breadcrumb from '../components/common/Breadcrumb';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Sidebar from '../components/common/Sidebar';
import { colors } from '../config/themeConfig';

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const { user, admin, isAuthenticated, isLoading, logout } = useAuth();
  const { globalLoading } = useLoading();
  const location = useLocation();
  // removed unused navigate
  const screens = useBreakpoint();
  
  // Use user or admin (backward compatibility)
  const currentUser = user || admin;
  
  // เพิ่ม ref เพื่อป้องกันการ navigate ซ้ำซ้อน
  const hasRedirected = useRef(false);
  // เพิ่ม ref เพื่อติดตามว่าได้ตรวจสอบ auth แล้วหรือยัง
  const authCheckedRef = useRef(false);
  
  const isMobile = !screens.md;

  // removed unused antd tokens

  // กำหนดค่าเริ่มต้นเมื่อ pathname เปลี่ยน
  useEffect(() => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const selectedKey = `/${pathSnippets.slice(0, 2).join('/')}`;
    
    setSelectedKeys([selectedKey]);
    
    if (pathSnippets.length > 0 && !collapsed && !isMobile) {
      setOpenKeys([`/${pathSnippets[0]}`]);
    }
    
    // ปิด drawer เมื่อมีการเปลี่ยนเส้นทาง
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  }, [location.pathname, collapsed, isMobile]);

  // ยกเลิกการ redirect อัตโนมัติใน MainLayout
  // การนำทางตามสิทธิ์จะถูกจัดการโดย ProtectedRoute และ RoleBasedRoute แล้ว
  useEffect(() => {
    if (!isLoading && !authCheckedRef.current) {
      authCheckedRef.current = true;
    }
  }, [isLoading]);

  // รีเซ็ต hasRedirected เมื่อมีการ login สำเร็จ
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, currentUser]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated && !currentUser && authCheckedRef.current) {
    return <LoadingSpinner fullScreen tip="กำลังนำท่านไปยังหน้าเข้าสู่ระบบ..." />;
  }

  // จัดการเมื่อ openKeys เปลี่ยน
  const onOpenChange = keys => {
    setOpenKeys(keys);
  };

  // จัดการเมื่อเลือกเมนู
  const onClick = ({ key }) => {
    setSelectedKeys([key]);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // จัดการการออกจากระบบ
  const handleLogout = async () => {
    hasRedirected.current = false;
    authCheckedRef.current = false;
    await logout();
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-lightBackground via-white to-purple-50">
      {globalLoading && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Spin size="large" tip="กำลังโหลดข้อมูล..." />
        </div>
      )}
      {/* Mobile drawer with enhanced styling */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={toggleMobileDrawer}
          open={mobileDrawerOpen}
          closable={false}
          bodyStyle={{
            padding: 0,
            background: colors.spaceGradient || 'linear-gradient(180deg, #90278E 0%, #6A1B68 100%)',
            overflow: 'hidden'
          }}
          width={256}
          destroyOnClose={false}
          maskClosable={true}
          zIndex={1001}
          className="performance-optimized"
        >
          <Sidebar
            collapsed={false}
            isMobile={true}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            onClick={onClick}
            onLogout={handleLogout}
            admin={currentUser}
          />
        </Drawer>
      )}

      {/* Desktop sidebar with enhanced styling */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={256}
          className="border-r border-primary border-opacity-20 shadow-2xl"
          theme="dark"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: colors.spaceGradient || 'linear-gradient(180deg, #90278E 0%, #6A1B68 100%)',
            zIndex: 1000,
            boxShadow: '4px 0 20px rgba(144, 39, 142, 0.3)'
          }}
        >
          <Sidebar
            collapsed={collapsed}
            isMobile={false}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            onClick={onClick}
            onLogout={handleLogout}
            admin={currentUser}
          />
        </Sider>
      )}

      <Layout className={`transition-all duration-300 ${!isMobile && !collapsed ? "ml-64" : !isMobile && collapsed ? "ml-20" : ""}`}>
        <Content className="mx-4 my-4">
          {/* Enhanced header with better styling */}
          <div className="flex items-center justify-between mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-sm">
            <div className="flex items-center">
              <Button
                type="text"
                icon={isMobile ? (mobileDrawerOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />) : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                onClick={isMobile ? toggleMobileDrawer : toggleCollapsed}
                className="mr-4 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
                style={{
                  fontSize: '16px',
                  width: 44,
                  height: 44,
                  color: colors.primary,
                  borderRadius: '12px',
                  border: `1px solid ${colors.primary}20`,
                }}
              />
              <Breadcrumb />
            </div>
          </div>
          
          {/* Main content area with glass effect */}
          <div className="min-h-[calc(100vh-220px)] transition-all duration-300 relative">
            {/* Subtle background pattern */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl"
              style={{
                backgroundImage: `radial-gradient(circle, ${colors.primary} 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
              }}
            />
            
            {/* Content with enhanced styling */}
            <div className="relative z-10 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/5 shadow-sm">
              <Outlet />
            </div>
          </div>
        </Content>
        
        <Footer />
      </Layout>
    </Layout>
  );
};

export default MainLayout;