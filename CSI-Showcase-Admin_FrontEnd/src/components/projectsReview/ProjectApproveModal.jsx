import React from 'react';
import { Modal, Button, Alert, Form, Input } from 'antd';
import { 
  CheckCircleOutlined, 
  CommentOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;

const ProjectApproveModal = ({ 
  reviewModalVisible, 
  setReviewModalVisible, 
  selectedProject, 
  reviewComment, 
  setReviewComment, 
  handleApprove, 
  isReviewing 
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center">
          <CheckCircleOutlined className="mr-2 text-green-500" />
          <span>อนุมัติโปรเจค</span>
        </div>
      }
      open={reviewModalVisible}
      onCancel={() => setReviewModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setReviewModalVisible(false)}>
          ยกเลิก
        </Button>,
        <Button
          key="approve"
          type="primary"
          className="bg-green-600 hover:bg-green-700"
          loading={isReviewing}
          onClick={handleApprove}
        >
          ยืนยันการอนุมัติ
        </Button>
      ]}
    >
      <Alert
        message={`อนุมัติโปรเจค: ${selectedProject?.title}`}
        description="การอนุมัติจะทำให้โปรเจคนี้แสดงบนเว็บไซต์หลักและสามารถเข้าถึงได้โดยผู้เยี่ยมชมทั่วไป"
        type="success"
        showIcon
        className="mb-4"
      />

      <Form layout="vertical">
        <Form.Item 
          label={
            <span>
              <CommentOutlined className="mr-1" />
              ความคิดเห็น (ไม่บังคับ)
            </span>
          }
        >
          <TextArea
            rows={4}
            placeholder="กรอกความคิดเห็นหรือข้อเสนอแนะเพิ่มเติม (ถ้ามี)"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectApproveModal;