// src/components/common/ProjectTypeBadge.jsx
import React from 'react';
import { Tag } from 'antd';
import { 
  BookOutlined, 
  TrophyOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { 
  PROJECT_TYPES, 
  PROJECT_TYPE_NAMES, 
  PROJECT_TYPE_COLORS 
} from '../../constants/projectConstants';

/**
 * Component แสดงประเภทของโปรเจค
 * 
 * @param {Object} props
 * @param {string} props.type - ประเภทของโปรเจค
 * @param {boolean} props.showIcon - แสดงไอคอนหรือไม่
 * @param {string} props.size - ขนาดของป้าย ('small', 'default', 'large')
 * @param {string} props.className - className เพิ่มเติม
 */
const ProjectTypeBadge = ({ 
  type, 
  showIcon = true, 
  size = 'default',
  className = '' 
}) => {
  // กำหนดค่าตามประเภท
  let color = 'default';
  let text = 'ไม่ระบุ';
  let icon = null;

  switch (type) {
    case PROJECT_TYPES.COURSEWORK:
      color = PROJECT_TYPE_COLORS[PROJECT_TYPES.COURSEWORK];
      text = PROJECT_TYPE_NAMES[PROJECT_TYPES.COURSEWORK];
      icon = <TeamOutlined />;
      break;
    case PROJECT_TYPES.ACADEMIC:
      color = PROJECT_TYPE_COLORS[PROJECT_TYPES.ACADEMIC];
      text = PROJECT_TYPE_NAMES[PROJECT_TYPES.ACADEMIC];
      icon = <BookOutlined />;
      break;
    case PROJECT_TYPES.COMPETITION:
      color = PROJECT_TYPE_COLORS[PROJECT_TYPES.COMPETITION];
      text = PROJECT_TYPE_NAMES[PROJECT_TYPES.COMPETITION];
      icon = <TrophyOutlined />;
      break;
    default:
      icon = <BookOutlined />;
  }

  // กำหนดสไตล์ตามขนาด
  let sizeClassName = '';
  if (size === 'small') {
    sizeClassName = 'text-xs py-0 px-1';
  } else if (size === 'large') {
    sizeClassName = 'text-base py-1 px-3';
  } else {
    sizeClassName = 'text-sm py-1 px-2';
  }

  return (
    <Tag 
      color={color} 
      icon={showIcon ? icon : null} 
      className={`${sizeClassName} ${className}`}
    >
      {text}
    </Tag>
  );
};

export default ProjectTypeBadge;