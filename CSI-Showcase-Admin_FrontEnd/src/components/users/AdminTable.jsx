import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography, Dropdown } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  UserOutlined, 
  MailOutlined,
  SolutionOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const AdminTable = ({ 
  admins, 
  loading, 
  handleEditAdmin, 
  handleShowDeleteModal 
}) => {
  // Dropdown menu for actions
  const getActionMenu = (admin) => {
    return {
      items: [
        {
          key: 'edit',
          label: 'แก้ไขข้อมูล',
          icon: <EditOutlined />,
          onClick: () => handleEditAdmin(admin)
        },
        {
          key: 'delete',
          label: 'ลบบัญชี',
          icon: <DeleteOutlined style={{ color: 'red' }} />,
          onClick: () => handleShowDeleteModal(admin)
        }
      ]
    };
  };

  // Define table columns
  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <div className="flex flex-col">
          <Text strong>{text}</Text>
          <Text type="secondary" className="text-xs">
            <UserOutlined className="mr-1" />
            {record.username}
          </Text>
        </div>
      ),
    },
    {
      title: 'ติดต่อ',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <div>
          <Text>
            <MailOutlined className="mr-1" />
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: 'ข้อมูลผู้ดูแลระบบ',
      key: 'admin_info',
      render: (_, record) => (
        <div>
          <Text type="secondary" className="block">
            <SolutionOutlined className="mr-1" />
            บทบาท: ผู้ดูแลระบบ
          </Text>
          <Text type="secondary" className="block">
            การจัดการ: {record.project_count || 0} โปรเจค
          </Text>
        </div>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'active' ? 'green' : 'red';
        const text = status === 'active' ? 'ใช้งานอยู่' : 'ระงับการใช้งาน';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'วันที่เข้าระบบ',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => {
        if (!date) return <Text type="secondary">ไม่ระบุ</Text>;
        
        const formattedDate = new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        
        return <Text>{formattedDate}</Text>;
      },
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไขข้อมูล">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditAdmin(record)}
              type="default"
              size="small"
            />
          </Tooltip>
          
          <Dropdown menu={getActionMenu(record)}>
            <Button
              icon={<MoreOutlined />}
              type="default"
              size="small"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={admins}
      rowKey="user_id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: 'ไม่พบข้อมูลผู้ดูแลระบบ' }}
    />
  );
};

export default AdminTable;