import React, { useState } from 'react';
import { Descriptions, Card, Avatar, Typography, Tag, Button, Tabs, Table, Timeline, List, Space, Divider, Modal } from 'antd';
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

const { Title, Text, Paragraph } = Typography;
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
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let text = 'ไม่ระบุ';
        let color = 'default';
        
        if (status === 'pending') {
          text = 'รอตรวจสอบ';
          color = 'warning';
        } else if (status === 'approved') {
          text = 'อนุมัติแล้ว';
          color = 'success';
        } else if (status === 'rejected') {
          text = 'ถูกปฏิเสธ';
          color = 'error';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatThaiDate(date, { dateStyle: 'medium' }),
    },
    {
      title: 'การเข้าชม',
      dataIndex: 'viewsCount',
      key: 'viewsCount',
      render: (views) => (
        <div className="flex items-center">
          <EyeOutlined className="mr-1 text-gray-400" />
          <Text>{views || 0}</Text>
        </div>
      ),
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
    },
    {
      title: 'อุปกรณ์',
      dataIndex: 'device',
      key: 'device',
      render: (device) => device || 'ไม่ทราบ',
    },
    {
      title: 'เบราว์เซอร์',
      dataIndex: 'browser',
      key: 'browser',
      render: (browser) => browser || 'ไม่ทราบ',
    },
  ];

  return (
    <div>
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col items-center md:items-start md:mr-8">
            <Avatar 
              src={user.image ? `/uploads/profiles/${user.image}` : null}
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
                  <Tag color={getStatusColor(user.status)}>{getStatusText(user.status)}</Tag>
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
                  <Text>{user.project_count || 0} โครงงาน</Text>
                </div>
              </Descriptions.Item>
              
              {user.role === 'student' && (
                <>
                  <Descriptions.Item label="รหัสนักศึกษา">
                    <Text>{user.student_id || 'ไม่ระบุ'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="ชั้นปี">
                    <Text>ปี {user.year || 'ไม่ระบุ'}</Text>
                  </Descriptions.Item>
                </>
              )}
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
              <Descriptions.Item label="สถานะ">{getStatusText(user.status)}</Descriptions.Item>
              <Descriptions.Item label="วันที่สร้างบัญชี">{formatThaiDate(user.created_at, { dateStyle: 'full' })}</Descriptions.Item>
              <Descriptions.Item label="การเข้าสู่ระบบล่าสุด">
                {user.last_login ? formatThaiDate(user.last_login, { dateStyle: 'full', timeStyle: 'short' }) : 'ไม่มีข้อมูล'}
              </Descriptions.Item>
              
              {user.role === 'student' && (
                <>
                  <Descriptions.Item label="รหัสนักศึกษา">{user.student_id || 'ไม่ระบุ'}</Descriptions.Item>
                  <Descriptions.Item label="คณะ/ภาควิชา">{user.department || 'ไม่ระบุ'}</Descriptions.Item>
                  <Descriptions.Item label="ชั้นปี">ปี {user.year || 'ไม่ระบุ'}</Descriptions.Item>
                  <Descriptions.Item label="ภาคการศึกษา">{user.semester || 'ไม่ระบุ'}</Descriptions.Item>
                </>
              )}
              
              <Descriptions.Item label="เกี่ยวกับ" span={2}>
                <Paragraph>{user.bio || 'ไม่มีข้อมูล'}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>
        
        <TabPane tab="โครงงาน" key="projects">
          <Card>
            {user.projects && user.projects.length > 0 ? (
              <Table
                columns={projectColumns}
                dataSource={user.projects.map(project => ({ ...project, key: project.id }))}
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <div className="text-center p-8">
                <Text type="secondary">ยังไม่มีโครงงานของผู้ใช้นี้</Text>
              </div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="ประวัติการเข้าสู่ระบบ" key="login_history">
          <Card>
            {user.loginHistory && user.loginHistory.length > 0 ? (
              <Table
                columns={loginHistoryColumns}
                dataSource={user.loginHistory.map((log, index) => ({ ...log, key: log.log_id || index }))}
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <div className="text-center p-8">
                <Text type="secondary">ยังไม่มีประวัติการเข้าสู่ระบบ</Text>
              </div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="กิจกรรม" key="activities">
          <Card>
            {user.activities && user.activities.length > 0 ? (
              <Timeline mode="left" className="p-4">
                {user.activities.map((activity, index) => (
                  <Timeline.Item key={index} label={formatThaiDate(activity.timestamp, { dateStyle: 'medium', timeStyle: 'short' })}>
                    <div>
                      <Text strong>{activity.type_text}</Text>
                      <div className="text-gray-600 mt-1">{activity.description}</div>
                      
                      {activity.project_id && (
                        <div className="mt-2">
                          <Link to={`/projects/${activity.project_id}`} className="text-purple-600">
                            เกี่ยวกับโครงงาน: {activity.project_title}
                          </Link>
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <div className="text-center p-8">
                <Text type="secondary">ยังไม่มีกิจกรรม</Text>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UserDetail;