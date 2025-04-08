import React from 'react';
import { Table, Button, Space, Tag, Tooltip, Badge, Card, Typography } from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import StatusTag from '../../components/common/StatusTag';
import ProjectTypeBadge from '../../components/common/ProjectTypeBadge';
import UserAvatar from '../../components/common/UserAvatar';
import TableActions from '../../components/common/TableActions';
import EmptyState from '../../components/common/EmptyState';
import { truncateText } from '../../utils/stringUtils';
import { formatThaiDate } from '../../utils/dataUtils';

const { Title } = Typography;

/**
 * Component แสดงรายการโปรเจค
 * 
 * @param {Object} props
 * @param {Array} props.projects - รายการโปรเจค
 * @param {Object} props.pagination - ข้อมูลการแบ่งหน้า
 * @param {Function} props.onPaginationChange - ฟังก์ชันที่เรียกเมื่อเปลี่ยนหน้า
 * @param {Function} props.onApprove - ฟังก์ชันที่เรียกเมื่อกดอนุมัติ
 * @param {Function} props.onReject - ฟังก์ชันที่เรียกเมื่อกดปฏิเสธ
 * @param {Function} props.onDelete - ฟังก์ชันที่เรียกเมื่อกดลบ
 * @param {boolean} props.loading - สถานะกำลังโหลดข้อมูล
 */
const ProjectList = ({
  projects = [],
  pagination = {},
  onPaginationChange,
  onApprove,
  onReject,
  onDelete,
  loading = false
}) => {
  // กำหนดคอลัมน์ของตาราง
  const columns = [
    {
      title: 'รหัส',
      dataIndex: 'project_id',
      key: 'project_id',
      width: 80,
      render: id => (
        <Typography.Text strong className="text-gray-700">
          #{id}
        </Typography.Text>
      )
    },
    {
      title: 'ชื่อผลงาน',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/projects/${record.project_id}`} className="text-blue-600 hover:text-blue-800 font-medium">
          {truncateText(text, 40)}
        </Link>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => <ProjectTypeBadge type={type} />,
    },
    {
      title: 'ผู้สร้าง',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 180,
      render: (name, record) => (
        <div className="flex items-center">
          <UserAvatar 
            user={{ 
              full_name: record.full_name, 
              image: record.image, 
              role: 'student' 
            }} 
            size="small" 
            className="mr-2" 
          />
          <span className="text-gray-800">{name}</span>
        </div>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => <StatusTag type="project" status={status} />,
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => (
        <div className="flex items-center text-gray-700">
          <CalendarOutlined className="mr-1" />
          <span>{formatThaiDate(date)}</span>
        </div>
      ),
    },
    {
      title: 'จำนวนเข้าชม',
      dataIndex: 'views_count',
      key: 'views_count',
      width: 130,
      render: (count) => (
        <div className="flex items-center">
          <BarChartOutlined className="mr-1 text-green-600" />
          <Badge 
            count={count} 
            showZero 
            style={{ 
              backgroundColor: '#52c41a',
              fontWeight: 'bold' 
            }}
            className="ml-1" 
          />
        </div>
      ),
    },
    {
      title: 'การจัดการ',
      key: 'action',
      width: 120,
      render: (_, record) => {
        return (
          <TableActions 
            recordId={record.project_id} 
            viewPath={`/projects/${record.project_id}`}
            showApprove={record.status === 'pending'} 
            showReject={record.status === 'pending'}
            onApprove={onApprove}
            onReject={onReject}
            onDelete={onDelete}
            type="project"
          />
        );
      },
    },
  ];

  // ตรวจสอบว่า projects เป็น array หรือไม่
  const projectsArray = Array.isArray(projects) ? projects : [];
  
  // ตรวจสอบว่ามีข้อมูลหรือไม่
  const isEmpty = projectsArray.length === 0;

  return (
    <div className="project-list-container">
      <Card 
        bordered={false} 
        className="shadow-sm mb-6 rounded-md overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        {isEmpty && !loading ? (
          <EmptyState 
            type="project" 
            description="ไม่พบข้อมูลผลงานที่ตรงกับเงื่อนไขการค้นหา"
          />
        ) : (
          <Table
            dataSource={projectsArray.map(project => ({ ...project, key: project.project_id }))}
            columns={columns}
            loading={loading}
            pagination={{
              current: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
              total: pagination.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `ทั้งหมด ${total} รายการ`,
              onChange: onPaginationChange,
              className: "px-6 py-4",
              itemRender: (page, type, originalElement) => {
                if (type === 'page') {
                  return (
                    <Button 
                      type={pagination.current === page ? 'primary' : 'default'}
                      size="small"
                      className={pagination.current === page ? 'font-bold' : ''}
                    >
                      {page}
                    </Button>
                  );
                }
                return originalElement;
              }
            }}
            scroll={{ x: 1200 }}
            className="custom-table"
            rowClassName={(record, index) => 
              `${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`
            }
          />
        )}
      </Card>
    </div>
  );
};

export default ProjectList;