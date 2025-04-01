import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="404"
        title="404"
        subTitle="ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา"
        extra={
          <Link to="/dashboard">
            <Button type="primary" className="bg-[#90278E]">
              กลับไปยังหน้าแดชบอร์ด
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;