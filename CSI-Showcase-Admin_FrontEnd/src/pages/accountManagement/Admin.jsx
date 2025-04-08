// src/pages/accountManagement/Admin.jsx
import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Space, 
  Modal, 
  message, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Tooltip, 
  Badge, 
  Divider, 
  Tag,
  Alert,
  Avatar
} from 'antd';
import { 
  UserAddOutlined, 
  ReloadOutlined, 
  SafetyCertificateOutlined, 
  TeamOutlined,
  UserSwitchOutlined,
  WarningOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import UserTable from '../../components/users/UserTable';
import UserDrawer from '../../components/users/UserDrawer';
import FilterForm from '../../components/common/FilterForm';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import ConfirmModal from '../../components/common/ConfirmModal';
import ErrorAlert from '../../components/common/ErrorAlert';
import DataCard from '../../components/common/DataCard';
import useUser from '../../hooks/useUser';
import useNotification from '../../hooks/useNotification';
import { USER_ROLES } from '../../constants/userConstants';

const { Title, Text, Paragraph } = Typography;

const Admin = () => {
  // นำเข้า hooks ที่จำเป็น
  const { 
    users, 
    loading, 
    error, 
    pagination, 
    filters, 
    handleFilterChange, 
    resetFilters, 
    handlePaginationChange,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  } = useUser(USER_ROLES.ADMIN, 'list');
  
  const { showSuccess, showError, showDeleteConfirm, showWarning } = useNotification();
  
  // สถานะสำหรับการจัดการฟอร์มและโมดัล
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // แสดง/ซ่อน drawer และกำหนดโหมด
  const showDrawer = (mode = 'create', user = null) => {
    setDrawerMode(mode);
    setSelectedUser(user);
    setDrawerVisible(true);
  };
  
  // ซ่อน drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedUser(null);
  };
  
  // จัดการการสร้างหรือแก้ไขผู้ใช้
  const handleSubmit = async (values) => {
    setActionLoading(true);
    
    try {
      let success = false;
      
      if (drawerMode === 'create') {
        // สร้างผู้ใช้ใหม่
        success = await createUser({
          ...values,
          role: USER_ROLES.ADMIN
        });
        
        if (success) {
          showSuccess('เพิ่มผู้ดูแลระบบสำเร็จ');
          closeDrawer();
          refreshUsers();
        }
      } else {
        // แก้ไขผู้ใช้
        success = await updateUser(selectedUser.user_id, values);
        
        if (success) {
          showSuccess('แก้ไขข้อมูลผู้ดูแลระบบสำเร็จ');
          closeDrawer();
          refreshUsers();
        }
      }
    } catch (err) {
      showError('เกิดข้อผิดพลาดในการดำเนินการ');
      console.error('User operation error:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  // แสดงโมดัลยืนยันการลบ
  const showDeleteConfirmation = (user) => {
    if (user.user_id === 1) {
      showWarning('ไม่สามารถลบผู้ดูแลระบบหลักได้');
      return;
    }
    
    setUserToDelete(user);
    setConfirmModalVisible(true);
  };
  
  // จัดการการลบผู้ใช้
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setActionLoading(true);
    
    try {
      const success = await deleteUser(userToDelete.user_id);
      
      if (success) {
        showSuccess('ลบผู้ดูแลระบบสำเร็จ');
        setConfirmModalVisible(false);
        setUserToDelete(null);
        refreshUsers();
      }
    } catch (err) {
      showError('เกิดข้อผิดพลาดในการลบผู้ดูแลระบบ');
      console.error('Delete user error:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  // คำนวณจำนวนผู้ดูแลที่ active และ inactive
  const getActiveAdminsCount = () => {
    return users.filter(user => user.status === 'active').length;
  };

  const getInactiveAdminsCount = () => {
    return users.filter(user => user.status === 'inactive').length;
  };
  
  // Extra content สำหรับ PageHeader
  const HeaderExtra = (
    <Button
      type="primary"
      icon={<UserAddOutlined />}
      onClick={() => showDrawer('create')}
      className="shadow-md hover:shadow-lg transition-shadow"
      size="large"
    >
      เพิ่มผู้ดูแลระบบใหม่
    </Button>
  );

  return (
    <div className="admin-page">
      <PageHeader
        title="จัดการบัญชีผู้ดูแลระบบ"
        subtitle="เพิ่ม แก้ไข และลบบัญชีผู้ดูแลระบบ"
        breadcrumb={[
          { title: 'จัดการบัญชีผู้ใช้', path: '/users' },
          { title: 'ผู้ดูแลระบบ' }
        ]}
        extra={HeaderExtra}
        className="mb-6"
        icon={<SafetyCertificateOutlined className="text-purple-600" />}
      />
      
      {/* ข้อมูลสรุป */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card 
            className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300" 
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="block mb-1">ผู้ดูแลระบบทั้งหมด</Text>
                    <Title level={2} className="m-0">{users.length}</Title>
                    <Text type="secondary" className="text-sm">คน</Text>
                  </div>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100">
                    <SafetyCertificateOutlined className="text-purple-500 text-2xl" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card 
            className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300" 
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="block mb-1">ผู้ดูแลที่ใช้งานอยู่</Text>
                    <Title level={2} className="m-0">{getActiveAdminsCount()}</Title>
                    <Badge status="success" text="กำลังใช้งาน" className="text-sm" />
                  </div>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <TeamOutlined className="text-green-500 text-2xl" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-cyan-500"></div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card 
            className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300" 
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="block mb-1">ผู้ดูแลที่ไม่ได้ใช้งาน</Text>
                    <Title level={2} className="m-0">{getInactiveAdminsCount()}</Title>
                    <Badge status="default" text="ไม่ได้ใช้งาน" className="text-sm" />
                  </div>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                    <UserSwitchOutlined className="text-gray-500 text-2xl" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ตัวกรองข้อมูล */}
      <Card 
        className="mb-6 shadow-md hover:shadow-lg transition-shadow duration-300"
        title={
          <div className="flex items-center">
            <SettingOutlined className="mr-2 text-blue-500" />
            <span>ค้นหาและกรองข้อมูล</span>
          </div>
        }
      >
        <FilterForm
          type="user"
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          filters={filters}
          className="user-filter-form"
        />
      </Card>

      {/* แสดงข้อผิดพลาด (ถ้ามี) */}
      {error && (
        <ErrorAlert
          message="เกิดข้อผิดพลาดในการโหลดข้อมูล"
          description={error}
          onRetry={refreshUsers}
          className="mb-6 shadow-md"
        />
      )}

      {/* แสดงตารางข้อมูล */}
      <Card 
        className="shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <Avatar 
              icon={<SafetyCertificateOutlined />} 
              className="mr-3 bg-purple-600"
              size="large"
            />
            <div>
              <Title level={4} className="m-0">รายชื่อผู้ดูแลระบบทั้งหมด</Title>
              <Text type="secondary" className="text-sm">
                แสดงข้อมูลผู้ดูแลระบบทั้งหมด {users.length} รายการ
              </Text>
            </div>
          </div>
          <div className="flex space-x-2">
            <Tooltip title="โหลดข้อมูลใหม่">
              <Button
                icon={<ReloadOutlined />}
                onClick={refreshUsers}
                loading={loading}
                className="hover:shadow-sm transition-shadow"
              >
                รีเฟรช
              </Button>
            </Tooltip>
            <Tooltip title="เพิ่มผู้ดูแลระบบ">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => showDrawer('create')}
                className="hover:shadow-sm transition-shadow"
              >
                เพิ่มผู้ดูแล
              </Button>
            </Tooltip>
          </div>
        </div>

        <Divider style={{ margin: '0 0 16px 0' }} />

        {loading && users.length === 0 ? (
          <LoadingState type="table" count={5} columns={5} />
        ) : users.length > 0 ? (
          <UserTable
            users={users}
            loading={loading}
            pagination={pagination}
            onChange={handlePaginationChange}
            onView={() => {}} // ถ้ามีหน้าแสดงรายละเอียด
            onEdit={(user) => showDrawer('edit', user)}
            onDelete={showDeleteConfirmation}
            role={USER_ROLES.ADMIN}
          />
        ) : (
          <EmptyState
            type="user"
            message="ไม่พบข้อมูลผู้ดูแลระบบ"
            description="ไม่พบข้อมูลผู้ดูแลระบบ หรือไม่มีข้อมูลที่ตรงกับการค้นหา"
            onAction={() => showDrawer('create')}
            actionText="เพิ่มผู้ดูแลระบบใหม่"
            icon={<SafetyCertificateOutlined className="text-5xl text-purple-500" />}
            className="p-8"
          />
        )}
      </Card>

      {/* คำแนะนำสำหรับผู้ดูแลระบบ */}
      <Card 
        className="mt-6 shadow-md"
        title={
          <div className="flex items-center">
            <WarningOutlined className="mr-2 text-yellow-500" />
            <span>คำแนะนำสำหรับผู้ดูแลระบบ</span>
          </div>
        }
      >
        <Paragraph className="mb-4">
          การเพิ่มผู้ดูแลระบบควรทำด้วยความระมัดระวัง เนื่องจากผู้ดูแลระบบมีสิทธิ์ในการจัดการข้อมูลและผู้ใช้ในระบบทั้งหมด
        </Paragraph>
        <Alert
          message="ไม่สามารถลบผู้ดูแลระบบหลัก (รหัส 1) ได้"
          type="warning"
          showIcon
        />
      </Card>

      {/* Drawer สำหรับสร้าง/แก้ไขข้อมูล */}
      <UserDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        initialValues={selectedUser || {}}
        onSubmit={handleSubmit}
        loading={actionLoading}
        mode={drawerMode}
        userRole={USER_ROLES.ADMIN}
      />
      
      {/* โมดัลยืนยันการลบ */}
      <ConfirmModal
        visible={confirmModalVisible}
        onCancel={() => {
          setConfirmModalVisible(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
        title="ยืนยันการลบผู้ดูแลระบบ"
        content={userToDelete ? 
          <div>
            <p className="mb-4">คุณต้องการลบผู้ดูแลระบบต่อไปนี้ใช่หรือไม่?</p>
            <div className="flex items-center p-3 mb-4 border border-gray-200 rounded-lg bg-gray-50">
              <Avatar 
                src={userToDelete.image} 
                icon={!userToDelete.image && <UserOutlined />} 
                size="large" 
                className="mr-3" 
              />
              <div>
                <div className="font-medium">{userToDelete.full_name}</div>
                <div className="text-gray-500 text-sm">@{userToDelete.username}</div>
              </div>
            </div>
            <Alert 
              message="การกระทำนี้ไม่สามารถเรียกคืนได้" 
              type="error" 
              showIcon 
            />
          </div> : ''}
        type="delete"
        loading={actionLoading}
        okButtonProps={{ danger: true }}
      />
      
      <style jsx global>{`
        .admin-page .ant-card {
          border-radius: 8px;
          overflow: hidden;
        }
        .admin-page .ant-card-head {
          border-bottom: 1px solid #f0f0f0;
          min-height: 48px;
        }
        .admin-page .ant-card-head-title {
          padding: 12px 0;
        }
        .admin-page .ant-statistic-title {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
        }
        .admin-page .ant-statistic-content {
          font-size: 24px;
          font-weight: 600;
        }
        
        /* แอนิเมชันและเอฟเฟกต์เมื่อ hover */
        .admin-page .ant-card {
          transition: all 0.3s ease;
        }
        .admin-page .ant-btn {
          transition: all 0.3s ease;
        }
        .admin-page .ant-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Admin;