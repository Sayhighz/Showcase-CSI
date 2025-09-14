import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin breadcrumb
 */
const AdminBreadcrumb = () => {
  const location = useLocation();

  const nameMap = {
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
    '/profile': 'โปรไฟล์ของฉัน',
  };

  const pathSnippets = location.pathname.split('/').filter(Boolean);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSnippets.length - 1;

    let title = nameMap[url] || decodeURIComponent(url.split('/').pop());
    let linkTo = url;
    let clickable = true;

    // Dynamic detail page mapping
    if (/^\/projects\/[^/]+$/.test(url)) {
      title = 'รายละเอียดผลงาน';
      clickable = false;
    }

    return {
      key: url,
      title: clickable && !isLast ? <Link to={linkTo}>{title}</Link> : <span>{title}</span>,
    };
  });

  const items = [
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
      items={items}
      style={{
        fontSize: '14px',
        marginBottom: 0,
      }}
    />
  );
};

/**
 * Student breadcrumb
 */
const StudentBreadcrumb = () => {
  const location = useLocation();

  const nameMap = {
    '/student/dashboard': 'แดชบอร์ด',
    '/projects/my-projects': 'ผลงานของฉัน',
    '/projects/upload': 'อัปโหลดผลงาน',
    '/profile': 'โปรไฟล์ของฉัน',
  };

  const pathSnippets = location.pathname.split('/').filter(Boolean);

  const extraBreadcrumbItems = pathSnippets
    .map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      // Skip base student segment and avoid duplicate dashboard crumb
      if (url === '/student' || url === '/student/dashboard') return null;

      const isLast = index === pathSnippets.length - 1;

      let title = nameMap[url] || decodeURIComponent(url.split('/').pop());
      let linkTo = url;
      let clickable = true;

      // Avoid linking to admin-only index
      if (url === '/projects') {
        title = 'ผลงานของฉัน';
        linkTo = '/projects/my-projects';
      }

      // Dynamic detail page mapping
      if (/^\/projects\/[^/]+$/.test(url)) {
        title = 'รายละเอียดผลงาน';
        clickable = false;
      }

      return {
        key: url,
        title: clickable && !isLast ? <Link to={linkTo}>{title}</Link> : <span>{title}</span>,
      };
    })
    .filter(Boolean);

  const items = [
    {
      key: '/student/dashboard',
      title: (
        <Link to="/student/dashboard">
          <HomeOutlined style={{ marginRight: 4 }} />
          แดชบอร์ด
        </Link>
      ),
    },
    ...extraBreadcrumbItems,
  ];

  return (
    <AntBreadcrumb
      items={items}
      style={{
        fontSize: '14px',
        marginBottom: 0,
      }}
    />
  );
};

/**
 * Wrapper that chooses between Admin vs Student breadcrumb.
 * - Student if path starts with /student or role is student
 * - Otherwise Admin
 */
const Breadcrumb = () => {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;
  const isStudentPath = location.pathname.startsWith('/student');
  const useStudent = isStudentPath || role === 'student';

  return useStudent ? <StudentBreadcrumb /> : <AdminBreadcrumb />;
};

export default Breadcrumb;