// src/components/users/UserDrawer.jsx
import React from 'react';
import { Drawer, Typography, Space, Divider } from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  UserOutlined, 
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import UserForm from './UserForm';

const { Title, Text } = Typography;

/**
 * Component แสดง Drawer สำหรับสร้างหรือแก้ไขข้อมูลผู้ใช้
 * 
 * @param {Object} props
 * @param {boolean} props.visible - สถานะการแสดง Drawer
 * @param {Function} props.onClose - ฟังก์ชันที่จะถูกเรียกเมื่อปิด Drawer
 * @param {Object} props.initialValues - ค่าเริ่มต้นสำหรับฟอร์ม
 * @param {Function} props.onSubmit - ฟังก์ชันที่จะถูกเรียกเมื่อส่งฟอร์ม
 * @param {boolean} props.loading - สถานะกำลังโหลด
 * @param {string} props.mode - โหมดของฟอร์ม ('create' หรือ 'edit')
 * @param {string} props.userRole - บทบาทของผู้ใช้ ('admin' หรือ 'student')
 */
const UserDrawer = ({ 
  visible, 
  onClose, 
  initialValues = {}, 
  onSubmit, 
  loading = false,
  mode = 'create',
  userRole = 'student'
}) => {
  // กำหนดชื่อและไอคอนตามโหมดและบทบาท
  const getTitle = () => {
    if (mode === 'create') {
      return userRole === 'admin' ? 'เพิ่มผู้ดูแลระบบใหม่' : 'เพิ่มนักศึกษาใหม่';
    } else {
      return 'แก้ไขข้อมูลผู้ใช้';
    }
  };

  const getTitleIcon = () => {
    if (mode === 'create') {
      return <UserAddOutlined />;
    } else {
      return <EditOutlined />;
    }
  };

  const getRoleText = () => {
    return userRole === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา';
  };

  const getRoleIcon = () => {
    return userRole === 'admin' 
      ? <SafetyCertificateOutlined className="text-purple-500" /> 
      : <UserOutlined className="text-blue-500" />;
  };

  // จัดการการส่งฟอร์ม
 // ใน UserDrawer.jsx
const handleSubmit = (values, hasImage) => {
    console.log("Values received in UserDrawer:", values);
    console.log("Has image:", hasImage);
    onSubmit(values, hasImage);
  };

  return (
    <Drawer
      title={
        <div className="flex items-center">
          <div 
            className="flex items-center justify-center h-8 w-8 rounded-full mr-3"
            style={{ 
              backgroundColor: userRole === 'admin' ? '#f9f0ff' : '#e6f7ff',
              color: userRole === 'admin' ? '#722ed1' : '#1890ff'
            }}
          >
            {getTitleIcon()}
          </div>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>{getTitle()}</Title>
            {mode === 'create' && (
              <Text type="secondary" className="flex items-center">
                <span className="mr-1">{getRoleIcon()}</span>
                <span>บทบาท: {getRoleText()}</span>
              </Text>
            )}
          </Space>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
      destroyOnClose={true}
      className="user-drawer"
      bodyStyle={{ padding: '24px 24px 84px 24px' }}
      headerStyle={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}
      footer={
        <div style={{ 
          textAlign: 'right', 
          padding: '12px 24px',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -1px 4px rgba(0,0,0,0.05)'
        }}>
          <Text type="secondary">
            {mode === 'create' 
              ? 'กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่' 
              : 'แก้ไขข้อมูลตามที่ต้องการเปลี่ยนแปลง'}
          </Text>
        </div>
      }
    >
      <UserForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        mode={mode}
        userRole={userRole}
      />

      <style jsx global>{`
        .user-drawer .ant-drawer-header-title {
          flex-direction: row;
        }
        .user-drawer .ant-drawer-body {
          overflow-y: auto;
          padding-bottom: 84px !important;
        }
        @media (max-width: 768px) {
          .user-drawer .ant-drawer-content-wrapper {
            width: 100% !important;
          }
        }
      `}</style>
    </Drawer>
  );
};

export default UserDrawer;