import React from 'react';
import { 
  Timeline, Card, Typography, Tag, Alert 
} from 'antd';
import { 
  CommentOutlined 
} from '@ant-design/icons';
import { formatThaiDate } from '../../utils/projectUtils';

const { Text } = Typography;

const ProjectReviewHistoryTab = ({ project }) => {
  if (!project.reviews || project.reviews.length === 0) {
    return (
      <Alert message="ยังไม่มีประวัติการตรวจสอบ" type="info" showIcon />
    );
  }

  return (
    <Timeline mode="left" className="ml-6 mt-8">
      {project.reviews.map((review, index) => (
        <Timeline.Item 
          key={index}
          color={review.status === 'approved' ? 'green' : review.status === 'rejected' ? 'red' : 'blue'}
          label={formatThaiDate(review.reviewed_at, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric' 
          })}
        >
          <Card className="mb-4" size="small">
            <div className="mb-2">
              <Tag color={
                review.status === 'approved' ? 'success' : 
                review.status === 'rejected' ? 'error' : 'processing'
              }>
                {review.status === 'approved' ? 'อนุมัติ' : 
                 review.status === 'rejected' ? 'ปฏิเสธ' : 'ตรวจสอบ'}
              </Tag>
            </div>
            <div className="mb-2">
              <Text type="secondary">
                ผู้ตรวจสอบ: {review.admin_name || review.admin_username || 'ไม่ระบุ'}
              </Text>
            </div>
            {review.review_comment && (
              <div className="bg-gray-50 p-3 rounded-md mt-2">
                <Text>
                  <CommentOutlined className="mr-2" />
                  ความคิดเห็น: {review.review_comment}
                </Text>
              </div>
            )}
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default ProjectReviewHistoryTab;