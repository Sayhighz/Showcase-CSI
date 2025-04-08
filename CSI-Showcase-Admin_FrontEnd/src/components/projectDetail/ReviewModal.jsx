// src/components/projectDetail/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Alert } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { PROJECT_STATUS } from '../../constants/projectConstants';

const { TextArea } = Input;
const { Text } = Typography;

const ReviewModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  type = 'approve', 
  loading = false 
}) => {
  const [form] = Form.useForm();
  const [comment, setComment] = useState('');
  
  // Reset form when modal opens or type changes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setComment('');
    }
  }, [visible, type, form]);

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values.comment);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Determine modal title, icon, and color based on review type
  const modalConfig = type === 'approve' 
    ? {
        title: 'อนุมัติผลงาน',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        buttonText: 'อนุมัติ',
        buttonType: 'primary',
        commentRequired: false,
        alertType: 'success',
        alertMessage: 'คุณกำลังอนุมัติผลงานนี้ ผลงานจะแสดงในเว็บไซต์หลักหลังจากอนุมัติ'
      }
    : {
        title: 'ปฏิเสธผลงาน',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        buttonText: 'ปฏิเสธ',
        buttonType: 'primary',
        buttonDanger: true,
        commentRequired: true,
        alertType: 'error',
        alertMessage: 'คุณกำลังปฏิเสธผลงานนี้ โปรดระบุเหตุผลในการปฏิเสธเพื่อแจ้งให้นักศึกษาทราบและปรับปรุงผลงาน'
      };

  return (
    <Modal
      title={
        <div className="flex items-center">
          {modalConfig.icon}
          <span className="ml-2">{modalConfig.title}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          ยกเลิก
        </Button>,
        <Button 
          key="submit" 
          type={modalConfig.buttonType}
          danger={modalConfig.buttonDanger}
          loading={loading}
          onClick={handleSubmit}
        >
          {modalConfig.buttonText}
        </Button>
      ]}
    >
      <Alert
        message={<Text strong>{type === 'approve' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}</Text>}
        description={modalConfig.alertMessage}
        type={modalConfig.alertType}
        showIcon
        icon={<ExclamationCircleOutlined />}
        className="mb-4"
      />
      
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="comment"
          label="ความคิดเห็น"
          rules={[
            { 
              required: modalConfig.commentRequired, 
              message: 'กรุณาระบุเหตุผลในการปฏิเสธ' 
            }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder={
              type === 'approve' 
                ? 'ความคิดเห็นเพิ่มเติม (ไม่จำเป็นต้องระบุ)' 
                : 'โปรดระบุเหตุผลในการปฏิเสธผลงานนี้...'
            }
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReviewModal;