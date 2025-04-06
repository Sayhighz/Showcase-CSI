// src/components/common/PageHeader.jsx
import React from 'react';
import { Typography, Breadcrumb, Space } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Component สำหรับส่วนหัวของแต่ละหน้า
 * ประกอบด้วย breadcrumb, หัวข้อ และรายละเอียด
 * 
 * @param {Object} props
 * @param {string} props.title - หัวข้อของหน้า
 * @param {string} props.subtitle - รายละเอียดของหน้า
 * @param {Array} props.breadcrumb - ข้อมูล breadcrumb เช่น [{title: 'หน้าหลัก', path: '/'}, {title: 'ผู้ใช้งาน'}]
 * @param {React.ReactNode} props.extra - องค์ประกอบเพิ่มเติมที่ต้องการแสดงทางขวามือ (เช่น ปุ่ม)
 */
const PageHeader = ({ title, subtitle, breadcrumb = [], extra }) => {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm mb-6">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <HomeOutlined /> หน้าหลัก
            </Link>
          </Breadcrumb.Item>
          {breadcrumb.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {item.path ? (
                <Link to={item.path}>{item.title}</Link>
              ) : (
                item.title
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="mb-1">{title}</Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
};

export default PageHeader;