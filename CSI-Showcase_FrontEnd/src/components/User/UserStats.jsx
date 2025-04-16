import React from 'react';
import { Card, Statistic, Row, Col, Typography, Tooltip } from 'antd';
import { 
  ProjectOutlined, 
  EyeOutlined, 
  LikeOutlined, 
  MessageOutlined, 
  TrophyOutlined, 
  StarOutlined 
} from '@ant-design/icons';
import { formatCompactNumber } from '../../utils/formatUtils';

const { Title } = Typography;

/**
 * UserStats component ใช้สำหรับแสดงข้อมูลสถิติของผู้ใช้
 * 
 * @param {Object} props - Props ของ component
 * @param {Object} props.stats - ข้อมูลสถิติ
 * @param {number} props.stats.projects - จำนวนโปรเจค
 * @param {number} props.stats.views - จำนวนการเข้าชมโปรเจคทั้งหมด
 * @param {number} props.stats.likes - จำนวนการถูกใจโปรเจคทั้งหมด
 * @param {number} props.stats.comments - จำนวนความคิดเห็นโปรเจคทั้งหมด
 * @param {number} props.stats.competitions - จำนวนการแข่งขันที่เข้าร่วม
 * @param {number} props.stats.awards - จำนวนรางวัลที่ได้รับ
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {string} props.size - ขนาดของ statistic ('small', 'default', 'large')
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} UserStats component
 */
const UserStats = ({ 
  stats,
  loading = false,
  size = 'default',
  style
}) => {
  if (!stats) return null;

  const { 
    projects = 0, 
    views = 0, 
    likes = 0, 
    comments = 0, 
    competitions = 0, 
    awards = 0 
  } = stats;

  // กำหนดขนาดของไอคอนตาม size ที่ระบุ
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      case 'default':
      default:
        return 20;
    }
  };

  const iconSize = getIconSize();

  return (
    <Card
      style={{ ...style }}
      loading={loading}
    >
      <Title level={4} style={{ marginBottom: 16 }}>สถิติผู้ใช้</Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8}>
          <Tooltip title="จำนวนโปรเจคทั้งหมด">
            <Statistic
              title="โปรเจค"
              value={projects}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<ProjectOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8}>
          <Tooltip title="จำนวนการเข้าชมโปรเจคทั้งหมด">
            <Statistic
              title="การเข้าชม"
              value={views}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<EyeOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8}>
          <Tooltip title="จำนวนการถูกใจโปรเจคทั้งหมด">
            <Statistic
              title="ถูกใจ"
              value={likes}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<LikeOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8}>
          <Tooltip title="จำนวนความคิดเห็นโปรเจคทั้งหมด">
            <Statistic
              title="ความคิดเห็น"
              value={comments}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<MessageOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8}>
          <Tooltip title="จำนวนการแข่งขันที่เข้าร่วม">
            <Statistic
              title="การแข่งขัน"
              value={competitions}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<TrophyOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8}>
          <Tooltip title="จำนวนรางวัลที่ได้รับ">
            <Statistic
              title="รางวัล"
              value={awards}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<StarOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
      </Row>
    </Card>
  );
};

export default UserStats;