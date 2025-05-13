import React from 'react';
import { Row, Col, Card, Typography, Table } from 'antd';
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
  ProjectOutlined
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

// แปลงรูปแบบเวลาให้เป็นรูปแบบที่อ่านง่ายขึ้น
const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// แปลงรูปแบบเดือนให้เป็นรูปแบบที่อ่านง่ายขึ้น
const formatMonth = (monthStr) => {
  if (!monthStr) return '-';
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleString('th-TH', { month: 'long', year: 'numeric' });
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

  // Added safeguard against null or undefined stats
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
  
  // Ensure all required properties exist with default values
  const safeStats = {
    totalUsers: stats.totalUsers || 0,
    usersByRole: stats.usersByRole || [],
    newUsersThisMonth: (stats.usersByMonth && stats.usersByMonth.length > 0) 
      ? stats.usersByMonth[stats.usersByMonth.length - 1].count 
      : 0,
    newUsersLastMonth: (stats.usersByMonth && stats.usersByMonth.length > 1) 
      ? stats.usersByMonth[stats.usersByMonth.length - 2].count 
      : 0,
    usersByMonth: stats.usersByMonth || [],
    recentLogins: stats.recentLogins || [],
    topContributors: stats.topContributors || []
  };

  // เตรียมข้อมูลสำหรับกราฟวงกลม
  const pieChartData = safeStats.usersByRole.map(item => ({
    ...item,
    name: item.role === 'admin' 
      ? 'ผู้ดูแลระบบ' 
      : item.role === 'student' 
        ? 'นักศึกษา' 
        : 'ผู้เยี่ยมชม'
  }));

  // เตรียมข้อมูลสำหรับกราฟแท่ง
  const barChartData = safeStats.usersByMonth.map(item => ({
    ...item,
    name: formatMonth(item.month)
  }));

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
      title: 'ชื่อ-นามสกุล',
      dataIndex: 'fullName',
      key: 'fullName',
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
      render: (time) => formatDateTime(time)
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
            value={safeStats.totalUsers}
            icon={<TeamOutlined style={{ fontSize: 24 }} />}
            color="#90278E"
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="นักศึกษา"
            value={safeStats.usersByRole?.find(r => r.role === 'student')?.count || 0}
            icon={<UserOutlined style={{ fontSize: 24 }} />}
            color="#1890ff"
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ผู้ดูแลระบบ"
            value={safeStats.usersByRole?.find(r => r.role === 'admin')?.count || 0}
            icon={<CrownOutlined style={{ fontSize: 24 }} />}
            color="#722ed1"
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ผู้สมัครใหม่เดือนนี้"
            value={safeStats.newUsersThisMonth}
            suffix=""
            icon={<UserAddOutlined style={{ fontSize: 24 }} />}
            color="#52c41a"
            comparison={{
              value: safeStats.newUsersLastMonth,
              label: 'เดือนที่แล้ว'
            }}
          />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={12}>
          <Card title="ผู้ใช้ตามบทบาท">
            <div style={{ height: 300 }}>
              {pieChartData && pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      nameKey="name"
                      dataKey="count"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role] || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Text type="secondary">ไม่มีข้อมูลผู้ใช้ตามบทบาท</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="การสมัครสมาชิกรายเดือน">
            <div style={{ height: 300 }}>
              {barChartData && barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar name="จำนวนผู้ใช้" dataKey="count" fill="#90278E" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Text type="secondary">ไม่มีข้อมูลการสมัครสมาชิกรายเดือน</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={12}>
          <Card title="การเข้าสู่ระบบล่าสุด">
            {safeStats.recentLogins && safeStats.recentLogins.length > 0 ? (
              <Table
                columns={recentLoginColumns}
                dataSource={safeStats.recentLogins.map((login, index) => ({ ...login, key: index }))}
                pagination={false}
                size="small"
              />
            ) : (
              <div className="p-4 text-center">
                <Text type="secondary">ไม่มีข้อมูลการเข้าสู่ระบบล่าสุด</Text>
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="ผู้ใช้ที่มีโครงงานมากที่สุด">
            {safeStats.topContributors && safeStats.topContributors.length > 0 ? (
              <Table
                columns={topContributorsColumns}
                dataSource={safeStats.topContributors.map((user, index) => ({ ...user, key: index }))}
                pagination={false}
                size="small"
              />
            ) : (
              <div className="p-4 text-center">
                <Text type="secondary">ไม่มีข้อมูลผู้ใช้ที่มีโครงงานมากที่สุด</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserStats;