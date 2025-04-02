import React from 'react';
import { 
  Card, Typography, Image, Alert 
} from 'antd';
import { 
  UserOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

const ProjectMembersTab = ({ project }) => {
  if (!project.members || project.members.length === 0) {
    return (
      <Alert message="ไม่มีผู้ร่วมงานที่ระบุไว้" type="info" showIcon />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {project.members.map((member, index) => (
        <Card key={index} size="small" className="hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="mr-4">
              {member.image ? (
                <Image 
                  src={member.image} 
                  alt={member.full_name} 
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }}
                  fallback="https://via.placeholder.com/60?text=User"
                  preview={false}
                />
              ) : (
                <div className="bg-gray-200 w-16 h-16 flex items-center justify-center rounded-full">
                  <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                </div>
              )}
            </div>
            <div>
              <Text strong>{member.full_name}</Text>
              <div>
                <Text type="secondary">{member.email || '-'}</Text>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProjectMembersTab;