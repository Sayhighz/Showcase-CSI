import React from 'react';
import { List, Avatar, Empty } from 'antd';
import { URL } from '../../../constants/apiEndpoints';

const Contributors = ({ projectDetails }) => {
  const contributors = projectDetails?.contributors || [];
  
  if (contributors.length === 0) {
    return <Empty description="ไม่มีผู้ร่วมงาน" />;
  }
  
  return (
    <List
      itemLayout="horizontal"
      dataSource={contributors}
      renderItem={contributor => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar 
                src={contributor.image ? `${URL}/${contributor.image}` : null} 
                style={{ backgroundColor: !contributor.image ? '#90278E' : 'transparent' }}
              >
                {!contributor.image && contributor.full_name.charAt(0).toUpperCase()}
              </Avatar>
            }
            title={contributor.full_name}
            description={contributor.email}
          />
        </List.Item>
      )}
    />
  );
};

export default Contributors;