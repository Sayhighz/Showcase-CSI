// src/components/common/StatusTag.jsx
import React from 'react';
import { Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  PROJECT_STATUS, 
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_NAMES 
} from '../../constants/projectConstants';
import { 
  USER_STATUS,
  USER_STATUS_COLORS,
  USER_STATUS_NAMES
} from '../../constants/userConstants';

/**
 * Component แสดงสถานะในรูปแบบ Tag
 * รองรับสถานะของโปรเจคและผู้ใช้
 * 
 * @param {Object} props
 * @param {string} props.type - ประเภทของสถานะ ('project', 'user')
 * @param {string} props.status - รหัสสถานะ
 * @param {string} props.className - className เพิ่มเติม
 */
const StatusTag = ({ type = 'project', status, className = '' }) => {
  // กำหนดค่า default สำหรับ status ที่ไม่ตรงกับที่มีในระบบ
  let color = 'default';
  let text = 'ไม่ระบุ';
  let icon = null;

  if (type === 'project') {
    // สถานะของโปรเจค
    switch (status) {
      case PROJECT_STATUS.PENDING:
        color = PROJECT_STATUS_COLORS[PROJECT_STATUS.PENDING];
        text = PROJECT_STATUS_NAMES[PROJECT_STATUS.PENDING];
        icon = <ClockCircleOutlined />;
        break;
      case PROJECT_STATUS.APPROVED:
        color = PROJECT_STATUS_COLORS[PROJECT_STATUS.APPROVED];
        text = PROJECT_STATUS_NAMES[PROJECT_STATUS.APPROVED];
        icon = <CheckCircleOutlined />;
        break;
      case PROJECT_STATUS.REJECTED:
        color = PROJECT_STATUS_COLORS[PROJECT_STATUS.REJECTED];
        text = PROJECT_STATUS_NAMES[PROJECT_STATUS.REJECTED];
        icon = <CloseCircleOutlined />;
        break;
      default:
        icon = <ExclamationCircleOutlined />;
    }
  } else if (type === 'user') {
    // สถานะของผู้ใช้
    switch (status) {
      case USER_STATUS.ACTIVE:
        color = USER_STATUS_COLORS[USER_STATUS.ACTIVE];
        text = USER_STATUS_NAMES[USER_STATUS.ACTIVE];
        icon = <CheckCircleOutlined />;
        break;
      case USER_STATUS.INACTIVE:
        color = USER_STATUS_COLORS[USER_STATUS.INACTIVE];
        text = USER_STATUS_NAMES[USER_STATUS.INACTIVE];
        icon = <ClockCircleOutlined />;
        break;
      case USER_STATUS.SUSPENDED:
        color = USER_STATUS_COLORS[USER_STATUS.SUSPENDED];
        text = USER_STATUS_NAMES[USER_STATUS.SUSPENDED];
        icon = <CloseCircleOutlined />;
        break;
      default:
        icon = <ExclamationCircleOutlined />;
    }
  }

  return (
    <Tag color={color} icon={icon} className={`px-2 py-1 ${className}`}>
      {text}
    </Tag>
  );
};

export default StatusTag;