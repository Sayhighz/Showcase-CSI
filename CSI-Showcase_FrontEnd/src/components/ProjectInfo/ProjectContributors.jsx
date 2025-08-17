import React, { useState } from 'react';
import { Card, Avatar, Row, Col, Tooltip, Button, Modal } from 'antd';
import { UserOutlined, TeamOutlined, CrownOutlined, EllipsisOutlined } from '@ant-design/icons';

const ProjectContributors = ({ author, contributors = [] }) => {
  const [showAllModal, setShowAllModal] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(6); // จำนวนผู้ร่วมโปรเจคที่แสดงในหน้าหลัก
  
  if (!author) return null;

  const baseUrl = import.meta.env.VITE_API_URL || '';

  // ตรวจสอบและแปลงข้อมูล contributors
  const prepareContributors = () => {
    try {
      // ถ้าเป็น string (JSON) พยายามแปลงเป็น array
      if (typeof contributors === 'string') {
        return JSON.parse(contributors);
      }
      
      // ถ้าเป็น array อยู่แล้ว
      if (Array.isArray(contributors)) {
        return contributors;
      }
      
      return [];
    } catch (e) {
      console.error('Error parsing contributors:', e);
      return [];
    }
  };
  
  // ข้อมูล contributors ที่พร้อมใช้งาน
  const preparedContributors = prepareContributors();
  // กำจัดข้อมูลที่ซ้ำกันโดยใช้ username เป็น key
  const uniqueContributors = preparedContributors.filter((contributor, index, self) =>
    index === self.findIndex((t) => t.username === contributor.username)
  );
  
  const hasMoreContributors = uniqueContributors.length > displayLimit;

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
    if (!name) return '#90278E';
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // ใช้สีตามธีม
    const colors = [
      '#90278E', '#B252B0', '#5E1A5C', '#722ed1', 
      '#9254de', '#d3adf7', '#efdbff', '#551a8b', '#702963'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // สร้างอวาตาร์ตามข้อมูลผู้ใช้
  const renderAvatar = (user, size = 60) => {
    const imageUrl = getProfileImageUrl(user.image);
    
    if (imageUrl) {
      return (
        <Avatar 
          size={size} 
          src={imageUrl} 
          alt={user.fullName || user.full_name || user.username}
          className="border border-[#90278E] border-opacity-20 shadow-md"
        />
      );
    }
    
    // ถ้าไม่มีรูป ให้แสดงอักษรย่อชื่อ
    const nameInitial = getNameInitial(user.fullName || user.full_name || user.username);
    const mainColor = getColorFromName(user.username);
    const secondColor = getColorFromName(user.username+'a');
    
    return (
      <Avatar 
        size={size} 
        style={{ 
          background: `linear-gradient(135deg, ${mainColor} 0%, ${secondColor} 100%)`,
        }}
        className="border border-white border-opacity-20 shadow-md"
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

  // แปลงบทบาทเป็นภาษาไทย
  const getRoleDisplay = (role) => {
    const roleMap = {
      'contributor': 'ผู้ร่วมโปรเจค',
      'developer': 'นักพัฒนา',
      'designer': 'นักออกแบบ',
      'researcher': 'นักวิจัย',
      'documenter': 'ผู้จัดทำเอกสาร',
      'tester': 'ผู้ทดสอบ'
    };
    
    return roleMap[role] || 'ผู้ร่วมโปรเจค';
  };

  // ตรวจสอบและรองรับรูปแบบข้อมูล fullName/full_name
  const getDisplayName = (user) => {
    return user.fullName || user.full_name || user.username || 'ผู้ใช้';
  };

  // คอมโพเนนต์สำหรับแสดงข้อมูลคนเดียว (ใช้ซ้ำในหน้าหลักและใน Modal)
  const ContributorCard = ({ user, isAuthor = false }) => (
    <div className="flex p-3 rounded-lg transition-all hover:bg-[#F5EAFF] h-full">
      <div className="mr-3 flex-shrink-0">
        {renderAvatar(user)}
      </div>
      <div className="min-w-0 flex-1">
        <Tooltip title={getDisplayName(user)} placement="topLeft">
          <h3 className="text-base font-medium text-[#24292f] truncate mb-0 max-w-[150px]">
            {getDisplayName(user)}
          </h3>
        </Tooltip>
        {isAuthor ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#90278E] bg-opacity-10 text-[#90278E] mt-1">
            <CrownOutlined className="mr-1" /> ผู้อัพโหลด
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5EAFF] text-[#90278E] mt-1">
            <TeamOutlined className="mr-1" /> {getRoleDisplay(user.role)}
          </span>
        )}
        <div className="text-sm text-[#8b949e] mt-1 truncate max-w-[150px]">@{user.username}</div>
      </div>
    </div>
  );

  // คอมโพเนนต์การแสดงปุ่มและ Avatar ของผู้ร่วมโปรเจค
  const ContributorJoinButton = () => (
    <div className="flex justify-center items-center h-full">
      <div className="text-center p-4 cursor-pointer" onClick={() => setShowAllModal(true)}>
        <Avatar 
          size={60}
          style={{ background: 'linear-gradient(135deg, #90278E 0%, #B252B0 100%)' }}
          className="border border-white border-opacity-20 shadow-md flex items-center justify-center"
          icon={<TeamOutlined />}
        />
        <div className="mt-2 text-[#90278E] font-medium text-sm">
          ผู้ร่วมโปรเจค
        </div>
      </div>
    </div>
  );

  // Modal แสดงผู้ร่วมโปรเจคทั้งหมด
  const AllContributorsModal = () => (
    <Modal
      title={
        <div className="flex items-center">
          <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
          <span className="text-xl font-bold text-[#90278E]">ผู้จัดทำโปรเจคทั้งหมด ({uniqueContributors.length + 1} คน)</span>
        </div>
      }
      open={showAllModal}
      onCancel={() => setShowAllModal(false)}
      footer={[
        <Button key="close" onClick={() => setShowAllModal(false)} className="bg-[#90278E] text-white hover:bg-[#5E1A5C]">
          ปิด
        </Button>
      ]}
      width={800}
      styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
      className="contributor-modal backdrop-filter backdrop-blur-md"
    >
      <div className="py-4">
        <h3 className="text-lg font-bold text-[#90278E] mb-3">เจ้าของโปรเจค</h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <ContributorCard user={author} isAuthor={true} />
          </Col>
        </Row>

        {uniqueContributors.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-[#90278E] mt-6 mb-3">ผู้ร่วมโปรเจค</h3>
            <Row gutter={[16, 16]}>
              {uniqueContributors.map((contributor, index) => (
                <Col xs={24} sm={12} md={8} key={`modal-contributor-${index}`}>
                  <ContributorCard user={contributor} />
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>
    </Modal>
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#90278E] mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
          ผู้จัดทำโปรเจค
        </div>
        {hasMoreContributors && (
          <Button 
            type="link" 
            onClick={() => setShowAllModal(true)}
            className="text-[#90278E] flex items-center hover:text-[#B252B0]"
          >
            ดูทั้งหมด <EllipsisOutlined />
          </Button>
        )}
      </h2>
      <Card 
        className="rounded-xl shadow-lg border border-[#90278E] border-opacity-20 relative overflow-hidden bg-white bg-opacity-80 backdrop-filter backdrop-blur-md hover:shadow-xl transition-all duration-300"
      >
        {/* Galaxy decorative elements ปรับสีตามธีม */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#B252B0] opacity-10 rounded-full blur-xl -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#90278E] opacity-10 rounded-full blur-xl -ml-6 -mb-6"></div>
        <div className="absolute bottom-10 right-20 w-16 h-16 bg-[#5E1A5C] opacity-10 rounded-full blur-xl"></div>
        
        <Row gutter={[20, 24]} className="relative z-10">
          {/* แสดงเจ้าของโปรเจค */}
          <Col xs={12} sm={8} md={6} lg={4} xl={4}>
            <div className="flex justify-center items-center flex-col text-center h-full">
              {renderAvatar(author)}
              <div className="mt-2 text-sm font-medium truncate w-full text-[#24292f]">
                {getDisplayName(author)}
              </div>
              <div className="text-xs text-[#90278E]">เจ้าของ</div>
            </div>
          </Col>

          {/* แสดงผู้ร่วมโปรเจค (จำกัดจำนวน) */}
          {uniqueContributors.length > 0 && uniqueContributors.slice(0, displayLimit).map((contributor, index) => (
            <Col xs={12} sm={8} md={6} lg={4} xl={4} key={`contributor-${index}`}>
              <div className="flex justify-center items-center flex-col text-center h-full">
                {renderAvatar(contributor)}
                <div className="mt-2 text-sm font-medium truncate w-full text-[#24292f]">
                  {getDisplayName(contributor)}
                </div>
                <div className="text-xs text-[#8b949e]">{getRoleDisplay(contributor.role)}</div>
              </div>
            </Col>
          ))}
          
          {/* แสดงปุ่มเพิ่มผู้ร่วมโปรเจค */}
          <Col xs={12} sm={8} md={6} lg={4} xl={4}>
            <ContributorJoinButton />
          </Col>
        </Row>

        {/* แสดงปุ่ม "โหลดเพิ่มเติม" เมื่อมีจำนวนมากบนมือถือ */}
        {hasMoreContributors && (
          <div className="mt-4 text-center">
            <Button 
              onClick={() => setShowAllModal(true)}
              className="border-[#90278E] text-[#90278E] hover:border-[#B252B0] hover:text-[#B252B0] hover:bg-[#F5EAFF] transition-all duration-300"
            >
              ดูผู้ร่วมโปรเจคทั้งหมด
            </Button>
          </div>
        )}
      </Card>

      {/* Modal แสดงรายชื่อผู้ร่วมโปรเจคทั้งหมด */}
      <AllContributorsModal />
    </div>
  );
};

export default ProjectContributors;