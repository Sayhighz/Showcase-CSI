import React from 'react';
import { Badge, Tooltip, Avatar } from 'antd';
import { 
  TrophyOutlined, 
  StarOutlined, 
  CrownOutlined, 
  RocketOutlined,
  FireOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  SmileOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

/**
 * AchievementBadge component ใช้สำหรับแสดงเครื่องหมายความสำเร็จของผู้ใช้
 * 
 * @param {Object} props - Props ของ component
 * @param {Object} props.achievement - ข้อมูลความสำเร็จ
 * @param {string} props.achievement.id - รหัสของความสำเร็จ
 * @param {string} props.achievement.title - ชื่อของความสำเร็จ
 * @param {string} props.achievement.description - คำอธิบายของความสำเร็จ
 * @param {string} props.achievement.icon - ไอคอนของความสำเร็จ
 * @param {string} props.achievement.level - ระดับของความสำเร็จ (bronze, silver, gold, platinum)
 * @param {string} props.achievement.date - วันที่ได้รับความสำเร็จ
 * @param {string} props.size - ขนาดของเครื่องหมาย ('small', 'default', 'large')
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} AchievementBadge component
 */
const AchievementBadge = ({ 
  achievement,
  size = 'default',
  style
}) => {
  if (!achievement) return null;

  const { id, title, description, icon, level = 'bronze', date } = achievement;

  // กำหนดสีตามระดับของความสำเร็จ
  const getLevelColor = () => {
    switch (level) {
      case 'bronze':
        return '#cd7f32';
      case 'silver':
        return '#c0c0c0';
      case 'gold':
        return '#ffd700';
      case 'platinum':
        return '#e5e4e2';
      default:
        return '#cd7f32'; // bronze เป็นค่าเริ่มต้น
    }
  };

  // กำหนดไอคอนตามชนิดของความสำเร็จ
  const getAchievementIcon = () => {
    switch (icon) {
      case 'trophy':
        return <TrophyOutlined />;
      case 'star':
        return <StarOutlined />;
      case 'crown':
        return <CrownOutlined />;
      case 'rocket':
        return <RocketOutlined />;
      case 'fire':
        return <FireOutlined />;
      case 'thunder':
        return <ThunderboltOutlined />;
      case 'heart':
        return <HeartOutlined />;
      case 'smile':
        return <SmileOutlined />;
      case 'experiment':
        return <ExperimentOutlined />;
      default:
        return <StarOutlined />; // star เป็นค่าเริ่มต้น
    }
  };

  // กำหนดขนาดของ Avatar ตาม size ที่ระบุ
  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      case 'default':
      default:
        return 48;
    }
  };

  const avatarSize = getAvatarSize();
  const badgeColor = getLevelColor();
  const achievementIcon = getAchievementIcon();

  // สร้างข้อความสำหรับ tooltip
  const tooltipTitle = (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{title}</div>
      <div style={{ marginBottom: 4 }}>{description}</div>
      {date && <div style={{ fontSize: '0.8rem' }}>ได้รับเมื่อ: {date}</div>}
    </div>
  );

  return (
    <Tooltip title={tooltipTitle} placement="top">
      <Badge 
        count={
          <Avatar 
            style={{ 
              backgroundColor: badgeColor,
              color: '#fff',
              fontSize: size === 'small' ? 10 : size === 'large' ? 16 : 12,
            }} 
            size={avatarSize / 3} 
            icon={achievementIcon} 
          />
        } 
        offset={[-avatarSize / 4, avatarSize / 4]}
      >
        <Avatar
          style={{ 
            backgroundColor: '#f0f0f0',
            color: badgeColor,
            ...style 
          }}
          size={avatarSize}
          icon={achievementIcon}
        />
      </Badge>
    </Tooltip>
  );
};

export default AchievementBadge;