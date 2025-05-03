import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Badge, Typography, Space } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ collapsed, onMenuClick, onLogout, admin }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'มีโปรเจคใหม่รอการอนุมัติ', read: false },
    { id: 2, message: 'มีผู้ใช้งานใหม่ลงทะเบียน', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // เมนูแสดงข้อมูลผู้ใช้
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">โปรไฟล์</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">ตั้งค่า</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        ออกจากระบบ
      </Menu.Item>
    </Menu>
  );

  // เมนูแสดงการแจ้งเตือน
  const notificationMenu = (
    <Menu 
      style={{ width: 300 }}
      onClick={({ key }) => {
        const updatedNotifications = notifications.map(n => 
          n.id === parseInt(key) ? { ...n, read: true } : n
        );
        setNotifications(updatedNotifications);
      }}
    >
      {notifications.length > 0 ? (
        <>
          {notifications.map(notification => (
            <Menu.Item key={notification.id} className={notification.read ? '' : 'font-bold'}>
              {notification.message}
            </Menu.Item>
          ))}
          <Menu.Divider />
          <Menu.Item key="all">
            <div className="text-center text-purple-600">ดูการแจ้งเตือนทั้งหมด</div>
          </Menu.Item>
        </>
      ) : (
        <Menu.Item key="none" disabled>
          ไม่มีการแจ้งเตือน
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <AntHeader 
      className="flex items-center justify-between px-4 sticky top-0 z-10"
      style={{ 
        background: '#FFFFFF', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', 
        height: 64, 
        padding: '0 24px' 
      }}
    >
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onMenuClick}
          className="mr-4 text-2xl"
          style={{
            fontSize: '16px',
            width: 40,
            height: 40,
            color: '#90278E',
          }}
        />
        
        <div className="ml-4 hidden md:block">
          <Link to="/dashboard">
            <div className="flex items-center">
              <img src="/images/csi-logo.png" alt="CSI Logo" className="h-8 mr-2" />
              <span className="text-xl font-semibold text-gray-700">CSI Showcase Admin</span>
            </div>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center">
        <Space size="large">
          <Dropdown 
            overlay={notificationMenu} 
            trigger={['click']} 
            placement="bottomRight"
            arrow
          >
            <Badge count={unreadCount} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                style={{ 
                  fontSize: '16px',
                  color: '#90278E' 
                }} 
              />
            </Badge>
          </Dropdown>
          
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight" arrow>
            <div className="flex items-center cursor-pointer">
              <Avatar 
                size="default" 
                src={admin?.image ? `/uploads/profiles/${admin.image}` : null}
                icon={!admin?.image && <UserOutlined />}
                style={{ 
                  backgroundColor: !admin?.image ? '#90278E' : undefined,
                  marginRight: '8px' 
                }} 
              />
              <div className="hidden md:block">
                <Text strong style={{ marginRight: '4px' }}>
                  {admin?.fullName || 'ผู้ดูแลระบบ'}
                </Text>
                <Text type="secondary" className="text-xs block">
                  {admin?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;