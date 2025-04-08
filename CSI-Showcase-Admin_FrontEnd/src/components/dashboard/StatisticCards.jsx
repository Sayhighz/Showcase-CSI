// src/components/dashboard/StatisticCards.jsx
import React from 'react';
import { Row, Col } from 'antd';
import { 
  TeamOutlined, 
  FileOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import DataCard from '../common/DataCard';
import { formatNumber } from '../../utils/numberUtils';

/**
 * Component แสดงบัตรสถิติต่างๆ ในหน้า Dashboard
 * 
 * @param {Object} props
 * @param {Object} props.stats - ข้อมูลสถิติจาก API
 */
const StatisticCards = ({ stats }) => {
  if (!stats) return null;

  // const stats = Array.isArray(stats) ? stats : [];

  return (
    <Row gutter={[16, 16]}>
      {/* Total Projects */}
      <Col xs={24} sm={12} lg={6}>
        <DataCard 
          title="จำนวนโปรเจคทั้งหมด"
          value={formatNumber(stats.totalProjects || 0)}
          icon={<FileOutlined />}
          color="#1890ff"
          change={stats.projectsGrowthRate}
          description="รวมทุกสถานะและประเภท"
        />
      </Col>

      {/* Pending Projects */}
      <Col xs={24} sm={12} lg={6}>
        <DataCard 
          title="รอการตรวจสอบ"
          value={formatNumber(stats.pendingProjects || 0)}
          icon={<ClockCircleOutlined />}
          color="#faad14"
          description="โปรเจคที่รอการอนุมัติ"
          percent={stats.pendingProjects > 0 ? 
            (stats.pendingProjects / stats.totalProjects) * 100 : 0}
        />
      </Col>

      {/* Approved Projects */}
      <Col xs={24} sm={12} lg={6}>
        <DataCard 
          title="อนุมัติแล้ว"
          value={formatNumber(stats.approvedProjects || 0)}
          icon={<CheckCircleOutlined />}
          color="#52c41a"
          description="โปรเจคที่อนุมัติแล้ว"
          percent={stats.approvedProjects > 0 ? 
            (stats.approvedProjects / stats.totalProjects) * 100 : 0}
        />
      </Col>

      {/* Total Users */}
      <Col xs={24} sm={12} lg={6}>
        <DataCard 
          title="จำนวนผู้ใช้งาน"
          value={formatNumber(stats.totalUsers || 0)}
          icon={<TeamOutlined />}
          color="#722ed1"
          change={stats.usersGrowthRate}
          description="นักศึกษาและผู้ดูแลระบบ"
        />
      </Col>

      {/* Total Views */}
      <Col xs={24} sm={12} lg={6}>
        <DataCard 
          title="การเข้าชมทั้งหมด"
          value={formatNumber(stats.totalViews || 0)}
          icon={<EyeOutlined />}
          color="#13c2c2"
          change={stats.viewsGrowthRate}
          description="รวมทุกประเภทการเข้าชม"
        />
      </Col>

      {/* Project Types Distribution */}
      <Col xs={24} sm={12} lg={6}>
        <DataCard 
          title="ผลงานการเรียน"
          value={formatNumber(stats.courseworkCount || 0)}
          icon={<BarChartOutlined />}
          color="#eb2f96"
          percent={stats.totalProjects > 0 ? 
            (stats.courseworkCount / stats.totalProjects) * 100 : 0}
          description="สัดส่วนจากทั้งหมด"
        />
      </Col>

      {/* Academic Papers */}
      <Col xs={24} sm={12} lg={6}>
        <DataCard 
          title="บทความวิชาการ"
          value={formatNumber(stats.academicCount || 0)}
          icon={<BarChartOutlined />}
          color="#fa541c"
          percent={stats.totalProjects > 0 ? 
            (stats.academicCount / stats.totalProjects) * 100 : 0}
          description="สัดส่วนจากทั้งหมด"
        />
      </Col>

      {/* Competitions */}
      <Col xs={24} sm={12} lg={6}>
        <DataCard 
          title="การแข่งขัน"
          value={formatNumber(stats.competitionCount || 0)}
          icon={<BarChartOutlined />}
          color="#a0d911"
          percent={stats.totalProjects > 0 ? 
            (stats.competitionCount / stats.totalProjects) * 100 : 0}
          description="สัดส่วนจากทั้งหมด"
        />
      </Col>
    </Row>
  );
};

export default StatisticCards;