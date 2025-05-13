import React from 'react';
import { Card, Avatar, Typography, Descriptions, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { URL } from '../../../constants/apiEndpoints';

const { Title, Text } = Typography;

const CreatorInfo = ({ projectDetails }) => {
  const navigate = useNavigate();
  
  if (!projectDetails) return null;
  
  return (
    <Card title="ข้อมูลผู้สร้าง" className="shadow-md">
      <div className="flex flex-col items-center mb-4">
        {projectDetails.user_image ? (
          <Avatar 
            src={`${URL}/${projectDetails.user_image}`} 
            size={100}
            className="mb-3"
          />
        ) : (
          <Avatar 
            size={100} 
            className="mb-3"
            style={{ backgroundColor: '#90278E' }}
          >
            {projectDetails.full_name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        )}
        
        <Title level={4} className="mb-1 text-center">{projectDetails.full_name || 'ไม่ระบุชื่อ'}</Title>
        <Text type="secondary" className="mb-3">{projectDetails.email || ''}</Text>
        
        <div className="w-full mt-3">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="ชื่อผู้ใช้">
              {projectDetails.username || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="จำนวนผลงาน">
              {projectDetails.project_count || '1'} ชิ้น
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
      
      <Button 
        type="default" 
        icon={<EyeOutlined />} 
        block
        onClick={() => navigate(`/users/${projectDetails.user_id}`)}
        className="mt-2"
      >
        ดูโปรไฟล์ผู้ใช้
      </Button>
    </Card>
  );
};

export default CreatorInfo;