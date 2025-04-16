// src/components/dashboard/RecentProjects.jsx
import React from 'react';
import { List, Avatar, Tag, Space, Empty } from 'antd';
import { Link } from 'react-router-dom';
import StatusTag from '../common/StatusTag';
import ProjectTypeBadge from '../common/ProjectTypeBadge';
import UserAvatar from '../common/UserAvatar';
import { formatThaiDate } from '../../utils/dataUtils';
import { truncateText } from '../../utils/stringUtils';

/**
 * Component แสดงรายการโปรเจคล่าสุด
 * 
 * @param {Object} props
 * @param {Array} props.projects - ข้อมูลโปรเจคล่าสุด
 */
const RecentProjects = ({ projects = [] }) => {
  if (!projects || projects.length === 0) {
    return <Empty description="ไม่มีโปรเจคล่าสุด" />;
  }


  return (
    <List
      dataSource={projects}
      renderItem={(project) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar 
                src={project.cover_image} 
                shape="square" 
                size={64}
                style={{ backgroundColor: '#f0f0f0' }}
              >
                {!project.cover_image && project.title?.charAt(0)}
              </Avatar>
            }
            title={
              <Link to={`/projects/${project.project_id}`}>
                {truncateText(project.title, 60)}
              </Link>
            }
            description={
              <Space direction="vertical" size="small">
                <Space>
                  <StatusTag type="project" status={project.status} />
                  <ProjectTypeBadge type={project.type} size="small" />
                </Space>
                <Space className="text-gray-500 text-sm">
                  <span>ปีการศึกษา {project.year}</span>
                  {project.user && (
                    <span>
                      โดย <UserAvatar user={project.user} size="small" /> {project.user.full_name || project.user.username}
                    </span>
                  )}
                </Space>
              </Space>
            }
          />
          <div className="text-gray-400 text-xs">
            {formatThaiDate(project.created_at)}
          </div>
        </List.Item>
      )}
    />
  );
};

export default RecentProjects;