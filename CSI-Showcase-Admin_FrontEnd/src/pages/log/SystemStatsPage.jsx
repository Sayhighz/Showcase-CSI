import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Button, Spin, Tabs } from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import EmptyState from '../../components/common/EmptyState';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DashboardStatCard from '../../components/dashboard/StatCard';
import useLog from '../../hooks/useLog';

// กำหนดคอมโพเนนต์สำหรับการแสดงแผนภูมิ
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// สีสำหรับกราฟ
const COLORS = ['#90278E', '#1890FF', '#52C41A', '#FAAD14', '#F5222D'];

const SystemStatsPage = () => {
  const [tabKey, setTabKey] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  
  const {
    stats,
    dailyStats,
    loading,
    error,
    refreshStats
  } = useLog('stats');

  // ฟังก์ชันเมื่อเปลี่ยน tab
  const handleTabChange = (key) => {
    setTabKey(key);
  };

  // ฟังก์ชันเมื่อเปลี่ยนช่วงวันที่
  const handleDateRangeChange = (dates) => {
    setSelectedDateRange(dates);
    // สามารถเพิ่มตรรกะให้โหลดข้อมูลตามช่วงวันที่ที่เลือกได้ที่นี่
  };

  // ฟังก์ชันแสดงสถานะการเปลี่ยนแปลงด้วยสี
  const getPercentChangeColor = (percentChange) => {
    if (percentChange > 0) return '#52C41A'; // สีเขียว
    if (percentChange < 0) return '#F5222D'; // สีแดง
    return '#FAAD14'; // สีเหลือง
  };

  if (loading) {
    return <LoadingSpinner tip="กำลังโหลดข้อมูลสถิติ..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={refreshStats}
        title="ไม่สามารถโหลดข้อมูลสถิติได้"
      />
    );
  }

  if (!stats || !dailyStats) {
    return (
      <EmptyState
        description="ไม่พบข้อมูลสถิติ"
        showReload={true}
        onReload={refreshStats}
      />
    );
  }

  return (
    <div>
      <PageTitle
        title="สถิติระบบ"
        subtitle="ภาพรวมและข้อมูลสถิติของการใช้งานระบบทั้งหมด"
        actions={[
          {
            icon: <ReloadOutlined />,
            type: "default",
            onClick: refreshStats,
            label: "รีเฟรช"
          }
        ]}
      />
      
      {/* แสดงสถิติประจำวัน */}
      <Card title="สถิติวันนี้" className="mb-6" extra={
        <div className="text-gray-500">
          เปรียบเทียบกับค่าเฉลี่ย 7 วันที่ผ่านมา
        </div>
      }>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <DashboardStatCard
              title="การเข้าสู่ระบบ"
              value={dailyStats?.logins?.today || 0}
              suffix="ครั้ง"
              icon={<BarChartOutlined />}
              color="#90278E"
              comparison={{
                value: dailyStats?.logins?.percentChange || 0,
                label: `${Math.abs(dailyStats?.logins?.percentChange || 0)}% จากค่าเฉลี่ย`,
                color: getPercentChangeColor(dailyStats?.logins?.percentChange || 0),
                increasing: dailyStats?.logins?.percentChange > 0
              }}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <DashboardStatCard
              title="การเข้าชม"
              value={dailyStats?.views?.today || 0}
              suffix="ครั้ง"
              icon={<BarChartOutlined />}
              color="#1890FF"
              comparison={{
                value: dailyStats?.views?.percentChange || 0,
                label: `${Math.abs(dailyStats?.views?.percentChange || 0)}% จากค่าเฉลี่ย`,
                color: getPercentChangeColor(dailyStats?.views?.percentChange || 0),
                increasing: dailyStats?.views?.percentChange > 0
              }}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <DashboardStatCard
              title="โครงงานใหม่"
              value={dailyStats?.projects?.today || 0}
              suffix="โครงงาน"
              icon={<BarChartOutlined />}
              color="#52C41A"
              comparison={{
                value: dailyStats?.projects?.percentChange || 0,
                label: `${Math.abs(dailyStats?.projects?.percentChange || 0)}% จากค่าเฉลี่ย`,
                color: getPercentChangeColor(dailyStats?.projects?.percentChange || 0),
                increasing: dailyStats?.projects?.percentChange > 0
              }}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <DashboardStatCard
              title="การตรวจสอบ"
              value={dailyStats?.reviews?.today || 0}
              suffix="ครั้ง"
              icon={<BarChartOutlined />}
              color="#FAAD14"
              comparison={{
                value: dailyStats?.reviews?.percentChange || 0,
                label: `${Math.abs(dailyStats?.reviews?.percentChange || 0)}% จากค่าเฉลี่ย`,
                color: getPercentChangeColor(dailyStats?.reviews?.percentChange || 0),
                increasing: dailyStats?.reviews?.percentChange > 0
              }}
            />
          </Col>
        </Row>
      </Card>
      
      {/* ตัวเลือกการกรองวันที่ */}
      <div className="mb-4 flex justify-end">
        <RangePicker onChange={handleDateRangeChange} />
      </div>
      
      {/* แท็บสำหรับแยกประเภทสถิติ */}
      <Tabs activeKey={tabKey} onChange={handleTabChange}>
        <TabPane tab="ภาพรวม" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="การเข้าสู่ระบบรายวัน" className="h-full">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.loginsByDay}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="จำนวนการเข้าสู่ระบบ"
                        stroke="#90278E"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="การเข้าชมรายวัน" className="h-full">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.viewsByDay}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="visitorCount"
                        name="ผู้เยี่ยมชม"
                        fill="#1890FF"
                      />
                      <Bar
                        dataKey="companyCount"
                        name="บริษัท"
                        fill="#52C41A"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="การตรวจสอบตามสถานะ" className="h-full">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.reviewsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.reviewsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="โครงงานและผู้ใช้รายวัน" className="h-full">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" allowDuplicatedCategory={false} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        data={stats.projectsByDay}
                        type="monotone"
                        dataKey="count"
                        name="โครงงาน"
                        stroke="#FAAD14"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        data={stats.usersByDay}
                        type="monotone"
                        dataKey="count"
                        name="ผู้ใช้"
                        stroke="#F5222D"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="การเข้าสู่ระบบ" key="logins">
          <Card>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.loginsByDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="จำนวนการเข้าสู่ระบบ"
                    stroke="#90278E"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab="การเข้าชม" key="views">
          <Card>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.viewsByDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="visitorCount"
                    name="ผู้เยี่ยมชม"
                    fill="#1890FF"
                  />
                  <Bar
                    dataKey="companyCount"
                    name="บริษัท"
                    fill="#52C41A"
                  />
                  <Bar
                    dataKey="totalCount"
                    name="ทั้งหมด"
                    fill="#90278E"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab="การตรวจสอบ" key="reviews">
          <Card>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.reviewsByDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="จำนวนการตรวจสอบ"
                    stroke="#FAAD14"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemStatsPage;