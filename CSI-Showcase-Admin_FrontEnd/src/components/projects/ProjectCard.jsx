import React from 'react';
import { Card, Tag, Typography, Avatar, Space, Button, Tooltip, Badge } from 'antd';
import { 
  EyeOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import { getCategoryName, getCategoryColor, getStatusName, getStatusColor } from '../../utils/projectUtils';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showActions = true,
  showStatus = true,
  className = '',
  style = {},
}) => {
  if (!project) return null;

  // สร้าง action buttons
  const getActions = () => {
    if (!showActions) return [];

    const actions = [
      <Tooltip title="ดูรายละเอียด" key="view">
        <Link to={`/projects/${project.project_id}`}>
          <Button type="text" icon={<EyeOutlined />} />
        </Link>
      </Tooltip>,
    ];

    if (onEdit) {
      actions.push(
        <Tooltip title="แก้ไข" key="edit">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(project.project_id)} 
          />
        </Tooltip>
      );
    }

    if (project.status === 'pending' && onApprove) {
      actions.push(
        <Tooltip title="อนุมัติ" key="approve">
          <Button 
            type="text" 
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
            onClick={() => onApprove(project.project_id)} 
          />
        </Tooltip>
      );
    }

    if (project.status === 'pending' && onReject) {
      actions.push(
        <Tooltip title="ปฏิเสธ" key="reject">
          <Button 
            type="text" 
            icon={<CloseCircleOutlined style={{ color: '#f5222d' }} />} 
            onClick={() => onReject(project.project_id)} 
          />
        </Tooltip>
      );
    }

    if (onDelete) {
      actions.push(
        <Tooltip title="ลบ" key="delete">
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(project.project_id, project.title)} 
          />
        </Tooltip>
      );
    }

    return actions;
  };

  return (
    <Card
      cover={
        <div className="h-48 bg-gray-100 relative">
          {project.image ? (
            <img
              alt={project.title}
              src={`/uploads/images/${project.image}`}
              className="h-full w-full object-cover"
              onError={(e) => { e.target.src = '/images/project-placeholder.png'; }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
              <Text type="secondary">ไม่มีรูปภาพ</Text>
            </div>
          )}
          
          {showStatus && (
            <div className="absolute top-2 right-2">
              <Badge 
                count={getStatusName(project.status)}
                style={{ 
                  backgroundColor: getStatusColor(project.status) === 'success' ? '#52c41a' :
                                  getStatusColor(project.status) === 'error' ? '#f5222d' :
                                  '#faad14',
                }}
              />
            </div>
          )}
          
          <div className="absolute bottom-2 left-2">
            <Tag color={getCategoryColor(project.type)}>
              {getCategoryName(project.type)}
            </Tag>
          </div>
        </div>
      }
      actions={getActions()}
      className={`h-full hover:shadow-md transition-shadow ${className}`}
      style={{ ...style }}
    >
      <Meta
        title={
          <Link to={`/projects/${project.project_id}`} className="hover:text-purple-700">
            {project.title}
          </Link>
        }
        description={
          <Paragraph ellipsis={{ rows: 2 }} className="text-gray-600">
            {project.description || 'ไม่มีคำอธิบาย'}
          </Paragraph>
        }
      />
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to={`/users/${project.user_id}`}>
              <Avatar 
                src={project.user_image ? `/uploads/profiles/${project.user_image}` : null}
                icon={!project.user_image && <UserOutlined />}
                size="small"
                className="mr-2"
                style={{ 
                  backgroundColor: !project.user_image ? '#90278E' : undefined,
                }}
              />
              <Text className="text-sm hover:text-purple-700">
                {project.username || 'ไม่ระบุชื่อ'}
              </Text>
            </Link>
          </div>
          
          <Space>
            <Tooltip title="จำนวนการเข้าชม">
              <div className="flex items-center text-gray-500">
                <EyeOutlined className="mr-1" />
                <Text className="text-sm">{project.views_count || 0}</Text>
              </div>
            </Tooltip>
            
            <Tooltip title={formatThaiDate(project.created_at, { dateStyle: 'full' })}>
              <div className="flex items-center text-gray-500 ml-2">
                <CalendarOutlined className="mr-1" />
                <Text className="text-sm">{formatThaiDate(project.created_at, { dateStyle: 'short' })}</Text>
              </div>
            </Tooltip>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;