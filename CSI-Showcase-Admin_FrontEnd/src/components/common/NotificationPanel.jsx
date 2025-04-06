// src/components/common/NotificationPanel.jsx
import React from 'react';
import { List, Badge, Button, Empty, Tooltip, Typography, Divider } from 'antd';
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  InfoCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dataUtils';
import { useAdminState } from '../../context/AdminStateContext';

const { Text } = Typography;

/**
 * Component แสดงรายการแจ้งเตือน
 * 
 * @param {Object} props
 * @param {Array} props.notifications - รายการแจ้งเตือน
 * @param {Function} props.onRead - ฟังก์ชันที่เรียกเมื่ออ่านการแจ้งเตือน
 * @param {Function} props.onReadAll - ฟังก์ชันที่เรียกเมื่ออ่านการแจ้งเตือนทั้งหมด
 * @param {number} props.maxHeight - ความสูงสูงสุดของรายการ (px)
 */
const NotificationPanel = ({
  notifications = [],
  onRead,
  onReadAll,
  maxHeight = 300
}) => {
  // ดึงข้อมูลการแจ้งเตือนจาก context ถ้าไม่ได้รับเป็น prop
  const adminState = useAdminState();
  const notificationList = notifications.length > 0 ? 
    notifications : (adminState?.notifications || []);
  const hasUnread = notificationList.some(notification => !notification.read);

  // จัดการเมื่อคลิกที่การแจ้งเตือน
  const handleNotificationClick = (notification) => {
    if (!notification.read && onRead) {
      onRead(notification.id);
    }
  };

  // เลือกไอคอนตามประเภทการแจ้งเตือน
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff' }} />;
    }
  };

  // แปลงวันที่เป็นรูปแบบภาษาไทย
  const formatDate = (dateString) => {
    return formatThaiDate(dateString, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="w-80">
      <div className="flex justify-between items-center px-4 py-2">
        <Text strong>การแจ้งเตือน</Text>
        {hasUnread && onReadAll && (
          <Button
            type="link"
            size="small"
            onClick={onReadAll}
            className="flex items-center"
          >
            <CheckOutlined className="mr-1" />
            <span>อ่านทั้งหมด</span>
          </Button>
        )}
      </div>
      
      <Divider className="my-0" />
      
      {notificationList.length === 0 ? (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="ไม่มีการแจ้งเตือน" 
          className="py-6"
        />
      ) : (
        <div style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto' }}>
          <List
            itemLayout="horizontal"
            dataSource={notificationList}
            renderItem={(notification) => (
              <List.Item
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!notification.read}>
                      {getNotificationIcon(notification.type)}
                    </Badge>
                  }
                  title={
                    <div className="flex justify-between items-center">
                      <Text strong>{notification.title}</Text>
                      <Text type="secondary" className="text-xs">
                        {formatDate(notification.timestamp)}
                      </Text>
                    </div>
                  }
                  description={
                    <Tooltip title={notification.message}>
                      <div className="truncate max-w-xs">
                        {notification.message}
                      </div>
                    </Tooltip>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;