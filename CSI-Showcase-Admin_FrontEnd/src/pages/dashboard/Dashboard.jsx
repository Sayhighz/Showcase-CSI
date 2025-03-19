import React from "react";
import { Card, Row, Col } from "antd";
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";

// Mock Data
const statsData = {
  totalWorks: 165,
  totalReviews: 65,
  approvedWorks: 50,
  rejectedWorks: 50,
};

const chartData1 = [
  { category: "หมวดหมู่ 1", works: 50 },
  { category: "หมวดหมู่ 2", works: 30 },
  { category: "หมวดหมู่ 3", works: 40 },
  { category: "หมวดหมู่ 4", works: 45 },
];

const chartData2 = [
  { name: "ผลงาน 1", views: 100 },
  { name: "ผลงาน 2", views: 300 },
  { name: "ผลงาน 3", views: 200 },
  { name: "ผลงาน 4", views: 400 },
];

// Dashboard Component
const Dashboard = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16}>
        {/* Stats Cards - Row 1 */}
        <Col span={12}>
          <Card title="จำนวนผลงานทั้งหมด" variant={false} style={{ textAlign: "center" }}>
            <FileTextOutlined style={{ fontSize: "36px", color: "#aaa" }} />
            <h2>{statsData.totalWorks}</h2>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="จำนวนการตรวจสอบ" variant={false} style={{ textAlign: "center" }}>
            <ClockCircleOutlined style={{ fontSize: "36px", color: "#1890ff" }} />
            <h2>{statsData.totalReviews}</h2>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: "20px" }}>
        {/* Stats Cards - Row 2 */}
        <Col span={12}>
          <Card title="จำนวนผลงานที่อนุมัติ" variant={false} style={{ textAlign: "center" }}>
            <CheckCircleOutlined style={{ fontSize: "36px", color: "#52c41a" }} />
            <h2>{statsData.approvedWorks}</h2>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="จำนวนผลงานที่ปฏิเสธ" variant={false} style={{ textAlign: "center" }}>
            <CloseCircleOutlined style={{ fontSize: "36px", color: "#f5222d" }} />
            <h2>{statsData.rejectedWorks}</h2>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "20px" }}>
        {/* Chart 1 - Line Chart (Number of Works by Category) */}
        <Col span={12}> {/* Increased the span to 12 for more width */}
          <Card title="ผลงานตามหมวดหมู่" variant={false}>
            <ResponsiveContainer width="100%" height={300}> {/* Increased height */}
              <LineChart data={chartData1}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="works" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Chart 2 - Bar Chart (Most Viewed Works) */}
        <Col span={12}> {/* Increased the span to 12 for more width */}
          <Card title="ผลงานที่มียอดวิวสูงสุด" variant={false}>
            <ResponsiveContainer width="100%" height={300}> {/* Increased height */}
              <BarChart data={chartData2}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
