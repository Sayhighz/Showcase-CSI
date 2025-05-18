import React from 'react';
import { Result, Button, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

/**
 * ErrorMessage component ใช้สำหรับแสดงข้อความผิดพลาด
 * 
 * @param {Object} props - Props ของ component
 * @param {string} props.title - หัวข้อของข้อความผิดพลาด
 * @param {string|React.ReactNode} props.message - รายละเอียดข้อความผิดพลาด
 * @param {number} props.status - รหัสสถานะข้อผิดพลาด (404, 500, etc.)
 * @param {boolean} props.showBackButton - แสดงปุ่มย้อนกลับหรือไม่
 * @param {boolean} props.showHomeButton - แสดงปุ่มหน้าหลักหรือไม่
 * @param {boolean} props.showReloadButton - แสดงปุ่มโหลดใหม่หรือไม่
 * @param {Function} props.onBackClick - ฟังก์ชันที่จะทำงานเมื่อคลิกปุ่มย้อนกลับ
 * @param {Function} props.onHomeClick - ฟังก์ชันที่จะทำงานเมื่อคลิกปุ่มหน้าหลัก
 * @param {Function} props.onReloadClick - ฟังก์ชันที่จะทำงานเมื่อคลิกปุ่มโหลดใหม่
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} ErrorMessage component
 */
const ErrorMessage = ({
  title = 'เกิดข้อผิดพลาด',
  message = 'ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้งในภายหลัง',
  status = 'error',
  showBackButton = true,
  showHomeButton = true,
  showReloadButton = true,
  onBackClick,
  onHomeClick,
  onReloadClick,
  style
}) => {
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับปุ่มย้อนกลับ
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  // ฟังก์ชันสำหรับปุ่มหน้าหลัก
  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate('/');
    }
  };

  // ฟังก์ชันสำหรับปุ่มโหลดใหม่
  const handleReloadClick = () => {
    if (onReloadClick) {
      onReloadClick();
    } else {
      window.location.reload();
    }
  };

  // กำหนด status icon และรายละเอียดตาม status
  const getStatusProps = () => {
    switch (status) {
      case 404:
        return {
          status: '404',
          title: title || 'ไม่พบหน้าที่ค้นหา',
          subTitle: message || 'ขออภัย เราไม่พบหน้าที่คุณกำลังค้นหา'
        };
      case 403:
        return {
          status: '403',
          title: title || 'ไม่มีสิทธิ์เข้าถึง',
          subTitle: message || 'ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้'
        };
      case 500:
        return {
          status: '500',
          title: title || 'เซิร์ฟเวอร์ผิดพลาด',
          subTitle: message || 'ขออภัย เกิดข้อผิดพลาดในเซิร์ฟเวอร์ กรุณาลองอีกครั้งในภายหลัง'
        };
      default:
        return {
          status: 'error',
          title: title,
          subTitle: message
        };
    }
  };

  const statusProps = getStatusProps();

  return (
    <Result
      status={statusProps.status}
      title={
        <div className="text-base sm:text-lg md:text-xl lg:text-2xl">
          {statusProps.title}
        </div>
      }
      subTitle={
        <div className="text-xs sm:text-sm md:text-base px-2 sm:px-4">
          {statusProps.subTitle}
        </div>
      }
      style={{ 
        padding: '1rem',
        ...style 
      }}
      extra={
        <Space size="small" className="flex flex-wrap justify-center gap-2">
          {showBackButton && (
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackClick}
              size={window.innerWidth < 768 ? "small" : "middle"}
              className="flex items-center"
            >
              ย้อนกลับ
            </Button>
          )}
          {showHomeButton && (
            <Button 
              icon={<HomeOutlined />} 
              onClick={handleHomeClick}
              size={window.innerWidth < 768 ? "small" : "middle"}
              className="flex items-center"
            >
              หน้าหลัก
            </Button>
          )}
          {showReloadButton && (
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleReloadClick}
              size={window.innerWidth < 768 ? "small" : "middle"}
              className="flex items-center"
            >
              ลองอีกครั้ง
            </Button>
          )}
        </Space>
      }
    />
  );
};

export default ErrorMessage;