// src/components/common/EmptyState.jsx
import React from 'react';
import { Empty, Button } from 'antd';
import { 
  FileOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  SearchOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { EMPTY_MESSAGES } from '../../constants/thaiMessages';

/**
 * Component แสดงสถานะว่างเปล่า
 * 
 * @param {Object} props
 * @param {string} props.type - ประเภทของข้อมูลที่ว่างเปล่า ('project', 'user', 'log', 'search')
 * @param {string} props.message - ข้อความที่ต้องการแสดง (ถ้าไม่ระบุจะใช้ข้อความตาม type)
 * @param {string} props.description - คำอธิบายเพิ่มเติม
 * @param {Function} props.onAction - ฟังก์ชันที่เรียกเมื่อกดปุ่ม
 * @param {string} props.actionText - ข้อความบนปุ่ม
 * @param {React.ReactNode} props.actionIcon - ไอคอนบนปุ่ม
 * @param {string} props.imageStyle - รูปแบบของรูปภาพ ('simple', 'normal')
 */
const EmptyState = ({
  type = 'project',
  message,
  description,
  onAction,
  actionText,
  actionIcon,
  imageStyle = 'normal'
}) => {
  // กำหนดข้อความตาม type
  let defaultMessage = '';
  let defaultIcon = null;

  switch (type) {
    case 'project':
      defaultMessage = EMPTY_MESSAGES.NO_PROJECTS;
      defaultIcon = <FileOutlined />;
      break;
    case 'user':
      defaultMessage = EMPTY_MESSAGES.NO_USERS;
      defaultIcon = <UserOutlined />;
      break;
    case 'log':
      defaultMessage = EMPTY_MESSAGES.NO_LOGS;
      defaultIcon = <ClockCircleOutlined />;
      break;
    case 'search':
      defaultMessage = EMPTY_MESSAGES.NO_RESULTS;
      defaultIcon = <SearchOutlined />;
      break;
    default:
      defaultMessage = EMPTY_MESSAGES.NO_DATA;
      defaultIcon = <FileOutlined />;
  }

  // กำหนดไอคอนของปุ่ม
  const buttonIcon = actionIcon || (type === 'search' ? <SearchOutlined /> : <PlusOutlined />);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Empty 
        image={imageStyle === 'simple' ? Empty.PRESENTED_IMAGE_SIMPLE : Empty.PRESENTED_IMAGE_DEFAULT}
        description={
          <div className="px-4">
            <div className="text-lg font-medium">{message || defaultMessage}</div>
            {description && <div className="text-gray-500 mt-2">{description}</div>}
          </div>
        }
      />
      
      {onAction && (
        <Button 
          type="primary" 
          onClick={onAction}
          icon={buttonIcon}
          className="mt-4"
        >
          {actionText || (type === 'search' ? 'ค้นหาใหม่' : 'เพิ่มข้อมูล')}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;