import React from 'react';
import { Typography, Button, Space } from 'antd';

const { Title, Text } = Typography;

const PageTitle = ({
  title,
  subtitle,
  actions = [],
  back = null,
  className = '',
  style = {},
}) => {
  return (
    <div 
      className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 ${className}`}
      style={style}
    >
      <div className="mb-4 md:mb-0">
        <div className="flex items-center">
          {back && (
            <div className="mr-2">
              {back}
            </div>
          )}
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
        </div>
        {subtitle && (
          <Text type="secondary" className="mt-1 block">
            {subtitle}
          </Text>
        )}
      </div>
      
      {actions && actions.length > 0 && (
        <Space size="small" wrap className="flex justify-end">
          {actions.map((action, index) => {
            if (React.isValidElement(action)) {
              return React.cloneElement(action, { key: index });
            }
            
            if (typeof action === 'object') {
              const { label, icon, type = 'default', onClick, ...rest } = action;
              
              return (
                <Button 
                  key={index}
                  type={type}
                  icon={icon}
                  onClick={onClick}
                  {...rest}
                >
                  {label}
                </Button>
              );
            }
            
            return null;
          })}
        </Space>
      )}
    </div>
  );
};

export default PageTitle;