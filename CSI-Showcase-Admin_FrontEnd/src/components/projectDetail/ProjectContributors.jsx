// src/components/projectDetail/ProjectContributors.jsx
import React from 'react';
import { Card, List, Typography, Avatar, Space, Tag, Divider, Empty, Badge, Tooltip } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CrownOutlined, 
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  GithubOutlined,
  LinkedinOutlined
} from '@ant-design/icons';

// Components
import UserAvatar from '../common/UserAvatar';

const { Title, Text, Paragraph } = Typography;

// BaseURL for images
const API_BASE_URL = 'http://localhost:4000';

const ProjectContributors = ({ contributors = [], owner, teamMembers = '' }) => {
  // Parse team members string to array
  let teamMembersArray = [];
  if (teamMembers && typeof teamMembers === 'string') {
    teamMembersArray = teamMembers.split(',').map(member => member.trim());
  }
  
  // Generate avatar colors based on name
  const getAvatarColor = (name) => {
    if (!name) return '#1677ff';
    
    const colors = [
      '#1677ff', // blue
      '#52c41a', // green
      '#faad14', // gold
      '#722ed1', // purple
      '#eb2f96', // magenta
      '#fadb14', // yellow
      '#a0d911', // lime
      '#13c2c2', // cyan
      '#fa541c', // orange
    ];
    
    // Get a consistent color based on name
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };
  
  return (
    <div className="fade-in">
      {/* Project Owner */}
      <Card 
        className="mb-6 hover-shadow" 
        title={
          <Title level={5} className="flex items-center my-0">
            <CrownOutlined className="mr-2 text-yellow-500" /> เจ้าของผลงาน
          </Title>
        }
      >
        {owner ? (
          <div className="flex flex-col sm:flex-row items-center bg-gray-50 rounded-lg p-6">
            <Badge.Ribbon text="เจ้าของ" color="gold">
              <div className="flex flex-col items-center">
                <Avatar 
                  size={80}
                  src={owner.user_image ? `${API_BASE_URL}/${owner.user_image}` : null}
                  icon={!owner.user_image && <UserOutlined />}
                  style={{ 
                    backgroundColor: !owner.user_image ? getAvatarColor(owner.full_name) : undefined,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Text strong className="mt-3">{owner.full_name}</Text>
              </div>
            </Badge.Ribbon>
            
            <Divider type="vertical" className="hidden sm:block h-20 mx-6" />
            
            <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-start">
              <div className="avatar-item mb-3">
                <Tag className="flex items-center py-1 px-3" color="blue">
                  <UserOutlined className="mr-2" />
                  <Text>{owner.username}</Text>
                </Tag>
              </div>
              
              <div className="avatar-item mb-3">
                <Tag className="flex items-center py-1 px-3" color="geekblue">
                  <MailOutlined className="mr-2" />
                  <Text>{owner.email}</Text>
                </Tag>
              </div>
              
              {owner.phone && (
                <div className="avatar-item">
                  <Tag className="flex items-center py-1 px-3" color="cyan">
                    <PhoneOutlined className="mr-2" />
                    <Text>{owner.phone}</Text>
                  </Tag>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state-container">
            <Empty description="ไม่พบข้อมูลเจ้าของผลงาน" />
          </div>
        )}
      </Card>

      {/* Contributors from the system */}
      {contributors && contributors.length > 0 && (
        <Card 
          className="mb-6 hover-shadow" 
          title={
            <Title level={5} className="flex items-center my-0">
              <TeamOutlined className="mr-2 text-blue-500" /> ผู้ร่วมงานในระบบ
            </Title>
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={contributors}
            renderItem={(contributor, index) => (
              <List.Item
                className="transition-all duration-300 hover:bg-gray-50 p-2 rounded-lg"
                key={contributor.id || index}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size="large"
                      src={contributor.image ? `${API_BASE_URL}/${contributor.image}` : null}
                      icon={!contributor.image && <UserOutlined />}
                      style={{ backgroundColor: !contributor.image ? getAvatarColor(contributor.full_name) : undefined }}
                    />
                  }
                  title={
                    <div className="flex items-center">
                      <Text strong>{contributor.full_name}</Text>
                      {contributor.role && (
                        <Tag color="blue" className="ml-2">{contributor.role}</Tag>
                      )}
                    </div>
                  }
                  description={
                    <Space direction="vertical" size={4} className="mt-1">
                      <div className="flex items-center text-gray-500">
                        <UserOutlined className="mr-1" />
                        <Text type="secondary">{contributor.username}</Text>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MailOutlined className="mr-1" />
                        <Text type="secondary">{contributor.email}</Text>
                      </div>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Team Members (for competition type) */}
      {teamMembersArray.length > 0 && (
        <Card 
          className="hover-shadow" 
          title={
            <Title level={5} className="flex items-center my-0">
              <TeamOutlined className="mr-2 text-green-500" /> สมาชิกในทีม
            </Title>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {teamMembersArray.map((member, index) => (
              <div 
                key={index} 
                className="flex items-center bg-gray-50 p-3 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-sm"
              >
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: getAvatarColor(member) }}
                  className="mr-3"
                />
                <Text>{member}</Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state if no contributors */}
      {!owner && contributors.length === 0 && teamMembersArray.length === 0 && (
        <div className="empty-state-container">
          <Empty 
            description="ไม่มีข้อมูลผู้ร่วมงานหรือสมาชิกในทีม" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </div>
      )}
    </div>
  );
};

export default ProjectContributors;