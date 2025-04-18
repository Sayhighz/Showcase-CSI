import React from 'react';
import { Radio, Card, Space, Typography } from 'antd';
import { BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { PROJECT_TYPE, PROJECT_TYPE_DISPLAY, PROJECT_TYPE_DESCRIPTION } from '../../constants/projectTypes';

const { Title, Text, Paragraph } = Typography;

/**
 * Component for selecting project type
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectType - Selected project type
 * @param {Function} props.setProjectType - Function to set project type
 * @returns {React.ReactElement} - Project type selection component
 */
const ProjectTypeStep = ({ projectType, setProjectType }) => {
  const handleTypeChange = (e) => {
    setProjectType(e.target.value);
  };

  const renderTypeCard = (type, icon, title, description) => {
    const isSelected = projectType === type;
    
    return (
      <Card 
        className={`project-type-card cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-2 border-blue-500 shadow-md' : ''}`}
        onClick={() => setProjectType(type)}
      >
        <div className="flex items-center mb-2">
          <Radio 
            checked={isSelected} 
            onChange={() => setProjectType(type)}
            className="mr-2"
          />
          <Title level={4} className="m-0 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </Title>
        </div>
        <Paragraph className="text-gray-600">{description}</Paragraph>
      </Card>
    );
  };

  return (
    <div className="project-type-step">
      <div className="mb-6">
        <Title level={3}>เลือกประเภทโครงงาน</Title>
        <Paragraph className="text-gray-600">
          โปรดเลือกประเภทของโครงงานที่คุณต้องการอัปโหลด เพื่อให้ระบบสามารถจัดเตรียมฟอร์มที่เหมาะสม
        </Paragraph>
      </div>

      <Radio.Group
        value={projectType}
        onChange={handleTypeChange}
        className="w-full"
      >
        <Space direction="vertical" size="large" className="w-full">
          {renderTypeCard(
            PROJECT_TYPE.COURSEWORK,
            <TeamOutlined className="text-green-500" />,
            PROJECT_TYPE_DISPLAY[PROJECT_TYPE.COURSEWORK],
            PROJECT_TYPE_DESCRIPTION[PROJECT_TYPE.COURSEWORK]
          )}
          
          {renderTypeCard(
            PROJECT_TYPE.ACADEMIC,
            <BookOutlined className="text-blue-500" />,
            PROJECT_TYPE_DISPLAY[PROJECT_TYPE.ACADEMIC],
            PROJECT_TYPE_DESCRIPTION[PROJECT_TYPE.ACADEMIC]
          )}
          
          {renderTypeCard(
            PROJECT_TYPE.COMPETITION,
            <TrophyOutlined className="text-yellow-500" />,
            PROJECT_TYPE_DISPLAY[PROJECT_TYPE.COMPETITION],
            PROJECT_TYPE_DESCRIPTION[PROJECT_TYPE.COMPETITION]
          )}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default ProjectTypeStep;