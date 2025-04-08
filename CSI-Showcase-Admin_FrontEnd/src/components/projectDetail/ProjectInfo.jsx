// src/components/projectDetail/ProjectInfo.jsx
import React from 'react';
import { Typography, Card, Descriptions, Divider } from 'antd';
import { 
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  GlobalOutlined,
  TagOutlined
} from '@ant-design/icons';

// Constants for mapping competition levels to Thai names
const COMPETITION_LEVELS = {
  department: 'ระดับภาควิชา',
  faculty: 'ระดับคณะ',
  university: 'ระดับมหาวิทยาลัย',
  national: 'ระดับประเทศ',
  international: 'ระดับนานาชาติ'
};

const { Title, Paragraph } = Typography;

const ProjectInfo = ({ projectDetails }) => {
  // Extract specific details based on project type
  const renderSpecificInfo = () => {
    switch(projectDetails.type) {
      case 'competition':
        if (!projectDetails.competition) return null;
        
        return (
          <Card className="mb-6">
            <Title level={5} className="flex items-center">
              <TrophyOutlined className="mr-2" /> ข้อมูลการแข่งขัน
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="ชื่อการแข่งขัน" span={2}>
                {projectDetails.competition.competition_name}
              </Descriptions.Item>
              <Descriptions.Item label="ปีที่จัดการแข่งขัน">
                {projectDetails.competition.competition_year}
              </Descriptions.Item>
              <Descriptions.Item label="ระดับการแข่งขัน">
                {COMPETITION_LEVELS[projectDetails.competition.competition_level] || projectDetails.competition.competition_level}
              </Descriptions.Item>
              <Descriptions.Item label="ผลงานที่ได้รับ" span={2}>
                {projectDetails.competition.achievement || 'ไม่ระบุ'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );
      
      case 'academic':
        if (!projectDetails.academic) return null;
        
        return (
          <Card className="mb-6">
            <Title level={5} className="flex items-center">
              <BookOutlined className="mr-2" /> ข้อมูลบทความวิชาการ
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="ปีที่ตีพิมพ์">
                {projectDetails.academic.published_year}
              </Descriptions.Item>
              <Descriptions.Item label="วันที่ตีพิมพ์">
                {projectDetails.academic.publication_date || 'ไม่ระบุ'}
              </Descriptions.Item>
              <Descriptions.Item label="แหล่งตีพิมพ์" span={2}>
                {projectDetails.academic.publication_venue || 'ไม่ระบุ'}
              </Descriptions.Item>
              <Descriptions.Item label="ผู้เขียน" span={2}>
                {projectDetails.academic.authors || 'ไม่ระบุ'}
              </Descriptions.Item>
              <Descriptions.Item label="บทคัดย่อ" span={2}>
                {projectDetails.academic.abstract || 'ไม่มีบทคัดย่อ'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );
      
      case 'coursework':
        if (!projectDetails.coursework) return null;
        
        return (
          <Card className="mb-6">
            <Title level={5} className="flex items-center">
              <TeamOutlined className="mr-2" /> ข้อมูลผลงานการเรียนการสอน
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="รหัสวิชา">
                {projectDetails.coursework.course_code || 'ไม่ระบุ'}
              </Descriptions.Item>
              <Descriptions.Item label="ชื่อวิชา">
                {projectDetails.coursework.course_name || 'ไม่ระบุ'}
              </Descriptions.Item>
              <Descriptions.Item label="อาจารย์ผู้สอน" span={2}>
                {projectDetails.coursework.instructor || 'ไม่ระบุ'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Project Description */}
      <Card className="mb-6">
        <Title level={5} className="flex items-center">
          <TagOutlined className="mr-2" /> รายละเอียดผลงาน
        </Title>
        <Paragraph>
          {projectDetails.description || 'ไม่มีคำอธิบายรายละเอียด'}
        </Paragraph>
      </Card>

      {/* Type-specific information */}
      {renderSpecificInfo()}
    </div>
  );
};

export default ProjectInfo;