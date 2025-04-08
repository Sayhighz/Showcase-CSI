// src/components/projectDetail/ProjectContributors.jsx
import React from 'react';
import { Card, List, Typography, Avatar, Space, Tag, Divider, Empty } from 'antd';
import { UserOutlined, TeamOutlined, CrownOutlined, MailOutlined } from '@ant-design/icons';

// Components
import UserAvatar from '../common/UserAvatar';

const { Title, Text } = Typography;

const ProjectContributors = ({ contributors = [], owner, teamMembers = '' }) => {
  // Parse team members string to array
  let teamMembersArray = [];
  if (teamMembers && typeof teamMembers === 'string') {
    teamMembersArray = teamMembers.split(',').map(member => member.trim());
  }
  
  return (
    <div>
      {/* Project Owner */}
      <Card className="mb-6">
        <Title level={5} className="flex items-center">
          <CrownOutlined className="mr-2" /> เจ้าของผลงาน
        </Title>
        {owner ? (
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <UserAvatar 
              user={owner} 
              size="large" 
              showTooltip={false}
            />
            <div className="ml-4">
              <Text strong>{owner.full_name}</Text>
              <div className="flex items-center text-gray-500 mt-1">
                <UserOutlined className="mr-1" />
                <Text type="secondary">{owner.username}</Text>
              </div>
              <div className="flex items-center text-gray-500 mt-1">
                <MailOutlined className="mr-1" />
                <Text type="secondary">{owner.email}</Text>
              </div>
            </div>
          </div>
        ) : (
          <Empty description="ไม่พบข้อมูลเจ้าของผลงาน" />
        )}
      </Card>

      {/* Contributors from the system */}
      {contributors && contributors.length > 0 && (
        <Card className="mb-6">
          <Title level={5} className="flex items-center">
            <TeamOutlined className="mr-2" /> ผู้ร่วมงานในระบบ
          </Title>
          <List
            itemLayout="horizontal"
            dataSource={contributors}
            renderItem={contributor => (
              <List.Item>
                <List.Item.Meta
                  avatar={<UserAvatar user={contributor} />}
                  title={contributor.full_name}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        <UserOutlined className="mr-1" />
                        {contributor.username}
                      </Text>
                      <Text type="secondary">
                        <MailOutlined className="mr-1" />
                        {contributor.email}
                      </Text>
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
        <Card>
          <Title level={5} className="flex items-center">
            <TeamOutlined className="mr-2" /> สมาชิกในทีม
          </Title>
          <div className="flex flex-wrap gap-2 mt-4">
            {teamMembersArray.map((member, index) => (
              <Tag key={index} color="blue" className="py-1 px-2 text-sm">
                <UserOutlined className="mr-1" />
                {member}
              </Tag>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state if no contributors */}
      {!owner && contributors.length === 0 && teamMembersArray.length === 0 && (
        <Empty description="ไม่มีข้อมูลผู้ร่วมงานหรือสมาชิกในทีม" />
      )}
    </div>
  );
};

export default ProjectContributors;