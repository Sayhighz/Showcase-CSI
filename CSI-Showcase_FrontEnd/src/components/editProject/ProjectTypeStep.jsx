import React from 'react';
import { Card, Radio, Typography, Row, Col, Alert } from 'antd';
import { BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { PROJECT_TYPES } from '../../constants/projectTypes';

const { Title, Text, Paragraph } = Typography;

/**
 * ProjectTypeStep component for selecting the type of project to upload
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectType - Currently selected project type
 * @param {Function} props.setProjectType - Function to update project type
 * @param {boolean} props.isEditing - Whether we're editing an existing project
 * @returns {JSX.Element} ProjectTypeStep component
 */
const ProjectTypeStep = ({ projectType, setProjectType, isEditing = false }) => {
  // Map icon names to actual icon components
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'BookOutlined':
        return <BookOutlined style={{ fontSize: 32 }} />;
      case 'TeamOutlined':
        return <TeamOutlined style={{ fontSize: 32 }} />;
      case 'TrophyOutlined':
        return <TrophyOutlined style={{ fontSize: 32 }} />;
      default:
        return null;
    }
  };

  return (
    <div className="project-type-step">
      <Title level={3} className="mb-6">เลือกประเภทโครงงาน</Title>
      
      {isEditing && (
        <Alert
          message="โปรดทราบ"
          description="การเปลี่ยนประเภทโครงงานอาจทำให้ต้องกรอกข้อมูลเพิ่มเติมตามประเภทที่เลือก"
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      <Radio.Group 
        onChange={(e) => setProjectType(e.target.value)} 
        value={projectType}
        className="w-full"
        disabled={isEditing} // Disable changing type in edit mode
      >
        <Row gutter={[16, 16]}>
          {PROJECT_TYPES.map((type) => (
            <Col xs={24} md={8} key={type.value}>
              <Radio.Button 
                value={type.value} 
                className="w-full h-full"
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  padding: 0,
                  border: projectType === type.value ? `2px solid ${type.color}` : '1px solid #d9d9d9'
                }}
              >
                <Card 
                  hoverable 
                  className="w-full h-full" 
                  style={{ 
                    textAlign: 'center',
                    borderRadius: 0,
                    border: 'none',
                    height: '100%'
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div 
                      className="icon-container mb-4" 
                      style={{ 
                        color: type.color,
                        fontSize: 36
                      }}
                    >
                      {getIcon(type.icon)}
                    </div>
                    <Title level={4}>{type.label}</Title>
                    <Text type="secondary" style={{ marginBottom: 12 }}>{type.emoji}</Text>
                    <Paragraph>
                      {type.description}
                    </Paragraph>
                  </div>
                </Card>
              </Radio.Button>
            </Col>
          ))}
        </Row>
      </Radio.Group>

      {isEditing && projectType && (
        <Alert
          message="ประเภทโครงงานถูกกำหนดไว้แล้ว"
          description="คุณไม่สามารถเปลี่ยนประเภทโครงงานในโหมดแก้ไข หากต้องการเปลี่ยนประเภท โปรดสร้างโครงงานใหม่"
          type="warning"
          showIcon
          className="mt-6"
        />
      )}
    </div>
  );
};

export default ProjectTypeStep;