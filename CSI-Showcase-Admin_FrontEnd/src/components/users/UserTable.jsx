// src/components/users/UserTable.jsx
import React, { useState } from 'react';
import { Table, Tag, Button, Space, Tooltip, Avatar, Badge, Typography, Row, Col, Card } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ClockCircleOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';
import UserAvatar from '../common/UserAvatar';
import UserRoleBadge from '../common/UserRoleBadge';
import StatusTag from '../common/StatusTag';
import TableActions from '../common/TableActions';
import { formatThaiDate } from '../../utils/dataUtils';

const { Text, Title } = Typography;

/**
 * Component แสดงตารางข้อมูลผู้ใช้งาน
 * 
 * @param {Object} props
 * @param {Array} props.users - รายการผู้ใช้งาน
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {Function} props.onView - ฟังก์ชันสำหรับดูรายละเอียด
 * @param {Function} props.onEdit - ฟังก์ชันสำหรับแก้ไขข้อมูล
 * @param {Function} props.onDelete - ฟังก์ชันสำหรับลบข้อมูล
 * @param {Object} props.pagination - ข้อมูลการแบ่งหน้า
 * @param {Function} props.onChange - ฟังก์ชันเมื่อมีการเปลี่ยนหน้าหรือเรียงลำดับ
 * @param {string} props.role - บทบาทของผู้ใช้ ('admin', 'student', 'all')
 */
const UserTable = ({ 
  users, 
  loading, 
  onView, 
  onEdit, 
  onDelete, 
  pagination,
  onChange,
  role = 'all'
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  
  // จัดการการขยายแถว
  const handleRowExpand = (expanded, record) => {
    setExpandedRowKeys(expanded ? [record.user_id] : []);
  };
  
  // สร้างข้อมูลเพิ่มเติมสำหรับการแสดงเมื่อขยายแถว
  const expandedRowRender = (record) => {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" className="h-full bg-white shadow-sm">
              <div className="flex items-center mb-2">
                <MailOutlined className="mr-2 text-blue-500" />
                <Text strong>อีเมล</Text>
              </div>
              <Text copyable={{ text: record.email }}>{record.email}</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Card size="small" className="h-full bg-white shadow-sm">
              <div className="flex items-center mb-2">
                <ClockCircleOutlined className="mr-2 text-blue-500" />
                <Text strong>วันที่สร้าง</Text>
              </div>
              <Text>{formatThaiDate(record.created_at, { dateStyle: 'long' })}</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Card size="small" className="h-full bg-white shadow-sm">
              <div className="flex items-center mb-2">
                <UserOutlined className="mr-2 text-blue-500" />
                <Text strong>ข้อมูลเพิ่มเติม</Text>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-xs text-gray-500">บทบาท</div>
                  <UserRoleBadge role={record.role} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">สถานะ</div>
                  <StatusTag type="user" status={record.status} />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <div className="flex justify-end mt-4">
          <Space>
            {onView && (
              <Button 
                type="primary" 
                ghost 
                icon={<EyeOutlined />} 
                onClick={() => onView(record)}
                size="small"
              >
                ดูรายละเอียด
              </Button>
            )}
            {onEdit && (
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => onEdit(record)}
                size="small"
              >
                แก้ไข
              </Button>
            )}
            {onDelete && (
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => onDelete(record)}
                size="small"
              >
                ลบ
              </Button>
            )}
          </Space>
        </div>
      </div>
    );
  };
  
  // แสดงสถานะออนไลน์
  const getStatusBadge = (status) => {
    return (
      <Badge 
        status={status === 'active' ? 'success' : 'default'} 
        text={status === 'active' ? 'ออนไลน์' : 'ออฟไลน์'}
      />
    );
  };
  
  // กำหนดคอลัมน์สำหรับแสดงในตาราง
  const columns = [
    {
      title: (
        <div className="flex items-center">
          <span className="mr-1">รหัส</span>
          <Tooltip title="เรียงลำดับตามรหัสผู้ใช้">
            <SortAscendingOutlined className="text-gray-400 cursor-pointer" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'user_id',
      key: 'user_id',
      width: 70,
      sorter: (a, b) => a.user_id - b.user_id,
      render: (id) => (
        <div className="text-center">
          <Badge 
            count={id} 
            style={{ 
              backgroundColor: '#1890ff', 
              fontSize: '12px', 
              fontWeight: 'normal', 
              minWidth: '28px'
            }} 
            overflowCount={999}
            showZero
          />
        </div>
      ),
    },
    {
      title: 'ผู้ใช้งาน',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center">
          <UserAvatar 
            user={record} 
            size="large" 
            showBadge={true}
            className="mr-3"
          />
          <div>
            <div className="font-medium">{record.full_name}</div>
            <div className="text-gray-500 text-sm flex items-center">
              <span className="mr-1">@{record.username}</span>
              {getStatusBadge(record.status)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center">
          <MailOutlined className="mr-1 text-blue-500" />
          <span>อีเมล</span>
        </div>
      ),
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
      render: (email) => (
        <Text copyable={{ text: email }} ellipsis={{ tooltip: email }}>
          {email}
        </Text>
      ),
    },
    {
      title: (
        <div className="flex items-center">
          <UserOutlined className="mr-1 text-blue-500" />
          <span>บทบาท</span>
        </div>
      ),
      dataIndex: 'role',
      key: 'role',
      render: (role) => <UserRoleBadge role={role} />,
      filters: [
        { text: 'ผู้ดูแลระบบ', value: 'admin' },
        { text: 'นักศึกษา', value: 'student' },
        { text: 'ผู้เยี่ยมชม', value: 'visitor' },
      ],
      onFilter: (value, record) => record.role === value,
      responsive: ['sm'],
    },
    {
      title: (
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-1 text-blue-500" />
          <span>วันที่สร้าง</span>
        </div>
      ),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatThaiDate(date, { dateStyle: 'medium' }),
      responsive: ['xl'],
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <TableActions
          recordId={record.user_id}
          viewPath={`/users/${record.role}/${record.user_id}`}
          onEdit={onEdit ? () => onEdit(record) : null}
          onDelete={onDelete ? () => onDelete(record) : null}
          type="user"
          showEdit={Boolean(onEdit)}
          showDelete={Boolean(onDelete)}
          showTooltips={true}
          buttonSize="middle"
        />
      ),
    },
  ];

  return (
    <div className="user-table-container">
      <Table 
        dataSource={users} 
        columns={columns} 
        rowKey="user_id"
        loading={loading}
        pagination={{
          ...pagination,
          showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={onChange}
        scroll={{ x: 800 }}
        rowClassName={(record) => record.status === 'inactive' ? 'inactive-row' : ''}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
          expandedRowKeys,
          onExpand: handleRowExpand,
          expandIcon: ({ expanded, onExpand, record }) => (
            expanded ? (
              <Button 
                type="text" 
                size="small" 
                icon={<SearchOutlined />} 
                onClick={e => {
                  e.stopPropagation();
                  onExpand(record, !expanded);
                }}
                className="text-blue-500"
              />
            ) : (
              <Button 
                type="text" 
                size="small" 
                icon={<SearchOutlined />} 
                onClick={e => {
                  e.stopPropagation();
                  onExpand(record, !expanded);
                }}
                className="text-gray-400 hover:text-blue-500"
              />
            )
          ),
        }}
        className="user-data-table"
      />

      <style jsx global>{`
        .user-data-table .ant-table-thead > tr > th {
          background-color: #f0f7ff;
          color: #1e293b;
          font-weight: 500;
        }
        .user-data-table .ant-table-row:hover {
          cursor: pointer;
        }
        .user-data-table .ant-table-row.inactive-row {
          background-color: #f9f9f9;
          opacity: 0.7;
        }
        .user-data-table .ant-table-row-expand-icon-cell {
          padding-right: 0 !important;
        }
        .user-data-table .ant-table-expanded-row {
          background-color: #fafafa;
        }
        .user-data-table .ant-badge-status-text {
          font-size: 12px;
        }
        
        /* แอนิเมชันสำหรับแถวและปุ่ม */
        .user-data-table .ant-table-row {
          transition: all 0.3s ease;
        }
        .user-data-table .ant-table-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        
        /* ปรับแต่ง pagination */
        .user-data-table .ant-pagination {
          margin-top: 16px !important;
        }
        .user-data-table .ant-pagination-item-active {
          font-weight: 500;
          border-color: #1890ff;
        }
        
        /* ปรับแต่งสีพื้นหลังโดยสลับสีแถว */
        .user-data-table .ant-table-tbody > tr:nth-child(even):not(.ant-table-expanded-row) {
          background-color: #fafafa;
        }
        
        /* ปรับแต่งเมื่อ hover ปุ่ม */
        .user-data-table .ant-btn:hover {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default UserTable;