import React from 'react';
import { Card, Statistic, Tooltip, Typography, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { formatNumber } from '../../utils/numberUtils';

const { Text } = Typography;

const StatCard = ({
  title,
  value,
  suffix = '',
  prefix = '',
  icon,
  color = '#90278E',
  loading = false,
  comparison = null,
  precision = 0,
  showChange = true,
  changeType = 'percent', // 'percent', 'value'
  footer = null,
  onClick = null,
  className = '',
  style = {},
}) => {
  // คำนวณการเปลี่ยนแปลง
  const renderComparison = () => {
    if (!comparison || !showChange) return null;
    
    const { value: prevValue, label } = comparison;
    
    if (prevValue === undefined || prevValue === null) return null;
    
    // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
    const calculateChange = () => {
      if (prevValue === 0) return value > 0 ? 100 : 0;
      return ((value - prevValue) / Math.abs(prevValue)) * 100;
    };
    
    // เตรียมค่าการเปลี่ยนแปลง
    const change = changeType === 'percent' ? calculateChange() : (value - prevValue);
    const formattedChange = changeType === 'percent' 
      ? `${change >= 0 ? '+' : ''}${formatNumber(change, 1)}%` 
      : `${change >= 0 ? '+' : ''}${formatNumber(change, precision)}`;
    
    // กำหนดสีและไอคอน
    let changeColor = '#8c8c8c';
    let ChangeIcon = MinusOutlined;
    
    if (change > 0) {
      changeColor = '#52c41a';
      ChangeIcon = ArrowUpOutlined;
    } else if (change < 0) {
      changeColor = '#f5222d';
      ChangeIcon = ArrowDownOutlined;
    }
    
    return (
      <Tooltip title={`${label || 'เทียบกับครั้งก่อน'}: ${formatNumber(prevValue, precision)}`}>
        <div className="flex items-center mt-1">
          <ChangeIcon style={{ color: changeColor, fontSize: '12px', marginRight: '4px' }} />
          <Text style={{ color: changeColor, fontSize: '12px' }}>
            {formattedChange}
          </Text>
        </div>
      </Tooltip>
    );
  };

  return (
    <Card
      className={`h-full hover:shadow-md transition-shadow ${className}`}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
      onClick={onClick}
      loading={loading}
      bodyStyle={{ padding: '20px' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <Text type="secondary" className="text-xs font-medium uppercase">
            {title}
          </Text>
          <Statistic 
            value={value} 
            precision={precision}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{ 
              color, 
              fontSize: '24px',
              fontWeight: 600,
            }}
            formatter={(val) => formatNumber(val, precision)}
          />
          {renderComparison()}
        </div>
        {icon && (
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-lg" 
            style={{ 
              backgroundColor: `${color}20`,
              color: color
            }}
          >
            {icon}
          </div>
        )}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default StatCard;