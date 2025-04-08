// src/components/dashboard/RecentActivities.jsx
import React from 'react';
import { List, Avatar, Tag, Badge, Empty, Tooltip } from 'antd';
import { 
  LoginOutlined, 
  LogoutOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dataUtils';
import UserAvatar from '../common/UserAvatar';
import UserRoleBadge from '../common/UserRoleBadge';

/**
 * Component แสดงกิจกรรมล่าสุดในระบบ (การเข้าสู่ระบบ)
 * 
 * @param {Object} props
 * @param {Array} props.activities - ข้อมูลกิจกรรมล่าสุด
 */
const RecentActivities = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return <Empty description="ไม่มีกิจกรรมล่าสุด" />;
  }

  // ฟังก์ชันสร้างไอคอนตามประเภทกิจกรรม
  const getActivityIcon = (activity) => {
    const status = activity.status || 'success';
    
    if (status === 'success') {
      return <LoginOutlined style={{ color: '#52c41a' }} />;
    } else {
      return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
    }
  };

  return (
    <List
      dataSource={activities}
      renderItem={(activity) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Badge 
                count={getActivityIcon(activity)}
                offset={[0, 32]}
              >
                <UserAvatar 
                  user={activity.user || { full_name: activity.username, role: activity.role }}
                  size="large"
                />
              </Badge>
            }
            title={
              <div className="flex items-center">
                <span className="mr-2">
                  {activity.user?.full_name || activity.username || 'ผู้ใช้งาน'}
                </span>
                {activity.role && (
                  <UserRoleBadge role={activity.role} size="small" />
                )}
              </div>
            }
            description={
              <div>
                {activity.status === 'success' ? (
                  <span className="text-green-600">เข้าสู่ระบบสำเร็จ</span>
                ) : (
                  <span className="text-red-600">เข้าสู่ระบบล้มเหลว</span>
                )}
                <div className="text-gray-500 text-xs mt-1">
                  <Tooltip title={activity.ip_address}>
                    <span>IP: {activity.ip_address}</span>
                  </Tooltip>
                </div>
              </div>
            }
          />
          <div className="text-gray-400 text-xs">
            {formatThaiDate(activity.login_time)}
          </div>
        </List.Item>
      )}
    />
  );
};

export default RecentActivities;