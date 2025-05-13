import React, { useState } from 'react';
import { Table, Tag, Tooltip, Typography, Space, Button, Avatar, Input } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  DesktopOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import EmptyState from '../common/EmptyState';
import ErrorDisplay from '../common/ErrorDisplay';
import LogFilterForm from './LogFilterForm';
import { URL } from '../../constants/apiEndpoints';

const { Text } = Typography;
const { Search } = Input;

const LoginLogList = ({
  logs = [],
  loading = false,
  error = null,
  pagination = {},
  onPageChange,
  onRefresh,
  filters = {},
  onFilterChange,
  onSearch,
  searchQuery = '',
  onReset // รับ prop onReset มาจาก parent component
}) => {
  const [filterVisible, setFilterVisible] = useState(false);

  // ฟังก์ชันสำหรับจัดรูปแบบ userAgent ให้อ่านง่ายขึ้น
  const formatUserAgent = (ua, os) => {
    if (!ua) return 'ไม่ทราบ';
    
    // ดึงชื่อเบราวเซอร์และเวอร์ชันจาก userAgent
    let browserInfo = '';
    if (ua.includes('Chrome')) {
      const chromeVersion = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
      if (chromeVersion && chromeVersion[1]) {
        browserInfo = `Chrome ${chromeVersion[1].split('.')[0]}`; // แสดงเฉพาะเวอร์ชันหลัก
      }
    } else if (ua.includes('Firefox')) {
      const firefoxVersion = ua.match(/Firefox\/(\d+\.\d+)/);
      if (firefoxVersion && firefoxVersion[1]) {
        browserInfo = `Firefox ${firefoxVersion[1]}`;
      }
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      const safariVersion = ua.match(/Version\/(\d+\.\d+)/);
      if (safariVersion && safariVersion[1]) {
        browserInfo = `Safari ${safariVersion[1]}`;
      }
    } else if (ua.includes('Edge')) {
      const edgeVersion = ua.match(/Edge\/(\d+\.\d+)/);
      if (edgeVersion && edgeVersion[1]) {
        browserInfo = `Edge ${edgeVersion[1]}`;
      }
    }
    
    // ใช้ข้อมูล OS ที่ได้รับมาโดยตรง ถ้ามี
    let osInfo = os || '';
    
    // ถ้าไม่มีข้อมูล OS ให้พยายามดึงจาก userAgent
    if (!osInfo) {
      if (ua.includes('Windows')) {
        osInfo = 'Windows';
      } else if (ua.includes('Mac OS')) {
        osInfo = 'macOS';
      } else if (ua.includes('Android')) {
        osInfo = 'Android';
      } else if (ua.includes('iOS')) {
        osInfo = 'iOS';
      } else if (ua.includes('Linux')) {
        osInfo = 'Linux';
      }
    }
    
    return browserInfo && osInfo ? `${browserInfo} บน ${osInfo}` : (browserInfo || osInfo || 'ไม่ทราบ');
  };

  // คอลัมน์สำหรับตาราง
  const columns = [
    {
      title: 'ผู้ใช้',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.image ? `${URL}/${record.image}` : null}
            icon={!record.image && <UserOutlined />}
            size="small"
            className="mr-2"
            style={{ 
              backgroundColor: !record.image ? '#90278E' : undefined,
            }}
          />
          <div>
            <Link to={`/users/${record.userId}`} className="font-medium hover:text-purple-700">
              {text || 'ผู้ใช้ไม่ระบุชื่อ'}
            </Link>
            <div className="text-xs text-gray-500 mt-1">
              {record.fullName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={role === 'admin' ? 'purple' : 'blue'}>
          {role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
        </Tag>
      ),
    },
    {
      title: 'เวลาเข้าสู่ระบบ',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      render: (time) => (
        <Tooltip title={formatThaiDate(time, { dateStyle: 'full', timeStyle: 'medium' })}>
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-1 text-gray-500" />
            <Text>{formatThaiDate(time, { dateStyle: 'short', timeStyle: 'short' })}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'ที่อยู่ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
      render: (ip) => (
        <div className="flex items-center">
          <EnvironmentOutlined className="mr-1 text-gray-500" />
          <Text>{ip}</Text>
        </div>
      ),
    },
    {
      title: 'อุปกรณ์',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (userAgent, record) => (
        <Tooltip title={userAgent || 'ไม่ทราบข้อมูลอุปกรณ์'}>
          <div className="flex items-center">
            <DesktopOutlined className="mr-1 text-gray-500" />
            <Text>{formatUserAgent(userAgent, record.os)}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'เบราว์เซอร์',
      dataIndex: 'browser',
      key: 'browser',
      render: (browser) => (
        <div className="flex items-center">
          <GlobalOutlined className="mr-1 text-gray-500" />
          <Text>{browser || 'ไม่ทราบ'}</Text>
        </div>
      ),
    },
  ];

  // เพิ่มฟังก์ชัน handleTableChange
  const handleTableChange = (tablePagination, tableFilters, sorter) => {
    onPageChange(tablePagination, tableFilters, sorter);
  };
  
  // สร้างฟังก์ชันสำหรับการ reset filter
  const handleResetFilters = () => {
    console.log('Resetting filters from LoginLogList');
    
    // ใช้ onReset จาก props หากมี
    if (typeof onReset === 'function') {
      onReset();
    } else {
      // ถ้าไม่มี onReset ให้ใช้ onFilterChange กับ object ว่าง
      onFilterChange({});
    }
  };

  // แสดงแบบฟอร์มกรองข้อมูล
  const renderFilterForm = () => {
    if (!filterVisible) return null;

    return (
      <LogFilterForm
        filters={filters}
        onFilter={onFilterChange}
        onReset={handleResetFilters} // ส่ง handleResetFilters ไปให้ LogFilterForm
        filterOptions={{
            showUserFilter: true,         // รองรับการกรองตามผู้ใช้
            showDateRangeFilter: true,    // รองรับการกรองตามวันที่
        }}
        loading={loading}
      />
    );
  };

  // แสดงข้อความเมื่อไม่มีข้อมูล
  const renderEmptyState = () => {
    if (Object.keys(filters).some(key => filters[key] && key !== 'page' && key !== 'limit')) {
      return (
        <EmptyState
          description="ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา"
          type="search"
          showAction={true}
          actionText="ล้างตัวกรอง"
          onAction={handleResetFilters} // ใช้ handleResetFilters แทน
        />
      );
    }

    return (
      <EmptyState
        description="ยังไม่มีข้อมูลการเข้าสู่ระบบ"
        showAction={false}
      />
    );
  };

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={onRefresh}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Search
          placeholder="ค้นหาผู้ใช้, IP, อุปกรณ์..."
          allowClear
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Space>
          <Button 
            onClick={() => setFilterVisible(!filterVisible)}
          >
            {filterVisible ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRefresh}
            loading={loading}
          >
            รีเฟรช
          </Button>
        </Space>
      </div>

      {renderFilterForm()}

      <Table
        columns={columns}
        dataSource={logs.map(log => ({ ...log, key: log.id || log.log_id }))}
        pagination={{
          current: pagination.current || 1,
          pageSize: pagination.pageSize || 10,
          total: pagination.total || (logs ? logs.length : 0),
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `รวมทั้งหมด ${total} รายการ`,
        }}
        onChange={handleTableChange}
        loading={loading}
        locale={{
          emptyText: renderEmptyState()
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default LoginLogList;