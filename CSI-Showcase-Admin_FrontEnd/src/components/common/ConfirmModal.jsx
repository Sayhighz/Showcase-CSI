// src/components/common/ConfirmModal.jsx
import React from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { CONFIRM_MESSAGES } from '../../constants/thaiMessages';

const { Text, Title } = Typography;

/**
 * Component สำหรับแสดง Modal ยืนยันการดำเนินการ
 * 
 * @param {Object} props
 * @param {boolean} props.visible - สถานะการแสดง Modal
 * @param {Function} props.onCancel - ฟังก์ชันเมื่อกดยกเลิก
 * @param {Function} props.onConfirm - ฟังก์ชันเมื่อกดยืนยัน
 * @param {string} props.title - หัวข้อของ Modal
 * @param {string|React.ReactNode} props.content - เนื้อหาของ Modal
 * @param {string} props.type - ประเภทของ Modal ('delete', 'confirm', 'info', 'success', 'warning')
 * @param {string} props.confirmText - ข้อความปุ่มยืนยัน
 * @param {string} props.cancelText - ข้อความปุ่มยกเลิก
 * @param {boolean} props.loading - สถานะการโหลดของปุ่มยืนยัน
 * @param {Object} props.width - ความกว้างของ Modal
 */
const ConfirmModal = ({
  visible = false,
  onCancel,
  onConfirm,
  title,
  content,
  type = 'confirm',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  loading = false,
  width = 420
}) => {
  // กำหนดค่าเริ่มต้นตามประเภทของ Modal
  let defaultTitle = 'ยืนยันการดำเนินการ';
  let defaultContent = 'คุณต้องการดำเนินการนี้ใช่หรือไม่?';
  let icon = <QuestionCircleOutlined style={{ color: '#1890ff' }} />;
  let confirmButtonType = 'primary';
  let danger = false;

  switch (type) {
    case 'delete':
      defaultTitle = 'ยืนยันการลบ';
      defaultContent = CONFIRM_MESSAGES.DELETE;
      icon = <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      confirmButtonType = 'primary';
      confirmText = confirmText || 'ลบ';
      danger = true;
      break;
    case 'info':
      defaultTitle = 'ข้อมูล';
      defaultContent = 'กรุณาตรวจสอบข้อมูลก่อนดำเนินการ';
      icon = <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      break;
    case 'success':
      defaultTitle = 'ดำเนินการสำเร็จ';
      defaultContent = 'ดำเนินการเรียบร้อยแล้ว';
      icon = <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      break;
    case 'warning':
      defaultTitle = 'คำเตือน';
      defaultContent = 'กรุณาตรวจสอบข้อมูลก่อนดำเนินการ';
      icon = <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      break;
    case 'error':
      defaultTitle = 'เกิดข้อผิดพลาด';
      defaultContent = 'พบข้อผิดพลาดในการดำเนินการ';
      icon = <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      break;
    case 'confirm':
    default:
      break;
  }

  return (
    <Modal
      title={
        <div className="flex items-center">
          <span className="mr-2">{icon}</span>
          <span>{title || defaultTitle}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={width}
      centered
    >
      <div className="py-4">
        <div className="mb-6">
          {typeof content === 'string' ? (
            <Text>{content || defaultContent}</Text>
          ) : (
            content || <Text>{defaultContent}</Text>
          )}
        </div>
        
        <div className="flex justify-end">
          <Space>
            {onCancel && (
              <Button onClick={onCancel}>
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button
                type={confirmButtonType}
                danger={danger}
                onClick={onConfirm}
                loading={loading}
              >
                {confirmText}
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;