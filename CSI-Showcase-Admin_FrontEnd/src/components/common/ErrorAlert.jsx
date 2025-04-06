// src/components/common/ErrorAlert.jsx
import React from 'react';
import { Alert, Space, Button } from 'antd';
import { CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { ERROR_MESSAGES } from '../../constants/errorMessages';

/**
 * Component แสดงข้อความแจ้งเตือนข้อผิดพลาด
 * 
 * @param {Object} props
 * @param {string} props.message - ข้อความแจ้งเตือน
 * @param {string} props.description - รายละเอียดข้อผิดพลาด
 * @param {Function} props.onRetry - ฟังก์ชันที่เรียกเมื่อกดปุ่มลองใหม่
 * @param {boolean} props.showRetry - แสดงปุ่มลองใหม่หรือไม่
 * @param {string} props.type - ประเภทของการแจ้งเตือน ('error', 'warning')
 * @param {boolean} props.closable - สามารถปิดได้หรือไม่
 * @param {string} props.className - className เพิ่มเติม
 */
const ErrorAlert = ({
  message = ERROR_MESSAGES.GENERAL_ERRORS.UNKNOWN,
  description,
  onRetry,
  showRetry = true,
  type = 'error',
  closable = true,
  className = ''
}) => {
  return (
    <Alert
      message={message}
      description={description}
      type={type}
      showIcon
      icon={<CloseCircleOutlined />}
      closable={closable}
      className={`mb-4 ${className}`}
      action={
        showRetry && onRetry ? (
          <Button 
            type="text" 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={onRetry}
          >
            ลองใหม่
          </Button>
        ) : null
      }
    />
  );
};

export default ErrorAlert;