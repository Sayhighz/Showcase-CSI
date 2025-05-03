import React, { useState, useEffect } from 'react';
import { Layout, theme, Button, Drawer, Grid } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import Breadcrumb from '../components/common/Breadcrumb';
import LoadingSpinner from '../components/common/LoadingSpinner';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { admin, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  
  const isMobile = !screens.md;

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // 自動關閉抽屜當路由變化
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  }, [location.pathname]);

  // 檢查用戶是否已驗證
  useEffect(() => {
    if (!loading && !admin) {
      navigate('/login');
    }
  }, [admin, loading, navigate]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // 處理登出
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // 側邊欄
  const sidebarComponent = (
    <Sidebar collapsed={collapsed} onBreakpoint={broken => setCollapsed(broken)} />
  );

  return (
    <Layout className="min-h-screen">
      {/* 移動設備抽屜 */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={toggleMobileDrawer}
          open={mobileDrawerOpen}
          closable={false}
          bodyStyle={{ padding: 0, backgroundColor: '#050114' }}
          width={256}
        >
          {sidebarComponent}
        </Drawer>
      )}

      {/* 桌面側邊欄 */}
      {!isMobile && (
        <Layout.Sider
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
            backgroundColor: '#050114',
            backgroundImage: 'linear-gradient(180deg, #050114 0%, #10033A 100%)'
          }}
        >
          {sidebarComponent}
        </Layout.Sider>
      )}

      <Layout className={!isMobile && !collapsed ? "ml-64" : !isMobile && collapsed ? "ml-20" : ""}>
        <Header 
          onMenuClick={isMobile ? toggleMobileDrawer : toggleCollapsed} 
          collapsed={collapsed}
          onLogout={handleLogout}
          admin={admin}
        />
        
        <Content className="mx-4 my-4">
          <div className="flex items-center mb-4">
            {!isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleCollapsed}
                className="mr-4 text-2xl"
                style={{
                  fontSize: '16px',
                  width: 40,
                  height: 40,
                  color: '#90278E',
                }}
              />
            )}
            <Breadcrumb />
          </div>
          
          <div
            className="p-6 min-h-[calc(100vh-200px)]"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
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