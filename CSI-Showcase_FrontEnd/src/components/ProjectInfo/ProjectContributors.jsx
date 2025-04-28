import React from 'react';
import { Card, Avatar, Row, Col, Tooltip } from 'antd';
import { UserOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons';

const ProjectContributors = ({ author, contributors = [] }) => {
  if (!author) return null;

  const baseUrl = import.meta.env.VITE_API_URL || '';

  // สร้าง URL รูปโปรไฟล์
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // ถ้า imagePath เป็น URL เต็มอยู่แล้ว ให้ใช้เลย
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // แต่ถ้าเป็นเส้นทางไฟล์ธรรมดา ให้นำไปต่อกับ baseUrl
    return `${baseUrl}/${imagePath}`;
  };

  // สร้างสีจากชื่อผู้ใช้ (ทำให้อวาตาร์แต่ละคนมีสีที่ต่างกัน แต่คงที่)
  const getColorFromName = (name) => {
    if (!name) return '#1890ff';
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Galaxy theme colors
    const colors = [
      '#90278E', '#7b1f79', '#a447a2', '#b76ab5', '#722ed1', 
      '#9254de', '#d3adf7', '#efdbff', '#551a8b', '#702963'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // สร้างอวาตาร์ตามข้อมูลผู้ใช้
  const renderAvatar = (user) => {
    const imageUrl = getProfileImageUrl(user.image);
    
    if (imageUrl) {
      return (
        <Avatar 
          size={68} 
          src={imageUrl} 
          alt={user.fullName || user.username}
          className="border-2 border-purple-100 shadow-md"
        />
      );
    }
    
    // ถ้าไม่มีรูป ให้แสดงอักษรย่อชื่อ
    const nameInitial = getNameInitial(user.fullName || user.username);
    return (
      <Avatar 
        size={68} 
        style={{ 
          backgroundColor: getColorFromName(user.username),
          background: `linear-gradient(135deg, ${getColorFromName(user.username)} 0%, ${getColorFromName(user.username+'a')} 100%)`,
        }}
        className="border-2 border-purple-100 shadow-md"
      >
        {nameInitial}
      </Avatar>
    );
  };

  // สร้างอักษรย่อชื่อ
  const getNameInitial = (name) => {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      return name.charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-[#90278E] mb-4 flex items-center">
        <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
        ผู้จัดทำโปรเจค
      </h2>
      <Card className="rounded-xl shadow-lg border border-purple-100 relative overflow-hidden">
        {/* Galaxy decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-5 rounded-full blur-xl -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-600 opacity-5 rounded-full blur-xl -ml-6 -mb-6"></div>
        <div className="absolute bottom-10 right-20 w-16 h-16 bg-purple-800 opacity-5 rounded-full blur-xl"></div>
        
        <Row gutter={[16, 24]} className="relative z-10">
          {/* แสดงเจ้าของโปรเจค */}
          <Col xs={24} sm={12} lg={8}>
            <div className="flex p-3 rounded-lg transition-all hover:bg-purple-50">
              <div className="mr-4 flex-shrink-0">
                {renderAvatar(author)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-medium text-gray-800 truncate mb-0">
                  {author.fullName || author.username}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#90278E] bg-opacity-10 text-[#90278E] mt-1">
                  <CrownOutlined className="mr-1" /> เจ้าของโปรเจค
                </span>
                <div className="text-sm text-gray-500 mt-1">@{author.username}</div>
              </div>
            </div>
          </Col>

          {/* แสดงผู้ร่วมโปรเจค */}
          {contributors && contributors.length > 0 && contributors.map((contributor, index) => (
            <Col xs={24} sm={12} lg={8} key={`contributor-${index}`}>
              <div className="flex p-3 rounded-lg transition-all hover:bg-purple-50">
                <div className="mr-4 flex-shrink-0">
                  {renderAvatar({
                    username: contributor.username,
                    fullName: contributor.full_name,
                    image: contributor.image
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-medium text-gray-800 truncate mb-0">
                    {contributor.full_name || contributor.username}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                    <TeamOutlined className="mr-1" /> ผู้ร่วมโปรเจค
                  </span>
                  <div className="text-sm text-gray-500 mt-1">@{contributor.username}</div>
                </div>
              </div>
            </Col>
          ))}
          
          {/* แสดงข้อความถ้าไม่มีผู้ร่วมโปรเจค */}
          {(!contributors || contributors.length === 0) && (
            <Col xs={24}>
              <div className="py-5 text-center text-gray-500 italic bg-gray-50 bg-opacity-50 rounded-lg">
                <p>ไม่มีผู้ร่วมโปรเจคนี้</p>
              </div>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default ProjectContributors;