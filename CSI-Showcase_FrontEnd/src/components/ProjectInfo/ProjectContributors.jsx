import React, { useState } from 'react';
import { Card, Avatar, Row, Col, Tooltip, Button, Modal } from 'antd';
import { TeamOutlined, CrownOutlined, EllipsisOutlined } from '@ant-design/icons';

const ProjectContributors = ({ author, contributors = [] }) => {
  const [showAllModal, setShowAllModal] = useState(false);
  const [displayLimit] = useState(6); // จำนวนผู้ร่วมโปรเจคที่แสดงในหน้าหลัก

  if (!author) return null;

  const baseUrl = import.meta.env.VITE_API_URL || '';

  // แปลง path รูปภาพให้เป็น URL ที่เข้าถึงได้
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (typeof imagePath !== 'string') return null;
    if (imagePath.startsWith('http')) return imagePath;
    const normalized = imagePath.replace(/^\/+/, '');
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    return `${normalizedBase}/${normalized}`;
  };

  // ทำให้สีอวาตาร์มีความสม่ำเสมอตามชื่อ
  const getColorFromName = (name) => {
    const fallback = '#90278E';
    if (!name || typeof name !== 'string') return fallback;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#90278E', '#B252B0', '#5E1A5C', '#722ed1',
      '#9254de', '#d3adf7', '#efdbff', '#551a8b', '#702963'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getNameInitial = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  // แปลงบทบาทเป็นภาษาไทย
  const getRoleDisplay = (role) => {
    const roleMap = {
      owner: 'หัวหน้าทีม',
      contributor: 'ผู้ร่วมโปรเจค',
      advisor: 'ที่ปรึกษา',
      developer: 'นักพัฒนา',
      designer: 'นักออกแบบ',
      researcher: 'นักวิจัย',
      documenter: 'ผู้จัดทำเอกสาร',
      tester: 'ผู้ทดสอบ',
    };
    return roleMap[role] || 'ผู้ร่วมโปรเจค';
  };

  // รองรับทั้งกรณีที่ contributors เป็น string(JSON) หรือ array
  const prepareRawContributors = () => {
    try {
      if (!contributors) return [];
      if (typeof contributors === 'string') {
        const parsed = JSON.parse(contributors);
        return Array.isArray(parsed) ? parsed : [];
      }
      if (Array.isArray(contributors)) return contributors;
      return [];
    } catch (e) {
      console.error('Error parsing contributors:', e);
      return [];
    }
  };

  // สร้าง object contributor ที่เป็นรูปแบบเดียวกันจากข้อมูล backend
  // รองรับทั้งสมาชิกที่ลงทะเบียน (registered) และสมาชิกภายนอก (external)
  const normalizeContributor = (c) => {
    // โครงสร้างจาก backend (project_groups join):
    // - registered: { role, memberType: 'registered', userId, username, fullName, image }
    // - external: { role, memberType: 'external', memberName, memberStudentId, memberEmail }
    const isRegistered = c.memberType === 'registered' || c.userId || c.username || c.user_id;
    if (isRegistered) {
      const fullName = c.fullName || c.full_name || c.username || '';
      return {
        id: c.userId ?? c.user_id ?? c.username ?? fullName,
        userId: c.userId ?? c.user_id ?? null,
        username: c.username ?? null,
        fullName,
        image: c.image ?? null,
        role: c.role || 'contributor',
        memberType: 'registered',
      };
    }
    // external
    const name = c.memberName || c.name || c.fullName || c.full_name || c.username || '';
    const usernameFromEmail = typeof c.memberEmail === 'string' ? c.memberEmail.split('@')[0] : null;
    return {
      id: `${name}|${c.memberEmail || ''}|${c.memberStudentId || c.member_student_id || ''}`,
      userId: null,
      username: usernameFromEmail || (name || null),
      fullName: name || 'ผู้ร่วมงาน',
      image: null,
      role: c.role || 'contributor',
      memberType: 'external',
      memberEmail: c.memberEmail || null,
      memberStudentId: c.memberStudentId || c.member_student_id || null,
    };
  };

  // เตรียมและกรองรายชื่อ contributors
  const preparedContributors = prepareRawContributors()
    // ตัดเจ้าของโปรเจคออกจากรายชื่อผู้ร่วมงาน (เพราะแสดงแยกอยู่แล้ว)
    .filter((c) => (c.role || '').toLowerCase() !== 'owner')
    // แปลงให้เป็นรูปแบบเดียวกัน
    .map(normalizeContributor);

  // ลบข้อมูลซ้ำโดยใช้ id ที่นิยามไว้
  const uniqueContributors = (() => {
    const seen = new Set();
    const result = [];
    for (const item of preparedContributors) {
      const key = item.id || `${item.username}|${item.fullName}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  })();

  const hasMoreContributors = uniqueContributors.length > displayLimit;

  // สร้างอวาตาร์ตามข้อมูลผู้ใช้ (รองรับกรณี external ที่ไม่มีรูป)
  const renderAvatar = (user, size = 60) => {
    const imageUrl = getProfileImageUrl(user.image);
    if (imageUrl) {
      return (
        <Avatar
          size={size}
          src={imageUrl}
          alt={user.fullName || user.username}
          className="border border-[#90278E] border-opacity-20 shadow-md"
        />
      );
    }
    const displayName = user.fullName || user.username || 'U';
    const mainColor = getColorFromName(displayName);
    const secondColor = getColorFromName(`${displayName}a`);
    return (
      <Avatar
        size={size}
        style={{ background: `linear-gradient(135deg, ${mainColor} 0%, ${secondColor} 100%)` }}
        className="border border-white border-opacity-20 shadow-md"
      >
        {getNameInitial(displayName)}
      </Avatar>
    );
  };

  // ตรวจสอบและรองรับรูปแบบข้อมูล fullName/full_name และ handle
  const getDisplayName = (user) => user.fullName || user.username || 'ผู้ใช้';
  const getDisplayHandle = (user) => user.username || user.memberEmail || '-';

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
            <CrownOutlined className="mr-1" /> หัวหน้าทีม
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5EAFF] text-[#90278E] mt-1">
            <TeamOutlined className="mr-1" /> {getRoleDisplay(user.role)}
          </span>
        )}
        <div className="text-sm text-[#8b949e] mt-1 truncate max-w-[150px]">@{getDisplayHandle(user)}</div>
      </div>
    </div>
  );

  // ปุ่มเปิด Modal แสดงรายชื่อทั้งหมด
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
        <h3 className="text-lg font-bold text-[#90278E] mb-3">หัวหน้าทีม</h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <ContributorCard user={{
              fullName: author.fullName || author.full_name || author.username,
              username: author.username,
              image: author.image,
            }} isAuthor={true} />
          </Col>
        </Row>

        {uniqueContributors.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-[#90278E] mt-6 mb-3">ผู้ร่วมโปรเจค</h3>
            <Row gutter={[16, 16]}>
              {uniqueContributors.map((u, index) => (
                <Col xs={24} sm={12} md={8} key={`modal-contributor-${index}`}>
                  <ContributorCard user={u} />
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
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#B252B0] opacity-10 rounded-full blur-xl -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#90278E] opacity-10 rounded-full blur-xl -ml-6 -mb-6"></div>
        <div className="absolute bottom-10 right-20 w-16 h-16 bg-[#5E1A5C] opacity-10 rounded-full blur-xl"></div>

        <Row gutter={[20, 24]} className="relative z-10">
          {/* เจ้าของโปรเจค */}
          <Col xs={12} sm={8} md={6} lg={4} xl={4}>
            <div className="flex justify-center items-center flex-col text-center h-full">
              {renderAvatar({
                fullName: author.fullName || author.full_name || author.username,
                username: author.username,
                image: author.image,
              })}
              <div className="mt-2 text-sm font-medium truncate w-full text-[#24292f]">
                {author.fullName || author.full_name || author.username}
              </div>
              <div className="text-xs text-[#90278E]">หัวหน้าทีม</div>
            </div>
          </Col>

          {/* ผู้ร่วมโปรเจค (จำกัดจำนวน) */}
          {uniqueContributors.length > 0 &&
            uniqueContributors.slice(0, displayLimit).map((u, index) => (
              <Col xs={12} sm={8} md={6} lg={4} xl={4} key={`contributor-${index}`}>
                <div className="flex justify-center items-center flex-col text-center h-full">
                  {renderAvatar(u)}
                  <div className="mt-2 text-sm font-medium truncate w-full text-[#24292f]">
                    {getDisplayName(u)}
                  </div>
                  <div className="text-xs text-[#8b949e]">{getRoleDisplay(u.role)}</div>
                </div>
              </Col>
            ))}

          {/* ปุ่มเปิดดูทั้งหมด */}
          <Col xs={12} sm={8} md={6} lg={4} xl={4}>
            <ContributorJoinButton />
          </Col>
        </Row>

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