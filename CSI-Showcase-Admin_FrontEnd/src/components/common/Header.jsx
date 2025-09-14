import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Badge, Typography, Space, Empty } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import useNotification from '../../hooks/useNotification';
import { URL } from '../../constants/apiEndpoints';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ collapsed, onMenuClick, onLogout, admin }) => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification(admin?.role);

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
      style={{ width: 350, maxHeight: 450, overflowY: 'auto' }}
      onClick={({ key, domEvent }) => {
        domEvent.stopPropagation();
        
        if (key === 'mark-all-read') {
          markAllAsRead();
        } else if (key.startsWith('delete-')) {
          const notificationId = parseInt(key.replace('delete-', ''));
          deleteNotification(notificationId);
        } else if (key !== 'header' && key !== 'empty' && !key.startsWith('notification-')) {
          markAsRead(parseInt(key));
        }
      }}
    >
      <Menu.Item key="header" disabled className="text-center font-semibold border-b bg-gray-50">
        <div className="py-2">
          <Text strong>การแจ้งเตือน</Text>
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" className="ml-2" />
          )}
        </div>
      </Menu.Item>
      
      {notifications.length > 0 ? (
        <>
          {notifications.map(notification => (
            <Menu.Item
              key={`notification-${notification.id}`}
              className={`${notification.read ? 'opacity-60' : 'font-medium'} py-2 hover:bg-gray-50`}
              style={{ whiteSpace: 'normal', height: 'auto', lineHeight: '1.4' }}
            >
              <div className="flex items-start justify-between group">
                <div className="flex items-start flex-1" onClick={() => markAsRead(notification.id)}>
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                    notification.read ? 'bg-gray-300' :
                    notification.priority === 'high' ? 'bg-red-500' :
                    notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString('th-TH')}
                    </div>
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                />
              </div>
            </Menu.Item>
          ))}
          
          {unreadCount > 0 && (
            <>
              <Menu.Divider />
              <Menu.Item key="mark-all-read" className="text-center text-purple-600 hover:bg-purple-50">
                <Button type="link" className="text-purple-600">
                  ทำเครื่องหมายอ่านทั้งหมด
                </Button>
              </Menu.Item>
            </>
          )}
        </>
      ) : (
        <Menu.Item key="empty" disabled className="text-center py-6">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="ไม่มีการแจ้งเตือน"
            style={{ margin: 0 }}
          />
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
              <span className="text-xl font-semibold text-gray-700">CSI ProjectManage</span>
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
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined />}
                loading={loading}
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
                src={admin?.image ? `${URL}/${admin.image}${admin?.imageVersion ? `?v=${admin.imageVersion}` : ''}` : null}
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