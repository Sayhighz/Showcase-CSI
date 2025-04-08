import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Drawer, Button, Badge, Avatar, Tooltip } from "antd";
import { MenuOutlined, BellOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import Sidebar from "./Sidebar";

const MasterLayout = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close drawer when window resizes to desktop size
  useEffect(() => {
    if (windowWidth >= 768) {
      setMobileDrawerOpen(false);
    }
  }, [windowWidth]);

  // Determine if we're in mobile view
  const isMobileView = windowWidth < 768;

  // Header Component with Mobile Menu Button
  const Header = () => (
    <div className="bg-white p-3 border-b flex items-center justify-between shadow-sm">
      {isMobileView && (
        <Button 
          icon={<MenuOutlined />} 
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center justify-center"
          style={{ color: '#90278E' }}
          type="text"
        />
      )}
      
      <div className="flex-grow flex justify-center md:justify-start">
        {isMobileView && (
          <h1 className="text-lg m-0 font-medium" style={{ color: '#90278E' }}>
            ระบบจัดการผลงานนักศึกษา
          </h1>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* <Tooltip title="การแจ้งเตือน">
          <Badge count={3} size="small" style={{ backgroundColor: '#90278E' }}>
            <Button icon={<BellOutlined />} type="text" />
          </Badge>
        </Tooltip> */}
        
        {/* <Avatar 
          src="https://randomuser.me/api/portraits/men/85.jpg" 
          size="small"
          className="cursor-pointer" 
        /> */}
      </div>
    </div>
  );

  // Page Content Wrapper
  const PageContent = () => (
    <div className="p-4 md:p-6 flex-grow bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page fade-in animation */}
        <div className="animate-fadeIn">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );

  // Footer Component
  const Footer = () => (
    <div className="bg-white p-3 text-center text-xs border-t">
      <p style={{ color: '#90278E' }}>© {new Date().getFullYear()} College of Sustainable Innovation. All rights reserved.</p>
    </div>
  );

  // Add animations to global CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
      
      /* Custom drawer styles */
      .sidebar-drawer .ant-drawer-body {
        padding: 0;
      }
      
      .sidebar-drawer .ant-drawer-content {
        background-color: transparent;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - hidden on mobile */}
      {!isMobileView && <Sidebar />}
      
      {/* Mobile Sidebar Drawer */}
      {isMobileView && (
        <Drawer
          placement="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          width={280}
          closable={false}
          className="sidebar-drawer"
          bodyStyle={{ padding: 0 }}
        >
          <Sidebar isMobile={true} onClose={() => setMobileDrawerOpen(false)} />
        </Drawer>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col flex-grow overflow-hidden">
        <Header />
        <PageContent />
        <Footer />
      </div>
    </div>
  );
};

export default MasterLayout;