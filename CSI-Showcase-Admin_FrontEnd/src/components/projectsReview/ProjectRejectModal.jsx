import React from 'react';
import { Modal, Button, Alert, Form, Input } from 'antd';
import { 
  CloseCircleOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;

const ProjectRejectModal = ({ 
  rejectModalVisible, 
  setRejectModalVisible, 
  selectedProject, 
  handleReject, 
  isReviewing,
  form 
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center">
          <CloseCircleOutlined className="mr-2 text-red-500" />
          <span>ปฏิเสธโปรเจค</span>
        </div>
      }
      open={rejectModalVisible}
      onCancel={() => setRejectModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setRejectModalVisible(false)}>
          ยกเลิก
        </Button>,
        <Button
          key="reject"
          type="primary"
          danger
          loading={isReviewing}
          onClick={handleReject}
        >
          ยืนยันการปฏิเสธ
        </Button>
      ]}
    >
      <Alert
        message={`ปฏิเสธโปรเจค: ${selectedProject?.title}`}
        description="การปฏิเสธจะส่งการแจ้งเตือนไปยังเจ้าของโปรเจค โปรดระบุเหตุผลที่ปฏิเสธเพื่อให้เจ้าของโปรเจคสามารถปรับปรุงแก้ไขได้"
        type="error"
        showIcon
        className="mb-4"
      />

      <Form form={form} layout="vertical">
        <Form.Item 
          name="rejectReason" 
          label="เหตุผลที่ปฏิเสธ" 
          rules={[{ required: true, message: 'กรุณาระบุเหตุผลที่ปฏิเสธ' }]}
        >
          <TextArea
            rows={4}
            placeholder="กรอกเหตุผลที่ปฏิเสธโปรเจคนี้"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectRejectModal;