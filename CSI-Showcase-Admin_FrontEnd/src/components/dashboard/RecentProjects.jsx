import React from 'react';
import { Card, Table, Tag, Typography, Tooltip, Button, Badge, Space } from 'antd';
import { EyeOutlined, UserOutlined, CalendarOutlined, LinkOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import { getCategoryName, getCategoryColor, getStatusName, getStatusColor } from '../../utils/projectUtils';
import { URL } from '../../constants/apiEndpoints';

const { Text } = Typography;

const RecentProjects = ({
  projects = [],
  loading = false,
  onViewMore = () => {},
  limit = 5,
  showViewMoreButton = true,
}) => {
  // คอลัมน์สำหรับตาราง
  const columns = [
    {
      title: 'โครงงาน',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="flex items-center">
          {record.image ? (
            <img 
              src={`${URL}${record.image}`} 
              alt={text} 
              className="w-10 h-10 object-cover rounded mr-3"
              onError={(e) => { e.target.src = '/images/project-placeholder.png'; }}
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
              <Text type="secondary">ไม่มีรูป</Text>
            </div>
          )}
          <div>
            <Link to={`/projects/${record.project_id}`} className="font-medium hover:text-purple-700">
              {text}
            </Link>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Tag color={getCategoryColor(record.type)} className="mr-1">
                {getCategoryName(record.type)}
              </Tag>
              <Badge 
                status={
                  record.status === 'approved' ? 'success' : 
                  record.status === 'rejected' ? 'error' : 'warning'
                } 
                text={getStatusName(record.status)}
                className="mr-2"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'ผู้สร้าง',
      dataIndex: 'username',
      key: 'username',
      width: 180,
      render: (text, record) => (
        <div className="flex items-center">
          <Tooltip title={record.full_name}>
            <div className="flex items-center">
              {record.user_image ? (
                <img 
                  src={`${URL}/${record.user_image}`} 
                  alt={text} 
                  className="w-6 h-6 object-cover rounded-full mr-2"
                  onError={(e) => { e.target.src = '/images/user-placeholder.png'; }}
                />
              ) : (
                <UserOutlined className="mr-2" />
              )}
              <Text>{text}</Text>
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'การเข้าชม',
      dataIndex: 'views_count',
      key: 'views_count',
      width: 100,
      render: (views, record) => (
        <div className="flex items-center">
          <EyeOutlined className="mr-1 text-gray-400" />
          <Text>{views || record.views_count || 0}</Text>
        </div>
      ),
    },
    {
      title: 'เวลา',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => (
        <Tooltip title={formatThaiDate(date, { dateStyle: 'full', timeStyle: 'short' })}>
          <div className="flex items-center">
            <CalendarOutlined className="mr-1 text-gray-400" />
            <Text>{formatThaiDate(date, { dateStyle: 'medium' })}</Text>
          </div>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card 
      title="โครงงานล่าสุด" 
      extra={
        showViewMoreButton && (
          <Button 
            type="link" 
            onClick={onViewMore}
            icon={<LinkOutlined />}
          >
            ดูทั้งหมด
          </Button>
        )
      }
      className="h-full"
    >
      <Table
        columns={columns}
        dataSource={projects.slice(0, limit).map(project => ({ ...project, key: project.project_id }))}
        loading={loading}
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default RecentProjects;