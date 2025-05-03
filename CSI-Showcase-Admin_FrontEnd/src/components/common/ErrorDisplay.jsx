import React from 'react';
import { Result, Button } from 'antd';
import { CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';

const ErrorDisplay = ({
  title = 'เกิดข้อผิดพลาด',
  subTitle = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
  error = null,
  onRetry = null,
  status = 'error',
  showReload = true,
  fullPage = false,
  style = {},
  className = '',
}) => {
  const renderErrorMessage = () => {
    if (!error) return null;
    
    // แสดงข้อความผิดพลาด
    const message = typeof error === 'string' 
      ? error 
      : error.message || 'เกิดข้อผิดพลาดที่ไม่รู้จัก';
    
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-md text-left">
        <div className="text-red-700 text-sm font-medium">ข้อความผิดพลาด:</div>
        <div className="text-red-600 text-sm mt-1 font-mono overflow-auto">{message}</div>
      </div>
    );
  };

  return (
    <div 
      className={`${fullPage ? 'min-h-full flex flex-col justify-center' : ''} ${className}`}
      style={style}
    >
      <Result
        status={status}
        title={title}
        subTitle={subTitle}
        icon={status === 'error' ? <CloseCircleOutlined style={{ color: '#F44336' }} /> : undefined}
        extra={
          showReload && onRetry && (
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={onRetry}
              danger={status === 'error'}
            >
              ลองใหม่อีกครั้ง
            </Button>
          )
        }
      >
        {renderErrorMessage()}
      </Result>
    </div>
  );
};

export default ErrorDisplay;