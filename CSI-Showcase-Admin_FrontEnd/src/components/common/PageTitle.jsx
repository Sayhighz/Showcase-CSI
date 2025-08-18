import React from 'react';
import { Typography, Button, Space, Divider, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PageTitle = ({
  title,
  subtitle,
  actions = [],
  back = null,
  breadcrumb = null,
  className = '',
  style = {},
  showDivider = true,
  level = 2,
  extra = null,
}) => {
  return (
    <div className={`page-title-container ${className}`} style={style}>
      {/* Breadcrumb Section */}
      {breadcrumb && (
        <div className="mb-3">
          <Breadcrumb
            items={[
              {
                href: '/',
                title: <HomeOutlined />,
              },
              ...breadcrumb
            ]}
          />
        </div>
      )}

      {/* Main Title Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {back && (
              <div className="flex-shrink-0">
                {back}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Title
                level={level}
                style={{
                  margin: 0,
                  color: '#1a1a1a',
                  fontSize: level === 1 ? '2rem' : level === 2 ? '1.5rem' : '1.25rem',
                  fontWeight: 600,
                  lineHeight: 1.2
                }}
                className="truncate"
              >
                {title}
              </Title>
              {subtitle && (
                <Text
                  type="secondary"
                  className="mt-2 block text-base leading-relaxed"
                  style={{ color: '#666' }}
                >
                  {subtitle}
                </Text>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {extra && (
            <div className="mr-3">
              {extra}
            </div>
          )}
          
          {actions && actions.length > 0 && (
            <Space size="middle" wrap className="flex justify-end">
              {actions.map((action, index) => {
                if (React.isValidElement(action)) {
                  return React.cloneElement(action, { key: index });
                }
                
                if (typeof action === 'object') {
                  const {
                    label,
                    icon,
                    type = 'default',
                    onClick,
                    loading = false,
                    disabled = false,
                    danger = false,
                    size = 'default',
                    ...rest
                  } = action;
                  
                  return (
                    <Button
                      key={index}
                      type={type}
                      icon={icon}
                      onClick={onClick}
                      loading={loading}
                      disabled={disabled}
                      danger={danger}
                      size={size}
                      style={{
                        borderRadius: '6px',
                        fontWeight: 500,
                        ...rest.style
                      }}
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
      </div>

      {/* Divider */}
      {showDivider && (
        <Divider style={{ margin: '0 0 24px 0' }} />
      )}
    </div>
  );
};

export default PageTitle;