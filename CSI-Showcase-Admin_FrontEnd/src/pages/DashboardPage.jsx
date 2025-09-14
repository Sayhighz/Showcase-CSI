// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Row, Col, Spin, Alert, Button } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import useProject from '../hooks/useProject';
import useUser from '../hooks/useUser';
import useLog from '../hooks/useLog';

const DashboardPage = () => {
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Refs to track previous values
  const prevProjectStatsRef = useRef(null);
  const prevUserStatsRef = useRef(null);
  const prevDashboardStatsRef = useRef(null);

  const {
    projectStats,
    loading: projectLoading,
    error: projectError,
    refreshProjects,
  } = useProject('stats');

  const {
    stats: userStats,
    loading: userLoading,
    error: userError,
    refreshUserStats,
  } = useUser(null, 'stats');

  const {
    dashboardStats,
    loading: logLoading,
    error: logError,
    refreshLogs,
  } = useLog('dashboard');

  useEffect(() => {
    if (!projectLoading && !userLoading && !logLoading) {
      if (projectStats || userStats || dashboardStats) {
        // Use lodash to check if data has actually changed before updating state
        const newDashboardData = {
          projects: projectStats,
          users: userStats,
          logs: dashboardStats,
        };
        
        const hasProjectStatsChanged = !_.isEqual(prevProjectStatsRef.current, projectStats);
        const hasUserStatsChanged = !_.isEqual(prevUserStatsRef.current, userStats);
        const hasDashboardStatsChanged = !_.isEqual(prevDashboardStatsRef.current, dashboardStats);
        
        // Only update state if data has changed
        if (hasProjectStatsChanged || hasUserStatsChanged || hasDashboardStatsChanged) {
          setDashboardData(newDashboardData);
          
          // Update refs with current values
          prevProjectStatsRef.current = projectStats;
          prevUserStatsRef.current = userStats;
          prevDashboardStatsRef.current = dashboardStats;
        }
      }
    }
    
    // Handle errors
    const newError = projectError || userError || logError;
    if (newError && !_.isEqual(error, newError)) {
      setError(newError);
    }
  }, [
    projectLoading,
    userLoading,
    logLoading,
    projectStats,
    userStats,
    dashboardStats,
    projectError,
    userError,
    logError,
    error
  ]);

  const handleRefresh = () => {
    refreshProjects();
    refreshUserStats();
    refreshLogs();
  };

  const loading = projectLoading || userLoading || logLoading;

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spin size="large" tip="กำลังโหลดข้อมูลแดชบอร์ด..." />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-4">
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error.toString() || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ โปรดลองอีกครั้งภายหลัง'}
          type="error"
          showIcon
          action={<Button icon={<ReloadOutlined />} onClick={handleRefresh}>ลองใหม่</Button>}
        />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4">
        <Alert
          message="ไม่พบข้อมูล"
          description="ไม่พบข้อมูลสำหรับแดชบอร์ด โปรดลองอีกครั้งภายหลัง"
          type="warning"
          showIcon
          action={<Button icon={<ReloadOutlined />} onClick={handleRefresh}>ลองใหม่</Button>}
        />
      </div>
    );
  }

  // ปรับโครงสร้างข้อมูลให้ตรงกับ response จริงจาก API
  const stats = {
    totalProjects: dashboardData.projects?.project_counts?.total_projects || 0,
    pendingProjects: dashboardData.projects?.project_counts?.pending_count || 0,
    totalUsers: dashboardData.users?.totalUsers || 0,
    // ตรวจสอบว่า dashboardStats.viewStats มีหรือไม่ ถ้าไม่มีให้ใช้ค่าเริ่มต้น
    totalViews: (dashboardData.logs?.viewStats?.total || 0),
    
    // ปรับตามโครงสร้างข้อมูลจริง
    recentProjects: dashboardData.projects?.recent_projects || [],
    recentLogins: dashboardData.users?.recentLogins || [],
    activities: dashboardData.logs?.recentActivities || [],
  };

  return (
    <div>

      {loading && (
        <div className="mb-4">
          <Alert
            message="กำลังรีเฟรชข้อมูล..."
            type="info"
            showIcon
          />
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ผลงานทั้งหมด"
            value={stats.totalProjects}
            icon={<ProjectOutlined style={{ fontSize: 24 }} />}
            color="#90278E"
            footer={<Link to="/projects" className="text-purple-700 text-sm">ดูทั้งหมด</Link>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="รอการอนุมัติ"
            value={stats.pendingProjects}
            icon={<ClockCircleOutlined style={{ fontSize: 24 }} />}
            color="#faad14"
            footer={<Link to="/projects/pending" className="text-purple-700 text-sm">ดูทั้งหมด</Link>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ผู้ใช้ทั้งหมด"
            value={stats.totalUsers}
            icon={<UserOutlined style={{ fontSize: 24 }} />}
            color="#1890ff"
            footer={<Link to="/users" className="text-purple-700 text-sm">ดูทั้งหมด</Link>}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;