import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography, Dropdown } from 'antd';
import { 
  EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  CalendarOutlined, TeamOutlined, TagOutlined, MoreOutlined, 
  BookOutlined, TrophyOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCategoryName, getCategoryColor, getStatusName, getStatusColor } from '../../utils/projectUtils';

const { Text } = Typography;

/**
 * คอมโพเนนต์ตารางแสดงข้อมูลโปรเจค
 */
const ProjectTable = ({ 
  projects, 
  loading, 
  handleApprove, 
  showRejectModal, 
  handleShowReview 
}) => {
  const navigate = useNavigate();

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
        return null;
    }
  };

  // Dropdown menu for actions
  const getActionMenu = (project) => {
    return {
      items: [
        {
          key: '1',
          label: 'ดูรายละเอียด',
          icon: <EyeOutlined />,
          onClick: () => navigate(`/projects/${project.project_id}`)
        },
        {
          key: '2',
          label: 'ตรวจสอบ',
          icon: <FileTextOutlined />,
          onClick: () => handleShowReview(project)
        },
        ...(project.status === 'pending' ? [
          {
            key: '3',
            label: 'อนุมัติ',
            icon: <CheckCircleOutlined style={{ color: 'green' }} />,
            onClick: () => handleApprove(project)
          },
          {
            key: '4',
            label: 'ปฏิเสธ',
            icon: <CloseCircleOutlined style={{ color: 'red' }} />,
            onClick: () => showRejectModal(project)
          }
        ] : [])
      ]
    };
  };

  // Define table columns
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
            onClick={() => navigate(`/projects/${record.project_id}`)}
          >
            {text}
          </Text>
          <Text type="secondary" className="text-xs mt-1">
            โดย: {record.full_name || 'ไม่ระบุ'}
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
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusName(status)}
        </Tag>
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
            <TeamOutlined className="mr-1" /> ชั้นปี: {record.level || `ปี ${record.study_year}` || 'ไม่ระบุ'}
          </Text>
          {record.tags && (
            <Text type="secondary" className="text-xs flex items-center">
              <TagOutlined className="mr-1" /> แท็ก: {record.tags}
            </Text>
          )}
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
        
        const formattedDate = new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        
        return <Text>{formattedDate}</Text>;
      },
    },
    {
      title: 'ดำเนินการ',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="ดูรายละเอียด">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/projects/${record.project_id}`)}
              type="default"
              size="small"
            />
          </Tooltip>
          
          <Dropdown menu={getActionMenu(record)}>
            <Button
              icon={<MoreOutlined />}
              type="default"
              size="small"
            />
          </Dropdown>
          
          {record.status === 'pending' && (
            <>
              <Tooltip title="อนุมัติ">
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record)}
                  type="primary"
                  className="bg-green-600 hover:bg-green-700"
                  size="small"
                />
              </Tooltip>
              
              <Tooltip title="ปฏิเสธ">
                <Button
                  icon={<CloseCircleOutlined />}
                  onClick={() => showRejectModal(record)}
                  type="primary"
                  danger
                  size="small"
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={projects}
      rowKey="project_id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: 'ไม่พบข้อมูลโปรเจค' }}
    />
  );
};

export default ProjectTable;