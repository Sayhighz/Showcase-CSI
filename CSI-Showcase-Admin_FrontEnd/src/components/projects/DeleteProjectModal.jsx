import React, { useState } from 'react';
import { Modal, Button, Typography, Space, Input, Alert, Divider } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { CONFIRM_MESSAGES } from '../../constants/thaiMessages';

const { Text, Title, Paragraph } = Typography;

/**
 * Component แสดงหน้าต่าง Modal สำหรับการยืนยันการลบโปรเจค
 * 
 * @param {Object} props
 * @param {boolean} props.visible - สถานะการแสดง Modal
 * @param {number} props.projectId - รหัสโปรเจค
 * @param {string} props.projectTitle - ชื่อโปรเจค
 * @param {Function} props.onConfirm - ฟังก์ชันที่เรียกเมื่อกดยืนยัน
 * @param {Function} props.onCancel - ฟังก์ชันที่เรียกเมื่อกดยกเลิก
 * @param {boolean} props.loading - สถานะกำลังโหลด
 */
const DeleteProjectModal = ({
  visible = false,
  projectId,
  projectTitle,
  onConfirm,
  onCancel,
  loading = false
}) => {
  // สถานะสำหรับเก็บข้อความยืนยัน
  const [confirmText, setConfirmText] = useState('');
  
  // ข้อความที่ต้องพิมพ์เพื่อยืนยัน
  const requiredConfirmText = 'delete';
  
  // ตรวจสอบว่าพิมพ์ข้อความยืนยันถูกต้องหรือไม่
  const isConfirmTextValid = confirmText === requiredConfirmText;
  
  // ส่งข้อมูลเมื่อกดยืนยัน
  const handleConfirm = () => {
    if (isConfirmTextValid) {
      onConfirm(projectId);
      setConfirmText(''); // รีเซ็ตข้อความยืนยัน
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={500}
      className="delete-project-modal"
      bodyStyle={{ padding: 0 }}
      maskClosable={false}
    >
      {/* Header */}
      <div className="bg-red-50 p-5">
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-red-100 rounded-full p-3 mr-3">
            <ExclamationCircleOutlined className="text-red-500 text-xl" />
          </div>
          <Title level={4} style={{ margin: 0, color: '#cf1322' }}>
            ยืนยันการลบผลงาน
          </Title>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6">
        <Alert
          message="คำเตือน: การดำเนินการนี้ไม่สามารถย้อนกลับได้"
          description="การลบจะทำให้ข้อมูลทั้งหมดของโปรเจคนี้หายไป รวมถึงความคิดเห็นและสถิติต่างๆ"
          type="error"
          showIcon
          icon={<WarningOutlined />}
          className="mb-4"
        />
        
        <div className="mb-5">
          <Text>{CONFIRM_MESSAGES.DELETE_PROJECT}</Text>
          
          {projectTitle && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <Text strong>ชื่อผลงานที่จะลบ:</Text><br/>
              <Text className="text-lg">{projectTitle}</Text>
              <div className="mt-2">
                <Text strong>รหัสผลงาน:</Text> <Text>#{projectId}</Text>
              </div>
            </div>
          )}
        </div>
        
        {/* ช่องยืนยันการลบด้วยข้อความ */}
        <div className="mb-4">
          <Text strong>พิมพ์คำว่า <Text type="danger">delete</Text> เพื่อยืนยันการลบ</Text>
          <Input
            placeholder="พิมพ์ 'delete'"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            status={confirmText && !isConfirmTextValid ? 'error' : ''}
            className="mt-2 rounded"
          />
          {confirmText && !isConfirmTextValid && (
            <div className="mt-1">
              <Text type="danger">กรุณาพิมพ์ "delete" ให้ถูกต้อง</Text>
            </div>
          )}
        </div>
        
        <Divider className="my-4" />
        
        <div className="flex justify-end">
          <Space>
            <Button 
              onClick={onCancel}
              size="large"
              className="rounded-md"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleConfirm}
              loading={loading}
              disabled={!isConfirmTextValid}
              size="large"
              className="rounded-md"
            >
              ลบ
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;