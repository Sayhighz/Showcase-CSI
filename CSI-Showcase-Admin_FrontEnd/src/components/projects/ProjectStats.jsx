import React, { memo } from 'react';
import {
    ProjectOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    UserOutlined,
    FileTextOutlined,
    BookOutlined,
    TrophyOutlined,
  } from '@ant-design/icons';
  import { Typography, Row, Col, Card, Table, Tag } from 'antd';
  import { Link } from 'react-router-dom';
  import StatCard from '../dashboard/StatCard';
  import LoadingSpinner from '../common/LoadingSpinner';
  import ErrorDisplay from '../common/ErrorDisplay';
  import {
    getCategoryName,
    getCategoryColor,
    getStatusName,
    getStatusColor,
  } from '../../utils/projectUtils';
  // Import recharts components
  import {
    PieChart, Pie, Cell, 
    BarChart, Bar, 
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer
  } from 'recharts';
  
  const { Title, Text } = Typography;
  
  // สีสำหรับกราฟวงกลม
  const TYPE_COLORS = {
    coursework: '#52c41a',
    academic: '#1890ff',
    competition: '#faad14',
  };
  
  const STATUS_COLORS = {
    pending: '#faad14',
    approved: '#52c41a',
    rejected: '#f5222d',
  };
  
  // คอมโพเนนต์ tooltip ที่กำหนดเอง
  const CustomTooltip = memo(({ active, payload, label }) => {
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
  });
  
  const ProjectStats = ({
    stats,
    loading = false,
    error = null,
    onRefresh,
  }) => {
    if (loading) {
      return <LoadingSpinner tip="กำลังโหลดสถิติโครงงาน..." />;
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
  
    // Format chart data to ensure numbers, not strings
    const typeChartData = [
      { 
        name: 'ผลงานการเรียน', 
        value: parseInt(stats.project_counts?.coursework_count || 0), 
        type: 'coursework' 
      },
      { 
        name: 'บทความวิชาการ', 
        value: parseInt(stats.project_counts?.academic_count || 0), 
        type: 'academic' 
      },
      { 
        name: 'การแข่งขัน', 
        value: parseInt(stats.project_counts?.competition_count || 0), 
        type: 'competition' 
      },
    ];
  
    const statusChartData = [
      { 
        name: 'รอตรวจสอบ', 
        value: parseInt(stats.project_counts?.pending_count || 0), 
        status: 'pending' 
      },
      { 
        name: 'อนุมัติแล้ว', 
        value: parseInt(stats.project_counts?.approved_count || 0), 
        status: 'approved' 
      },
      { 
        name: 'ถูกปฏิเสธ', 
        value: parseInt(stats.project_counts?.rejected_count || 0), 
        status: 'rejected' 
      },
    ];
  
    // Format monthly data to ensure numbers
    const formattedMonthlyUploads = stats.monthly_uploads?.map(month => ({
      month: month.month,
      project_count: parseInt(month.project_count),
      academic_count: parseInt(month.academic_count),
      coursework_count: parseInt(month.coursework_count),
      competition_count: parseInt(month.competition_count)
    })) || [];
  
    const formattedMonthlyViews = stats.monthly_views?.map(month => ({
      month: month.month,
      view_count: parseInt(month.view_count)
    })) || [];
  
    // คอลัมน์สำหรับตารางโครงงานยอดนิยม
    const topProjectsColumns = [
      {
        title: 'ชื่อโครงงาน',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (
          <Link to={`/projects/${record.project_id}`} className="hover:text-purple-700">
            {text}
          </Link>
        ),
      },
      {
        title: 'ประเภท',
        dataIndex: 'type',
        key: 'type',
        render: (type) => {
          return <Tag color={getCategoryColor(type)}>{getCategoryName(type)}</Tag>;
        },
      },
      {
        title: 'ผู้สร้าง',
        dataIndex: 'username',
        key: 'username',
        render: (username, record) => (
          <Link to={`/users/${record.user_id}`}>
            {username || record.full_name || 'ไม่ระบุชื่อ'}
          </Link>
        ),
      },
      {
        title: 'การเข้าชม',
        dataIndex: 'views_count',
        key: 'views_count',
        render: (views) => (
          <div className="flex items-center">
            <EyeOutlined className="mr-1 text-gray-500" />
            <Text strong>{views || 0}</Text>
          </div>
        ),
      },
    ];
  
    // คอลัมน์สำหรับตารางโครงงานล่าสุด
    const recentProjectsColumns = [
      {
        title: 'ชื่อโครงงาน',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (
          <Link to={`/projects/${record.project_id}`} className="hover:text-purple-700">
            {text}
          </Link>
        ),
      },
      {
        title: 'ประเภท',
        dataIndex: 'type',
        key: 'type',
        render: (type) => {
          return <Tag color={getCategoryColor(type)}>{getCategoryName(type)}</Tag>;
        },
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          return <Tag color={getStatusColor(status)}>{getStatusName(status)}</Tag>;
        },
      },
      {
        title: 'วันที่สร้าง',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => {
          // Format date for better display
          const formattedDate = new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          return formattedDate;
        }
      },
    ];
  
    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="โครงงานทั้งหมด"
              value={stats.project_counts?.total_projects || 0}
              icon={<ProjectOutlined style={{ fontSize: 24 }} />}
              color="#90278E"
            />
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="โครงงานที่อนุมัติแล้ว"
              value={parseInt(stats.project_counts?.approved_count) || 0}
              icon={<CheckCircleOutlined style={{ fontSize: 24 }} />}
              color="#52c41a"
            />
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="โครงงานที่รอตรวจสอบ"
              value={parseInt(stats.project_counts?.pending_count) || 0}
              icon={<ClockCircleOutlined style={{ fontSize: 24 }} />}
              color="#faad14"
            />
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="โครงงานที่ถูกปฏิเสธ"
              value={parseInt(stats.project_counts?.rejected_count) || 0}
              icon={<CloseCircleOutlined style={{ fontSize: 24 }} />}
              color="#f5222d"
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} md={12}>
            <Card title="โครงงานตามประเภท">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      nameKey="name"
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      isAnimationActive={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type] || '#8884d8'} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="โครงงานตามสถานะ">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      nameKey="name"
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      isAnimationActive={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24}>
            <Card title="โครงงานรายเดือน">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formattedMonthlyUploads}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar name="ทั้งหมด" dataKey="project_count" fill="#90278E" isAnimationActive={false} />
                    <Bar name="ผลงานการเรียน" dataKey="coursework_count" fill="#52c41a" isAnimationActive={false} />
                    <Bar name="บทความวิชาการ" dataKey="academic_count" fill="#1890ff" isAnimationActive={false} />
                    <Bar name="การแข่งขัน" dataKey="competition_count" fill="#faad14" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24}>
            <Card title="การเข้าชมรายเดือน">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formattedMonthlyViews}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      name="จำนวนการเข้าชม"
                      type="monotone"
                      dataKey="view_count"
                      stroke="#90278E"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} md={12}>
            <Card title="โครงงานยอดนิยม">
              <Table
                columns={topProjectsColumns}
                dataSource={stats.top_projects?.map((project, index) => ({ ...project, key: index }))}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="โครงงานล่าสุด">
              <Table
                columns={recentProjectsColumns}
                dataSource={stats.recent_projects?.map((project, index) => ({ ...project, key: index }))}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  export default memo(ProjectStats);