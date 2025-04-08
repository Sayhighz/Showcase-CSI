// src/components/projectDetail/ProjectDetailHeader.jsx
import React from 'react';
import { Row, Col, Descriptions, Image, Card, Statistic, Tag } from 'antd';
import { 
  EyeOutlined, 
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dataUtils';

// Components
import StatusTag from '../common/StatusTag';
import ProjectTypeBadge from '../common/ProjectTypeBadge';
import UserAvatar from '../common/UserAvatar';

const ProjectDetailHeader = ({ projectDetails }) => {
  // Safely handle undefined data
  if (!projectDetails) {
    return <div>กำลังโหลดข้อมูล...</div>;
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

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={8}>
        <Card className="h-full">
          <div className="flex flex-col items-center">
            {coverImage ? (
              <Image 
                src={`/api/files/${coverImage.file_path}`} 
                alt={projectDetails.title}
                className="w-full object-cover rounded mb-4"
                style={{ maxHeight: '200px' }}
                fallback="https://via.placeholder.com/400x200?text=ไม่มีรูปภาพ"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded mb-4">
                <span className="text-gray-500">ไม่มีรูปภาพ</span>
              </div>
            )}
            
            <div className="flex justify-center gap-2 mt-2 mb-4">
              <Tag 
                color={projectDetails.type === 'competition' ? 'gold' : 
                       projectDetails.type === 'academic' ? 'blue' : 'green'}
                icon={getTypeIcon(projectDetails.type)}
              >
                {projectDetails.type === 'competition' ? 'การแข่งขัน' : 
                 projectDetails.type === 'academic' ? 'บทความวิชาการ' : 'ผลงานการเรียน'}
              </Tag>
              <Tag 
                color={
                  projectDetails.status === 'approved' ? 'success' : 
                  projectDetails.status === 'rejected' ? 'error' : 'warning'
                }
              >
                {projectDetails.status === 'approved' ? 'อนุมัติแล้ว' : 
                 projectDetails.status === 'rejected' ? 'ถูกปฏิเสธ' : 'รอตรวจสอบ'}
              </Tag>
            </div>
            
            <div className="flex justify-between w-full mt-2">
              <Statistic 
                title="การเข้าชม" 
                value={projectDetails.views_count} 
                prefix={<EyeOutlined />}
                valueStyle={{ fontSize: '1.2rem' }}
              />
              <Statistic 
                title="สร้างเมื่อ" 
                value={formattedDate} 
                prefix={<CalendarOutlined />}
                valueStyle={{ fontSize: '1.2rem' }}
              />
            </div>
          </div>
        </Card>
      </Col>
      
      <Col xs={24} md={16}>
        <Card className="h-full">
          <Descriptions title="ข้อมูลผลงาน" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="ชื่อผลงาน" span={2}>
              {projectDetails.title}
            </Descriptions.Item>
            <Descriptions.Item label="เจ้าของผลงาน">
              <div className="flex items-center">
                <UserAvatar 
                  user={{
                    full_name: projectDetails.full_name,
                    image: projectDetails.image
                  }} 
                  size="small"
                />
                <span className="ml-2">{projectDetails.full_name}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="อีเมล">
              {projectDetails.email}
            </Descriptions.Item>
            <Descriptions.Item label="ชั้นปี">
              ปี {projectDetails.study_year}
            </Descriptions.Item>
            <Descriptions.Item label="ปีการศึกษา">
              {projectDetails.year}
            </Descriptions.Item>
            <Descriptions.Item label="ภาคการศึกษา">
              {projectDetails.semester === '1' ? 'ภาคต้น' : 
               projectDetails.semester === '2' ? 'ภาคปลาย' : 'ภาคฤดูร้อน'}
            </Descriptions.Item>
            <Descriptions.Item label="คำสำคัญ" span={2}>
              {tags.length > 0 ? (
                <div>
                  {tags.map((tag, index) => (
                    <Tag key={index} color="blue" className="mb-1">
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
  );
};

export default ProjectDetailHeader;