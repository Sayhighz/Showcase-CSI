import React, { useState, useEffect } from 'react';
import { Typography, Space, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

/**
 * คอมโพเนนต์สำหรับแสดงส่วนหัวของหน้าเว็บ
 * @param {Object} props - Props ของคอมโพเนนต์
 * @param {string} props.title - หัวข้อหลัก
 * @param {string} props.subtitle - หัวข้อรอง
 * @param {Array} props.breadcrumb - รายการ breadcrumb
 * @param {string} props.icon - ไอคอนประกอบหัวข้อ
 * @param {React.ReactNode} props.extra - ส่วนเพิ่มเติมด้านขวาของหัวข้อ
 * @returns {React.ReactElement} - คอมโพเนนต์ PageHeader
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumb = [], 
  icon = null,
  extra = null
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

  return (
    <div className={`mb-4 sm:mb-6 md:mb-8`}>
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <Breadcrumb className="mb-2 sm:mb-3 md:mb-4" separator=">" style={{
          fontSize: responsiveSize === 'xs' ? '12px' : (responsiveSize === 'sm' ? '13px' : '14px')
        }}>
          {breadcrumb.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {item.path ? (
                <Link to={item.path}>{item.label}</Link>
              ) : (
                item.label
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      
      {/* Header with title and extra content */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-1 sm:mb-2">
        <div className="mb-3 sm:mb-0 text-center sm:text-left w-full sm:w-auto">
          <Title 
            level={responsiveSize === 'xs' ? 3 : 2} 
            className="text-[#90278E] flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-0 sm:mb-1"
            style={{
              fontSize: responsiveSize === 'xs' ? '20px' : (responsiveSize === 'sm' ? '22px' : '24px')
            }}
          >
            {icon && <span className="mr-1 sm:mr-2" style={{
              fontSize: responsiveSize === 'xs' ? '16px' : (responsiveSize === 'sm' ? '18px' : '20px')
            }}>{icon}</span>}
            {title}
          </Title>
          
          {subtitle && (
            <Text type="secondary" className="text-sm sm:text-base md:text-lg">
              {subtitle}
            </Text>
          )}
        </div>
        
        {extra && (
          <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
            {extra}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;