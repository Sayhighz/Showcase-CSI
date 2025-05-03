import React from 'react';
import { Card, Avatar, Typography, Tag, Space, Tooltip, Divider, Button } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  ProjectOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';

const { Meta } = Card;
const { Text } = Typography;

const UserCard = ({
  user,
  onEdit,
  onDelete,
  showActions = true,
  size = 'default', // 'small', 'default', 'large'
  className = '',
  style = {},
}) => {
  if (!user) return null;

  // คำแปลบทบาท
  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'ผู้ดูแลระบบ';
      case 'student':
        return 'นักศึกษา';
      case 'visitor':
        return 'ผู้เยี่ยมชม';
      default:
        return role;
    }
  };

  // สีของแท็กตามบทบาท
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'student':
        return 'blue';
      case 'visitor':
        return 'green';
      default:
        return 'default';
    }
  };

  // คำแปลสถานะ
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'ใช้งาน';
      case 'inactive':
        return 'ไม่ได้ใช้งาน';
      case 'suspended':
        return 'ถูกระงับ';
      default:
        return status;
    }
  };

  // สีของแท็กตามสถานะ
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // กำหนดขนาดของ Avatar และ Card
  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return 64;
      case 'large':
        return 96;
      default:
        return 80;
    }
  };

  // แสดงปุ่มเมนู
  const renderActions = () => {
    if (!showActions) return [];

    return [
      <Tooltip title="ดูรายละเอียด">
        <Link to={`/users/${user.user_id}`}>
          <Button type="text" icon={<EyeOutlined />} />
        </Link>
      </Tooltip>,
      <Tooltip title="แก้ไข">
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => onEdit && onEdit(user.user_id)} 
        />
      </Tooltip>,
      <Tooltip title="ลบ">
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => onDelete && onDelete(user.user_id, user.username)} 
        />
      </Tooltip>
    ];
  };

  return (
    <Card
      className={`h-full hover:shadow-md transition-shadow ${className}`}
      style={{ ...style }}
      actions={showActions ? renderActions() : undefined}
    >
      <div className="flex flex-col items-center">
        <Avatar 
          src={user.image ? `/uploads/profiles/${user.image}` : null}
          icon={!user.image && <UserOutlined />}
          size={getAvatarSize()}
          style={{ 
            backgroundColor: !user.image ? '#90278E' : undefined,
          }}
        />
        
        <Meta
          title={
            <Link to={`/users/${user.user_id}`} className="text-center mt-4 block hover:text-purple-700">
              {user.username}
            </Link>
          }
          description={
            <div className="text-center mt-1">
              <Text type="secondary">{user.full_name}</Text>
              <div className="mt-2 flex justify-center">
                <Space>
                  <Tag color={getRoleColor(user.role)}>{getRoleText(user.role)}</Tag>
                  <Tag color={getStatusColor(user.status)}>{getStatusText(user.status)}</Tag>
                </Space>
              </div>
            </div>
          }
          style={{ marginTop: 16, textAlign: 'center' }}
        />
        
        <Divider className="my-3" />
        
        <div className="w-full">
          <div className="flex items-center text-gray-600 mb-2">
            <MailOutlined className="mr-2" />
            <Text className="truncate" style={{ maxWidth: '100%' }}>
              {user.email}
            </Text>
          </div>
          
          <div className="flex items-center text-gray-600 mb-2">
            <CalendarOutlined className="mr-2" />
            <Text>เข้าร่วมเมื่อ {formatThaiDate(user.created_at, { dateStyle: 'medium' })}</Text>
          </div>
          
          <div className="flex items-center text-gray-600">
            <ProjectOutlined className="mr-2" />
            <Text>โครงงาน: {user.project_count || 0}</Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;