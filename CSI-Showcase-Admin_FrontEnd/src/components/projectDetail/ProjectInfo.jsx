// src/components/projectDetail/ProjectInfo.jsx
import React from 'react';
import { Typography, Card, Descriptions, Divider, Tag, Alert, Empty } from 'antd';
import { 
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  GlobalOutlined,
  TagOutlined,
  CalendarOutlined,
  BuildOutlined,
  UserOutlined,
  ReadOutlined,
  ApartmentOutlined,
  FileTextOutlined
} from '@ant-design/icons';

// Constants for mapping competition levels to Thai names
const COMPETITION_LEVELS = {
  department: 'ระดับภาควิชา',
  faculty: 'ระดับคณะ',
  university: 'ระดับมหาวิทยาลัย',
  national: 'ระดับประเทศ',
  international: 'ระดับนานาชาติ'
};

// Map level to color
const LEVEL_COLORS = {
  department: 'blue',
  faculty: 'cyan',
  university: 'purple',
  national: 'magenta',
  international: 'gold'
};

const { Title, Paragraph, Text } = Typography;

const ProjectInfo = ({ projectDetails }) => {
  // Check if projectDetails is available
  if (!projectDetails) {
    return <Empty description="ไม่มีข้อมูลผลงาน" />;
  }

  // Extract specific details based on project type
  const renderSpecificInfo = () => {
    switch(projectDetails.type) {
      case 'competition':
        if (!projectDetails.competition) return null;
        
        return (
          <Card 
            className="mb-6 hover-shadow" 
            title={
              <Title level={5} className="flex items-center my-0">
                <TrophyOutlined className="mr-2 text-yellow-500" /> ข้อมูลการแข่งขัน
              </Title>
            }
          >
            {projectDetails.competition.achievement && (
              <Alert
                message={
                  <div className="flex items-center">
                    <TrophyOutlined className="mr-2 text-yellow-500" />
                    <Text strong>{projectDetails.competition.achievement}</Text>
                  </div>
                }
                type="success"
                className="mb-4"
                showIcon={false}
              />
            )}

            <Descriptions bordered column={{ xs: 1, sm: 2 }} className="competition-info">
              <Descriptions.Item 
                label={<Text strong><CalendarOutlined className="mr-1" /> ชื่อการแข่งขัน</Text>} 
                span={2}
              >
                <Text>{projectDetails.competition.competition_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<Text strong><CalendarOutlined className="mr-1" /> ปีที่จัดการแข่งขัน</Text>}
              >
                <Tag color="blue">{projectDetails.competition.competition_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<Text strong><ApartmentOutlined className="mr-1" /> ระดับการแข่งขัน</Text>}
              >
                <Tag color={LEVEL_COLORS[projectDetails.competition.competition_level] || 'blue'}>
                  {COMPETITION_LEVELS[projectDetails.competition.competition_level] || projectDetails.competition.competition_level}
                </Tag>
              </Descriptions.Item>
              
              {projectDetails.competition.team_members && (
                <Descriptions.Item 
                  label={<Text strong><TeamOutlined className="mr-1" /> ทีม</Text>} 
                  span={2}
                >
                  <div className="flex flex-wrap gap-1 mt-1">
                    {projectDetails.competition.team_members.split(',').map((member, idx) => (
                      <Tag key={idx} color="cyan" className="py-1">
                        <UserOutlined className="mr-1" />
                        {member.trim()}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        );
      
      case 'academic':
        if (!projectDetails.academic) return null;
        
        return (
          <Card 
            className="mb-6 hover-shadow" 
            title={
              <Title level={5} className="flex items-center my-0">
                <BookOutlined className="mr-2 text-blue-500" /> ข้อมูลบทความวิชาการ
              </Title>
            }
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }} className="academic-info">
              <Descriptions.Item 
                label={<Text strong><CalendarOutlined className="mr-1" /> ปีที่ตีพิมพ์</Text>}
              >
                <Tag color="blue">{projectDetails.academic.published_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<Text strong><CalendarOutlined className="mr-1" /> วันที่ตีพิมพ์</Text>}
              >
                {projectDetails.academic.publication_date || 'ไม่ระบุ'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={<Text strong><GlobalOutlined className="mr-1" /> แหล่งตีพิมพ์</Text>}
                span={2}
              >
                <Tag color="cyan">{projectDetails.academic.publication_venue || 'ไม่ระบุ'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<Text strong><UserOutlined className="mr-1" /> ผู้เขียน</Text>}
                span={2}
              >
                <div className="flex flex-wrap gap-1 mt-1">
                  {projectDetails.academic.authors ? 
                    projectDetails.academic.authors.split(',').map((author, idx) => (
                      <Tag key={idx} color="geekblue" className="py-1">
                        <UserOutlined className="mr-1" />
                        {author.trim()}
                      </Tag>
                    )) : 'ไม่ระบุ'
                  }
                </div>
              </Descriptions.Item>
            </Descriptions>

            {projectDetails.academic.abstract && (
              <div className="mt-4">
                <Title level={5} className="flex items-center">
                  <FileTextOutlined className="mr-2" /> บทคัดย่อ
                </Title>
                <Card className="bg-gray-50">
                  <Paragraph>
                    {projectDetails.academic.abstract}
                  </Paragraph>
                </Card>
              </div>
            )}
          </Card>
        );
      
      case 'coursework':
        if (!projectDetails.coursework) return null;
        
        return (
          <Card 
            className="mb-6 hover-shadow" 
            title={
              <Title level={5} className="flex items-center my-0">
                <TeamOutlined className="mr-2 text-green-500" /> ข้อมูลผลงานการเรียนการสอน
              </Title>
            }
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }} className="coursework-info">
              <Descriptions.Item 
                label={<Text strong><ReadOutlined className="mr-1" /> รหัสวิชา</Text>}
              >
                <Tag color="green">{projectDetails.coursework.course_code || 'ไม่ระบุ'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<Text strong><BookOutlined className="mr-1" /> ชื่อวิชา</Text>}
              >
                <Text>{projectDetails.coursework.course_name || 'ไม่ระบุ'}</Text>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<Text strong><UserOutlined className="mr-1" /> อาจารย์ผู้สอน</Text>}
                span={2}
              >
                <Tag color="cyan">
                  <UserOutlined className="mr-1" />
                  {projectDetails.coursework.instructor || 'ไม่ระบุ'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fade-in">
      {/* Project Description */}
      <Card 
        className="mb-6 hover-shadow" 
        title={
          <Title level={5} className="flex items-center my-0">
            <TagOutlined className="mr-2 text-primary" /> รายละเอียดผลงาน
          </Title>
        }
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          {projectDetails.description ? (
            <Paragraph className="whitespace-pre-line">
              {projectDetails.description}
            </Paragraph>
          ) : (
            <div className="text-center py-4">
              <Text type="secondary" italic>ไม่มีคำอธิบายรายละเอียด</Text>
            </div>
          )}
        </div>
      </Card>

      {/* Type-specific information */}
      {renderSpecificInfo()}
    </div>
  );
};

export default ProjectInfo;