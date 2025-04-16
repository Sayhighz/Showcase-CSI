// src/pages/accountManagement/Student.jsx
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
  Avatar,
  Progress
} from 'antd';
import { 
  UserAddOutlined, 
  ReloadOutlined, 
  UserOutlined, 
  TeamOutlined,
  UserSwitchOutlined,
  BookOutlined,
  SettingOutlined,
  FilterOutlined,
  PieChartOutlined,
  ReadOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import UserTable from '../../components/users/UserTable';
import UserDrawer from '../../components/users/UserDrawer';
import FilterForm from '../../components/common/FilterForm';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import ConfirmModal from '../../components/common/ConfirmModal';
import ErrorAlert from '../../components/common/ErrorAlert';
import useUser from '../../hooks/useUser';
import useNotification from '../../hooks/useNotification';
import { USER_ROLES } from '../../constants/userConstants';

const { Title, Text, Paragraph } = Typography;

const Student = () => {
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
  } = useUser(USER_ROLES.STUDENT, 'list');
  
  const { showSuccess, showError, showDeleteConfirm } = useNotification();
  
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
// ในไฟล์ที่เรียกใช้ UserForm (เช่น StudentPage หรือ AdminPage)
// แก้ไขฟังก์ชัน handleSubmit ใน Student.jsx
// ใน Student.jsx
// ใน Student.jsx
const handleSubmit = async (values, hasImage) => {
  setActionLoading(true);
  
  try {
    // ตรวจสอบว่าเป็น FormData หรือไม่ และมีข้อมูลหรือไม่
    if (hasImage && values instanceof FormData) {
      console.log("Values is FormData, attempting to create user with image");
      
      try {
        // ใช้ createUser ที่มาจาก useUser hook สำหรับส่งข้อมูลใหม่
        const response = await axiosPost('/users', values); // ส่ง FormData ตรงๆ ไปที่ API
        
        if (response.success) {
          showSuccess('เพิ่มนักศึกษาสำเร็จ');
          closeDrawer();
          refreshUsers();
        } else {
          throw new Error(response.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้');
        }
      } catch (err) {
        console.error('Error creating user with image:', err);
        showError(err.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้พร้อมรูปภาพ');
      }
    } else {
      // กรณีไม่มีการอัปโหลดรูปภาพ ใช้ข้อมูลเดิม
      console.log("Using regular user data without image");
      
      let userData = values;
      if (drawerMode === 'create') {
        userData = {
          ...values,
          role: USER_ROLES.STUDENT
        };
      }
      
      const success = drawerMode === 'create' 
        ? await createUser(userData) 
        : await updateUser(selectedUser.user_id, userData);
      
      if (success) {
        showSuccess(drawerMode === 'create' ? 'เพิ่มนักศึกษาสำเร็จ' : 'แก้ไขข้อมูลนักศึกษาสำเร็จ');
        closeDrawer();
        refreshUsers();
      }
    }
  } catch (err) {
    console.error('User operation error:', err);
    showError(err.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
  } finally {
    setActionLoading(false);
  }
};

  // แสดงโมดัลยืนยันการลบ
  const showDeleteConfirmation = (user) => {
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
        showSuccess('ลบนักศึกษาสำเร็จ');
        setConfirmModalVisible(false);
        setUserToDelete(null);
        refreshUsers();
      }
    } catch (err) {
      showError('เกิดข้อผิดพลาดในการลบนักศึกษา');
      console.error('Delete user error:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  // คำนวณจำนวนนักศึกษาที่ active และ inactive
  const getActiveStudentsCount = () => {
    return users.filter(user => user.status === 'active').length;
  };

  const getInactiveStudentsCount = () => {
    return users.filter(user => user.status === 'inactive').length;
  };

  // คำนวณอัตราส่วนนักศึกษาที่ active
  const getActiveRatio = () => {
    if (users.length === 0) return 0;
    return Math.round((getActiveStudentsCount() / users.length) * 100);
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
      เพิ่มนักศึกษาใหม่
    </Button>
  );

  return (
    <div className="student-page">
      <PageHeader
        title="จัดการบัญชีนักศึกษา"
        subtitle="เพิ่ม แก้ไข และลบบัญชีนักศึกษาในระบบ"
        breadcrumb={[
          { title: 'จัดการบัญชีผู้ใช้', path: '/users' },
          { title: 'นักศึกษา' }
        ]}
        extra={HeaderExtra}
        className="mb-6"
        icon={<ReadOutlined className="text-blue-600" />}
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
                    <Text type="secondary" className="block mb-1">นักศึกษาทั้งหมด</Text>
                    <Title level={2} className="m-0">{users.length}</Title>
                    <Text type="secondary" className="text-sm">คน</Text>
                  </div>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                    <ReadOutlined className="text-blue-500 text-2xl" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
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
                    <Text type="secondary" className="block mb-1">นักศึกษาที่ใช้งานอยู่</Text>
                    <Title level={2} className="m-0">{getActiveStudentsCount()}</Title>
                    <Badge status="success" text="กำลังใช้งาน" className="text-sm" />
                  </div>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <TeamOutlined className="text-green-500 text-2xl" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
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
                <div className="flex justify-between mb-3">
                  <Text type="secondary">สถานะการใช้งานระบบ</Text>
                  <Text strong>{getActiveRatio()}%</Text>
                </div>
                <Progress 
                  percent={getActiveRatio()} 
                  status="active" 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  className="mb-2"
                />
                <Row>
                  <Col span={12}>
                    <div className="flex items-center">
                      <Badge status="success" className="mr-1" />
                      <Text className="text-xs">กำลังใช้งาน: {getActiveStudentsCount()}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center">
                      <Badge status="default" className="mr-1" />
                      <Text className="text-xs">ไม่ได้ใช้งาน: {getInactiveStudentsCount()}</Text>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ตัวกรองข้อมูล */}
      <Card 
        className="mb-6 shadow-md hover:shadow-lg transition-shadow duration-300"
        title={
          <div className="flex items-center">
            <FilterOutlined className="mr-2 text-blue-500" />
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
              icon={<ReadOutlined />} 
              className="mr-3 bg-blue-600"
              size="large"
            />
            <div>
              <Title level={4} className="m-0">รายชื่อนักศึกษาทั้งหมด</Title>
              <Text type="secondary" className="text-sm">
                แสดงข้อมูลนักศึกษาทั้งหมด {users.length} รายการ
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
            <Tooltip title="เพิ่มนักศึกษา">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => showDrawer('create')}
                className="hover:shadow-sm transition-shadow"
              >
                เพิ่มนักศึกษา
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
            role={USER_ROLES.STUDENT}
          />
        ) : (
          <EmptyState
            type="user"
            message="ไม่พบข้อมูลนักศึกษา"
            description="ไม่พบข้อมูลนักศึกษาในระบบ หรือไม่มีข้อมูลที่ตรงกับการค้นหา"
            onAction={() => showDrawer('create')}
            actionText="เพิ่มนักศึกษาใหม่"
            icon={<ReadOutlined className="text-5xl text-blue-500" />}
            className="p-8"
          />
        )}
      </Card>

      {/* คำแนะนำสำหรับการจัดการนักศึกษา */}
      <Card 
        className="mt-6 shadow-md"
        title={
          <div className="flex items-center">
            <BookOutlined className="mr-2 text-blue-500" />
            <span>คำแนะนำการจัดการบัญชีนักศึกษา</span>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Alert
              message="การเพิ่มนักศึกษารายบุคคล"
              description="คุณสามารถเพิ่มบัญชีนักศึกษาทีละคนโดยกดปุ่ม 'เพิ่มนักศึกษาใหม่' และกรอกข้อมูลให้ครบถ้วน"
              type="info"
              showIcon
            />
          </Col>
          <Col xs={24} md={12}>
            <Alert
              message="การนำเข้าข้อมูลจำนวนมาก"
              description="หากต้องการเพิ่มนักศึกษาจำนวนมาก สามารถใช้ฟังก์ชันนำเข้าข้อมูลจากไฟล์ Excel หรือ CSV ได้"
              type="success"
              showIcon
            />
          </Col>
        </Row>
      </Card>

      {/* Drawer สำหรับสร้าง/แก้ไขข้อมูล */}
      <UserDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        initialValues={selectedUser || {}}
        onSubmit={handleSubmit}
        loading={actionLoading}
        mode={drawerMode}
        userRole={USER_ROLES.STUDENT}
      />
      
      {/* โมดัลยืนยันการลบ */}
      <ConfirmModal
        visible={confirmModalVisible}
        onCancel={() => {
          setConfirmModalVisible(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
        title="ยืนยันการลบนักศึกษา"
        content={userToDelete ? 
          <div>
            <p className="mb-4">คุณต้องการลบนักศึกษาต่อไปนี้ใช่หรือไม่?</p>
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
        .student-page .ant-card {
          border-radius: 8px;
          overflow: hidden;
        }
        .student-page .ant-card-head {
          border-bottom: 1px solid #f0f0f0;
          min-height: 48px;
        }
        .student-page .ant-card-head-title {
          padding: 12px 0;
        }
        .student-page .ant-statistic-title {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
        }
        .student-page .ant-statistic-content {
          font-size: 24px;
          font-weight: 600;
        }
        
        /* แอนิเมชันและเอฟเฟกต์เมื่อ hover */
        .student-page .ant-card {
          transition: all 0.3s ease;
        }
        .student-page .ant-btn {
          transition: all 0.3s ease;
        }
        .student-page .ant-btn:hover {
          transform: translateY(-2px);
        }
        
        /* ปรับแต่ง Progress Bar */
        .student-page .ant-progress-inner {
          background-color: #f5f5f5;
        }
        .student-page .ant-progress-bg {
          transition: all 0.5s ease;
        }
      `}</style>
    </div>
  );
};

export default Student;