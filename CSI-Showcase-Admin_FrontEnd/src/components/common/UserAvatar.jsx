// src/components/common/UserAvatar.jsx
import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';
import { USER_ROLES, USER_ROLE_COLORS } from '../../constants/userConstants';

/**
 * Component แสดงรูปโปรไฟล์ของผู้ใช้
 * 
 * @param {Object} props
 * @param {Object|string} props.user - ข้อมูลผู้ใช้หรือชื่อผู้ใช้
 * @param {string} props.user.full_name - ชื่อ-นามสกุลของผู้ใช้
 * @param {string} props.user.role - บทบาทของผู้ใช้
 * @param {string} props.user.image - URL รูปภาพของผู้ใช้
 * @param {string} props.size - ขนาดของ Avatar ('small', 'default', 'large', number)
 * @param {boolean} props.showTooltip - แสดง tooltip หรือไม่
 * @param {boolean} props.showBadge - แสดงป้ายกำกับบทบาทหรือไม่
 * @param {string} props.shape - รูปร่างของ Avatar ('circle', 'square')
 * @param {string} props.className - className เพิ่มเติม
 */
const UserAvatar = ({
  user,
  size = 'default',
  showTooltip = true,
  showBadge = false,
  shape = 'circle',
  className = ''
}) => {
  if (!user) {
    return (
      <Avatar
        size={size}
        icon={<UserOutlined />}
        shape={shape}
        className={className}
      />
    );
  }

  // ถ้า user เป็น string ให้สร้าง object ข้อมูลผู้ใช้
  const userData = typeof user === 'string' ? { full_name: user } : user;
  const { full_name, role, image } = userData;

  // แสดง avatar ตามข้อมูลที่มี
  const avatar = (
    <Avatar
      size={size}
      src={image}
      icon={!image && <UserOutlined />}
      shape={shape}
      className={className}
      style={
        role && role === USER_ROLES.ADMIN && !image
          ? { backgroundColor: USER_ROLE_COLORS[USER_ROLES.ADMIN] }
          : {}
      }
    >
      {!image && full_name ? full_name.charAt(0).toUpperCase() : null}
    </Avatar>
  );

  // ถ้ามีการแสดงป้ายกำกับ จะแสดงไอคอนเล็กๆ มุมขวาล่าง
  const badgedAvatar = showBadge && role === USER_ROLES.ADMIN ? (
    <div className="relative inline-block">
      {avatar}
      <span className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
        <CrownOutlined 
          style={{ color: USER_ROLE_COLORS[USER_ROLES.ADMIN] }} 
          className="text-sm bg-white rounded-full p-1 border border-gray-200"
        />
      </span>
    </div>
  ) : (
    avatar
  );

  // ถ้าแสดง tooltip จะแสดงชื่อผู้ใช้เมื่อ hover
  if (showTooltip && full_name) {
    return (
      <Tooltip title={full_name}>
        {badgedAvatar}
      </Tooltip>
    );
  }

  return badgedAvatar;
};

export default UserAvatar;