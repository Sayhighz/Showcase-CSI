// src/components/projectDetail/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Alert, Radio, Space, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  SendOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { PROJECT_STATUS } from '../../constants/projectConstants';

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

const ReviewModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  type = 'approve', 
  loading = false,
  projectTitle = ''
}) => {
  const [form] = Form.useForm();
  const [comment, setComment] = useState('');
  const [commentLength, setCommentLength] = useState(0);
  
  // Reset form when modal opens or type changes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setComment('');
      setCommentLength(0);
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

  // Handle comment change
  const handleCommentChange = (e) => {
    setComment(e.target.value);
    setCommentLength(e.target.value.length);
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
        alertMessage: 'คุณกำลังอนุมัติผลงานนี้ ผลงานจะแสดงในเว็บไซต์หลักหลังจากอนุมัติ',
        color: '#52c41a'
      }
    : {
        title: 'ปฏิเสธผลงาน',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        buttonText: 'ปฏิเสธ',
        buttonType: 'primary',
        buttonDanger: true,
        commentRequired: true,
        alertType: 'error',
        alertMessage: 'คุณกำลังปฏิเสธผลงานนี้ โปรดระบุเหตุผลในการปฏิเสธเพื่อแจ้งให้นักศึกษาทราบและปรับปรุงผลงาน',
        color: '#ff4d4f'
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
      width={600}
      centered
      footer={[
        <Button key="back" onClick={onCancel} className="px-5">
          ยกเลิก
        </Button>,
        <Button 
          key="submit" 
          type={modalConfig.buttonType}
          danger={modalConfig.buttonDanger}
          loading={loading}
          onClick={handleSubmit}
          icon={type === 'approve' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          className="px-5"
        >
          {modalConfig.buttonText}
        </Button>
      ]}
      bodyStyle={{ padding: '20px' }}
    >
      <div className="space-y-6">
        <Alert
          message={
            <Text strong>{type === 'approve' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}</Text>
          }
          description={
            <div>
              <Paragraph>{modalConfig.alertMessage}</Paragraph>
              {projectTitle && (
                <Paragraph strong className="mt-2">
                  <InfoCircleOutlined className="mr-1" />
                  ชื่อผลงาน: {projectTitle}
                </Paragraph>
              )}
            </div>
          }
          type={modalConfig.alertType}
          showIcon
          icon={<ExclamationCircleOutlined />}
          className="mb-4"
        />
        
        <Divider style={{ margin: '16px 0' }}>
          <Space>
            <CommentOutlined />
            <span>ความคิดเห็น</span>
          </Space>
        </Divider>
        
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="comment"
            rules={[
              { 
                required: modalConfig.commentRequired, 
                message: 'กรุณาระบุเหตุผลในการปฏิเสธ' 
              }
            ]}
          >
            <div>
              <TextArea 
                rows={5} 
                placeholder={
                  type === 'approve' 
                    ? 'ความคิดเห็นเพิ่มเติม (ไม่จำเป็นต้องระบุ)' 
                    : 'โปรดระบุเหตุผลในการปฏิเสธผลงานนี้...'
                }
                value={comment}
                onChange={handleCommentChange}
                showCount
                maxLength={500}
                className="text-base"
              />
              
              {type === 'reject' && (
                <div className="mt-2">
                  {commentLength === 0 && (
                    <Alert 
                      message="กรุณาระบุเหตุผลในการปฏิเสธ" 
                      type="warning" 
                      showIcon 
                      icon={<WarningOutlined />}
                    />
                  )}
                </div>
              )}
              
              {type === 'approve' && commentLength > 0 && (
                <div className="mt-2">
                  <Alert 
                    message="ความเห็นของคุณจะแสดงให้นักศึกษาเห็นด้วย" 
                    type="info" 
                    showIcon 
                    icon={<InfoCircleOutlined />}
                  />
                </div>
              )}
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ReviewModal;