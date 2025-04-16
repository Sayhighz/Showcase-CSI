import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag, Space, Typography, Avatar, Tooltip } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { formatDate, getTimeAgo } from '../../utils/dateUtils';
import { PROJECT } from '../../constants/routes';
import { getProjectTypeInfo } from '../../constants/projectTypes';

const { Meta } = Card;
const { Title, Text } = Typography;

/**
 * ProjectCard component ใช้สำหรับแสดงข้อมูลโปรเจคในรูปแบบการ์ด
 * 
 * @param {Object} props - Props ของ component
 * @param {Object} props.project - ข้อมูลโปรเจค
 * @param {string} props.project.id - ID ของโปรเจค
 * @param {string} props.project.title - ชื่อโปรเจค
 * @param {string} props.project.description - คำอธิบายโปรเจค
 * @param {string} props.project.type - ประเภทของโปรเจค (academic, coursework, competition)
 * @param {string} props.project.coverImage - URL ของรูปภาพหน้าปก
 * @param {Date|string} props.project.createdAt - วันที่สร้างโปรเจค
 * @param {Date|string} props.project.updatedAt - วันที่อัปเดตโปรเจคล่าสุด
 * @param {Object} props.project.creator - ข้อมูลผู้สร้างโปรเจค
 * @param {Array} props.project.tags - แท็กของโปรเจค
 * @param {number} props.project.views - จำนวนการเข้าชม
 * @param {number} props.project.likes - จำนวนการถูกใจ
 * @param {number} props.project.comments - จำนวนความคิดเห็น
 * @param {string} props.size - ขนาดของการ์ด ('small', 'default', 'large')
 * @param {Function} props.onClick - ฟังก์ชันที่จะทำงานเมื่อคลิกที่การ์ด
 * @param {Object} props.style - Custom style สำหรับการ์ด
 * @returns {JSX.Element} ProjectCard component
 */
const ProjectCard = ({ 
  project, 
  size = 'default', 
  onClick,
  style
}) => {
  if (!project) return null;

  const { 
    id, 
    title, 
    description, 
    type, 
    coverImage, 
    createdAt, 
    creator, 
    tags = [], 
    views = 0, 
    likes = 0, 
    comments = 0 
  } = project;

  // ดึงข้อมูลประเภทโปรเจค
  const projectTypeInfo = getProjectTypeInfo(type);

  // สร้าง component action ด้านล่างของการ์ด
  const cardActions = [
    <Tooltip title="จำนวนการเข้าชม">
      <Space>
        <EyeOutlined /> 
        {views}
      </Space>
    </Tooltip>,
    <Tooltip title="จำนวนการถูกใจ">
      <Space>
        <LikeOutlined /> 
        {likes}
      </Space>
    </Tooltip>,
    <Tooltip title="จำนวนความคิดเห็น">
      <Space>
        <MessageOutlined /> 
        {comments}
      </Space>
    </Tooltip>
  ];

  // สร้าง component รูปภาพหน้าปก
  const cardCover = coverImage ? (
    <div className="project-card-image-container" style={{ height: size === 'small' ? 120 : 180, overflow: 'hidden' }}>
      <img 
        alt={title}
        src={coverImage}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover'
        }}
      />
    </div>
  ) : null;

  const handleCardClick = () => {
    if (onClick) {
      onClick(project);
    }
  };

  return (
    <Link to={PROJECT.VIEW(id)} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        cover={cardCover}
        actions={cardActions}
        size={size}
        style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          ...style
        }}
        onClick={handleCardClick}
      >
        <div style={{ marginBottom: 8 }}>
          {projectTypeInfo && (
            <Tag color={projectTypeInfo.color}>
              {projectTypeInfo.emoji} {projectTypeInfo.label}
            </Tag>
          )}
        </div>
        <Meta
          title={
            <Title level={4} ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
              {title}
            </Title>
          }
          description={
            <Text type="secondary" ellipsis={{ rows: 2 }}>
              {description || 'ไม่มีคำอธิบาย'}
            </Text>
          }
        />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {creator && (
            <Space>
              <Avatar 
                src={creator.avatar} 
                size="small"
              >
                {creator.fullName ? creator.fullName.charAt(0) : '?'}
              </Avatar>
              <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                {creator.fullName || 'ไม่ระบุชื่อ'}
              </Text>
            </Space>
          )}
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>
            {getTimeAgo(createdAt) || formatDate(createdAt) || 'ไม่ระบุวันที่'}
          </Text>
        </div>
        {tags.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Space size={[0, 4]} wrap>
              {tags.slice(0, 3).map((tag, index) => (
                <Tag key={index} style={{ marginRight: 4 }}>
                  {tag}
                </Tag>
              ))}
              {tags.length > 3 && (
                <Tag>+{tags.length - 3}</Tag>
              )}
            </Space>
          </div>
        )}
      </Card>
    </Link>
  );
};

export default ProjectCard;