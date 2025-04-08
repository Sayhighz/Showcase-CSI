// src/components/users/UserDetail.jsx
import React from 'react';
import { Card, Descriptions, Button, Space, Divider, Badge, Table, Typography, Row, Col, Avatar } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  ClockCircleOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import UserAvatar from '../common/UserAvatar';
import UserRoleBadge from '../common/UserRoleBadge';
import StatusTag from '../common/StatusTag';
import { formatThaiDate } from '../../utils/dataUtils';

const { Title, Text } = Typography;

/**
 * Component แสดงรายละเอียดผู้ใช้
 * 
 * @param {Object} props
 * @param {Object} props.user - ข้อมูลผู้ใช้
 * @param {Array} props.loginHistory - ประวัติการเข้าสู่ระบบ
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {Function} props.onEdit - ฟังก์ชันสำหรับแก้ไขข้อมูล
 * @param {Function} props.onDelete - ฟังก์ชันสำหรับลบข้อมูล
 */
const UserDetail = ({ 
  user, 
  loginHistory = [], 
  loading = false,
  onEdit,
  onDelete 
}) => {
  if (!user) return null;
  
  // กำหนดคอลัมน์สำหรับแสดงประวัติการเข้าสู่ระบบ
  const loginColumns = [
    {
      title: 'วันเวลา',
      dataIndex: 'login_time',
      key: 'login_time',
      render: (date) => formatThaiDate(date, { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip) => (
        <Badge 
          count={ip} 
          style={{ 
            backgroundColor: '#1890ff', 
            fontWeight: 'normal',
            fontSize: '12px',
            padding: '0 8px'
          }} 
        />
      ),
    },
    {
      title: 'User Agent',
      dataIndex: 'user_agent',
      key: 'user_agent',
      responsive: ['lg'],
      ellipsis: true,
      render: (agent) => (
        <Text ellipsis={{ tooltip: agent }}>
          {agent}
        </Text>
      ),
    },
  ];

  // ฟังก์ชันสร้าง card ข้อมูลต่างๆ
  const renderInfoCard = (icon, title, value, color = '#1890ff') => (
    <Card 
      bordered={false} 
      className="shadow-sm hover:shadow-md transition-shadow duration-300"
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div className="flex items-center">
        <div 
          className="mr-3 p-2 rounded-full" 
          style={{ backgroundColor: `${color}20` }}
        >
          {React.cloneElement(icon, { style: { color, fontSize: '20px' } })}
        </div>
        <div>
          <div className="text-xs text-gray-500">{title}</div>
          <div className="font-medium text-base">{value}</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="user-detail-container space-y-6">
      <Card 
        loading={loading}
        className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Banner */}
        <div 
          className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative"
        >
          <div className="absolute -bottom-16 left-8">
            <Badge 
              count={user.status === 'active' ? 'ออนไลน์' : 'ออฟไลน์'} 
              status={user.status === 'active' ? 'success' : 'default'}
              offset={[-15, 15]}
            >
              <UserAvatar 
                user={user} 
                size={120}
                showTooltip={false}
                showBadge={true}
                className="border-4 border-white shadow-md"
              />
            </Badge>
          </div>
        </div>

        {/* User Info Section */}
        <div className="pt-20 px-6 pb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={3} className="mb-0">{user.full_name}</Title>
              <div className="flex items-center mb-4">
                <UserRoleBadge role={user.role} />
                <Text type="secondary" className="ml-2">@{user.username}</Text>
              </div>

              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="bg-gray-50 p-3 rounded-lg">
                <Descriptions.Item 
                  label={
                    <div className="flex items-center">
                      <UserOutlined className="mr-2 text-blue-500" />
                      <span>ชื่อผู้ใช้</span>
                    </div>
                  }
                >
                  {user.username}
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <div className="flex items-center">
                      <MailOutlined className="mr-2 text-blue-500" />
                      <span>อีเมล</span>
                    </div>
                  }
                >
                  <Text copyable={{ text: user.email }}>{user.email}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <div className="flex items-center">
                      <TeamOutlined className="mr-2 text-blue-500" />
                      <span>บทบาท</span>
                    </div>
                  }
                >
                  <UserRoleBadge role={user.role} />
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <div className="flex items-center">
                      <SafetyCertificateOutlined className="mr-2 text-blue-500" />
                      <span>สถานะ</span>
                    </div>
                  }
                >
                  <StatusTag type="user" status={user.status} />
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <div className="flex items-center">
                      <ClockCircleOutlined className="mr-2 text-blue-500" />
                      <span>วันที่สร้าง</span>
                    </div>
                  }
                  span={2}
                >
                  {formatThaiDate(user.created_at, { dateStyle: 'long' })}
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col xs={24} md={12}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  {renderInfoCard(
                    <ClockCircleOutlined />, 
                    'เข้าระบบล่าสุด', 
                    loginHistory.length > 0 
                      ? formatThaiDate(loginHistory[0].login_time, { dateStyle: 'medium' })
                      : 'ไม่มีข้อมูล', 
                    '#52c41a'
                  )}
                </Col>
                <Col span={12}>
                  {renderInfoCard(
                    <TeamOutlined />, 
                    'จำนวนการเข้าสู่ระบบ', 
                    `${loginHistory.length} ครั้ง`, 
                    '#722ed1'
                  )}
                </Col>
                {user.department && (
                  <Col span={12}>
                    {renderInfoCard(
                      <EnvironmentOutlined />, 
                      'แผนก', 
                      user.department, 
                      '#fa8c16'
                    )}
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <div className="flex justify-end">
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => onEdit(user)}
                className="hover:shadow-md transition-shadow duration-300"
              >
                แก้ไข
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => onDelete(user)}
                className="hover:shadow-md transition-shadow duration-300"
              >
                ลบ
              </Button>
            </Space>
          </div>
        </div>
      </Card>
      
      {loginHistory && loginHistory.length > 0 && (
        <Card 
          title={
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-2 text-blue-500" />
              <span>ประวัติการเข้าสู่ระบบ</span>
            </div>
          } 
          className="shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <Table 
            dataSource={loginHistory} 
            columns={loginColumns}
            rowKey="log_id"
            pagination={{ pageSize: 5 }}
            rowClassName={(record, index) => index % 2 === 0 ? 'bg-gray-50' : ''}
            className="login-history-table"
          />
        </Card>
      )}

      <style jsx global>{`
        .login-history-table .ant-table-thead > tr > th {
          background-color: #f0f5ff;
        }
        .user-detail-container .ant-descriptions-item-label {
          width: 120px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default UserDetail;