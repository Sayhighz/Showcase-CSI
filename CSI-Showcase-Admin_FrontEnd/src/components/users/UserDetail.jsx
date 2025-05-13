import React, { useState } from 'react';
import { Descriptions, Card, Avatar, Typography, Tag, Button, Tabs, Table, Space, Divider, Modal } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  ProjectOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import { URL } from '../../constants/apiEndpoints';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const UserDetail = ({
  user,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState('info');

  if (loading) {
    return <LoadingSpinner tip="กำลังโหลดข้อมูลผู้ใช้..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={onRefresh}
      />
    );
  }

  if (!user) {
    return (
      <ErrorDisplay
        status="404"
        title="ไม่พบผู้ใช้"
        subTitle="ไม่พบข้อมูลผู้ใช้ที่คุณต้องการดู"
        onRetry={onRefresh}
      />
    );
  }

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
  const showDeleteConfirm = () => {
    confirm({
      title: 'ยืนยันการลบผู้ใช้',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>คุณแน่ใจหรือไม่ที่ต้องการลบผู้ใช้ <Text strong>{user.username}</Text>?</p>
          <p>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        </div>
      ),
      okText: 'ใช่, ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk() {
        if (onDelete) {
          onDelete(user.user_id);
        }
      },
    });
  };

  // คอลัมน์สำหรับตารางโครงงาน
  const projectColumns = [
    {
      title: 'ชื่อโครงงาน',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/projects/${record.id}`} className="hover:text-purple-700">
          {text}
        </Link>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        let text = 'ไม่ระบุ';
        let color = 'default';
        
        if (category === 'coursework') {
          text = 'ผลงานการเรียน';
          color = 'green';
        } else if (category === 'academic') {
          text = 'บทความวิชาการ';
          color = 'blue';
        } else if (category === 'competition') {
          text = 'การแข่งขัน';
          color = 'gold';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'ระดับ',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'ปีการศึกษา',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Link to={`/projects/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} />
          </Link>
        </Space>
      ),
    },
  ];

  // คอลัมน์สำหรับตารางประวัติการเข้าสู่ระบบ
  const loginHistoryColumns = [
    {
      title: 'เวลาเข้าสู่ระบบ',
      dataIndex: 'login_time',
      key: 'login_time',
      render: (time) => formatThaiDate(time, { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      title: 'ที่อยู่ IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
    }
  ];

  // ตรวจสอบว่ามีแท็บที่ควรแสดงหรือไม่
  const hasProjects = user.projects && user.projects.length > 0;
  const hasLoginHistory = user.loginHistory && user.loginHistory.length > 0;

  return (
    <div>
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col items-center md:items-start md:mr-8">
            <Avatar 
              src={user.image ? `${URL}/${user.image}` : null}
              icon={!user.image && <UserOutlined />}
              size={120}
              style={{ 
                backgroundColor: !user.image ? '#90278E' : undefined,
              }}
              className="mb-4"
            />
            
            <Space direction="vertical" className="w-full mb-4 md:mb-0">
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => onEdit && onEdit(user.user_id)}
                block
              >
                แก้ไขข้อมูล
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={showDeleteConfirm}
                block
              >
                ลบผู้ใช้
              </Button>
            </Space>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <Title level={3} className="mb-1">{user.username}</Title>
                <Text type="secondary" className="text-lg">{user.full_name}</Text>
              </div>
              
              <div className="mt-2 md:mt-0">
                <Space>
                  <Tag color={getRoleColor(user.role)}>{getRoleText(user.role)}</Tag>
                  {user.status && (
                    <Tag color={getStatusColor(user.status)}>{getStatusText(user.status)}</Tag>
                  )}
                </Space>
              </div>
            </div>
            
            <Divider className="my-3" />
            
            <Descriptions layout="vertical" column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="อีเมล">
                <div className="flex items-center">
                  <MailOutlined className="mr-2 text-gray-500" />
                  <Text>{user.email}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="วันที่สร้างบัญชี">
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2 text-gray-500" />
                  <Text>{formatThaiDate(user.created_at, { dateStyle: 'full' })}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="จำนวนโครงงาน">
                <div className="flex items-center">
                  <ProjectOutlined className="mr-2 text-gray-500" />
                  <Text>{user.projects ? user.projects.length : 0} โครงงาน</Text>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="ข้อมูลผู้ใช้" key="info">
          <Card>
            <Descriptions layout="vertical" column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="ชื่อผู้ใช้">{user.username}</Descriptions.Item>
              <Descriptions.Item label="ชื่อ-นามสกุล">{user.full_name}</Descriptions.Item>
              <Descriptions.Item label="อีเมล">{user.email}</Descriptions.Item>
              <Descriptions.Item label="บทบาท">{getRoleText(user.role)}</Descriptions.Item>
              {user.status && (
                <Descriptions.Item label="สถานะ">{getStatusText(user.status)}</Descriptions.Item>
              )}
              <Descriptions.Item label="วันที่สร้างบัญชี">{formatThaiDate(user.created_at, { dateStyle: 'full' })}</Descriptions.Item>
              {user.last_login && (
                <Descriptions.Item label="การเข้าสู่ระบบล่าสุด">
                  {formatThaiDate(user.last_login, { dateStyle: 'full', timeStyle: 'short' })}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </TabPane>
        
        {hasProjects && (
          <TabPane tab="โครงงาน" key="projects">
            <Card>
              <Table
                columns={projectColumns}
                dataSource={user.projects.map(project => ({ ...project, key: project.id }))}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
        )}
        
        {hasLoginHistory && (
          <TabPane tab="ประวัติการเข้าสู่ระบบ" key="login_history">
            <Card>
              <Table
                columns={loginHistoryColumns}
                dataSource={user.loginHistory.map((log, index) => ({ ...log, key: log.log_id || index }))}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default UserDetail;