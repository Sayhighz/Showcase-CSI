import React from 'react';
import { motion } from 'framer-motion';
import { Typography, Button, Space, Tag } from 'antd';
import { FireOutlined, EyeOutlined, ArrowRightOutlined, TeamOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from '../../constants';

const { Title, Text, Paragraph } = Typography;

const ProjectCard = ({ 
  project, 
  colorScheme = 'light',
  showCollaborators = false 
}) => {
  // Color configuration for both themes
  const cardStyles = {
    light: {
      bg: 'bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm',
      border: 'border border-gray-200 hover:border-[#90278E]',
      shadow: '0 4px 20px rgba(144, 39, 142, 0.1)',
      shadowHover: '0 12px 30px rgba(144, 39, 142, 0.2)',
      title: '#90278E',
      text: 'inherit',
      secondary: 'rgba(0, 0, 0, 0.6)',
      footer: 'bg-gray-50',
      footerBorder: 'border-gray-100'
    },
    dark: {
      bg: 'bg-[#90278E] bg-opacity-10 backdrop-filter backdrop-blur-sm',
      border: 'border border-white border-opacity-10 hover:border-white hover:border-opacity-30',
      shadow: '0 4px 20px rgba(144, 39, 142, 0.15)',
      shadowHover: '0 12px 30px rgba(144, 39, 142, 0.3)',
      title: 'white',
      text: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.6)',
      footer: 'bg-white bg-opacity-5',
      footerBorder: 'border-white border-opacity-10'
    }
  };

  const styles = cardStyles[colorScheme];

  // Render collaborators if available and requested
  const renderCollaborators = () => {
    if (!showCollaborators || !project.collaborators || project.collaborators.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center space-x-2 mt-3 p-2 rounded-lg bg-purple-50 bg-opacity-50">
        <TeamOutlined className="text-[#90278E]" />
        <Text className="text-xs" style={{ color: styles.secondary }}>
          +{project.collaborators.length} ผู้ร่วมพัฒนา
        </Text>
      </div>
    );
  };
  
  return (
    <motion.div 
      className={`${styles.bg} ${styles.border} rounded-xl overflow-hidden transition-all duration-300`}
      style={{ boxShadow: styles.shadow }}
      whileHover={{ 
        y: -8,
        boxShadow: styles.shadowHover
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Card Header */}
      <div className={`p-4 sm:p-5 border-b ${styles.footerBorder}`}>
        <div className="flex justify-between items-start mb-3">
          <Tag color="#90278E" className="text-xs font-medium">
            {project.level}
          </Tag>
          <div className="flex items-center space-x-3 text-xs">
            <span style={{ color: styles.secondary }}>
              <EyeOutlined /> {project.viewsCount || 0}
            </span>
            {project.collaborators && project.collaborators.length > 0 && (
              <span style={{ color: styles.secondary }}>
                <TeamOutlined /> {project.collaborators.length + 1}
              </span>
            )}
          </div>
        </div>
        
        <Title 
          level={3} 
          className="text-base sm:text-lg md:text-xl mb-0 leading-tight" 
          style={{ color: styles.title, marginTop: 0, marginBottom: 0 }}
        >
          {project.title}
        </Title>
      </div>
      
      {/* Card Content */}
      <div className="p-4 sm:p-5">
        <Paragraph 
          className="text-xs sm:text-sm md:text-base mb-4 leading-relaxed" 
          style={{ 
            color: styles.text,
            height: '4.5em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}
        >
          {project.description}
        </Paragraph>
        
        {/* Student info */}
        <div className="flex items-center space-x-3 mb-3">
          {project.userImage ? (
            <img 
              src={`${API_ENDPOINTS.BASE}/${project.userImage}`} 
              alt={project.student}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-200" 
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#90278E] flex items-center justify-center text-white font-bold text-sm">
              {project.student?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Text className="font-medium block text-sm truncate" style={{ color: styles.text }}>
              {project.student}
            </Text>
            <Text className="text-xs" style={{ color: styles.secondary }}>
              @{project.username}
            </Text>
          </div>
        </div>

        {/* Collaborators info */}
        {renderCollaborators()}
      </div>
      
      {/* Card Footer */}
      <div className={`p-4 sm:p-5 ${styles.footer} border-t ${styles.footerBorder}`}>
        <div className="flex justify-between items-center">
          <Text className="text-xs" style={{ color: styles.secondary }}>
            {new Date(project.createdAt).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              type="default"
              size="small"
              icon={<ArrowRightOutlined />}
              className={`text-xs font-medium ${
                colorScheme === 'light' 
                  ? "border border-[#90278E] text-[#90278E] hover:bg-[#90278E] hover:text-white hover:border-[#90278E]" 
                  : "bg-white text-[#90278E] hover:bg-gray-100 border-white"
              }`}
              href={project.projectLink}
            >
              ดูรายละเอียด
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;