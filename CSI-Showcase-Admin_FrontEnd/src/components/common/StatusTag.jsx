import React from 'react';
import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { PROJECT_STATUS, PROJECT_STATUS_COLORS, PROJECT_STATUS_NAMES } from '../../constants/projectConstants';
import { USER_STATUS, USER_STATUS_COLORS, USER_STATUS_NAMES } from '../../constants/userConstants';
import { LOGIN_STATUS, LOGIN_STATUS_COLORS, LOGIN_STATUS_NAMES } from '../../constants/userConstants';

/**
 * คอมโพเนนต์แสดงสถานะในรูปแบบแท็ก
 * @param {Object} props - พร็อพเพอร์ตี้ของคอมโพเนนต์
 * @param {string} props.type - ประเภทของสถานะ ('project', 'user', 'login')
 * @param {string} props.status - ค่าของสถานะ
 * @param {string} props.text - ข้อความแสดงสถานะ (ถ้าไม่ระบุจะใช้ค่าเริ่มต้นตามประเภทและสถานะ)
 * @param {React.ReactNode} props.icon - ไอคอนแสดงสถานะ (ถ้าไม่ระบุจะใช้ค่าเริ่มต้นตามประเภทและสถานะ)
 * @param {string} props.color - สีของแท็ก (ถ้าไม่ระบุจะใช้ค่าเริ่มต้นตามประเภทและสถานะ)
 * @returns {React.ReactNode} - คอมโพเนนต์แท็กแสดงสถานะ
 */
const StatusTag = ({ type, status, text, icon, color, ...restProps }) => {
  // กำหนดค่าเริ่มต้นตามประเภทและสถานะ
  let defaultText = '';
  let defaultColor = '';
  let defaultIcon = null;

  switch (type) {
    case 'project':
      defaultText = PROJECT_STATUS_NAMES[status] || status;
      defaultColor = PROJECT_STATUS_COLORS[status] || 'default';
      
      // กำหนดไอคอนตามสถานะของโปรเจค
      switch (status) {
        case PROJECT_STATUS.APPROVED:
          defaultIcon = <CheckCircleOutlined />;
          break;
        case PROJECT_STATUS.PENDING:
          defaultIcon = <ClockCircleOutlined />;
          break;
        case PROJECT_STATUS.REJECTED:
          defaultIcon = <CloseCircleOutlined />;
          break;
        default:
          defaultIcon = <InfoCircleOutlined />;
      }
      break;
      
    case 'user':
      defaultText = USER_STATUS_NAMES[status] || status;
      defaultColor = USER_STATUS_COLORS[status] || 'default';
      
      // กำหนดไอคอนตามสถานะของผู้ใช้
      switch (status) {
        case USER_STATUS.ACTIVE:
          defaultIcon = <CheckCircleOutlined />;
          break;
        case USER_STATUS.INACTIVE:
          defaultIcon = <CloseCircleOutlined />;
          break;
        case USER_STATUS.SUSPENDED:
          defaultIcon = <ExclamationCircleOutlined />;
          break;
        default:
          defaultIcon = <InfoCircleOutlined />;
      }
      break;
      
    case 'login':
      defaultText = LOGIN_STATUS_NAMES[status] || status;
      defaultColor = LOGIN_STATUS_COLORS[status] || 'default';
      
      // กำหนดไอคอนตามสถานะการเข้าสู่ระบบ
      switch (status) {
        case LOGIN_STATUS.SUCCESS:
          defaultIcon = <CheckCircleOutlined />;
          break;
        case LOGIN_STATUS.FAILED:
          defaultIcon = <CloseCircleOutlined />;
          break;
        default:
          defaultIcon = <InfoCircleOutlined />;
      }
      break;
      
    default:
      defaultText = status;
      defaultColor = 'default';
      defaultIcon = <InfoCircleOutlined />;
  }

  // ใช้ค่าที่กำหนดมาหรือค่าเริ่มต้น
  const tagText = text || defaultText;
  const tagColor = color || defaultColor;
  const tagIcon = icon || defaultIcon;

  return (
    <Tag color={tagColor} icon={tagIcon} {...restProps}>
      {tagText}
    </Tag>
  );
};

export default StatusTag;