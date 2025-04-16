import React from 'react';
import { Spin, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * LoadingSpinner component ใช้สำหรับแสดงสถานะการโหลดข้อมูล
 * 
 * @param {Object} props - Props ของ component
 * @param {string} props.tip - ข้อความที่แสดงระหว่างการโหลด
 * @param {string} props.size - ขนาดของ spinner ('small', 'default', 'large')
 * @param {boolean} props.fullPage - แสดงแบบเต็มหน้าจอหรือไม่
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} LoadingSpinner component
 */
const LoadingSpinner = ({ 
  tip = 'กำลังโหลด...', 
  size = 'default', 
  fullPage = false,
  style
}) => {
  // กำหนดขนาดของไอคอนตาม size ที่ระบุ
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      case 'default':
      default:
        return 32;
    }
  };

  // สร้างไอคอนการโหลดด้วยขนาดที่กำหนด
  const loadingIcon = <LoadingOutlined style={{ fontSize: getIconSize() }} spin />;

  // แสดงแบบเต็มหน้าจอ
  if (fullPage) {
    return (
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
          ...style
        }}
      >
        <Space direction="vertical" align="center">
          <Spin indicator={loadingIcon} />
          {tip && <Text style={{ marginTop: 16 }}>{tip}</Text>}
        </Space>
      </div>
    );
  }

  // แสดงแบบธรรมดา
  return (
    <div 
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        ...style
      }}
    >
      <Space direction="vertical" align="center">
        <Spin indicator={loadingIcon} />
        {tip && <Text style={{ marginTop: 8 }}>{tip}</Text>}
      </Space>
    </div>
  );
};

export default LoadingSpinner;