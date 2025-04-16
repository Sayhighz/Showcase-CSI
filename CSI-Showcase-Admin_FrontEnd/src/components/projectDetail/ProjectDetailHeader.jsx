// src/components/projectDetail/ProjectDetailHeader.jsx
import React from 'react';
import { Row, Col, Descriptions, Image, Card, Statistic, Tag, Typography, Tooltip, Badge } from 'antd';
import { 
  EyeOutlined, 
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  FileTextOutlined,
  StarFilled
} from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dataUtils';

// Components
import StatusTag from '../common/StatusTag';
import ProjectTypeBadge from '../common/ProjectTypeBadge';
import UserAvatar from '../common/UserAvatar';

const { Title, Text } = Typography;

const ProjectDetailHeader = ({ projectDetails }) => {
  // Safely handle undefined data
  if (!projectDetails) {
    return <div className="flex justify-center items-center h-40 bg-gray-100 rounded-md">กำลังโหลดข้อมูล...</div>;
  }
  
  // Format the created date
  const formattedDate = projectDetails.created_at ? formatThaiDate(projectDetails.created_at) : 'ไม่มีข้อมูล';
  
  // Find cover image if available
  const coverImage = projectDetails.files?.find(
    file => file.file_id === projectDetails.cover_image_id
  );
  
  // Process tags
  const tags = projectDetails.tags ? projectDetails.tags.split(',') : [];

  // Get icon for project type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'academic':
        return <BookOutlined />;
      case 'coursework':
        return <TeamOutlined />;
      case 'competition':
        return <TrophyOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  // Get text for project type
  const getTypeText = (type) => {
    switch (type) {
      case 'competition':
        return 'การแข่งขัน';
      case 'academic':
        return 'บทความวิชาการ';
      case 'coursework':
        return 'ผลงานการเรียน';
      default:
        return 'ผลงานทั่วไป';
    }
  };

  // Get color for project type
  const getTypeColor = (type) => {
    switch (type) {
      case 'competition':
        return 'gold';
      case 'academic':
        return 'blue';
      case 'coursework':
        return 'green';
      default:
        return 'default';
    }
  };

  // Get status config (icon, color, text)
  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'success', text: 'อนุมัติแล้ว' };
      case 'rejected':
        return { color: 'error', text: 'ถูกปฏิเสธ' };
      case 'pending':
      default:
        return { color: 'warning', text: 'รอตรวจสอบ' };
    }
  };

  const statusConfig = getStatusConfig(projectDetails.status);

  return (
    <div className="fade-in">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="h-full hover-shadow">
            <div className="flex flex-col items-center">
              {coverImage ? (
                <Badge.Ribbon 
                  text={getTypeText(projectDetails.type)} 
                  color={getTypeColor(projectDetails.type)}
                  className="z-10"
                >
                  <div className="relative w-full overflow-hidden rounded-lg mb-4">
                    <Image 
                      src={`/api/files/${coverImage.file_path}`} 
                      alt={projectDetails.title}
                      className="cover-image w-full object-cover"
                      style={{ height: '240px' }}
                      fallback="https://via.placeholder.com/400x240?text=ไม่มีรูปภาพ"
                      preview={{ mask: <div className="flex items-center justify-center">ดูเต็ม</div> }}
                    />
                  </div>
                </Badge.Ribbon>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                  {getTypeIcon(projectDetails.type)}
                  <span className="text-gray-500 ml-2">ไม่มีรูปภาพ</span>
                </div>
              )}
              
              <div className="flex justify-center gap-2 mt-2 mb-4 w-full">
                <Tag 
                  className="status-tag text-center flex-1"
                  color={statusConfig.color}
                >
                  {statusConfig.text}
                </Tag>
              </div>
              
              <div className="flex justify-between w-full mt-4 bg-gray-50 p-4 rounded-lg">
                <Statistic 
                  title={<div className="flex items-center"><EyeOutlined className="mr-1" /> การเข้าชม</div>}
                  value={projectDetails.views_count || 0} 
                  valueStyle={{ fontSize: '1.5rem', color: '#1677ff' }}
                />
                <Statistic 
                  title={<div className="flex items-center"><CalendarOutlined className="mr-1" /> สร้างเมื่อ</div>}
                  value={formattedDate} 
                  valueStyle={{ fontSize: '1rem' }}
                />
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card className="h-full hover-shadow">
            <Title level={3} className="mb-1 flex items-center">
              {projectDetails.title}
              {projectDetails.type === 'competition' && projectDetails.competition?.achievement && (
                <Tooltip title={projectDetails.competition.achievement}>
                  <StarFilled className="ml-2 text-yellow-400" />
                </Tooltip>
              )}
            </Title>
            
            <Text type="secondary" className="mb-6 block">
              {projectDetails.subtitle || `${getTypeText(projectDetails.type)} • ปีการศึกษา ${projectDetails.year}`}
            </Text>
            
            <Descriptions title="ข้อมูลผลงาน" bordered column={{ xs: 1, sm: 2 }} className="mt-6">
              <Descriptions.Item label={<strong>เจ้าของผลงาน</strong>} span={2}>
                <div className="flex items-center">
                  <UserAvatar 
                    user={{
                      full_name: projectDetails.full_name,
                      image: projectDetails.image
                    }} 
                    size="default"
                  />
                  <div className="ml-2">
                    <Text strong className="block">{projectDetails.full_name}</Text>
                    <Text type="secondary" className="text-xs">{projectDetails.email}</Text>
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={<strong>ชั้นปี</strong>}>
                <Tag color="cyan">ปี {projectDetails.study_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<strong>ปีการศึกษา</strong>}>
                <Tag color="blue">{projectDetails.year} • {
                  projectDetails.semester === '1' ? 'ภาคต้น' : 
                  projectDetails.semester === '2' ? 'ภาคปลาย' : 'ภาคฤดูร้อน'
                }</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<strong>คำสำคัญ</strong>} span={2}>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <Tag key={index} color="blue" className="mb-1 py-1">
                        {tag.trim()}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">ไม่มีคำสำคัญ</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetailHeader;