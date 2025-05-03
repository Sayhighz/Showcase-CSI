import React, { useState } from 'react';
import { Table, Tag, Tooltip, Typography, Space, Button, Avatar } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ProjectOutlined,
  FileTextOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import EmptyState from '../common/EmptyState';
import ErrorDisplay from '../common/ErrorDisplay';
import LogFilterForm from './LogFilterForm';

const { Text, Paragraph } = Typography;

const ReviewLogList = ({
  reviews = [],
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
      title: 'ผู้ตรวจสอบ',
      dataIndex: 'admin_name',
      key: 'admin_name',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.admin_image ? `/uploads/profiles/${record.admin_image}` : null}
            icon={!record.admin_image && <UserOutlined />}
            size="small"
            className="mr-2"
            style={{ 
              backgroundColor: !record.admin_image ? '#90278E' : undefined,
            }}
          />
          <div>
            <Link to={`/users/${record.admin_id}`} className="font-medium hover:text-purple-700">
              {text || record.admin_username || 'ผู้ดูแลระบบ'}
            </Link>
          </div>
        </div>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'default';
        let icon = null;
        let text = 'ไม่ระบุ';
        
        if (status === 'approved') {
          color = 'success';
          icon = <CheckCircleOutlined />;
          text = 'อนุมัติ';
        } else if (status === 'rejected') {
          color = 'error';
          icon = <CloseCircleOutlined />;
          text = 'ปฏิเสธ';
        } else if (status === 'updated') {
          color = 'warning';
          icon = <FileTextOutlined />;
          text = 'อัปเดต';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'ความคิดเห็น',
      dataIndex: 'review_comment',
      key: 'review_comment',
      ellipsis: true,
      render: (comment) => (
        <Tooltip title={comment || 'ไม่มีความคิดเห็น'}>
          <Paragraph ellipsis={{ rows: 2 }}>
            {comment || 'ไม่มีความคิดเห็น'}
          </Paragraph>
        </Tooltip>
      ),
    },
    {
      title: 'เวลาตรวจสอบ',
      dataIndex: 'reviewed_at',
      key: 'reviewed_at',
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
          showAdminFilter: true,
          showDateRangeFilter: true,
          showReviewStatusFilter: true,
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
        description="ยังไม่มีข้อมูลการตรวจสอบโครงงาน"
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
        dataSource={reviews.map(review => ({ ...review, key: review.review_id || review.id }))}
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

export default ReviewLogList;