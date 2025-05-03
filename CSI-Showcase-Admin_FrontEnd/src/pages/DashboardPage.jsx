import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Alert, Button } from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  EyeOutlined, 
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import ProjectTypeChart from '../components/dashboard/ProjectTypeChart';
import ProjectStatusChart from '../components/dashboard/ProjectStatusChart';
import RecentProjects from '../components/dashboard/RecentProjects';
import RecentLogins from '../components/dashboard/RecentLogins';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import PageTitle from '../components/common/PageTitle';
import { useProject } from '../hooks/useProject';
import { useUser } from '../hooks/useUser';
import { useLog } from '../hooks/useLog';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Custom hooks สำหรับดึงข้อมูล
  const { 
    projectStats, 
    loading: projectLoading, 
    error: projectError,
    refreshProjectStats 
  } = useProject('stats');
  
  const { 
    stats: userStats, 
    loading: userLoading, 
    error: userError,
    refreshUserStats 
  } = useUser(null, 'stats');
  
  const { 
    dashboardStats, 
    loading: logLoading, 
    error: logError,
    refreshDashboardStats 
  } = useLog('dashboard');

  // รวมข้อมูลจาก hooks ต่างๆ
  useEffect(() => {
    if (!projectLoading && !userLoading && !logLoading) {
      setLoading(false);
      
      if (projectStats || userStats || dashboardStats) {
        setDashboardData({
          projects: projectStats,
          users: userStats,
          logs: dashboardStats
        });
      }
    }
    
    if (projectError || userError || logError) {
      setError(projectError || userError || logError);
    }
  }, [
    projectStats, projectLoading, projectError,
    userStats, userLoading, userError,
    dashboardStats, logLoading, logError
  ]);

  // รีเฟรชข้อมูล
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    refreshProjectStats();
    refreshUserStats();
    refreshDashboardStats();
  };

  // แสดงหน้า loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spin size="large" tip="กำลังโหลดข้อมูลแดชบอร์ด..." />
      </div>
    );
  }

  // แสดงหน้า error
  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ โปรดลองอีกครั้งภายหลัง'}
          type="error"
          showIcon
          action={
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              ลองใหม่
            </Button>
          }
        />
      </div>
    );
  }

  // กรณีไม่มีข้อมูล
  if (!dashboardData) {
    return (
      <div className="p-4">
        <Alert
          message="ไม่พบข้อมูล"
          description="ไม่พบข้อมูลสำหรับแดชบอร์ด โปรดลองอีกครั้งภายหลัง"
          type="warning"
          showIcon
          action={
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              ลองใหม่
            </Button>
          }
        />
      </div>
    );
  }

  // เตรียมข้อมูลสำหรับแสดงผล
  const stats = {
    totalProjects: dashboardData.projects?.project_counts?.total_projects || 0,
    pendingProjects: dashboardData.projects?.project_counts?.pending_count || 0,
    totalUsers: dashboardData.users?.totalUsers || 0,
    totalViews: dashboardData.logs?.viewStats?.total || 0,
    recentProjects: dashboardData.projects?.recent_projects || [],
    recentLogins: dashboardData.logs?.recentLogins || [],
    activities: dashboardData.logs?.recentActivities || [],
  };

  return (
    <div>
      <PageTitle
        title="แดชบอร์ด"
        subtitle="ภาพรวมของระบบจัดการผลงานนักศึกษา"
        actions={[
          {
            label: 'รีเฟรช',
            icon: <ReloadOutlined />,
            onClick: handleRefresh,
          },
        ]}
      />
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="โครงงานทั้งหมด"
            value={stats.totalProjects}
            icon={<ProjectOutlined style={{ fontSize: 24 }} />}
            color="#90278E"
            footer={
              <Link to="/projects" className="text-purple-700 text-sm">
                ดูทั้งหมด
              </Link>
            }
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="รอการอนุมัติ"
            value={stats.pendingProjects}
            icon={<ClockCircleOutlined style={{ fontSize: 24 }} />}
            color="#faad14"
            footer={
              <Link to="/projects/pending" className="text-purple-700 text-sm">
                ดูทั้งหมด
              </Link>
            }
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ผู้ใช้ทั้งหมด"
            value={stats.totalUsers}
            icon={<UserOutlined style={{ fontSize: 24 }} />}
            color="#1890ff"
            footer={
              <Link to="/users" className="text-purple-700 text-sm">
                ดูทั้งหมด
              </Link>
            }
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="การเข้าชมทั้งหมด"
            value={stats.totalViews}
            icon={<EyeOutlined style={{ fontSize: 24 }} />}
            color="#52c41a"
            footer={
              <Link to="/logs/visitor-views" className="text-purple-700 text-sm">
                ดูทั้งหมด
              </Link>
            }
          />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <ProjectTypeChart 
            projects={dashboardData.projects?.all || []}
            height={300}
          />
        </Col>
        
        <Col xs={24} lg={12}>
          <ProjectStatusChart 
            projects={dashboardData.projects?.all || []}
            height={300}
          />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <RecentProjects 
            projects={stats.recentProjects}
            onViewMore={() => window.location.href = '/projects'}
          />
        </Col>
        
        <Col xs={24} lg={12}>
          <RecentLogins 
            logins={stats.recentLogins}
            onViewMore={() => window.location.href = '/logs/login'}
          />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24}>
          <ActivityTimeline 
            activities={stats.activities}
            onViewMore={() => window.location.href = '/logs/activities'}
            limit={10}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;