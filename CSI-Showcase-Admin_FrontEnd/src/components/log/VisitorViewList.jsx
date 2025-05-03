import React, { useState } from 'react';
import { Table, Tooltip, Typography, Space, Button, Avatar } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  ProjectOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import EmptyState from '../common/EmptyState';
import ErrorDisplay from '../common/ErrorDisplay';
import LogFilterForm from './LogFilterForm';

const { Text } = Typography;

const VisitorViewList = ({
  views = [],
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
      title: 'โครงงาน',
      dataIndex: 'project_title',
      key: 'project_title',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            icon={<ProjectOutlined />}
            size="small"
            className="mr-2"
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Link to={`/projects/${record.project_id}`} className="font-medium hover:text-purple-700">
              {text || `โครงงาน #${record.project_id}`}
            </Link>
            {record.project_type && (
              <div className="text-xs text-gray-500 mt-1">
                {record.project_type === 'coursework' && 'ผลงานการเรียน'}
                {record.project_type === 'academic' && 'บทความวิชาการ'}
                {record.project_type === 'competition' && 'การแข่งขัน'}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'เวลาเข้าชม',
      dataIndex: 'viewed_at',
      key: 'viewed_at',
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
            <UserOutlined className="mr-1 text-gray-500" />
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
    {
      title: 'ประเภท',
      dataIndex: 'visitor_type',
      key: 'visitor_type',
      width: 120,
      render: (type) => (
        <div className="flex items-center">
          <EyeOutlined className="mr-1 text-gray-500" />
          <Text>{type === 'company' ? 'บริษัท' : 'ผู้เยี่ยมชมทั่วไป'}</Text>
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
          showProjectFilter: true,
          showDateRangeFilter: true,
          showVisitorTypeFilter: true,
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
        dataSource={views.map(view => ({ ...view, key: view.id || view.view_id }))}
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

export default VisitorViewList;