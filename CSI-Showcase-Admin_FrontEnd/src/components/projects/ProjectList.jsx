import React, { useState } from 'react';
import { Table, Tag, Button, Typography, Space, Dropdown, Menu, Modal, Tooltip, Badge, Avatar } from 'antd';
import { 
  ProjectOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  EyeOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import { 
  getCategoryName, 
  getCategoryColor, 
  getStatusName, 
  getStatusColor 
} from '../../utils/projectUtils';
import SearchBar from '../common/SearchBar';
import FilterPanel from '../common/FilterPanel';
import EmptyState from '../common/EmptyState';
import ErrorDisplay from '../common/ErrorDisplay';
import ProjectReviewForm from '../projects/ProjectReviewForm';
import { URL } from '../../constants/apiEndpoints';

const { Text, Title } = Typography;
const { confirm } = Modal;

const ProjectList = ({
  projects = [],
  loading = false,
  error = null,
  pagination = {},
  onPageChange,
  onDelete,
  onApprove,
  onReject,
  onSearch,
  onAddProject,
  onFilter,
  filters = {},
  searchQuery = '',
  searchLoading = false,
  status = 'all',
  filterOptions = {
    type: true,
    year: true,
    level: false,
    tag: true,
  },
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  
  // แสดงกล่องยืนยันการลบ
  const showDeleteConfirm = (projectId, title) => {
    confirm({
      title: 'ยืนยันการลบโครงงาน',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>คุณแน่ใจหรือไม่ที่ต้องการลบโครงงาน <Text strong>{title}</Text>?</p>
          <p>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        </div>
      ),
      okText: 'ใช่, ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk() {
        if (onDelete) {
          onDelete(projectId);
        }
      },
    });
  };

  // แสดง modal รีวิวโครงงาน
  const showReviewModal = (projectId, title) => {
    setCurrentProject({ id: projectId, title: title });
    setReviewModalVisible(true);
  };

  // จัดการการส่งฟอร์มรีวิว
  const handleReviewFinish = async (values) => {
    if (!currentProject) return;
    
    setReviewLoading(true);
    
    try {
      if (values.action === 'approve') {
        if (onApprove) {
          await onApprove(currentProject.id, values.comment);
        }
      } else {
        if (onReject) {
          await onReject(currentProject.id, values.comment);
        }
      }
      setReviewModalVisible(false);
    } catch (error) {
      console.error('Error during review process:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  // คอลัมน์สำหรับตาราง
  const columns = [
    {
      title: 'ชื่อโครงงาน',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="flex items-center">
          {record.image ? (
            <img 
              src={`${URL}/${record.image}`} 
              alt={text} 
              className="w-12 h-12 object-cover rounded mr-3"
              onError={(e) => { e.target.src = '/images/project-placeholder.png'; }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
              <ProjectOutlined className="text-gray-400" style={{ fontSize: 24 }} />
            </div>
          )}
          <div>
            <Link to={`/projects/${record.project_id}`} className="font-medium hover:text-purple-700">
              {text}
            </Link>
            <div className="flex items-center text-xs text-gray-500 mt-1 flex-wrap">
              <Tag color={getCategoryColor(record.type)} className="mr-1 mb-1">
                {getCategoryName(record.type)}
              </Tag>
              <Badge 
                status={
                  record.status === 'approved' ? 'success' : 
                  record.status === 'rejected' ? 'error' : 'warning'
                } 
                text={getStatusName(record.status)}
                className="mr-2 mb-1"
              />
              {record.tags && (
                <div className="text-gray-400 mb-1">
                  {record.tags.split(',').slice(0, 2).map((tag, i) => (
                    <span key={i} className="mr-1">#{tag.trim()}</span>
                  ))}
                  {record.tags.split(',').length > 2 && <span>...</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'ผู้สร้าง',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div className="flex items-center">
          <Tooltip title={record.full_name || text}>
            <div className="flex items-center">
              <Avatar 
                src={record.user_image ? `${URL}/${record.user_image}` : null}
                icon={!record.user_image && <UserOutlined />}
                size="small"
                className="mr-2"
                style={{ 
                  backgroundColor: !record.user_image ? '#90278E' : undefined,
                }}
              />
              <Link to={`/users/${record.user_id}`} className="hover:text-purple-700">
                {text || 'ไม่ระบุชื่อ'}
              </Link>
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'ปีการศึกษา',
      dataIndex: 'year',
      key: 'year',
      width: 120,
      responsive: ['md'],
      render: (year, record) => (
        <div className="flex flex-col">
          <Text>{year || 'ไม่ระบุ'}</Text>
          {record.study_year && (
            <Text type="secondary" className="text-xs">ปี {record.study_year}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      responsive: ['lg'],
      render: (date) => (
        <Tooltip title={formatThaiDate(date, { dateStyle: 'full' })}>
          <div className="flex items-center">
            <CalendarOutlined className="mr-1 text-gray-400" />
            <Text>{formatThaiDate(date, { dateStyle: 'medium' })}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'การเข้าชม',
      dataIndex: 'views_count',
      key: 'views_count',
      width: 100,
      responsive: ['md'],
      render: (views) => (
        <div className="flex items-center">
          <EyeOutlined className="mr-1 text-gray-400" />
          <Text>{views || 0}</Text>
        </div>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: <Link to={`/projects/${record.project_id}`}>ดูรายละเอียด</Link>,
          },
        ];

        // เพิ่มปุ่มสำหรับตรวจสอบถ้าสถานะเป็น pending
        if (record.status === 'pending') {
          items.push(
            {
              key: 'review',
              icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
              label: <span onClick={() => showReviewModal(record.project_id, record.title)}>ตรวจสอบโครงงาน</span>,
            }
          );
        }

        items.push(
          { type: 'divider' },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            danger: true,
            label: <span onClick={() => showDeleteConfirm(record.project_id, record.title)}>ลบ</span>,
          }
        );

        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // ตั้งค่าการเลือกแถว
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // สร้างตัวกรองสำหรับ FilterPanel
  const getFilters = () => {
    const filterItems = [];

    if (filterOptions.type) {
      filterItems.push({
        name: 'type',
        label: 'ประเภทโครงงาน',
        type: 'select',
        options: [
          { value: 'coursework', label: 'ผลงานการเรียน' },
          { value: 'academic', label: 'บทความวิชาการ' },
          { value: 'competition', label: 'การแข่งขัน' },
        ],
      });
    }

    if (filterOptions.level) {
      filterItems.push({
        name: 'level',
        label: 'ชั้นปี',
        type: 'select',
        options: [
          { value: '1', label: 'ปี 1' },
          { value: '2', label: 'ปี 2' },
          { value: '3', label: 'ปี 3' },
          { value: '4', label: 'ปี 4' },
        ],
      });
    }

    if (filterOptions.year) {
      // สร้างตัวเลือกปีการศึกษาย้อนหลัง 5 ปีจากปีปัจจุบัน
      const currentYear = new Date().getFullYear() + 543; // ปี พ.ศ.
      const yearOptions = [];
      
      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        yearOptions.push({ value: String(year), label: String(year) });
      }

      filterItems.push({
        name: 'year',
        label: 'ปีการศึกษา',
        type: 'select',
        options: yearOptions,
      });
    }

    return filterItems;
  };

  // แสดงข้อความเมื่อไม่มีข้อมูล
  const renderEmptyState = () => {
    if (searchQuery || Object.keys(filters).filter(key => filters[key] !== '').length > 0) {
      return (
        <EmptyState
          description="ไม่พบโครงงานที่ตรงกับการค้นหา"
          type="search"
          showAction={true}
          onAction={() => {
            onSearch('');
            onFilter({});
          }}
          actionText="ล้างตัวกรอง"
        />
      );
    }

    let message = 'ยังไม่มีโครงงานในระบบ';
    if (status === 'pending') {
      message = 'ไม่มีโครงงานที่รอการอนุมัติ';
    } else if (status === 'approved') {
      message = 'ไม่มีโครงงานที่อนุมัติแล้ว';
    } else if (status === 'rejected') {
      message = 'ไม่มีโครงงานที่ถูกปฏิเสธ';
    }

    return (
      <EmptyState
        description={message}
        showAction={!!onAddProject}
        onAction={onAddProject}
        actionText="เพิ่มโครงงานใหม่"
        actionIcon={<PlusOutlined />}
      />
    );
  };

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => onSearch(searchQuery)}
      />
    );
  }

  // กำหนดหัวข้อตามประเภท
  const getTitle = () => {
    if (status === 'pending') return 'โครงงานรอการอนุมัติ';
    if (status === 'approved') return 'โครงงานที่อนุมัติแล้ว';
    if (status === 'rejected') return 'โครงงานที่ถูกปฏิเสธ';
    return 'โครงงานทั้งหมด';
  };

  // กำหนด pagination options ให้ใช้ได้กับ antd Table
  const paginationOptions = {
    current: pagination.current || 1,
    pageSize: pagination.pageSize || 10,
    total: pagination.total || 0,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
  };

  // แสดง Modal สำหรับตรวจสอบโครงงานหลายรายการ
  const showBatchReviewModal = (action) => {
    setCurrentProject({ 
      id: selectedRowKeys,
      title: `${selectedRowKeys.length} รายการ`, 
      action: action 
    });
    setReviewModalVisible(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <Title level={5} className="mb-4 md:mb-0">
          {getTitle()}
        </Title>
        
        <div className="flex flex-col md:flex-row w-full md:w-auto space-y-2 md:space-y-0 md:space-x-2">
          <SearchBar
            placeholder="ค้นหาโครงงาน..."
            onSearch={onSearch}
            value={searchQuery}
            loading={searchLoading}
            allowClear
            className="w-full md:w-auto"
            width="100%"
          />
          
          <Button 
            onClick={() => setFilterVisible(!filterVisible)}
            className="md:ml-2"
          >
            {filterVisible ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
          </Button>
          
        </div>
      </div>

      {filterVisible && (
        <FilterPanel
          filters={getFilters()}
          onFilter={onFilter}
          onReset={() => onFilter({})}
          initialValues={filters}
          loading={loading}
        />
      )}

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={projects.map(project => ({ ...project, key: project.project_id }))}
        pagination={paginationOptions}
        onChange={(pagination, filters, sorter) => {
          onPageChange(pagination.current, pagination.pageSize);
        }}
        loading={loading}
        locale={{
          emptyText: renderEmptyState()
        }}
        scroll={{ x: 'max-content' }}
      />

      {selectedRowKeys.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md border-t border-gray-200 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <Text>{selectedRowKeys.length} รายการที่เลือก</Text>
            <Space>
              <Button onClick={() => setSelectedRowKeys([])}>ยกเลิกการเลือก</Button>
              {status === 'pending' && (
                <>
                  <Button 
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    onClick={() => showBatchReviewModal('approve')}
                  >
                    อนุมัติที่เลือก
                  </Button>
                  <Button 
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => showBatchReviewModal('reject')}
                  >
                    ปฏิเสธที่เลือก
                  </Button>
                </>
              )}
              <Button 
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  confirm({
                    title: `ยืนยันการลบโครงงาน ${selectedRowKeys.length} รายการ`,
                    icon: <ExclamationCircleOutlined />,
                    content: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้',
                    okText: 'ใช่, ลบ',
                    okType: 'danger',
                    cancelText: 'ยกเลิก',
                    onOk() {
                      // TODO: ลบโครงงานหลายรายการ
                      setSelectedRowKeys([]);
                    },
                  });
                }}
              >
                ลบที่เลือก
              </Button>
            </Space>
          </div>
        </div>
      )}

      {/* Modal ตรวจสอบโครงงาน */}
      <Modal
        title={`ตรวจสอบโครงงาน${currentProject ? `: ${currentProject.title}` : ''}`}
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProjectReviewForm
          initialValues={currentProject ? { action: currentProject.action || 'approve' } : {}}
          onFinish={handleReviewFinish}
          onCancel={() => setReviewModalVisible(false)}
          loading={reviewLoading}
        />
      </Modal>
    </div>
  );
};

export default ProjectList;