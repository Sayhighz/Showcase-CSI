// src/components/logs/LoginLogTable.jsx
import React from 'react';
import { Table, Space, Tag, Tooltip, Button, Badge, Card } from 'antd';
import { EyeOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dataUtils';
import UserAvatar from '../common/UserAvatar';
import UserRoleBadge from '../common/UserRoleBadge';
import { LOGIN_STATUS, LOGIN_STATUS_COLORS } from '../../constants/userConstants';

/**
 * Component แสดงข้อมูลประวัติการเข้าสู่ระบบในรูปแบบตาราง
 * 
 * @param {Object} props
 * @param {Array} props.data - ข้อมูลประวัติการเข้าสู่ระบบ
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {Function} props.onRefresh - ฟังก์ชันรีเฟรชข้อมูล
 * @param {Object} props.pagination - ข้อมูลการแบ่งหน้า
 * @param {Function} props.onPaginationChange - ฟังก์ชันเมื่อมีการเปลี่ยนหน้า
 * @param {Function} props.onViewDetail - ฟังก์ชันเมื่อกดปุ่มดูรายละเอียด
 */
const LoginLogTable = ({
  data = [],
  loading = false,
  onRefresh,
  pagination,
  onPaginationChange,
  onViewDetail
}) => {
  console.log(data)
  // สร้างคอลัมน์สำหรับตาราง
  const columns = [
    {
      title: 'ผู้ใช้งาน',
      key: 'user',
      render: (_, record) => (
        <Space size="middle">
          <UserAvatar
            user={{
              full_name: record.full_name,
              role: record.role,
              image: record.image
            }}
            size="small"
            showBadge
          />
          <div>
            <div className="font-medium">{record.full_name}</div>
            <div className="text-xs text-gray-500">{record.username}</div>
          </div>
        </Space>
      ),
      width: '20%',
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <UserRoleBadge role={role} size="small" />,
      width: '10%',
    },
    {
      title: 'เวลาเข้าสู่ระบบ',
      dataIndex: 'loginTime',
      key: 'loginTime',
      render: (loginTime) => formatThaiDate(loginTime, { dateStyle: 'medium', timeStyle: 'medium' }),
      width: '15%',
      sorter: (a, b) => new Date(a.login_time) - new Date(b.login_time),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: '12%',
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          icon={status === LOGIN_STATUS.SUCCESS ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={status === LOGIN_STATUS.SUCCESS ? 'success' : 'error'}
          className="px-3 py-1 flex items-center w-24 justify-center"
        >
          {status === LOGIN_STATUS.SUCCESS ? 'สำเร็จ' : 'ล้มเหลว'}
        </Tag>
      ),
      width: '12%',
      filters: [
        { text: 'สำเร็จ', value: LOGIN_STATUS.SUCCESS },
        { text: 'ล้มเหลว', value: LOGIN_STATUS.FAILED },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="ดูรายละเอียด">
          <Button
            type="primary"
            shape="circle"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onViewDetail && onViewDetail(record)}
            className="bg-blue-500 hover:bg-blue-600"
          />
        </Tooltip>
      ),
      width: '10%',
      align: 'center',
    },
  ];

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">ข้อมูลการเข้าสู่ระบบ</div>
        <Button
          onClick={onRefresh}
          icon={<ReloadOutlined />}
          loading={loading}
          className="hover:scale-105 transition-transform duration-200"
        >
          รีเฟรช
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={data.map(item => ({ ...item, key: item.log_id }))}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={(pagination, filters, sorter) => {
          if (onPaginationChange) {
            onPaginationChange(pagination.current, pagination.pageSize);
          }
        }}
        scroll={{ x: 1000 }}
        className="rounded-lg overflow-hidden"
        rowClassName={(record) => 
          record.status === LOGIN_STATUS.FAILED ? 'bg-red-50' : ''
        }
        size="middle"
      />
    </Card>
  );
};

export default LoginLogTable;