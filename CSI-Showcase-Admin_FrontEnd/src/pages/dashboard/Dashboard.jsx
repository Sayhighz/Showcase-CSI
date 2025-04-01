import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Space, Statistic, Table, Tag,
  Spin, Empty, Tabs, Tooltip, DatePicker, Select, Alert
} from 'antd';
import { 
  FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  LoadingOutlined, ClockCircleOutlined, EyeOutlined, 
  UserOutlined, BookOutlined, TrophyOutlined, TeamOutlined, 
  RocketOutlined, DashboardOutlined
} from '@ant-design/icons';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { getProjectStats, getPendingProjects } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// สีสำหรับแผนภูมิ
const COLORS = ['#90278E', '#FF5E8C', '#2F54EB', '#52C41A', '#FAAD14'];

const Dashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const navigate = useNavigate();
  const { admin } = useAuth();

  // โหลดข้อมูลสถิติโปรเจค
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getProjectStats();
        setStatsData(data);
      } catch (error) {
        console.error('Failed to load project statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingProjects = async () => {
      try {
        const data = await getPendingProjects();
        setPendingProjects(data);
      } catch (error) {
        console.error('Failed to load pending projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchStats();
    fetchPendingProjects();
  }, []);

  // ข้อมูลสำหรับแผนภูมิประเภทของโปรเจค
  const getProjectTypeData = () => {
    if (!statsData || !statsData.projectsByType) return [];
    
    return statsData.projectsByType.map(item => ({
      name: getCategoryName(item.type),
      value: item.count
    }));
  };

  // ข้อมูลสำหรับแผนภูมิสถานะของโปรเจค
  const getProjectStatusData = () => {
    if (!statsData || !statsData.projectsByStatus) return [];
    
    return statsData.projectsByStatus.map(item => ({
      name: getStatusName(item.status),
      value: item.count
    }));
  };

  // ข้อมูลสำหรับแผนภูมิจำนวนโปรเจคในแต่ละเดือน
  const getProjectsByMonthData = () => {
    if (!statsData || !statsData.projectsByMonth) return [];
    
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    return statsData.projectsByMonth.map(item => {
      const [year, month] = item.month.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      return {
        name: `${thaiMonths[monthIndex]} ${parseInt(year, 10) + 543}`,
        count: item.count
      };
    });
  };

  // ฟังก์ชันเปลี่ยนชื่อประเภทโปรเจคให้เป็นภาษาไทย
  const getCategoryName = (category) => {
    switch (category) {
      case 'academic':
        return 'บทความวิชาการ';
      case 'coursework':
        return 'ผลงานการเรียน';
      case 'competition':
        return 'การแข่งขัน';
      default:
        return category;
    }
  };

  // ฟังก์ชันเปลี่ยนชื่อสถานะโปรเจคให้เป็นภาษาไทย
  const getStatusName = (status) => {
    switch (status) {
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'pending':
        return 'รอตรวจสอบ';
      case 'rejected':
        return 'ถูกปฏิเสธ';
      default:
        return status;
    }
  };

  // Column สำหรับตารางโปรเจคที่รอการตรวจสอบ
  const pendingProjectColumns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'ชื่อโปรเจค',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500 mt-1">
            โดย: {record.author?.fullName || 'ไม่ระบุ'}
          </div>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => {
        let color = 'default';
        let icon = null;
        
        switch (category) {
          case 'academic':
            color = 'blue';
            icon = <BookOutlined />;
            break;
          case 'coursework':
            color = 'green';
            icon = <TeamOutlined />;
            break;
          case 'competition':
            color = 'gold';
            icon = <TrophyOutlined />;
            break;
          default:
            break;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {getCategoryName(category)}
          </Tag>
        );
      },
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => {
        if (!date) return 'ไม่ระบุ';
        const formattedDate = new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return <span>{formattedDate}</span>;
      },
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        <span className="ml-2">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <Title level={4} className="mb-6 flex items-center">
          <DashboardOutlined className="mr-2" /> แดชบอร์ดสำหรับผู้ดูแลระบบ
        </Title>
        
        <Alert
          message={<span className="font-medium">สวัสดี, {admin.username}!</span>}
          description={
            <div>
              <p>ยินดีต้อนรับเข้าสู่ระบบจัดการ CSI Showcase สำหรับการจัดการผลงานของนักศึกษา</p>
              {pendingProjects.length > 0 ? (
                <p>ขณะนี้มีโปรเจคที่รอการตรวจสอบจำนวน <strong>{pendingProjects.length}</strong> โปรเจค</p>
              ) : (
                <p>ขณะนี้ไม่มีโปรเจคที่รอการตรวจสอบ</p>
              )}
            </div>
          }
          type="info"
          showIcon
          className="mb-6"
        />
        
        <Row gutter={[16, 16]}>
          {/* บัตรแสดงจำนวนโปรเจคทั้งหมด */}
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="จำนวนผลงานทั้งหมด"
                value={statsData?.totalProjects || 0}
                prefix={<FileTextOutlined className="text-[#90278E]" />}
                valueStyle={{ color: '#90278E' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                ผลงานทั้งหมดในระบบ
              </div>
            </Card>
          </Col>

          {/* บัตรแสดงจำนวนโปรเจคที่อนุมัติแล้ว */}
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="ผลงานที่อนุมัติแล้ว"
                value={
                  statsData?.projectsByStatus?.find(item => item.status === 'approved')?.count || 0
                }
                prefix={<CheckCircleOutlined className="text-green-500" />}
                valueStyle={{ color: '#52C41A' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                ผลงานที่ผ่านการอนุมัติและแสดงบนหน้าเว็บไซต์
              </div>
            </Card>
          </Col>

          {/* บัตรแสดงจำนวนโปรเจคที่รอการตรวจสอบ */}
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => navigate('/projects')}
            >
              <Statistic
                title="รอการตรวจสอบ"
                value={
                  statsData?.projectsByStatus?.find(item => item.status === 'pending')?.count || 0
                }
                prefix={<ClockCircleOutlined className="text-[#FAAD14]" />}
                valueStyle={{ color: '#FAAD14' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                คลิกเพื่อดูรายการที่รอการตรวจสอบ
              </div>
            </Card>
          </Col>

          {/* บัตรแสดงจำนวนการเข้าชมทั้งหมด */}
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="จำนวนการเข้าชมทั้งหมด"
                value={statsData?.totalViews || 0}
                prefix={<EyeOutlined className="text-blue-500" />}
                valueStyle={{ color: '#2F54EB' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                ยอดเข้าชมผลงานทั้งหมด
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Tabs defaultActiveKey="1" className="bg-white p-4 rounded-lg shadow-sm">
        <TabPane 
          tab={<span><RocketOutlined /> ภาพรวมโปรเจค</span>} 
          key="1"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* แผนภูมิจำนวนโปรเจคแยกตามประเภท */}
            <Card title="จำนวนโปรเจคแยกตามประเภท" className="shadow-sm">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={getProjectTypeData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {getProjectTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* แผนภูมิแท่งแสดงจำนวนโปรเจคแยกตามสถานะ */}
            <Card title="จำนวนโปรเจคแยกตามสถานะ" className="shadow-sm">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={getProjectStatusData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="จำนวน">
                      {getProjectStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* แผนภูมิเส้นแสดงจำนวนโปรเจคในแต่ละเดือน */}
          <Card 
            title="จำนวนโปรเจคในแต่ละเดือน" 
            className="shadow-sm mb-8"
            extra={
              <Select 
                defaultValue={timeRange} 
                style={{ width: 120 }} 
                onChange={value => setTimeRange(value)}
              >
                <Option value="month">รายเดือน</Option>
                <Option value="quarter">รายไตรมาส</Option>
                <Option value="year">รายปี</Option>
              </Select>
            }
          >
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={getProjectsByMonthData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="จำนวนโปรเจค"
                    stroke="#90278E"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* ตารางแสดงโปรเจคที่รอการตรวจสอบล่าสุด */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span>โปรเจคที่รอการตรวจสอบล่าสุด</span>
                {pendingProjects.length > 0 && (
                  <Tag color="#FAAD14" className="ml-2">{pendingProjects.length} รายการ</Tag>
                )}
              </div>
            } 
            className="shadow-sm"
            extra={
              <button 
                onClick={() => navigate('/projects')}
                className="text-[#90278E] hover:text-[#FF5E8C] transition-colors"
              >
                ดูทั้งหมด
              </button>
            }
          >
            {projectsLoading ? (
              <div className="flex justify-center items-center h-32">
                <Spin />
              </div>
            ) : pendingProjects.length > 0 ? (
              <Table
                columns={pendingProjectColumns}
                dataSource={pendingProjects.slice(0, 5)}
                rowKey="projectId"
                pagination={false}
                onRow={(record) => ({
                  onClick: () => navigate(`/projects?id=${record.projectId}`),
                  style: { cursor: 'pointer' }
                })}
              />
            ) : (
              <Empty description="ไม่มีโปรเจคที่รอการตรวจสอบ" />
            )}
          </Card>
        </TabPane>

        <TabPane 
          tab={<span><UserOutlined /> ข้อมูลผู้ใช้งาน</span>} 
          key="2"
        >
          {/* เพิ่มข้อมูลสถิติผู้ใช้งาน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card title="สรุปจำนวนผู้ใช้งานแบ่งตามบทบาท" className="shadow-sm">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'นักศึกษา', value: 75 },
                        { name: 'ผู้ดูแลระบบ', value: 5 },
                        { name: 'ผู้เยี่ยมชม', value: 20 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="การลงทะเบียนผู้ใช้ใหม่" className="shadow-sm">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={[
                      { name: 'ม.ค. 2568', count: 10 },
                      { name: 'ก.พ. 2568', count: 15 },
                      { name: 'มี.ค. 2568', count: 13 },
                      { name: 'เม.ย. 2568', count: 17 },
                      { name: 'พ.ค. 2568', count: 12 },
                      { name: 'มิ.ย. 2568', count: 20 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="ผู้ใช้ใหม่"
                      stroke="#FF5E8C"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card title="กิจกรรมการเข้าสู่ระบบล่าสุด" className="shadow-sm">
            <Table
              columns={[
                {
                  title: 'ลำดับ',
                  key: 'index',
                  width: 60,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: 'ชื่อผู้ใช้',
                  dataIndex: 'username',
                  key: 'username',
                  render: (text) => (
                    <div className="flex items-center">
                      <UserOutlined className="mr-2 text-[#90278E]" />
                      <span>{text}</span>
                    </div>
                  ),
                },
                {
                  title: 'เวลาเข้าสู่ระบบ',
                  dataIndex: 'loginTime',
                  key: 'loginTime',
                },
                {
                  title: 'IP Address',
                  dataIndex: 'ipAddress',
                  key: 'ipAddress',
                },
                {
                  title: 'รายละเอียด',
                  dataIndex: 'details',
                  key: 'details',
                },
              ]}
              dataSource={[
                {
                  key: '1',
                  username: 'somchai_s',
                  loginTime: '22 มิ.ย. 68 10:30 AM',
                  ipAddress: '192.168.1.1',
                  details: 'Chrome, Windows 10',
                },
                {
                  key: '2',
                  username: 'somsri_p',
                  loginTime: '22 มิ.ย. 68 10:15 AM',
                  ipAddress: '192.168.1.2',
                  details: 'Firefox, MacOS',
                },
                {
                  key: '3',
                  username: 'admin',
                  loginTime: '22 มิ.ย. 68 09:45 AM',
                  ipAddress: '192.168.1.3',
                  details: 'Chrome, Windows 11',
                },
                {
                  key: '4',
                  username: 'student1',
                  loginTime: '22 มิ.ย. 68 09:30 AM',
                  ipAddress: '192.168.1.4',
                  details: 'Safari, iOS',
                },
                {
                  key: '5',
                  username: 'student2',
                  loginTime: '22 มิ.ย. 68 09:20 AM',
                  ipAddress: '192.168.1.5',
                  details: 'Edge, Windows 10',
                },
              ]}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={<span><FileTextOutlined /> รายงาน</span>} 
          key="3"
        >
          <div className="mb-6">
            <div className="flex justify-end mb-4">
              <Space>
                <RangePicker />
                <Select defaultValue="all" style={{ width: 150 }}>
                  <Option value="all">ทั้งหมด</Option>
                  <Option value="academic">บทความวิชาการ</Option>
                  <Option value="coursework">ผลงานการเรียน</Option>
                  <Option value="competition">การแข่งขัน</Option>
                </Select>
                <Button type="primary" className="bg-[#90278E]">
                  สร้างรายงาน
                </Button>
              </Space>
            </div>

            <Card title="รายงานสรุปข้อมูลผลงาน" className="shadow-sm">
              <Alert
                message="ข้อมูลตัวอย่าง"
                description="ข้อมูลนี้เป็นข้อมูลตัวอย่างสำหรับการแสดงผล"
                type="info"
                showIcon
                className="mb-4"
              />

              <Table
                columns={[
                  {
                    title: 'ลำดับ',
                    key: 'index',
                    width: 60,
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: 'ประเภทผลงาน',
                    dataIndex: 'category',
                    key: 'category',
                    render: (category) => {
                      let color = 'default';
                      let icon = null;
                      
                      switch (category) {
                        case 'academic':
                          color = 'blue';
                          icon = <BookOutlined />;
                          break;
                        case 'coursework':
                          color = 'green';
                          icon = <TeamOutlined />;
                          break;
                        case 'competition':
                          color = 'gold';
                          icon = <TrophyOutlined />;
                          break;
                        default:
                          break;
                      }
                      
                      return (
                        <Tag color={color} icon={icon}>
                          {getCategoryName(category)}
                        </Tag>
                      );
                    },
                  },
                  {
                    title: 'จำนวนผลงาน',
                    dataIndex: 'count',
                    key: 'count',
                  },
                  {
                    title: 'ยอดเข้าชม',
                    dataIndex: 'views',
                    key: 'views',
                  },
                  {
                    title: 'คะแนนเฉลี่ย',
                    dataIndex: 'rating',
                    key: 'rating',
                  },
                ]}
                dataSource={[
                  {
                    key: '1',
                    category: 'academic',
                    count: 35,
                    views: 1250,
                    rating: 4.5,
                  },
                  {
                    key: '2',
                    category: 'coursework',
                    count: 80,
                    views: 2300,
                    rating: 4.2,
                  },
                  {
                    key: '3',
                    category: 'competition',
                    count: 25,
                    views: 1800,
                    rating: 4.7,
                  },
                ]}
                pagination={false}
                summary={pageData => {
                  let totalCount = 0;
                  let totalViews = 0;
                  let totalRating = 0;
                  
                  pageData.forEach(({ count, views, rating }) => {
                    totalCount += count;
                    totalViews += views;
                    totalRating += rating;
                  });
                  
                  return (
                    <>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          <strong>รวมทั้งหมด</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <strong>{totalCount}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <strong>{totalViews}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          <strong>{(totalRating / 3).toFixed(1)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </>
                  );
                }}
              />
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard;