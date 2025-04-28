import React from 'react';
import { Card, Statistic, Row, Col, Typography, Tooltip } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined, UserOutlined, CalendarOutlined, TagOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * ฟังก์ชันสำหรับจัดรูปแบบตัวเลขให้อ่านง่าย
 * @param {number} value - ค่าตัวเลขที่ต้องการจัดรูปแบบ
 * @returns {string} - ค่าที่จัดรูปแบบแล้ว
 */
const formatCompactNumber = (value) => {
  if (!value && value !== 0) return '-';
  
  if (value < 1000) return value.toString();
  
  if (value < 1000000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  
  return (value / 1000000).toFixed(1) + 'M';
};

/**
 * ฟังก์ชันสำหรับจัดรูปแบบวันที่
 * @param {string|Date} date - วันที่ที่ต้องการจัดรูปแบบ
 * @returns {string} - วันที่ที่จัดรูปแบบแล้ว
 */
const formatDate = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * ProjectStats component ใช้สำหรับแสดงข้อมูลสถิติของโปรเจค
 * 
 * @param {Object} props - Props ของ component
 * @param {Object} props.project - ข้อมูลโปรเจค
 * @param {number} props.project.views - จำนวนการเข้าชม
 * @param {number} props.project.likes - จำนวนการถูกใจ
 * @param {number} props.project.comments - จำนวนความคิดเห็น
 * @param {number} props.project.contributors - จำนวนผู้มีส่วนร่วม
 * @param {Array} props.project.tags - แท็กของโปรเจค
 * @param {Date|string} props.project.createdAt - วันที่สร้างโปรเจค
 * @param {Date|string} props.project.updatedAt - วันที่อัปเดตโปรเจคล่าสุด
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {string} props.size - ขนาดของ statistic ('small', 'default', 'large')
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} ProjectStats component
 */
const ProjectStats = ({ 
  project,
  loading = false,
  size = 'default',
  style
}) => {
  if (!project) return null;

  const { 
    views = 0, 
    likes = 0, 
    comments = 0, 
    contributors = 0, 
    tags = [], 
    createdAt, 
    updatedAt 
  } = project;

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
      <Title level={4} style={{ marginBottom: 16 }}>สถิติโปรเจค</Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนการเข้าชม">
            <Statistic
              title="การเข้าชม"
              value={views}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<EyeOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนการถูกใจ">
            <Statistic
              title="ถูกใจ"
              value={likes}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<LikeOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนความคิดเห็น">
            <Statistic
              title="ความคิดเห็น"
              value={comments}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<MessageOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนผู้มีส่วนร่วม">
            <Statistic
              title="ผู้มีส่วนร่วม"
              value={contributors}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<UserOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนแท็ก">
            <Statistic
              title="แท็ก"
              value={Array.isArray(tags) ? tags.length : 0}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<TagOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="วันที่สร้าง">
            <Statistic
              title="สร้างเมื่อ"
              value={formatDate(createdAt) || 'ไม่ระบุ'}
              valueStyle={{ fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16 }}
              prefix={<CalendarOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
            />
          </Tooltip>
        </Col>
      </Row>
    </Card>
  );
};

export default ProjectStats;