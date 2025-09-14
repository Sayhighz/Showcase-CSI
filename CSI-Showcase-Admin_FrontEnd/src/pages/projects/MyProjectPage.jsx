// src/pages/projects/MyProjectPage.jsx
import React, { useCallback, useState, useEffect, useRef } from 'react';
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
    pagination,
    deleteProject,
    handlePaginationChange,
    filters,
    refreshProjects,
    applyFilters
  } = useProject('my-projects');

  // Check if current user is a student (only students can upload projects)
  const isStudent = currentUser?.role === 'student';





  // Local draft filters (apply on button press)
  const [pendingFilters, setPendingFilters] = useState({
    search: filters.search || '',
    type: filters.type || '',
    status: filters.status || ''
  });
  // Keep a ref in sync to avoid stale reads when user clicks immediately after changing selects
  const pendingFiltersRef = useRef(pendingFilters);
  useEffect(() => {
    pendingFiltersRef.current = pendingFilters;
  }, [pendingFilters]);

  // Keep draft controls in sync when applied filters change from elsewhere
  useEffect(() => {
    const next = {
      search: filters.search || '',
      type: filters.type || '',
      status: filters.status || '',
    };
    setPendingFilters(next);
    pendingFiltersRef.current = next;
  }, [filters.search, filters.type, filters.status]);

  const onChangeSearch = useCallback((e) => {
    const v = e?.target?.value ?? '';
    // Update ref first to avoid stale value when clicking Search immediately
    pendingFiltersRef.current = { ...pendingFiltersRef.current, search: v };
    setPendingFilters(prev => ({ ...prev, search: v }));
  }, []);

  const onChangeType = useCallback((value) => {
    const v = value || '';
    pendingFiltersRef.current = { ...pendingFiltersRef.current, type: v };
    setPendingFilters(prev => ({ ...prev, type: v }));
  }, []);

  const onChangeStatus = useCallback((value) => {
    const v = value || '';
    pendingFiltersRef.current = { ...pendingFiltersRef.current, status: v };
    setPendingFilters(prev => ({ ...prev, status: v }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    // Single authoritative apply that also performs immediate fetch and skips auto-effect once
    applyFilters({ ...pendingFiltersRef.current });
  }, [applyFilters]);

  const handleResetAll = useCallback(() => {
    const cleared = { search: '', type: '', status: '' };
    setPendingFilters(cleared);
    applyFilters(cleared);
  }, [applyFilters]);
  // Handle project actions
  const handleEdit = useCallback((projectId) => {
    navigate(`/projects/${projectId}`);
  }, [navigate]);

  const handleView = useCallback((projectId) => {
    navigate(`/projects/${projectId}`);
  }, [navigate]);

  const handleDelete = useCallback(async (projectId) => {
    try {
      const success = await deleteProject(projectId);
      if (success) {
        await refreshProjects();
      }
    } catch {
      message.error('เกิดข้อผิดพลาดในการลบโปรเจค');
    }
  }, [deleteProject, refreshProjects]);

  const handleAddNew = useCallback(() => {
    navigate('/projects/upload');
  }, [navigate]);

  // Calculate statistics


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
          {((currentUser?.role === 'admin') || record.status !== 'approved') && (
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
          )}
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

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="ค้นหาโปรเจค..."
              prefix={<SearchOutlined />}
              value={pendingFilters.search}
              onChange={onChangeSearch}
              onPressEnter={handleApplyFilters}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="ประเภทโปรเจค"
              value={pendingFilters.type}
              onChange={onChangeType}
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
              value={pendingFilters.status}
              onChange={onChangeStatus}
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
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
              >
                ค้นหา
              </Button>
              <Button
                icon={<FilterOutlined />}
                onClick={handleResetAll}
              >
                ล้างตัวกรอง
              </Button>
            </Space>
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