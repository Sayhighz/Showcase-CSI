import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const EmptyState = ({
  description = 'ไม่พบข้อมูล',
  image = undefined,
  showAction = true,
  actionText = 'เพิ่มข้อมูล',
  actionIcon = <PlusOutlined />,
  actionType = 'primary',
  onAction = null,
  showReload = false,
  onReload = null,
  reloadText = 'รีเฟรช',
  type = 'default', // default, search, noData, custom
  className = '',
  style = {},
}) => {
  // เลือกข้อความและไอคอนตามประเภท
  const getEmptyDetails = () => {
    switch (type) {
      case 'search':
        return {
          description: description || 'ไม่พบผลลัพธ์จากการค้นหา',
          icon: <SearchOutlined />,
          actionText: actionText || 'ล้างการค้นหา',
        };
      case 'noData':
        return {
          description: description || 'ยังไม่มีข้อมูล',
          icon: actionIcon,
          actionText: actionText || 'เพิ่มข้อมูลใหม่',
        };
      default:
        return {
          description,
          icon: actionIcon,
          actionText,
        };
    }
  };

  const { description: finalDescription, icon, actionText: finalActionText } = getEmptyDetails();

  return (
    <div className={`py-10 ${className}`} style={style}>
      <Empty
        image={image}
        description={
          <span className="text-gray-500">{finalDescription}</span>
        }
      >
        {showAction && onAction && (
          <Button 
          type={actionType}
          icon={icon}
          onClick={onAction}
        >
          {finalActionText}
        </Button>
      )}
      
      {showReload && onReload && (
        <Button 
          className="ml-2"
          icon={<ReloadOutlined />}
          onClick={onReload}
        >
          {reloadText}
        </Button>
      )}
    </Empty>
  </div>
);
};

export default EmptyState;