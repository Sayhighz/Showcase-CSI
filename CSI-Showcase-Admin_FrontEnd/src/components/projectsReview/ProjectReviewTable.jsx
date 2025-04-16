import React from 'react';
import { Table, Tag, Button, Space, Typography, Empty } from 'antd';
import { 
  EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  CalendarOutlined, TeamOutlined
} from '@ant-design/icons';
import { 
  getCategoryName, 
  getCategoryColor, 
} from '../../utils/projectUtils';
import { formatThaiDate } from '../../utils/dataUtils';

const { Text } = Typography;

const ProjectReviewTable = ({ 
  loading, 
  filteredProjects, 
  showProjectDetails, 
  handleShowApproveModal, 
  handleShowRejectModal 
}) => {
  // Get icon component for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic':
        return <BookOutlined />;
      case 'coursework':
        return <TeamOutlined />;
      case 'competition':
        return <TrophyOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'ชื่อโปรเจค',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="flex flex-col">
          <Text 
            className="text-base font-medium cursor-pointer hover:text-[#90278E] transition-colors" 
            onClick={() => showProjectDetails(record)}
          >
            {text}
          </Text>
          <Text type="secondary" className="text-xs mt-1">
            โดย: {record.full_name || record.username || 'ไม่ระบุ'}
          </Text>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type) => (
        type ? (
          <Tag color={getCategoryColor(type)} icon={getCategoryIcon(type)}>
            {getCategoryName(type)}
          </Tag>
        ) : (
          <Text type="secondary">ไม่ระบุ</Text>
        )
      ),
    },
    {
      title: 'ข้อมูลทั่วไป',
      key: 'metaInfo',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary" className="text-xs flex items-center">
            <CalendarOutlined className="mr-1" /> ปี/ภาค: {record.year}/{record.semester || '-'}
          </Text>
          <Text type="secondary" className="text-xs flex items-center">
            <TeamOutlined className="mr-1" /> ชั้นปี: {`ปี ${record.study_year}` || 'ไม่ระบุ'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date) => {
        if (!date) return <Text type="secondary">ไม่ระบุ</Text>;
        
        const formattedDate = formatDateThai(date);
        return <Text>{formattedDate}</Text>;
      },
    },
    {
      title: 'ดำเนินการ',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showProjectDetails(record)}
            type="default"
            size="small"
          >
            ดูรายละเอียด
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => handleShowApproveModal(record)}
            type="primary"
            className="bg-green-600 hover:bg-green-700"
            size="small"
          >
            อนุมัติ
          </Button>
          <Button
            icon={<CloseCircleOutlined />}
            onClick={() => handleShowRejectModal(record)}
            type="primary"
            danger
            size="small"
          >
            ปฏิเสธ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={filteredProjects}
      rowKey="project_id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      locale={{
        emptyText: (
          <Empty 
            description="ไม่พบโปรเจคที่รอการตรวจสอบ" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        )
      }}
    />
  );
};

export default ProjectReviewTable;