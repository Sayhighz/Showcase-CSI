// src/components/projectDetail/ProjectReviewHistory.jsx
import React from 'react';
import { Timeline, Card, Typography, Empty, Tag, Avatar, Badge } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  CommentOutlined,
  TagOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dataUtils';

const { Title, Text, Paragraph } = Typography;

const ProjectReviewHistory = ({ reviews = [] }) => {
  // Check for empty reviews
  if (!reviews || reviews.length === 0) {
    return (
      <div className="empty-state-container">
        <Empty 
          description="ยังไม่มีประวัติการตรวจสอบ" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // Sort reviews by date (newest first)
  const sortedReviews = [...reviews].sort((a, b) => 
    new Date(b.reviewed_at) - new Date(a.reviewed_at)
  );

  // Function to get review status icon and color
  const getReviewStatusInfo = (status) => {
    // Default values in case status is undefined
    if (!status) {
      return { 
        icon: <ClockCircleOutlined />, 
        color: 'blue', 
        text: 'ไม่ระบุสถานะ' 
      };
    }
    
    switch (status) {
      case 'approved':
        return { 
          icon: <CheckCircleOutlined />, 
          color: 'success', 
          text: 'อนุมัติแล้ว' 
        };
      case 'rejected':
        return { 
          icon: <CloseCircleOutlined />, 
          color: 'error', 
          text: 'ถูกปฏิเสธ' 
        };
      case 'pending':
        return { 
          icon: <ClockCircleOutlined />, 
          color: 'warning', 
          text: 'รอการตรวจสอบ' 
        };
      default:
        return { 
          icon: <ClockCircleOutlined />, 
          color: 'blue', 
          text: status 
        };
    }
  };

  // Generate avatar color based on name
  const getAvatarColor = (name) => {
    if (!name) return '#1677ff';
    
    const colors = [
      '#1677ff', // blue
      '#52c41a', // green
      '#faad14', // gold
      '#722ed1', // purple
      '#eb2f96', // magenta
      '#13c2c2', // cyan
      '#fa541c', // orange
    ];
    
    // Get a consistent color based on name
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };
  
  return (
    <Card
      className="hover-shadow"
      title={
        <Title level={5} className="flex items-center my-0">
          <TagOutlined className="mr-2 text-blue-500" /> ประวัติการตรวจสอบ
        </Title>
      }
    >
      <div className="review-timeline">
        <Timeline mode="left">
          {sortedReviews.map((review, index) => {
            const statusInfo = getReviewStatusInfo(review.status);
            const reviewDate = review.reviewed_at ? formatThaiDate(review.reviewed_at) : 'ไม่ระบุวันที่';
            const adminName = review.admin_name || review.admin_username || 'ไม่ระบุ';
            
            return (
              <Timeline.Item 
                key={review.review_id || index} 
                color={statusInfo.color}
                dot={statusInfo.icon}
                label={
                  <div className="flex items-center text-sm">
                    <CalendarOutlined className="mr-1" />
                    <Text>{reviewDate}</Text>
                  </div>
                }
              >
                <Card 
                  className={`w-full transition-all duration-300 hover:shadow-md border-l-4`}
                  style={{ borderLeftColor: 
                    statusInfo.color === 'success' ? '#52c41a' : 
                    statusInfo.color === 'error' ? '#ff4d4f' : 
                    statusInfo.color === 'warning' ? '#faad14' : '#1677ff'
                  }}
                  size="small"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center">
                      <Avatar 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: getAvatarColor(adminName) }}
                        className="mr-2"
                      />
                      <div>
                        <Text strong>{adminName}</Text>
                        <div className="flex items-center mt-1">
                          <Tag color={statusInfo.color} className="flex items-center py-1">
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.text}</span>
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {review.review_comment ? (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CommentOutlined className="mr-2 text-blue-500" />
                        <Text strong>ความคิดเห็น</Text>
                      </div>
                      <Paragraph className="whitespace-pre-line">
                        {review.review_comment}
                      </Paragraph>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 italic py-2">
                      <CommentOutlined className="mr-1" /> ไม่มีความคิดเห็น
                    </div>
                  )}
                </Card>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    </Card>
  );
};

export default ProjectReviewHistory;