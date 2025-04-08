import React from 'react';
import { Typography, Space, Button, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, HomeOutlined, UserOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * คอมโพเนนต์ส่วนหัวของหน้า
 * @param {Object} props - พร็อพเพอร์ตี้ของคอมโพเนนต์
 * @param {string} props.title - หัวข้อหลัก
 * @param {string} props.subtitle - หัวข้อย่อย
 * @param {React.ReactNode} props.icon - ไอคอนหัวข้อ
 * @param {React.ReactNode} props.extra - ส่วนเสริมที่จะแสดงด้านขวา
 * @param {boolean} props.showBack - แสดงปุ่มย้อนกลับหรือไม่
 * @param {function} props.onBack - ฟังก์ชันเมื่อกดปุ่มย้อนกลับ
 * @param {Array} props.breadcrumb - ข้อมูลเส้นทางนำทาง
 * @returns {JSX.Element} - คอมโพเนนต์ส่วนหัวของหน้า
 */
const PageHeader = ({
  title,
  subtitle,
  icon,
  extra,
  showBack = false,
  onBack,
  breadcrumb = [],
}) => {
  // ฟังก์ชันสร้างไอคอนตามประเภท
  const getIcon = (type) => {
    switch (type) {
      case 'home':
        return <HomeOutlined />;
      case 'user':
        return <UserOutlined />;
      case 'file':
        return <FileTextOutlined />;
      case 'team':
        return <TeamOutlined />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <Breadcrumb className="mb-4">
          {breadcrumb.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {item.link ? (
                <Link to={item.link}>
                  {item.icon && getIcon(item.icon)}
                  {item.icon && ' '}
                  {item.title}
                </Link>
              ) : (
                <>
                  {item.icon && getIcon(item.icon)}
                  {item.icon && ' '}
                  {item.title}
                </>
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <Space>
          {showBack && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="mr-2"
            />
          )}
          
          <div>
            <Title level={4} className="mb-0 flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
            </Title>
            {subtitle && <Text type="secondary">{subtitle}</Text>}
          </div>
        </Space>
        
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
};

export default PageHeader;