import React, { useState } from 'react';
import { Table, Tag, Button, Avatar, Typography, Space, Dropdown, Menu, Modal, Tooltip } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  EyeOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import SearchBar from '../common/SearchBar';
import EmptyState from '../common/EmptyState';
import ErrorDisplay from '../common/ErrorDisplay';

const { Text, Title } = Typography;
const { confirm } = Modal;

const UserList = ({
  users = [],
  loading = false,
  error = null,
  role = 'all',
  pagination = {},
  onPageChange,
  onDelete,
  onSearch,
  onAddUser,
  searchQuery = '',
  searchLoading = false,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // คำแปลบทบาท
  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'ผู้ดูแลระบบ';
      case 'student':
        return 'นักศึกษา';
      case 'visitor':
        return 'ผู้เยี่ยมชม';
      default:
        return role;
    }
  };

  // สีของแท็กตามบทบาท
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'student':
        return 'blue';
      case 'visitor':
        return 'green';
      default:
        return 'default';
    }
  };

  // คำแปลสถานะ
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'ใช้งาน';
      case 'inactive':
        return 'ไม่ได้ใช้งาน';
      case 'suspended':
        return 'ถูกระงับ';
      default:
        return status;
    }
  };

  // สีของแท็กตามสถานะ
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // แสดงกล่องยืนยันการลบ
  const showDeleteConfirm = (userId, username) => {
    confirm({
      title: 'ยืนยันการลบผู้ใช้',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>คุณแน่ใจหรือไม่ที่ต้องการลบผู้ใช้ <Text strong>{username}</Text>?</p>
          <p>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        </div>
      ),
      okText: 'ใช่, ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk() {
        if (onDelete) {
          onDelete(userId);
        }
      },
    });
  };

  // คอลัมน์สำหรับตาราง
  const columns = [
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.image ? `/uploads/profiles/${record.image}` : null}
            icon={!record.image && <UserOutlined />}
            size="large"
            className="mr-3"
            style={{ 
              backgroundColor: !record.image ? '#90278E' : undefined,
            }}
          />
          <div>
            <Link to={`/users/${record.user_id}`} className="font-medium hover:text-purple-700">
              {text}
            </Link>
            <div className="text-gray-500 text-sm mt-1">{record.full_name}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
      render: (email) => <Text className="text-gray-600">{email}</Text>,
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>{getRoleText(role)}</Tag>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      responsive: ['md'],
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'created_at',
      key: 'created_at',
      responsive: ['lg'],
      render: (date) => formatThaiDate(date, { dateStyle: 'medium' }),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EyeOutlined />}>
                <Link to={`/users/${record.user_id}`}>ดูรายละเอียด</Link>
              </Menu.Item>
              <Menu.Item key="edit" icon={<EditOutlined />}>
                <Link to={`/users/${record.user_id}/edit`}>แก้ไข</Link>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                icon={<DeleteOutlined />} 
                danger
                onClick={() => showDeleteConfirm(record.user_id, record.username)}
              >
                ลบ
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // ตั้งค่าการเลือกแถว
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // แสดงข้อความเมื่อไม่มีข้อมูล
  const renderEmptyState = () => {
    if (searchQuery) {
      return (
        <EmptyState
          description="ไม่พบผู้ใช้ที่ตรงกับการค้นหา"
          type="search"
          showAction={true}
          onAction={() => onSearch('')}
          actionText="ล้างการค้นหา"
        />
      );
    }

    let message = 'ยังไม่มีผู้ใช้ในระบบ';
    if (role === 'admin') {
      message = 'ยังไม่มีผู้ดูแลระบบ';
    } else if (role === 'student') {
      message = 'ยังไม่มีนักศึกษา';
    }

    return (
      <EmptyState
        description={message}
        showAction={!!onAddUser}
        onAction={onAddUser}
        actionText="เพิ่มผู้ใช้ใหม่"
        actionIcon={<PlusOutlined />}
      />
    );
  };

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => onSearch(searchQuery)}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <Title level={5} className="mb-4 md:mb-0">
          {role === 'all' && 'ผู้ใช้ทั้งหมด'}
          {role === 'admin' && 'ผู้ดูแลระบบทั้งหมด'}
          {role === 'student' && 'นักศึกษาทั้งหมด'}
        </Title>
        
        <div className="flex flex-col md:flex-row w-full md:w-auto space-y-2 md:space-y-0 md:space-x-2">
          <SearchBar
            placeholder="ค้นหาผู้ใช้..."
            onSearch={onSearch}
            value={searchQuery}
            loading={searchLoading}
            allowClear
            className="w-full md:w-auto"
            width="100%"
          />
          
          {onAddUser && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onAddUser}
              className="mt-2 md:mt-0"
            >
              เพิ่มผู้ใช้
            </Button>
          )}
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={users.map(user => ({ ...user, key: user.user_id }))}
        pagination={pagination}
        onChange={onPageChange}
        loading={loading}
        locale={{
          emptyText: renderEmptyState()
        }}
        scroll={{ x: 'max-content' }}
      />

      {selectedRowKeys.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md border-t border-gray-200 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <Text>{selectedRowKeys.length} รายการที่เลือก</Text>
            <Space>
              <Button onClick={() => setSelectedRowKeys([])}>ยกเลิกการเลือก</Button>
              <Button 
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  confirm({
                    title: `ยืนยันการลบผู้ใช้ ${selectedRowKeys.length} คน`,
                    icon: <ExclamationCircleOutlined />,
                    content: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้',
                    okText: 'ใช่, ลบ',
                    okType: 'danger',
                    cancelText: 'ยกเลิก',
                    onOk() {
                      // TODO: ลบผู้ใช้หลายคน
                      setSelectedRowKeys([]);
                    },
                  });
                }}
              >
                ลบที่เลือก
              </Button>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;