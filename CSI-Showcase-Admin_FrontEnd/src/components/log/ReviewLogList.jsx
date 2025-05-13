import React, { useState } from 'react';
import { Table, Tag, Tooltip, Typography, Space, Button, Avatar, Input } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ProjectOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import EmptyState from '../common/EmptyState';
import ErrorDisplay from '../common/ErrorDisplay';
import LogFilterForm from './LogFilterForm';

const { Text, Paragraph } = Typography;
const { Search } = Input;

const ReviewLogList = ({
  reviews = [],
  loading = false,
  error = null,
  pagination = {},
  onPageChange,
  onRefresh,
  filters = {},
  onFilterChange,
  onSearch,
  searchQuery = '',
  onReset // เพิ่ม prop onReset
}) => {
  const [filterVisible, setFilterVisible] = useState(false);

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
            {record.projectType && (
              <div className="text-xs text-gray-500 mt-1">
                {record.projectType === 'coursework' && 'ผลงานการเรียน'}
                {record.projectType === 'academic' && 'บทความวิชาการ'}
                {record.projectType === 'competition' && 'การแข่งขัน'}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'ผู้ตรวจสอบ',
      dataIndex: ['admin', 'fullName'],
      key: 'adminName',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.admin?.image ? `/uploads/profiles/${record.admin.image}` : null}
            icon={!record.admin?.image && <UserOutlined />}
            size="small"
            className="mr-2"
            style={{ 
              backgroundColor: !record.admin?.image ? '#90278E' : undefined,
            }}
          />
          <div>
            <Link to={`/users/${record.admin?.id}`} className="font-medium hover:text-purple-700">
              {text || record.admin?.username || 'ผู้ดูแลระบบ'}
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
      dataIndex: 'comment',
      key: 'comment',
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
      dataIndex: 'reviewedAt',
      key: 'reviewedAt',
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

  // เพิ่มฟังก์ชัน handleTableChange
  const handleTableChange = (tablePagination, tableFilters, sorter) => {
    onPageChange(tablePagination, tableFilters, sorter);
  };

  // สร้างฟังก์ชันสำหรับการ reset filter
  const handleResetFilters = () => {
    console.log('Resetting filters from ReviewLogList');
    
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
        onReset={handleResetFilters} // ส่ง handleResetFilters ไปยัง LogFilterForm
        filterOptions={{
          showProjectFilter: true,
          showAdminFilter: true,
          showReviewStatusFilter: true,
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
      <div className="mb-4 flex justify-between">
        <Search
          placeholder="ค้นหาโครงงาน, ชื่อผู้ตรวจสอบ..."
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
        dataSource={reviews.map(review => ({ ...review, key: review.id }))}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
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

export default ReviewLogList;