import React, { useState, useEffect } from 'react';
import { Table, Tooltip, Typography, Space, Button, Avatar, Input } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  ProjectOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import EmptyState from '../common/EmptyState';
import ErrorDisplay from '../common/ErrorDisplay';
import LogFilterForm from './LogFilterForm';

const { Text } = Typography;
const { Search } = Input;

const VisitorViewList = ({
  views = [],
  loading = false,
  error = null,
  pagination = {},
  onPageChange,
  onRefresh,
  filters = {},
  onFilterChange,
  onSearch,
  searchQuery = '',
  onReset
}) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  
  // อัพเดต localFilters เมื่อ filters ภายนอกเปลี่ยนแปลง
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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
      title: 'โครงงาน',
      dataIndex: 'projectTitle',
      key: 'projectTitle',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            icon={<ProjectOutlined />}
            size="small"
            className="mr-2"
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Link to={`/projects/${record.projectId}`} className="font-medium hover:text-purple-700">
              {text || `โครงงาน #${record.projectId}`}
            </Link>
          </div>
        </div>
      ),
    },
    {
      title: 'เวลาเข้าชม',
      dataIndex: 'viewedAt',
      key: 'viewedAt',
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
      key: 'browser',
      render: (_, record) => {
        // ดึงข้อมูลเบราว์เซอร์จาก userAgent
        let browserInfo = 'ไม่ทราบ';
        if (record.userAgent) {
          if (record.userAgent.includes('Chrome')) {
            const chromeVersion = record.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
            if (chromeVersion && chromeVersion[1]) {
              browserInfo = `Chrome ${chromeVersion[1].split('.')[0]}`;
            }
          } else if (record.userAgent.includes('Firefox')) {
            const firefoxVersion = record.userAgent.match(/Firefox\/(\d+\.\d+)/);
            if (firefoxVersion && firefoxVersion[1]) {
              browserInfo = `Firefox ${firefoxVersion[1]}`;
            }
          } else if (record.userAgent.includes('Safari') && !record.userAgent.includes('Chrome')) {
            const safariVersion = record.userAgent.match(/Version\/(\d+\.\d+)/);
            if (safariVersion && safariVersion[1]) {
              browserInfo = `Safari ${safariVersion[1]}`;
            }
          } else if (record.userAgent.includes('Edge')) {
            const edgeVersion = record.userAgent.match(/Edge\/(\d+\.\d+)/);
            if (edgeVersion && edgeVersion[1]) {
              browserInfo = `Edge ${edgeVersion[1]}`;
            }
          }
        }
        return (
          <div className="flex items-center">
            <GlobalOutlined className="mr-1 text-gray-500" />
            <Text>{browserInfo}</Text>
          </div>
        );
      },
    },
    {
      title: 'ประเภท',
      dataIndex: 'visitorType',
      key: 'visitorType',
      width: 120,
      render: (type) => (
        <div className="flex items-center">
          <EyeOutlined className="mr-1 text-gray-500" />
          <Text>{type === 'company' ? 'บริษัท' : 'ผู้เยี่ยมชมทั่วไป'}</Text>
        </div>
      ),
    },
  ];

  // ฟังก์ชันจัดการการเปลี่ยนแปลง filter
  const handleFilterChange = (newFilters) => {
    // เรียกใช้ onFilterChange ที่ส่งมาจาก parent component
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // ฟังก์ชัน reset filter
  const handleResetFilter = () => {
    
    // ใช้ onReset จาก props หากมี
    if (typeof onReset === 'function') {
      onReset(); // เรียกใช้ resetFilters จาก useLog hook
    } else {
      // ถ้าไม่มี onReset ให้ใช้ onFilterChange กับ object ว่าง
      if (onFilterChange) {
        onFilterChange({});
      }
    }
  };

  // เพิ่มฟังก์ชัน handleTableChange
  const handleTableChange = (tablePagination, tableFilters, sorter) => {
    if (onPageChange) {
      onPageChange(tablePagination, tableFilters, sorter);
    }
  };

  // แสดงแบบฟอร์มกรองข้อมูล
  const renderFilterForm = () => {
    if (!filterVisible) return null;

    return (
      <LogFilterForm
        filters={localFilters}
        onFilter={handleFilterChange}
        onReset={handleResetFilter}
        filterOptions={{
          showProjectFilter: true,
          showDateRangeFilter: true,
          showVisitorTypeFilter: true
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
          onAction={handleResetFilter}
        />
      );
    }

    return (
      <EmptyState
        description="ยังไม่มีข้อมูลการเข้าชม"
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
  };

  // ฟังก์ชันจัดการการค้นหา
  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Search
          placeholder="ค้นหาโครงงาน, IP..."
          allowClear
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
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
        dataSource={views.map(view => ({ ...view, key: view.id }))}
        pagination={{
          current: pagination.current || 1,
          pageSize: pagination.pageSize || 10,
          total: pagination.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `รวมทั้งหมด ${total} รายการ`
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

export default VisitorViewList;