// src/pages/student/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Button, 
  List, 
  Tag, 
  Space, 
  Typography, 
  Empty,
  Spin,
  Alert
} from 'antd';
import {
  UploadOutlined,
  ProjectOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useProject from '../../hooks/useProject';

const { Title, Text } = Typography;

const StudentDashboard = () => {
  const { user } = useAuth();
  const {
    projects,
    loading,
    error,
    fetchMyProjects
  } = useProject('my-projects');

  const [stats, setStats] = useState({
    totalProjects: 0,
    approvedProjects: 0,
    pendingProjects: 0,
    rejectedProjects: 0,
    totalViews: 0
  });

  // Helper to read views from different payload shapes
  const getProjectViews = (p) => {
    if (!p) return 0;
    const v = (p.views ?? p.views_count ?? p.viewsCount ?? p.statistics?.views);
    return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
  };

  // โหลดข้อมูลโปรเจคของนักศึกษา
  useEffect(() => {
    if (user?.id) {
      fetchMyProjects(user.id, { limit: 10 });
    }
  }, [user, fetchMyProjects]);

  // คำนวณสถิติจากข้อมูลโปรเจค
  useEffect(() => {
    if (projects?.length > 0) {
      const totalProjects = projects.length;
      const approvedProjects = projects.filter(p => p.status === 'approved').length;
      const pendingProjects = projects.filter(p => p.status === 'pending').length;
      const rejectedProjects = projects.filter(p => p.status === 'rejected').length;
      const totalViews = projects.reduce((sum, p) => sum + getProjectViews(p), 0);

      setStats({
        totalProjects,
        approvedProjects,
        pendingProjects,
        rejectedProjects,
        totalViews
      });
    }
  }, [projects]);

  // ฟังก์ชันสำหรับแสดงสถานะ
  const renderStatus = (status) => {
    const statusConfig = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'รอการอนุมัติ' },
      approved: { color: 'green', icon: <CheckCircleOutlined />, text: 'อนุมัติแล้ว' },
      rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'ถูกปฏิเสธ' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="กำลังโหลดข้อมูล..." />
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

  return (
    <div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="ผลงานทั้งหมด"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="อนุมัติแล้ว"
              value={stats.approvedProjects}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="รอการอนุมัติ"
              value={stats.pendingProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="การเข้าชมรวม"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Projects */}
      <Card
        title="ผลงานล่าสุด"
        extra={
          <Link to="/projects/my-projects">
            <Button type="link">ดูทั้งหมด</Button>
          </Link>
        }
      >
        {projects?.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={projects.slice(0, 5)}
            renderItem={(project) => {
              const views = getProjectViews(project);
              return (
                <List.Item
                  actions={[
                    <Link key="view" to={`/projects/${project.id}`}>
                      <Button type="link" size="small">
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{project.title}</span>
                        {renderStatus(project.status)}
                      </Space>
                    }
                    description={
                      <Space split={<span>•</span>}>
                        <Text type="secondary">{project.type || 'ผลงาน'}</Text>
                        <Text type="secondary">
                          อัปเดตล่าสุด: {new Date(project.updatedAt).toLocaleDateString('th-TH')}
                        </Text>
                        {views > 0 && (
                          <Text type="secondary">
                            <EyeOutlined /> {views} ครั้ง
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty
            description="ยังไม่มีผลงาน"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/projects/upload">
              <Button type="primary" size="large">
                อัปโหลดผลงานแรกของคุณ
              </Button>
            </Link>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;