// src/components/projectDetail/ProjectReviewHistory.jsx
import React from 'react';
import { Timeline, Card, Typography, Empty, Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  UserOutlined
} from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dataUtils';

const { Title, Text, Paragraph } = Typography;

const ProjectReviewHistory = ({ reviews = [] }) => {
  // Check for empty reviews
  if (!reviews || reviews.length === 0) {
    return (
      <Empty 
        description="ยังไม่มีประวัติการตรวจสอบ" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
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
          color: 'green', 
          text: 'อนุมัติแล้ว' 
        };
      case 'rejected':
        return { 
          icon: <CloseCircleOutlined />, 
          color: 'red', 
          text: 'ถูกปฏิเสธ' 
        };
      case 'pending':
        return { 
          icon: <ClockCircleOutlined />, 
          color: 'gold', 
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
  
  return (
    <Card>
      <Title level={5} className="mb-4">ประวัติการตรวจสอบ</Title>
      <Timeline>
        {sortedReviews.map((review, index) => {
          const statusInfo = getReviewStatusInfo(review.status);
          const reviewDate = review.reviewed_at ? formatThaiDate(review.reviewed_at) : 'ไม่ระบุวันที่';
          
          return (
            <Timeline.Item 
              key={review.review_id || index} 
              color={statusInfo.color}
              dot={statusInfo.icon}
            >
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Tag color={statusInfo.color}>
                      {statusInfo.text}
                    </Tag>
                    <Text strong className="ml-2">
                      {reviewDate}
                    </Text>
                  </div>
                </div>
                
                <div className="mb-3">
                  <Text type="secondary" className="flex items-center">
                    <UserOutlined className="mr-1" />
                    ตรวจสอบโดย: {review.admin_name || review.admin_username || 'ไม่ระบุ'}
                  </Text>
                </div>
                
                {review.review_comment ? (
                  <Paragraph className="bg-white p-3 rounded border border-gray-100">
                    <Text strong>ความคิดเห็น:</Text>
                    <div className="mt-1">{review.review_comment}</div>
                  </Paragraph>
                ) : (
                  <Paragraph type="secondary" italic>
                    ไม่มีความคิดเห็น
                  </Paragraph>
                )}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Card>
  );
};

export default ProjectReviewHistory;