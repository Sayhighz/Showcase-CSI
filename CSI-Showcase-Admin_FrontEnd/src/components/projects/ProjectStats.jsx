import React from 'react';
import { Row, Col, Card, Progress, Typography, Space } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import { PROJECT_STATUS_COLORS } from '../../constants/projectConstants';

const { Title, Text } = Typography;

/**
 * Component แสดงสถิติของโปรเจค
 * 
 * @param {Object} props
 * @param {Object} props.stats - ข้อมูลสถิติโปรเจค
 * @param {number} props.stats.total_projects - จำนวนโปรเจคทั้งหมด
 * @param {number} props.stats.approved_count - จำนวนโปรเจคที่อนุมัติแล้ว
 * @param {number} props.stats.pending_count - จำนวนโปรเจคที่รออนุมัติ
 * @param {number} props.stats.rejected_count - จำนวนโปรเจคที่ถูกปฏิเสธ
 * @param {boolean} props.loading - สถานะกำลังโหลดข้อมูล
 */
const ProjectStats = ({ 
  stats = { total_projects: 0, approved_count: 0, pending_count: 0, rejected_count: 0 }, 
  loading = false 
}) => {
  // คำนวณเปอร์เซ็นต์
  const calculatePercent = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const approvedPercent = calculatePercent(stats.approved_count, stats.total_projects);
  const pendingPercent = calculatePercent(stats.pending_count, stats.total_projects);
  const rejectedPercent = calculatePercent(stats.rejected_count, stats.total_projects);

  // ข้อมูลการ์ด
  const cardData = [
    {
      title: "ผลงานทั้งหมด",
      value: stats.total_projects,
      icon: <FileTextOutlined />,
      color: "#1890ff",
      description: "จำนวนผลงานทั้งหมดในระบบ",
      hasProgress: false
    },
    {
      title: "อนุมัติแล้ว",
      value: stats.approved_count,
      icon: <CheckCircleOutlined />,
      color: PROJECT_STATUS_COLORS.approved_count || "#52c41a",
      description: `${approvedPercent}% ของผลงานทั้งหมด`,
      percent: approvedPercent,
      hasProgress: true
    },
    {
      title: "รออนุมัติ",
      value: stats.pending_count,
      icon: <ClockCircleOutlined />,
      color: PROJECT_STATUS_COLORS.pending_count || "#faad14",
      description: `${pendingPercent}% ของผลงานทั้งหมด`,
      percent: pendingPercent,
      hasProgress: true
    },
    {
      title: "ถูกปฏิเสธ",
      value: stats.rejected_count,
      icon: <CloseCircleOutlined />,
      color: PROJECT_STATUS_COLORS.rejected_count || "#ff4d4f",
      description: `${rejectedPercent}% ของผลงานทั้งหมด`,
      percent: rejectedPercent,
      hasProgress: true
    }
  ];

  return (
    <Row gutter={[16, 16]} className="mb-6">
      {cardData.map((card, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card 
            hoverable 
            loading={loading}
            className="h-full stat-card transition-all hover:shadow-md"
            bodyStyle={{ padding: "20px" }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div className="flex justify-between items-center">
                <div 
                  className="rounded-full p-2 mr-2 flex items-center justify-center" 
                  style={{ backgroundColor: `${card.color}20`, width: 40, height: 40 }}
                >
                  <span style={{ color: card.color, fontSize: '18px' }}>
                    {card.icon}
                  </span>
                </div>
                <Title level={5} style={{ margin: 0, color: 'rgba(0, 0, 0, 0.85)' }}>
                  {card.title}
                </Title>
              </div>
              
              <Title level={2} style={{ margin: '12px 0', color: card.color }}>
                {loading ? '-' : card.value}
              </Title>
              
              {card.hasProgress && (
                <Progress 
                  percent={card.percent} 
                  showInfo={false} 
                  strokeColor={card.color}
                  size="small"
                  className="mb-1"
                />
              )}
              
              <Text type="secondary">
                {card.description}
              </Text>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProjectStats;