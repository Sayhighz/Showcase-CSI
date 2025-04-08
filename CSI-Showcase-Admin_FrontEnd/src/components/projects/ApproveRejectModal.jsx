import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, Typography, Divider, Alert, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

/**
 * Modal สำหรับอนุมัติหรือปฏิเสธโปรเจค
 * 
 * @param {Object} props
 * @param {boolean} props.visible - สถานะการแสดง Modal
 * @param {string} props.modalType - ประเภทของ Modal ('approve' หรือ 'reject')
 * @param {string|number} props.projectId - รหัสโปรเจค
 * @param {string} props.projectTitle - ชื่อโปรเจค
 * @param {Function} props.onConfirm - ฟังก์ชันที่เรียกเมื่อกดยืนยัน (ควรรับพารามิเตอร์ comment)
 * @param {Function} props.onCancel - ฟังก์ชันที่เรียกเมื่อกดยกเลิก
 * @param {boolean} props.loading - สถานะกำลังโหลด
 */
const ApproveRejectModal = ({
  visible = false,
  modalType = 'approve',
  projectId,
  projectTitle = '',
  onConfirm,
  onCancel,
  loading = false
}) => {
  const [comment, setComment] = useState('');
  const [form] = Form.useForm();
  
  // รีเซ็ตฟอร์มเมื่อ Modal เปิด/ปิด
  useEffect(() => {
    if (visible) {
      setComment('');
      form.resetFields();
    }
  }, [visible, form]);
  
  const handleSubmit = () => {
    // กรณีปฏิเสธต้องตรวจสอบว่ามีการกรอกเหตุผล
    if (modalType === 'reject' && !comment.trim()) {
      form.validateFields(['comment']);
      return;
    }
    
    // ส่งเฉพาะ comment ไป โดย projectId จะดึงจาก state ในฝั่งของ Project.jsx
    onConfirm && onConfirm(comment);
  };
  
  // กำหนดหัวข้อและสีตามประเภท
  const title = modalType === 'approve' ? 'ยืนยันการอนุมัติโปรเจค' : 'ยืนยันการปฏิเสธโปรเจค';
  const icon = modalType === 'approve' ? 
    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  const okText = modalType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ';
  const okButtonProps = {
    type: modalType === 'approve' ? 'primary' : 'primary',
    danger: modalType === 'reject',
    icon: icon
  };
  
  // คำอธิบายเพิ่มเติม
  const getDescription = () => {
    if (modalType === 'approve') {
      return 'การอนุมัติจะทำให้โปรเจคนี้แสดงในหน้าเว็บไซต์สาธารณะ';
    } else {
      return 'การปฏิเสธจะทำให้โปรเจคนี้ไม่แสดงในหน้าเว็บไซต์สาธารณะ คุณต้องระบุเหตุผล';
    }
  };
  
  // สี background ของ Modal header
  const headerBackground = modalType === 'approve' ? 'bg-green-50' : 'bg-red-50';
  
  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose
      className="rounded-lg overflow-hidden"
      bodyStyle={{ padding: 0 }}
      maskClosable={false}
    >
      {/* Header ที่มีสี */}
      <div className={`p-5 ${headerBackground}`}>
        <div className="flex items-center">
          <div 
            className={`flex items-center justify-center rounded-full p-3 mr-3 
            ${modalType === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}
          >
            {icon}
          </div>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
        </div>
      </div>
      
      <div className="p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="mb-4">
            <Alert 
              type={modalType === 'approve' ? 'success' : 'warning'}
              showIcon
              icon={<InfoCircleOutlined />}
              message={
                <>
                  <Text strong>
                    คุณต้องการ{modalType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}โปรเจค 
                    "<strong>{projectTitle}</strong>" (ID: {projectId})
                  </Text>
                  <Paragraph type="secondary" className="mt-1 mb-0">
                    {getDescription()}
                  </Paragraph>
                </>
              }
              style={{ marginBottom: 16 }}
            />
          </div>
          
          {/* แสดงช่องกรอกความคิดเห็นเฉพาะกรณีปฏิเสธ */}
          {modalType === 'reject' && (
            <Form.Item
              name="comment"
              label="เหตุผลในการปฏิเสธ"
              rules={[{ required: true, message: 'กรุณาระบุเหตุผลในการปฏิเสธ' }]}
            >
              <TextArea
                rows={4}
                placeholder="ระบุเหตุผลในการปฏิเสธโปรเจคนี้..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                showCount
                maxLength={500}
                className="rounded"
              />
            </Form.Item>
          )}
          
          {/* แสดงช่องกรอกความคิดเห็นเพิ่มเติมกรณีอนุมัติ (ไม่บังคับ) */}
          {modalType === 'approve' && (
            <Form.Item
              name="comment"
              label="ความคิดเห็นเพิ่มเติม (ไม่บังคับ)"
            >
              <TextArea
                rows={3}
                placeholder="ความคิดเห็นเพิ่มเติม (ถ้ามี)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                showCount
                maxLength={300}
                className="rounded"
              />
            </Form.Item>
          )}
          
          <Divider className="my-4" />
          
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={onCancel}
              size="large"
              className="rounded-md px-4"
            >
              ยกเลิก
            </Button>
            <Button
              {...okButtonProps}
              onClick={handleSubmit}
              loading={loading}
              size="large"
              className="rounded-md px-5 shadow-sm"
            >
              {okText}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ApproveRejectModal;