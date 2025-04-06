import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography, Dropdown } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  UserOutlined, 
  MailOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const StudentTable = ({ 
  students, 
  loading, 
  handleEditStudent, 
  handleShowDeleteModal 
}) => {
    const safeStudents = Array.isArray(students) ? students : [];
    console.log(students)

  // Dropdown menu for actions
  const getActionMenu = (student) => {
    return {
      items: [
        {
          key: 'edit',
          label: 'แก้ไขข้อมูล',
          icon: <EditOutlined />,
          onClick: () => handleEditStudent(student)
        },
        {
          key: 'delete',
          label: 'ลบบัญชี',
          icon: <DeleteOutlined style={{ color: 'red' }} />,
          onClick: () => handleShowDeleteModal(student)
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
      title: 'ข้อมูลนักศึกษา',
      key: 'student_info',
      render: (_, record) => (
        <div>
          <Text type="secondary" className="block">
            โปรเจค: {record.project_count || 0} ผลงาน
          </Text>
        </div>
      ),
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
              onClick={() => handleEditStudent(record)}
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
      dataSource={safeStudents}
      rowKey="user_id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: 'ไม่พบข้อมูลนักศึกษา' }}
    />
  );
};

export default StudentTable;