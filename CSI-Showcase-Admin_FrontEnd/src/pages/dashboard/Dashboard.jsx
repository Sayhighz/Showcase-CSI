import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, message, Tabs } from 'antd';
import { 
  TeamOutlined, 
  FileOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  LineChartOutlined
} from '@ant-design/icons';

// Import components
import PageHeader from '../../components/common/PageHeader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';

// Import charts and dashboard-specific components
import StatisticCards from '../../components/dashboard/StatisticCards';
import ProjectTypeChart from '../../components/dashboard/ProjectTypeChart';
import StudyYearDistribution from '../../components/dashboard/StudyYearDistribution';
import RecentProjects from '../../components/dashboard/RecentProjects';
import RecentActivities from '../../components/dashboard/RecentActivities';
import ApprovalRatioCard from '../../components/dashboard/ApprovalRatioCard';

// Import services
import { getDashboardStats } from '../../services/statisticsService';

// Import constants
import { HEADERS, HEADER_DESCRIPTIONS } from '../../constants/thaiMessages';
import { getLoginLogs } from '../../services/logService';

const Dashboard = () => {
  // State management for dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentProjects: [],
    recentActivities: [],
    loading: true,
    error: null
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Reset loading state and clear previous errors
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch stats data
      const statsResponse = await getDashboardStats();

      // Mock login logs data since it's not in our stats
      const mockLoginLogs = await getLoginLogs();

      // Validate responses
      if (!statsResponse.success) {
        throw new Error(statsResponse.message || 'ไม่สามารถดึงข้อมูลสถิติได้');
      }

      // Transform top viewed projects to the format expected by RecentProjects
      const transformedProjects = statsResponse.data.projectStats.topViewed.map(project => ({
        project_id: project.id,
        title: project.title,
        type: project.category,
        status: 'approved', // Assume all top viewed are approved
        year: '2024', // Placeholder since we don't have this data
        created_at: new Date().toISOString(), // Placeholder
        user: project.author || { full_name: 'ไม่ระบุ' },
        cover_image: null // Placeholder
      }));

      // Process approval stats for ApprovalRatioCard
      const approvalStats = {
        approved: statsResponse.data.projectStats.byStatus.find(s => s.status === 'approved')?.count || 0,
        rejected: statsResponse.data.projectStats.byStatus.find(s => s.status === 'rejected')?.count || 0,
        pending: statsResponse.data.projectStats.byStatus.find(s => s.status === 'pending')?.count || 0,
        total: statsResponse.data.totals.projects
      };

      // Process project type stats for charts
      const projectTypeStats = statsResponse.data.projectStats.byType.map(item => ({
        type: item.type,
        count: item.count
      }));

      // Create mock study year data since it's not in our stats


      // Format data for cards
      const formattedStats = {
        totalProjects: statsResponse.data.totals.projects,
        pendingProjects: approvalStats.pending,
        approvedProjects: approvalStats.approved,
        totalUsers: statsResponse.data.totals.users,
        totalViews: statsResponse.data.totals.views,
        courseworkCount: statsResponse.data.projectStats.byType.find(t => t.type === 'coursework')?.count || 0,
        academicCount: statsResponse.data.projectStats.byType.find(t => t.type === 'academic')?.count || 0,
        competitionCount: statsResponse.data.projectStats.byType.find(t => t.type === 'competition')?.count || 0,
        approvalStats: approvalStats,
        projectTypeStats: projectTypeStats,
      };

      setDashboardData({
        stats: formattedStats,
        recentProjects: transformedProjects,
        recentActivities: mockLoginLogs,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Dashboard Data Fetch Error:', err);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด'
      }));
      message.error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Retry data fetching
  const handleRetry = () => {
    fetchDashboardData();
  };

  // Destructure state for cleaner code
  const { stats, recentProjects, loading, error } = dashboardData;

  // Render loading state
  if (loading) {
    return (
      <div>
        <PageHeader 
          title={HEADERS.DASHBOARD}
          subtitle={HEADER_DESCRIPTIONS.DASHBOARD}
          breadcrumb={[{ title: HEADERS.DASHBOARD }]}
        />
        <LoadingState type="full" message="กำลังโหลดข้อมูลแดชบอร์ด..." />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div>
        <PageHeader 
          title={HEADERS.DASHBOARD}
          subtitle={HEADER_DESCRIPTIONS.DASHBOARD}
          breadcrumb={[{ title: HEADERS.DASHBOARD }]}
        />
        <ErrorAlert 
          message="ไม่สามารถโหลดข้อมูลแดชบอร์ดได้" 
          description={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Render dashboard content
  return (
    <div>
      <PageHeader 
        title={HEADERS.DASHBOARD}
        subtitle={HEADER_DESCRIPTIONS.DASHBOARD}
        breadcrumb={[{ title: HEADERS.DASHBOARD }]}
      />

      {/* Statistics Overview */}
      <StatisticCards stats={stats || {}} />

      {/* Project Approval Ratio */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          {stats?.approvalStats && (
            <ApprovalRatioCard approvalStats={stats.approvalStats} />
          )}
        </Col>
      </Row>

      {/* Charts & Statistics */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card title="สัดส่วนประเภทโปรเจค" className="h-full">
            {stats?.projectTypeStats?.length ? (
              <ProjectTypeChart data={stats.projectTypeStats} />
            ) : (
              <EmptyState 
                type="project" 
                message="ไม่มีข้อมูลประเภทโปรเจค" 
                imageStyle="simple" 
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="โปรเจคยอดนิยม" 
            extra={<a href="/projects">ดูทั้งหมด</a>}
            className="h-full"
          >
            {recentProjects.length ? (
              <RecentProjects projects={recentProjects} />
            ) : (
              <EmptyState 
                type="project" 
                message="ไม่มีโปรเจคล่าสุด" 
                imageStyle="simple" 
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;