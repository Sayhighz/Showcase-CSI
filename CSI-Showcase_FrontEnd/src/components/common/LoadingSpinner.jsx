import React, { useState, useEffect } from 'react';
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // ตรวจสอบขนาดหน้าจอและอัปเดต state
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // ปรับขนาดตาม responsive
  const getResponsiveSize = () => {
    if (windowWidth < 576) return 'xs';
    if (windowWidth < 768) return 'sm';
    if (windowWidth < 992) return 'md';
    if (windowWidth < 1200) return 'lg';
    return 'xl';
  };

  const responsiveSize = getResponsiveSize();

  // กำหนดขนาดของไอคอนตาม size ที่ระบุและขนาดหน้าจอ
  const getIconSize = () => {
    // ปรับตาม responsive
    const responsiveFactor = responsiveSize === 'xs' ? 0.7 : 
                            (responsiveSize === 'sm' ? 0.8 : 
                            (responsiveSize === 'md' ? 0.9 : 1));
    
    // ปรับตาม size ที่กำหนด
    switch (size) {
      case 'small':
        return 24 * responsiveFactor;
      case 'large':
        return 48 * responsiveFactor;
      case 'default':
      default:
        return 32 * responsiveFactor;
    }
  };

  // สร้างไอคอนการโหลดด้วยขนาดที่กำหนด
  const loadingIcon = <LoadingOutlined style={{ fontSize: getIconSize() }} spin />;

  // ปรับขนาดฟ้อนต์ตาม responsive
  const getFontSize = () => {
    return responsiveSize === 'xs' ? '12px' : 
           (responsiveSize === 'sm' ? '13px' : '14px');
  };

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
          {tip && <Text style={{ 
            marginTop: responsiveSize === 'xs' ? 8 : 16, 
            fontSize: getFontSize() 
          }}>{tip}</Text>}
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
        padding: responsiveSize === 'xs' ? 12 : (responsiveSize === 'sm' ? 16 : 24),
        ...style
      }}
    >
      <Space direction="vertical" align="center">
        <Spin indicator={loadingIcon} />
        {tip && <Text style={{ 
          marginTop: responsiveSize === 'xs' ? 4 : 8, 
          fontSize: getFontSize() 
        }}>{tip}</Text>}
      </Space>
    </div>
  );
};

export default LoadingSpinner;