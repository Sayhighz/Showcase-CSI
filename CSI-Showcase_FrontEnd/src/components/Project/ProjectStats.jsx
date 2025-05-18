import React, { useState, useEffect } from 'react';
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // ตรวจสอบขนาดหน้าจอและอัปเดต state
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // ปรับขนาดตาม responsive
  const getResponsiveSize = () => {
    if (windowWidth < 576) return 'xs';
    if (windowWidth < 768) return 'sm';
    if (windowWidth < 992) return 'md';
    if (windowWidth < 1200) return 'lg';
    return 'xl';
  };

  const responsiveSize = getResponsiveSize();
  const isMobile = responsiveSize === 'xs';
  const isTablet = responsiveSize === 'sm' || responsiveSize === 'md';

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

  // กำหนดขนาดของไอคอนตาม size ที่ระบุและ responsive
  const getIconSize = () => {
    // ปรับตาม responsive
    const responsiveFactor = isMobile ? 0.8 : (isTablet ? 0.9 : 1);
    
    // ปรับตาม size ที่กำหนด
    switch (size) {
      case 'small':
        return Math.round(16 * responsiveFactor);
      case 'large':
        return Math.round(24 * responsiveFactor);
      case 'default':
      default:
        return Math.round(20 * responsiveFactor);
    }
  };

  const iconSize = getIconSize();

  // กำหนดขนาดของฟอนต์สำหรับ title และ value ตาม size และขนาดหน้าจอ
  const getTitleFontSize = () => {
    if (isMobile) return '12px';
    if (isTablet) return size === 'small' ? '13px' : '14px';
    return size === 'small' ? '14px' : (size === 'large' ? '16px' : '15px');
  };

  const getValueFontSize = () => {
    if (isMobile) return size === 'small' ? '14px' : '16px';
    if (isTablet) return size === 'small' ? '16px' : '18px';
    return size === 'small' ? '18px' : (size === 'large' ? '22px' : '20px');
  };

  return (
    <Card
      style={{ 
        ...style,
        padding: isMobile ? '8px' : (isTablet ? '12px' : '16px'),
        borderRadius: isMobile ? '8px' : '12px'
      }}
      loading={loading}
      bodyStyle={{ padding: isMobile ? '8px' : (isTablet ? '12px' : '16px') }}
    >
      <Title level={isMobile ? 5 : 4} style={{ 
        marginBottom: isMobile ? 10 : 16,
        fontSize: isMobile ? '16px' : (isTablet ? '18px' : '20px')
      }}>
        สถิติโปรเจค
      </Title>
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 12 : 16]}>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนการเข้าชม">
            <Statistic
              title={<span style={{ fontSize: getTitleFontSize() }}>การเข้าชม</span>}
              value={views}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<EyeOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
              valueStyle={{ fontSize: getValueFontSize() }}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนการถูกใจ">
            <Statistic
              title={<span style={{ fontSize: getTitleFontSize() }}>ถูกใจ</span>}
              value={likes}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<LikeOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
              valueStyle={{ fontSize: getValueFontSize() }}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนความคิดเห็น">
            <Statistic
              title={<span style={{ fontSize: getTitleFontSize() }}>ความคิดเห็น</span>}
              value={comments}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<MessageOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
              valueStyle={{ fontSize: getValueFontSize() }}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนผู้มีส่วนร่วม">
            <Statistic
              title={<span style={{ fontSize: getTitleFontSize() }}>ผู้มีส่วนร่วม</span>}
              value={contributors}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<UserOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
              valueStyle={{ fontSize: getValueFontSize() }}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="จำนวนแท็ก">
            <Statistic
              title={<span style={{ fontSize: getTitleFontSize() }}>แท็ก</span>}
              value={Array.isArray(tags) ? tags.length : 0}
              formatter={(value) => formatCompactNumber(value)}
              prefix={<TagOutlined style={{ fontSize: iconSize }} />}
              loading={loading}
              valueStyle={{ fontSize: getValueFontSize() }}
            />
          </Tooltip>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Tooltip title="วันที่สร้าง">
            <Statistic
              title={<span style={{ fontSize: getTitleFontSize() }}>สร้างเมื่อ</span>}
              value={formatDate(createdAt) || 'ไม่ระบุ'}
              valueStyle={{ fontSize: getValueFontSize() }}
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