import React from 'react';
import { Card, Typography, Tag, Space, Button, Tooltip, Popconfirm, Image } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, ClockCircleOutlined, TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// นำเข้า utilities
import { formatDate } from '../../utils/dateUtils'
import { truncateText } from '../../utils/formatUtils';
import { getProjectTypeInfo } from '../../constants/projectTypes';

// นำเข้า constants
import { PROJECT } from '../../constants/routes';

const { Title, Text } = Typography;
const { Meta } = Card;

/**
 * คอมโพเนนต์สำหรับแสดงการ์ดโปรเจค
 * @param {Object} props - Props ของคอมโพเนนต์
 * @param {Object} props.project - ข้อมูลโปรเจค
 * @param {Function} props.onEdit - ฟังก์ชันเมื่อกดปุ่มแก้ไข
 * @param {Function} props.onDelete - ฟังก์ชันเมื่อกดปุ่มลบ
 * @param {boolean} props.showActions - แสดงปุ่มแก้ไข/ลบหรือไม่
 * @returns {React.ReactElement} - คอมโพเนนต์ ProjectCard
 */
const ProjectCard = ({ project, onEdit, onDelete, showActions = false }) => {
  const navigate = useNavigate();
  
  // ดึงข้อมูลประเภทโปรเจค
  const projectTypeInfo = getProjectTypeInfo(project.type);
  
  // ฟังก์ชันเมื่อคลิกที่การ์ดเพื่อดูรายละเอียด
  const handleViewDetails = () => {
    navigate(PROJECT.VIEW(project.id));
  };

  // ดูว่ามีรูปภาพหรือไม่
  const coverImage = project.coverImage || project.images?.[0]?.url || '/placeholder-project.jpg';

  return (
    <Card
      hoverable
      className="shadow-md hover:shadow-lg transition-shadow duration-300"
      cover={
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <Image
            alt={project.title}
            src={coverImage}
            className="object-cover w-full h-full"
            preview={false}
            fallback="/placeholder-project.jpg"
            onClick={handleViewDetails}
          />
          {projectTypeInfo && (
            <Tag 
              color={projectTypeInfo.color} 
              className="absolute top-3 right-3 px-2 py-1"
            >
              {projectTypeInfo.emoji} {projectTypeInfo.label}
            </Tag>
          )}
        </div>
      }
      actions={showActions ? [
        <Tooltip title="ดูรายละเอียด" key="view">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={handleViewDetails}
          />
        </Tooltip>,
        <Tooltip title="แก้ไข" key="edit">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit();
            }}
          />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจคนี้?"
          okText="ใช่"
          cancelText="ไม่"
          okButtonProps={{ danger: true }}
          onConfirm={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
        >
          <Tooltip title="ลบ">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              danger
              onClick={(e) => e.stopPropagation()}
            />
          </Tooltip>
        </Popconfirm>
      ] : undefined}
      onClick={handleViewDetails}
    >
      <Meta
        title={<Title level={4} ellipsis={{ rows: 1 }}>{project.title}</Title>}
        description={
          <div className="space-y-2">
            <Text type="secondary" className="block" ellipsis={{ rows: 2 }}>
              {truncateText(project.description || 'ไม่มีคำอธิบาย', 100)}
            </Text>
            
            <Space className="mt-2" size={16}>
              <Text type="secondary">
                <ClockCircleOutlined className="mr-1" />
                {formatDate(project.createdAt)}
              </Text>
              
              {project.tags && project.tags.length > 0 && (
                <Text type="secondary">
                  <TagOutlined className="mr-1" />
                  {project.tags.slice(0, 2).join(', ')}
                  {project.tags.length > 2 && '...'}
                </Text>
              )}
            </Space>
          </div>
        }
      />
    </Card>
  );
};

export default ProjectCard;