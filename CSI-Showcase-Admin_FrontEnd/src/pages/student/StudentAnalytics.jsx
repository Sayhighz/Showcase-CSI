// src/pages/student/StudentAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Select, 
  DatePicker, 
  Space, 
  Typography, 
  Spin,
  Alert,
  Tag,
  Progress,
  Empty
} from 'antd';
import {
  ProjectOutlined,
  EyeOutlined,
  LikeOutlined,
  TrophyOutlined,
  BarChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import useProject from '../../hooks/useProject';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// สีสำหรับ charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StudentAnalytics = () => {
  const { user } = useAuth();
  const { 
    projects, 
    loading, 
    error, 
    fetchMyProjects
  } = useProject('my-projects');

  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  
  const [selectedProject, setSelectedProject] = useState('all');
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalLikes: 0,
    avgRating: 0,
    projectsCount: 0,
    viewsOverTime: [],
    projectsByStatus: [],
    projectsByType: []
  });

  // โหลดข้อมูลโปรเจคของนักศึกษา
  useEffect(() => {
    if (user?.id) {
      fetchMyProjects(user.id, { limit: 100 });
    }
  }, [user, fetchMyProjects]);

  // คำนวณข้อมูลสถิติ
  useEffect(() => {
    if (projects?.length > 0) {
      const filteredProjects = selectedProject === 'all' 
        ? projects 
        : projects.filter(p => p.id === selectedProject);

      // คำนวณสถิติพื้นฐาน
      const totalViews = filteredProjects.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalLikes = filteredProjects.reduce((sum, p) => sum + (p.likes || 0), 0);
      const avgRating = filteredProjects.length > 0 
        ? filteredProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / filteredProjects.length 
        : 0;

      // จำแนกตามสถานะ
      const statusCounts = {
        approved: filteredProjects.filter(p => p.status === 'approved').length,
        pending: filteredProjects.filter(p => p.status === 'pending').length,
        rejected: filteredProjects.filter(p => p.status === 'rejected').length
      };

      const projectsByStatus = [
        { name: 'อนุมัติแล้ว', value: statusCounts.approved, color: '#52c41a' },
        { name: 'รอการอนุมัติ', value: statusCounts.pending, color: '#fa8c16' },
        { name: 'ถูกปฏิเสธ', value: statusCounts.rejected, color: '#ff4d4f' }
      ].filter(item => item.value > 0);

      // จำแนกตามประเภท
      const typeCounts = {};
      filteredProjects.forEach(p => {
        const type = p.type || 'อื่นๆ';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const projectsByType = Object.entries(typeCounts).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));

      // สร้างข้อมูลการเข้าชมตามเวลา (จำลอง)
      const viewsOverTime = Array.from({ length: 30 }, (_, i) => {
        const date = dayjs().subtract(29 - i, 'day');
        return {
          date: date.format('DD/MM'),
          views: Math.floor(Math.random() * (totalViews / 10)) + 1,
          likes: Math.floor(Math.random() * (totalLikes / 10)) + 1
        };
      });

      setAnalytics({
        totalViews,
        totalLikes,
        avgRating: Math.round(avgRating * 10) / 10,
        projectsCount: filteredProjects.length,
        viewsOverTime,
        projectsByStatus,
        projectsByType
      });
    }
  }, [projects, selectedProject]);

  // Columns สำหรับตารางโปรเจค
  const projectColumns = [
    {
      title: 'ชื่อโปรเจค',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" size="small">{record.description}</Text>
        </Space>
      )
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'รอการอนุมัติ' },
          approved: { color: 'green', text: 'อนุมัติแล้ว' },
          rejected: { color: 'red', text: 'ถูกปฏิเสธ' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'การเข้าชม',
      dataIndex: 'views',
      key: 'views',
      render: (views) => <Text>{views || 0} ครั้ง</Text>,
      sorter: (a, b) => (a.views || 0) - (b.views || 0)
    },
    {
      title: 'การถูกใจ',
      dataIndex: 'likes',
      key: 'likes',
      render: (likes) => <Text>{likes || 0} ครั้ง</Text>,
      sorter: (a, b) => (a.likes || 0) - (b.likes || 0)
    },
    {
      title: 'คะแนน',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <Text>{rating || 0}/5</Text>
          <Progress 
            percent={(rating || 0) * 20} 
            size="small" 
            showInfo={false} 
            strokeColor="#faad14"
          />
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="กำลังโหลดข้อมูลสถิติ..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        message="เกิดข้อผิดพลาด" 
        description={error} 
        type="error" 
        showIcon 
      />
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Empty
        description="ยังไม่มีโปรเจคสำหรับแสดงสถิติ"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BarChartOutlined /> สถิติและการวิเคราะห์
        </Title>
        <Text type="secondary">
          ข้อมูลสถิติการเข้าชมและประสิทธิภาพของโปรเจคของคุณ
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Space>
            <CalendarOutlined />
            <Text>ช่วงเวลา:</Text>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Space>
          <Space>
            <ProjectOutlined />
            <Text>โปรเจค:</Text>
            <Select
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ width: 200 }}
              placeholder="เลือกโปรเจค"
            >
              <Select.Option value="all">ทั้งหมด</Select.Option>
              {projects.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.title}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Space>
      </Card>

      {/* Statistics Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="จำนวนโปรเจค"
              value={analytics.projectsCount}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="การเข้าชมรวม"
              value={analytics.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="การถูกใจรวม"
              value={analytics.totalLikes}
              prefix={<LikeOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="คะแนนเฉลี่ย"
              value={analytics.avgRating}
              prefix={<TrophyOutlined />}
              suffix="/5"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* Views Over Time */}
        <Col xs={24} lg={16}>
          <Card title="แนวโน้มการเข้าชมและการถูกใจ">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#1890ff" 
                  name="การเข้าชม"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="#52c41a" 
                  name="การถูกใจ"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Projects by Status */}
        <Col xs={24} lg={8}>
          <Card title="สถานะโปรเจค">
            {analytics.projectsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.projectsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="ไม่มีข้อมูล" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Project Details Table */}
      <Card title="รายละเอียดโปรเจค">
        <Table
          columns={projectColumns}
          dataSource={projects}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `ทั้งหมด ${total} โปรเจค`
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default StudentAnalytics;