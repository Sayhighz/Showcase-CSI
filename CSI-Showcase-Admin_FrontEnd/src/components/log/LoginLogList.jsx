import React, { useState, useEffect } from 'react';
import { Table, Tag, Tooltip, Typography, Space, Button, Avatar } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  DesktopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import EmptyState from '../common/EmptyState';
import ErrorDisplay from '../common/ErrorDisplay';
import LogFilterForm from './LogFilterForm';

const { Text } = Typography;

const LoginLogList = ({
  logs = [],
  loading = false,
  error = null,
  pagination = {},
  onPageChange,
  onRefresh,
  filters = {},
  onFilterChange,
}) => {
  const [filterVisible, setFilterVisible] = useState(false);

  // คอลัมน์สำหรับตาราง
  const columns = [
    {
      title: 'ผู้ใช้',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.image ? `/uploads/profiles/${record.image}` : null}
            icon={!record.image && <UserOutlined />}
            size="small"
            className="mr-2"
            style={{ 
              backgroundColor: !record.image ? '#90278E' : undefined,
            }}
          />
          <div>
            <Link to={`/users/${record.user_id}`} className="font-medium hover:text-purple-700">
              {text || 'ผู้ใช้ไม่ระบุชื่อ'}
            </Link>
            <div className="text-xs text-gray-500 mt-1">
              {record.full_name}
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
      dataIndex: 'login_time',
      key: 'login_time',
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
      dataIndex: 'ip_address',
      key: 'ip_address',
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
      dataIndex: 'device',
      key: 'device',
      render: (device, record) => (
        <Tooltip title={`${record.os || 'ไม่ทราบ OS'}`}>
          <div className="flex items-center">
            <DesktopOutlined className="mr-1 text-gray-500" />
            <Text>{device || 'ไม่ทราบ'}</Text>
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

  // แสดงแบบฟอร์มกรองข้อมูล
  const renderFilterForm = () => {
    if (!filterVisible) return null;

    return (
      <LogFilterForm
        filters={filters}
        onFilter={onFilterChange}
        onReset={() => onFilterChange({})}
        filterOptions={{
          showUserFilter: true,
          showDateRangeFilter: true,
          showLoginStatusFilter: true,
        }}
      />
    );
  };

  // แสดงข้อความเมื่อไม่มีข้อมูล
  const renderEmptyState = () => {
    if (Object.keys(filters).some(key => filters[key])) {
      return (
        <EmptyState
          description="ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา"
          type="search"
          showAction={true}
          actionText="ล้างตัวกรอง"
          onAction={() => onFilterChange({})}
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
      <div className="mb-4 flex justify-end">
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
        dataSource={logs.map(log => ({ ...log, key: log.log_id || log.id }))}
        pagination={pagination}
        onChange={onPageChange}
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