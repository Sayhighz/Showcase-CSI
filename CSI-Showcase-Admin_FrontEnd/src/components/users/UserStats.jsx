import React from 'react';
import { Row, Col, Card, Typography, Statistic, Tooltip, Space, Table } from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';
import { 
  UserOutlined, 
  TeamOutlined, 
  CrownOutlined, 
  UserAddOutlined,
  CalendarOutlined,
  ProjectOutlined,
  EyeOutlined
} from '@ant-design/icons';
import StatCard from '../dashboard/StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

// สีสำหรับกราฟวงกลม
const ROLE_COLORS = {
  admin: '#90278E',
  student: '#1890ff',
  visitor: '#52c41a',
};

// คอมโพเนนต์ tooltip ที่กำหนดเอง
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md">
        <p className="font-medium text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center mt-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.fill || entry.color }}
            ></div>
            <span className="text-gray-800">{entry.name}: </span>
            <span className="ml-1 font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const UserStats = ({
  stats,
  loading = false,
  error = null,
  onRefresh,
}) => {
  if (loading) {
    return <LoadingSpinner tip="กำลังโหลดสถิติผู้ใช้..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={onRefresh}
      />
    );
  }

  if (!stats) {
    return (
      <ErrorDisplay
        status="warning"
        title="ไม่พบข้อมูลสถิติ"
        subTitle="ไม่สามารถโหลดข้อมูลสถิติได้"
        onRetry={onRefresh}
      />
    );
  }

  // คอลัมน์สำหรับตารางผู้ใช้ที่เข้าสู่ระบบล่าสุด
  const recentLoginColumns = [
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Link to={`/users/${record.id}`} className="hover:text-purple-700">
          {text}
        </Link>
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let text = role;
        let color = 'default';
        
        if (role === 'admin') {
          text = 'ผู้ดูแลระบบ';
          color = 'purple';
        } else if (role === 'student') {
          text = 'นักศึกษา';
          color = 'blue';
        } else if (role === 'visitor') {
          text = 'ผู้เยี่ยมชม';
          color = 'green';
        }
        
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: 'เวลาเข้าสู่ระบบ',
      dataIndex: 'loginTime',
      key: 'loginTime',
    },
    {
      title: 'ที่อยู่ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
  ];

  // คอลัมน์สำหรับตารางผู้ใช้ที่มีโครงงานมากที่สุด
  const topContributorsColumns = [
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Link to={`/users/${record.id}`} className="hover:text-purple-700">
          {text}
        </Link>
      ),
    },
    {
      title: 'ชื่อ-นามสกุล',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'จำนวนโครงงาน',
      dataIndex: 'projectCount',
      key: 'projectCount',
      render: (count) => (
        <div className="flex items-center">
          <ProjectOutlined className="mr-1 text-gray-500" />
          <Text strong>{count}</Text>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ผู้ใช้ทั้งหมด"
            value={stats.totalUsers}
            icon={<TeamOutlined style={{ fontSize: 24 }} />}
            color="#90278E"
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="นักศึกษา"
            value={stats.usersByRole?.find(r => r.role === 'student')?.count || 0}
            icon={<UserOutlined style={{ fontSize: 24 }} />}
            color="#1890ff"
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ผู้ดูแลระบบ"
            value={stats.usersByRole?.find(r => r.role === 'admin')?.count || 0}
            icon={<CrownOutlined style={{ fontSize: 24 }} />}
            color="#722ed1"
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ผู้สมัครใหม่เดือนนี้"
            value={stats.newUsersThisMonth || 0}
            suffix=""
            icon={<UserAddOutlined style={{ fontSize: 24 }} />}
            color="#52c41a"
            comparison={{
              value: stats.newUsersLastMonth || 0,
              label: 'เดือนที่แล้ว'
            }}
          />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={12}>
          <Card title="ผู้ใช้ตามบทบาท">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.usersByRole}
                    nameKey="role"
                    dataKey="count"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name === 'admin' ? 'ผู้ดูแลระบบ' : name === 'student' ? 'นักศึกษา' : 'ผู้เยี่ยมชม'} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role] || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="การสมัครสมาชิกรายเดือน">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.usersByMonth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar name="จำนวนผู้ใช้" dataKey="count" fill="#90278E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={12}>
          <Card title="การเข้าสู่ระบบล่าสุด">
            <Table
              columns={recentLoginColumns}
              dataSource={stats.recentLogins?.map((login, index) => ({ ...login, key: index }))}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="ผู้ใช้ที่มีโครงงานมากที่สุด">
            <Table
              columns={topContributorsColumns}
              dataSource={stats.topContributors?.map((user, index) => ({ ...user, key: index }))}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserStats;