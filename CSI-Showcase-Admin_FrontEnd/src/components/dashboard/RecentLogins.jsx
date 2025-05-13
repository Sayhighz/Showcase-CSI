import React from 'react';
import { Card, List, Avatar, Typography, Tag, Tooltip, Button } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import { URL } from '../../constants/apiEndpoints';

const { Text } = Typography;

const getBrowserIcon = (browser) => {
  if (!browser) return <GlobalOutlined />;
  
  const browserLower = browser.toLowerCase();
  if (browserLower.includes('chrome')) return <span>🌐</span>;
  if (browserLower.includes('firefox')) return <span>🦊</span>;
  if (browserLower.includes('safari')) return <span>🧭</span>;
  if (browserLower.includes('edge')) return <span>📱</span>;
  
  return <GlobalOutlined />;
};

const RecentLogins = ({
  logins = [],
  loading = false,
  onViewMore = () => {},
  limit = 5,
  showViewMoreButton = true,
}) => {
  return (
    <Card 
      title="การเข้าสู่ระบบล่าสุด" 
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
      <List
        loading={loading}
        dataSource={logins.slice(0, limit)}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  src={item.image ? `${URL}/${item.image}` : null}
                  icon={!item.image && <UserOutlined />}
                  style={{
                    backgroundColor: !item.image ? '#90278E' : undefined
                  }}
                />
              }
              title={
                <div className="flex items-center justify-between">
                  <Link to={`/users/${item.user_id || item.id}`} className="font-medium hover:text-purple-700">
                    {item.username || 'ผู้ใช้ไม่ระบุชื่อ'}
                  </Link>
                  <Tooltip title={formatThaiDate(item.loginTime || item.login_time, { dateStyle: 'full', timeStyle: 'medium' })}>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockCircleOutlined className="mr-1" />
                      <span>{formatThaiDate(item.loginTime || item.login_time, { dateStyle: 'short' })}</span>
                    </div>
                  </Tooltip>
                </div>
              }
              description={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Text type="secondary" className="mr-2">{item.fullName || item.full_name}</Text>
                    <Tag color="purple">{item.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}</Tag>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1 md:mt-0">
                    <Tooltip title={`${item.browser} on ${item.os}`}>
                      <span className="mr-2">{getBrowserIcon(item.browser)}</span>
                    </Tooltip>
                    <Tooltip title={item.ipAddress || item.ip_address}>
                      <span><EnvironmentOutlined /> {item.ipAddress || item.ip_address}</span>
                    </Tooltip>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RecentLogins;