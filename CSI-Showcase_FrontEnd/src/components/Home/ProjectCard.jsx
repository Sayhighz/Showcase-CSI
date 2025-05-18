import React from 'react';
import { motion } from 'framer-motion';
import { Typography, Button, Space, Tag } from 'antd';
import { FireOutlined, EyeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from '../../constants';

const { Title, Text, Paragraph } = Typography;

const ProjectCard = ({ project, colorScheme = 'light' }) => {
  // Set text color based on color scheme
  const textColor = colorScheme === 'light' ? '#90278E' : 'white';
  
  // GitHub card styles
  const cardBg = colorScheme === 'light' 
    ? 'bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm' 
    : 'bg-[#90278E] bg-opacity-10 backdrop-filter backdrop-blur-sm';
  
  const cardBorder = colorScheme === 'light'
    ? 'border border-gray-200'
    : 'border border-white border-opacity-10';
  
  return (
    <motion.div 
      className={`${cardBg} ${cardBorder} rounded-xl overflow-hidden shadow-lg transition-all duration-300`}
      whileHover={{ 
        y: -5, 
        boxShadow: '0 12px 24px rgba(144, 39, 142, 0.2)',
        borderColor: colorScheme === 'light' ? '#90278E' : 'rgba(255, 255, 255, 0.3)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Card Header */}
      <div className="p-3 sm:p-5 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <Tag color="#90278E" className="mb-2 text-xs">{project.level}</Tag>
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Text type="secondary" style={{ color: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'inherit' }}>
              <EyeOutlined /> {project.viewsCount}
            </Text>
          </div>
        </div>
        
        <Title level={3} className="text-base sm:text-lg md:text-xl" style={{ color: textColor, marginTop: 0 }}>{project.title}</Title>
      </div>
      
      {/* Card Content */}
      <div className="p-3 sm:p-5">
        <Paragraph 
          className="text-xs sm:text-sm md:text-base mb-4 sm:mb-6" 
          style={{ 
            color: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'inherit',
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
        
        <div className="flex items-center space-x-3 mb-4">
          {project.userImage ? (
            <img 
              src={`${API_ENDPOINTS.BASE}/${project.userImage}`} 
              alt={project.student}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-100" 
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#90278E] flex items-center justify-center text-white font-bold">
              {project.student.charAt(0)}
            </div>
          )}
          <div>
            <Text className="font-medium block text-sm sm:text-base" style={{ color: colorScheme === 'dark' ? 'white' : 'inherit' }}>
              {project.student}
            </Text>
            <Text type="secondary" className="text-xs sm:text-sm" style={{ color: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'inherit' }}>
              {project.username}
            </Text>
          </div>
        </div>
      </div>
      
      {/* Card Footer - GitHub style */}
      <div className="p-3 sm:p-5 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <Text type="secondary" className="text-xs sm:text-sm" style={{ color: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'inherit' }}>
            {new Date(project.createdAt).toLocaleDateString('th-TH')}
          </Text>
          <Button 
            type="default"
            size="small"
            icon={<ArrowRightOutlined />}
            className={`text-xs sm:text-sm ${colorScheme === 'light' ? 
              "border border-[#90278E] text-[#90278E] hover:bg-[#90278E] hover:text-white" : 
              "bg-white text-[#90278E] hover:bg-gray-100 border-none"}`}
            href={project.projectLink}
          >
            ดูรายละเอียด
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;