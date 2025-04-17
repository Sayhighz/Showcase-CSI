import React from 'react';
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
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <Breadcrumb className="mb-4">
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
        <div className="mb-4 sm:mb-0 text-center sm:text-left">
          <Title 
            level={2} 
            className="text-[#90278E] flex items-center gap-2 mb-1"
          >
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </Title>
          
          {subtitle && (
            <Text type="secondary" className="text-lg">
              {subtitle}
            </Text>
          )}
        </div>
        
        {extra && (
          <div className="flex-shrink-0">
            {extra}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;