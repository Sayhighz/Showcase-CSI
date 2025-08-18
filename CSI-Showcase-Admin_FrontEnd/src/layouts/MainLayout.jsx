import React, { useState, useEffect, useRef } from 'react';
import { Layout, theme, Button, Drawer, Grid } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import Breadcrumb from '../components/common/Breadcrumb';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Sidebar from '../components/common/Sidebar'; // Import the new Sidebar component

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const { user, admin, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  
  // Use user or admin (backward compatibility)
  const currentUser = user || admin;
  
  // เพิ่ม ref เพื่อป้องกันการ navigate ซ้ำซ้อน
  const hasRedirected = useRef(false);
  // เพิ่ม ref เพื่อติดตามว่าได้ตรวจสอบ auth แล้วหรือยัง
  const authCheckedRef = useRef(false);
  
  const isMobile = !screens.md;

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
    <Layout className="min-h-screen">
      {/* ลิ้นชักสำหรับอุปกรณ์มือถือ */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={toggleMobileDrawer}
          open={mobileDrawerOpen}
          closable={false}
          bodyStyle={{ 
            padding: 0, 
            backgroundColor: '#90278E',
            overflow: 'hidden'
          }}
          width={256}
          destroyOnClose={false}
          maskClosable={true}
          zIndex={1001}
        >
          {/* Use the Sidebar component for mobile */}
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

      {/* แถบด้านข้างสำหรับเดสก์ท็อป */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={256}
          className="border-r border-gray-200 border-opacity-10"
          theme="dark"
          style={{ 
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            backgroundColor: '#90278E',
            backgroundImage: 'linear-gradient(180deg, #90278E 0%, #6A1B68 100%)',
            zIndex: 1000
          }}
        >
          {/* Use the Sidebar component for desktop */}
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

      <Layout className={!isMobile && !collapsed ? "ml-64" : !isMobile && collapsed ? "ml-20" : ""}>
        <Content className="mx-4 my-4">
          <div className="flex items-center mb-4">
            {/* ปุ่มสำหรับทั้งอุปกรณ์เดสก์ท็อปและมือถือ */}
            <Button
              type="text"
              icon={isMobile ? (mobileDrawerOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />) : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={isMobile ? toggleMobileDrawer : toggleCollapsed}
              className="mr-4 hover:bg-purple-50 transition-colors duration-200"
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
                color: '#90278E',
                borderRadius: '8px',
              }}
            />
            <Breadcrumb />
          </div>
          
          <div
            className="p-6 min-h-[calc(100vh-200px)] transition-all duration-300"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <Outlet />
          </div>
        </Content>
        
        <Footer />
      </Layout>
    </Layout>
  );
};

export default MainLayout;