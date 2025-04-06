import React from 'react';
import { 
  Button, Typography, Space, Tag 
} from 'antd';
import { 
  UserOutlined, ClockCircleOutlined, 
  CheckCircleOutlined, EyeOutlined, DeleteOutlined, ArrowLeftOutlined , TeamOutlined
} from '@ant-design/icons';
import { 
  getCategoryName, getCategoryColor, 
  getStatusName, getStatusColor, 
  formatThaiDate 
} from '../../utils/projectUtils';

const { Title, Text } = Typography;

const ProjectHeader = ({ 
  project, 
  navigate, 
  setDeleteModalVisible,
  handleActionClick 
}) => {
  const getCategoryIcon = (category) => {
    switch (category) {
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
    <>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/projects')} 
        className="mb-4 pl-0"
      >
        กลับไปหน้าจัดการโปรเจค
      </Button>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
        <div>
          <Title level={4}>{project.title}</Title>
          <Space className="mb-2">
            <Tag color={getCategoryColor(project.type)} icon={getCategoryIcon(project.type)}>
              {getCategoryName(project.type)}
            </Tag>
            <Tag color={getStatusColor(project.status)}>
              {getStatusName(project.status)}
            </Tag>
            {project.visibility ? (
              <Tag color="green">เผยแพร่</Tag>
            ) : (
              <Tag color="gray">ซ่อน</Tag>
            )}
          </Space>
          <Text type="secondary" className="block">
            <UserOutlined /> เจ้าของ: {project.full_name || project.username || 'ไม่ระบุ'}
          </Text>
          <Text type="secondary" className="block">
            <ClockCircleOutlined /> สร้างเมื่อ: {formatThaiDate(project.created_at)}
          </Text>
        </div>

        <div className="mt-4 sm:mt-0">
          <Space>
            <Button 
              type="primary" 
              icon={project.status === 'pending' ? <CheckCircleOutlined /> : <EyeOutlined />}
              onClick={() => handleActionClick()}
              className={project.status === 'pending' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {project.status === 'pending' ? 'อนุมัติโปรเจค' : 'ดูหน้าเว็บไซต์'}
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
            >
              ลบโปรเจค
            </Button>
          </Space>
        </div>
      </div>

      {project.cover_image && (
        <div className="mb-6">
          <Image 
            src={project.cover_image} 
            alt={project.title} 
            className="max-h-80 object-contain w-full"
            fallback="https://via.placeholder.com/800x400?text=ไม่มีภาพ"
          />
        </div>
      )}
    </>
  );
};

export default ProjectHeader;