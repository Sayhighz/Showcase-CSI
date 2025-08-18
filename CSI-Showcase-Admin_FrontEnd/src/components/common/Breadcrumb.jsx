import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

// แผนที่เส้นทางสำหรับแปลงเป็นชื่อในภาษาไทย
const breadcrumbNameMap = {
  '/': 'หน้าหลัก',
  '/dashboard': 'แดชบอร์ด',
  '/projects': 'จัดการผลงาน',
  '/projects/pending': 'ผลงานรอการอนุมัติ',
  '/projects/stats': 'สถิติผลงาน',
  '/users': 'จัดการผู้ใช้',
  '/users/students': 'นักศึกษา',
  '/users/admins': 'ผู้ดูแลระบบ',
  '/users/stats': 'สถิติผู้ใช้',
  '/logs': 'บันทึกระบบ',
  '/logs/login': 'การเข้าสู่ระบบ',
  '/logs/visitor-views': 'การเข้าชม',
  '/logs/reviews': 'การตรวจสอบผลงาน',
  '/logs/system-stats': 'สถิติระบบ',
};

// ไอคอนสำหรับแต่ละเส้นทาง
const breadcrumbIconMap = {
  '/dashboard': <HomeOutlined />,
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  
  // สร้างรายการเส้นทาง
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    
    return {
      key: url,
      title: <Link to={url}>{breadcrumbNameMap[url] || url.split('/').pop()}</Link>,
    };
  });

  // เพิ่มรายการหน้าหลัก
  const breadcrumbItems = [
    {
      key: '/dashboard',
      title: (
        <Link to="/dashboard">
          <HomeOutlined style={{ marginRight: 4 }} />
          แดชบอร์ด
        </Link>
      ),
    },
    ...extraBreadcrumbItems,
  ];

  return (
    <AntBreadcrumb 
      items={breadcrumbItems}
      style={{ 
        fontSize: '14px',
        marginBottom: 0
      }}
    />
  );
};

export default Breadcrumb;