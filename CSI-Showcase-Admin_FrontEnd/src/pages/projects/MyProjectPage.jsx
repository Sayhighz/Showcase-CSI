// src/pages/projects/MyProjectPage.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Empty, 
  Input, 
  Select, 
  Space,
  Table,
  Tag,
  Popconfirm,
  message,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import useProject from '../../hooks/useProject';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;

// Project types mapping
const PROJECT_TYPES = {
  academic: { label: 'บทความวิชาการ', color: 'blue', icon: BookOutlined },
  competition: { label: 'การแข่งขัน', color: 'gold', icon: TrophyOutlined },
  coursework: { label: 'งานในชั้นเรียน', color: 'green', icon: AppstoreOutlined }
};

// Status mapping
const STATUS_TYPES = {
  pending: { label: 'รออนุมัติ', color: 'processing', icon: ClockCircleOutlined },
  approved: { label: 'อนุมัติ', color: 'success', icon: CheckCircleOutlined },
  rejected: { label: 'ปฏิเสธ', color: 'error', icon: CloseCircleOutlined }
};

const MyProjectPage = () => {
  const navigate = useNavigate();
  const { admin, user } = useAuth();
  const currentUser = admin || user;
  const {
    projects,
    loading,
    error,
    pagination,
    fetchMyProjects,
    deleteProject,
    handlePaginationChange
  } = useProject('my-projects');

  // Check if current user is a student (only students can upload projects)
  const isStudent = currentUser?.role === 'student';

  // Local state for filters
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });

  // Fetch projects on component mount and filter changes
  useEffect(() => {
    if (currentUser?.id) {
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) {
          delete queryParams[key];
        }
      });
      
      fetchMyProjects(currentUser.id, queryParams);
    }
  }, [currentUser?.id, filters.search, filters.type, filters.status, pagination.current, pagination.pageSize]); // Remove fetchMyProjects from dependencies

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: '',
      status: ''
    });
  }, []);

  // Handle project actions
  const handleEdit = useCallback((projectId) => {
    navigate(`/projects/edit/${projectId}`);
  }, [navigate]);

  const handleView = useCallback((projectId) => {
    navigate(`/projects/detail/${projectId}`);
  }, [navigate]);

  const handleDelete = useCallback(async (projectId) => {
    try {
      const success = await deleteProject(projectId);
      if (success && currentUser?.id) {
        // Refresh the projects list
        const queryParams = {
          page: pagination.current,
          limit: pagination.pageSize,
          ...filters
        };
        
        // Remove empty filters
        Object.keys(queryParams).forEach(key => {
          if (!queryParams[key]) {
            delete queryParams[key];
          }
        });
        
        fetchMyProjects(currentUser.id, queryParams);
      }
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการลบโปรเจค');
    }
  }, [deleteProject, currentUser?.id, pagination.current, pagination.pageSize, filters.search, filters.type, filters.status]); // Remove fetchMyProjects from dependencies

  const handleAddNew = useCallback(() => {
    navigate('/projects/upload');
  }, [navigate]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        total: 0,
        academic: 0,
        competition: 0,
        coursework: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
    }

    return projects.reduce((acc, project) => {
      acc.total++;
      const pt = project.type || project.category; // รองรับทั้ง type และ category
      if (pt) {
        acc[pt] = (acc[pt] || 0) + 1;
      }
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {
      total: 0,
      academic: 0,
      competition: 0,
      coursework: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    });
  }, [projects]);

  // Table columns
  const columns = [
    {
      title: 'ชื่อโปรเจค',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      render: (_type, record) => {
        const type = record.type || record.category || '-';
        const typeInfo = PROJECT_TYPES[type] || { label: type, color: 'default' };
        const IconComponent = typeInfo.icon;
        return (
          <Tag color={typeInfo.color} icon={IconComponent ? <IconComponent /> : null}>
            {typeInfo.label}
          </Tag>
        );
      },
      filters: Object.entries(PROJECT_TYPES).map(([key, value]) => ({
        text: value.label,
        value: key
      })),
      onFilter: (value, record) => {
        const type = record.type || record.category;
        return type === value;
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = STATUS_TYPES[status] || { label: status, color: 'default' };
        const IconComponent = statusInfo.icon;
        return (
          <Tag color={statusInfo.color} icon={IconComponent ? <IconComponent /> : null}>
            {statusInfo.label}
          </Tag>
        );
      },
      filters: Object.entries(STATUS_TYPES).map(([key, value]) => ({
        text: value.label,
        value: key
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'ปีการศึกษา',
      dataIndex: 'year',
      key: 'year',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('th-TH'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="ดูรายละเอียด">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title="แก้ไข">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="ลบโปรเจค"
            description="คุณแน่ใจหรือไม่ที่จะลบโปรเจคนี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
          >
            <Tooltip title="ลบ">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageTitle
        title="โปรเจคของฉัน"
        subtitle="จัดการและดูรายละเอียดโปรเจคทั้งหมดของคุณ"
        extra={
          isStudent && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNew}
            >
              เพิ่มโปรเจคใหม่
            </Button>
          )
        }
      />

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ทั้งหมด"
              value={statistics.total}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="บทความวิชาการ"
              value={statistics.academic}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="การแข่งขัน"
              value={statistics.competition}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="งานในชั้นเรียน"
              value={statistics.coursework}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="ค้นหาโปรเจค..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="ประเภทโปรเจค"
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(PROJECT_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="สถานะ"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(STATUS_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={handleClearFilters}
            >
              ล้างตัวกรอง
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Projects Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={projects}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
            onChange: handlePaginationChange,
            onShowSizeChange: handlePaginationChange,
          }}
          locale={{
            emptyText: (
              <Empty
                description="ไม่มีโปรเจคในระบบ"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                {isStudent && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                  >
                    เพิ่มโปรเจคแรกของคุณ
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default MyProjectPage;