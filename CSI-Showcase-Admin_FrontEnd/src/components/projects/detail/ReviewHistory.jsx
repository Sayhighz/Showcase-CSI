import React from 'react';
import { Timeline, Tag, Typography, Empty } from 'antd';
import { formatThaiDate } from '../../../utils/dataUtils';

const { Text } = Typography;

const ReviewHistory = ({ projectDetails }) => {
  const reviews = projectDetails?.reviews || [];
  
  if (reviews.length === 0) {
    return <Empty description="ไม่มีประวัติการตรวจสอบ" />;
  }
  
  return (
    <Timeline mode="left">
      {reviews.map(review => (
        <Timeline.Item
          key={review.review_id}
          color={review.status === 'approved' ? 'green' : review.status === 'rejected' ? 'red' : 'blue'}
          label={formatThaiDate(review.reviewed_at, { dateStyle: 'medium', timeStyle: 'short' })}
        >
          <div className="ml-2">
            <div className="flex items-center mb-1">
              <Tag 
                color={review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'error' : 'processing'}
              >
                {review.status === 'approved' ? 'อนุมัติ' : review.status === 'rejected' ? 'ปฏิเสธ' : 'แก้ไข'}
              </Tag>
              <span className="ml-2 text-purple-700 font-medium">โดย {review.admin_name}</span>
            </div>
            {review.review_comment && (
              <div className="ml-2 mt-1 text-gray-700">
                <Text>{review.review_comment}</Text>
              </div>
            )}
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default ReviewHistory;