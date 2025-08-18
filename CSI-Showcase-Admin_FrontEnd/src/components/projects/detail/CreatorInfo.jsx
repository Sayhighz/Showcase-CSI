import React from 'react';
import { Card, Avatar, Typography, Descriptions, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { URL } from '../../../constants/apiEndpoints';

const { Title, Text } = Typography;

const CreatorInfo = ({ projectDetails }) => {
  const navigate = useNavigate();
  
  if (!projectDetails) return null;
  
  // ใช้ข้อมูลผู้ที่อัปโหลด (owner) แยกจากผู้ร่วมงาน
  const uploader = projectDetails.uploader ? {
    userId: projectDetails.uploader.userId,
    username: projectDetails.uploader.username,
    fullName: projectDetails.uploader.fullName,
    email: projectDetails.uploader.email,
    image: projectDetails.uploader.image
  } : {
    userId: projectDetails.user_id,
    username: projectDetails.username,
    fullName: projectDetails.full_name,
    email: projectDetails.email,
    image: projectDetails.user_image
  };
  
  return (
    <Card title="ผู้ที่อัปโหลด" className="shadow-md">
      <div className="flex flex-col items-center mb-4">
        {uploader.image ? (
          <Avatar
            src={`${URL}/${uploader.image}`}
            size={100}
            className="mb-3"
          />
        ) : (
          <Avatar
            size={100}
            className="mb-3"
            style={{ backgroundColor: '#90278E' }}
          >
            {uploader.fullName?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        )}
        
        <Title level={4} className="mb-1 text-center">{uploader.fullName || 'ไม่ระบุชื่อ'}</Title>
        <Text type="secondary" className="mb-3">{uploader.email || ''}</Text>
        
        <div className="w-full mt-3">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="ชื่อผู้ใช้">
              {uploader.username || '-'}
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
        onClick={() => navigate(`/users/${uploader.userId}`)}
        className="mt-2"
      >
        ดูโปรไฟล์ผู้ใช้
      </Button>
    </Card>
  );
};

export default CreatorInfo;