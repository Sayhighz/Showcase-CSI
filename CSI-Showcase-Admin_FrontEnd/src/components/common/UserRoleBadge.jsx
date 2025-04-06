// src/components/common/UserRoleBadge.jsx
import React from 'react';
import { Tag } from 'antd';
import { 
  CrownOutlined, 
  UserOutlined, 
  GlobalOutlined 
} from '@ant-design/icons';
import { 
  USER_ROLES, 
  USER_ROLE_NAMES, 
  USER_ROLE_COLORS 
} from '../../constants/userConstants';

/**
 * Component แสดงบทบาทของผู้ใช้
 * 
 * @param {Object} props
 * @param {string} props.role - บทบาทของผู้ใช้
 * @param {boolean} props.showIcon - แสดงไอคอนหรือไม่
 * @param {string} props.size - ขนาดของป้าย ('small', 'default', 'large')
 * @param {string} props.className - className เพิ่มเติม
 */
const UserRoleBadge = ({ 
  role, 
  showIcon = true, 
  size = 'default',
  className = '' 
}) => {
  // กำหนดค่าตามบทบาท
  let color = 'default';
  let text = 'ไม่ระบุ';
  let icon = null;

  switch (role) {
    case USER_ROLES.ADMIN:
      color = USER_ROLE_COLORS[USER_ROLES.ADMIN];
      text = USER_ROLE_NAMES[USER_ROLES.ADMIN];
      icon = <CrownOutlined />;
      break;
    case USER_ROLES.STUDENT:
      color = USER_ROLE_COLORS[USER_ROLES.STUDENT];
      text = USER_ROLE_NAMES[USER_ROLES.STUDENT];
      icon = <UserOutlined />;
      break;
    case USER_ROLES.VISITOR:
      color = USER_ROLE_COLORS[USER_ROLES.VISITOR];
      text = USER_ROLE_NAMES[USER_ROLES.VISITOR];
      icon = <GlobalOutlined />;
      break;
    default:
      icon = <UserOutlined />;
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

export default UserRoleBadge;