import React from 'react';
import { List, Avatar, Empty, Tag, Typography } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { URL } from '../../../constants/apiEndpoints';

const { Text } = Typography;

const Contributors = ({ projectDetails }) => {
  const contributors = projectDetails?.contributors || [];
  
  if (contributors.length === 0) {
    return <Empty description="ไม่มีผู้ร่วมงาน" />;
  }

  // แยกผู้ร่วมงานตามประเภท
  const separateContributors = () => {
    const registered = [];
    const external = [];
    
    contributors.forEach(contributor => {
      if (contributor.memberType === 'registered' || contributor.userId) {
        registered.push(contributor);
      } else {
        external.push(contributor);
      }
    });
    
    return { registered, external };
  };

  const { registered, external } = separateContributors();

  const renderContributor = (contributor, isRegistered = true) => {
    const displayName = isRegistered
      ? (contributor.fullName || contributor.full_name || contributor.username)
      : (contributor.memberName || contributor.name);
    
    const displayEmail = isRegistered
      ? contributor.email
      : contributor.memberEmail;
    
    const displayId = isRegistered
      ? contributor.userId
      : contributor.memberStudentId;

    const roleLabel = {
      'owner': 'เจ้าของโครงการ',
      'contributor': 'ผู้ร่วมงาน',
      'advisor': 'อาจารย์ที่ปรึกษา'
    }[contributor.role] || 'ผู้ร่วมงาน';

    return (
      <List.Item key={isRegistered ? contributor.userId : `${contributor.memberName}-${contributor.memberStudentId}`}>
        <List.Item.Meta
          avatar={
            <Avatar
              src={isRegistered && contributor.image ? `${URL}/${contributor.image}` : null}
              style={{
                backgroundColor: isRegistered ? '#1890ff' : '#52c41a',
                color: 'white'
              }}
              icon={isRegistered ? <UserOutlined /> : <TeamOutlined />}
            >
              {!contributor.image && displayName ? displayName.charAt(0).toUpperCase() : ''}
            </Avatar>
          }
          title={
            <div className="flex items-center gap-2">
              <Text strong>{displayName || 'ไม่ระบุชื่อ'}</Text>
              <Tag color={isRegistered ? 'blue' : 'green'} size="small">
                {isRegistered ? 'สมาชิก' : 'ภายนอก'}
              </Tag>
              <Tag color="purple" size="small">
                {roleLabel}
              </Tag>
            </div>
          }
          description={
            <div className="space-y-1">
              {displayEmail && (
                <div>
                  <Text type="secondary">อีเมล: {displayEmail}</Text>
                </div>
              )}
              {displayId && (
                <div>
                  <Text type="secondary">
                    {isRegistered ? 'รหัสผู้ใช้' : 'รหัสนักศึกษา'}: {displayId}
                  </Text>
                </div>
              )}
              {!displayEmail && !displayId && (
                <Text type="secondary">ไม่มีข้อมูลเพิ่มเติม</Text>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* สมาชิกที่ลงทะเบียน */}
      {registered.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <UserOutlined className="text-blue-500" />
            <Text strong>สมาชิกที่ลงทะเบียน ({registered.length} คน)</Text>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={registered}
            renderItem={contributor => renderContributor(contributor, true)}
          />
        </div>
      )}

      {/* บุคคลภายนอก */}
      {external.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TeamOutlined className="text-green-500" />
            <Text strong>บุคคลภายนอก ({external.length} คน)</Text>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={external}
            renderItem={contributor => renderContributor(contributor, false)}
          />
        </div>
      )}
    </div>
  );
};

export default Contributors;