import React from 'react';
import { Card, Timeline, Typography, Tag, Button, Spin, Empty } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  UserAddOutlined,
  ProjectOutlined,
  EyeOutlined,
  FileDoneOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';

const { Text } = Typography;

// กำหนดไอคอนตามประเภทกิจกรรม
const getActivityIcon = (type) => {
  switch (type) {
    case 'project_created':
      return <ProjectOutlined className="text-blue-500" />;
    case 'project_approved':
      return <CheckCircleOutlined className="text-green-500" />;
    case 'project_rejected':
      return <CloseCircleOutlined className="text-red-500" />;
    case 'user_registered':
      return <UserAddOutlined className="text-purple-500" />;
    case 'user_login':
      return <UserAddOutlined className="text-cyan-500" />;
    case 'project_viewed':
      return <EyeOutlined className="text-gray-500" />;
    case 'review_submitted':
      return <FileDoneOutlined className="text-orange-500" />;
    default:
      return <ClockCircleOutlined className="text-gray-500" />;
  }
};

// กำหนดสีตามประเภทกิจกรรม
const getActivityColor = (type) => {
  switch (type) {
    case 'project_created':
      return 'blue';
    case 'project_approved':
      return 'green';
    case 'project_rejected':
      return 'red';
    case 'user_registered':
      return 'purple';
    case 'user_login':
      return 'cyan';
    case 'project_viewed':
      return 'gray';
    case 'review_submitted':
      return 'orange';
    default:
      return 'gray';
  }
};

const ActivityTimeline = ({
  activities = [],
  loading = false,
  onViewMore = () => {},
  limit = 8,
  showViewMoreButton = true,
}) => {
  // แสดง loading
  if (loading) {
    return (
      <Card title="กิจกรรมล่าสุด" className="h-full">
        <div className="flex items-center justify-center h-64">
          <Spin tip="กำลังโหลดข้อมูล..." />
        </div>
      </Card>
    );
  }

  // แสดงเมื่อไม่มีข้อมูล
  if (!activities || activities.length === 0) {
    return (
      <Card title="กิจกรรมล่าสุด" className="h-full">
        <div className="flex items-center justify-center h-64">
          <Empty description="ไม่มีกิจกรรมล่าสุด" />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="กิจกรรมล่าสุด" 
      extra={
        showViewMoreButton && (
          <Button 
            type="link" 
            onClick={onViewMore}
            icon={<LinkOutlined />}
          >
            ดูทั้งหมด
          </Button>
        )
      }
      className="h-full"
    >
      <Timeline
        mode="left"
        items={activities.slice(0, limit).map((activity, index) => ({
          key: index,
          dot: getActivityIcon(activity.type),
          color: getActivityColor(activity.type),
          children: (
            <div className="pb-4">
              <div className="flex items-center mb-1">
                <Tag color={getActivityColor(activity.type)} className="mr-2">
                  {activity.type_name || activity.type}
                </Tag>
                <Text className="text-gray-400 text-xs">
                  {formatThaiDate(activity.timestamp, { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
              </div>
              <div className="text-sm">{activity.message}</div>
              {activity.user && (
                <div className="mt-1">
                  <Link to={`/users/${activity.user.id}`} className="text-xs text-gray-500 hover:text-purple-700">
                    โดย: {activity.user.username || activity.user.full_name}
                  </Link>
                </div>
              )}
              {activity.project_id && (
                <div className="mt-1">
                  <Link to={`/projects/${activity.project_id}`} className="text-xs text-gray-500 hover:text-purple-700">
                    โปรเจค: {activity.project_title || `#${activity.project_id}`}
                  </Link>
                </div>
                )}
                </div>
              ),
            }))}
          />
        </Card>
      );
    };
    
    export default ActivityTimeline;