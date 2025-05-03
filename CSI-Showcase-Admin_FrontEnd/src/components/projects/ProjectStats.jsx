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
  
    // สร้าง Icon ตามประเภทโครงงาน
    const getTypeIcon = (type) => {
      switch (type) {
        case 'coursework':
          return <FileTextOutlined style={{ fontSize: 24 }} />;
        case 'academic':
          return <BookOutlined style={{ fontSize: 24 }} />;
        case 'competition':
          return <TrophyOutlined style={{ fontSize: 24 }} />;
        default:
          return <ProjectOutlined style={{ fontSize: 24 }} />;
      }
    };
  
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
              value={stats.project_counts?.approved_count || 0}
              icon={<CheckCircleOutlined style={{ fontSize: 24 }} />}
              color="#52c41a"
            />
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="โครงงานที่รอตรวจสอบ"
              value={stats.project_counts?.pending_count || 0}
              icon={<ClockCircleOutlined style={{ fontSize: 24 }} />}
              color="#faad14"
            />
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="โครงงานที่ถูกปฏิเสธ"
              value={stats.project_counts?.rejected_count || 0}
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
                      data={[
                        { name: 'ผลงานการเรียน', value: stats.project_counts?.coursework_count || 0, type: 'coursework' },
                        { name: 'บทความวิชาการ', value: stats.project_counts?.academic_count ||.0, type: 'academic' },
                        { name: 'การแข่งขัน', value: stats.project_counts?.competition_count || 0, type: 'competition' },
                      ]}
                      nameKey="name"
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {[
                        { name: 'ผลงานการเรียน', value: stats.project_counts?.coursework_count || 0, type: 'coursework' },
                        { name: 'บทความวิชาการ', value: stats.project_counts?.academic_count || 0, type: 'academic' },
                        { name: 'การแข่งขัน', value: stats.project_counts?.competition_count || 0, type: 'competition' },
                      ].map((entry, index) => (
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
                      data={[
                        { name: 'รอตรวจสอบ', value: stats.project_counts?.pending_count || 0, status: 'pending' },
                        { name: 'อนุมัติแล้ว', value: stats.project_counts?.approved_count || 0, status: 'approved' },
                        { name: 'ถูกปฏิเสธ', value: stats.project_counts?.rejected_count || 0, status: 'rejected' },
                      ]}
                      nameKey="name"
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {[
                        { name: 'รอตรวจสอบ', value: stats.project_counts?.pending_count || 0, status: 'pending' },
                        { name: 'อนุมัติแล้ว', value: stats.project_counts?.approved_count || 0, status: 'approved' },
                        { name: 'ถูกปฏิเสธ', value: stats.project_counts?.rejected_count || 0, status: 'rejected' },
                      ].map((entry, index) => (
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
                    data={stats.monthly_uploads || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar name="ทั้งหมด" dataKey="project_count" fill="#90278E" />
                    <Bar name="ผลงานการเรียน" dataKey="coursework_count" fill="#52c41a" />
                    <Bar name="บทความวิชาการ" dataKey="academic_count" fill="#1890ff" />
                    <Bar name="การแข่งขัน" dataKey="competition_count" fill="#faad14" />
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
                    data={stats.monthly_views || []}
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
                      activeDot={{ r: 8 }}
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
  
  export default ProjectStats;