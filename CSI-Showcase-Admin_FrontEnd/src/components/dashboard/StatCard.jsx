import React from 'react';
import { Card, Statistic, Tooltip, Typography, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { formatNumber } from '../../utils/numberUtils';
import { colors } from '../../config/themeConfig';

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
      className={`h-full admin-card hover:transform hover:scale-105 transition-all duration-300 cursor-pointer ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        background: 'rgba(255, 255, 255, 0.98)',
        border: `1px solid ${colors.primary}15`,
        borderRadius: '16px',
        boxShadow: `0 8px 25px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.08)`,
        ...style
      }}
      onClick={onClick}
      loading={loading}
      bodyStyle={{ padding: '24px' }}
    >
      {/* Background gradient overlay */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-bl-full"
        style={{
          background: `linear-gradient(135deg, ${color}, ${colors.secondary})`,
        }}
      />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <Text
            className="text-sm font-sukhumvit font-medium uppercase tracking-wider mb-2 block"
            style={{ color: colors.textMuted }}
          >
            {title}
          </Text>
          <Statistic
            value={value}
            precision={precision}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{
              color,
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: 'SukhumvitSet',
              lineHeight: 1.2
            }}
            formatter={(val) => formatNumber(val, precision)}
          />
          {renderComparison()}
        </div>
        {icon && (
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300"
            style={{
              background: `linear-gradient(135deg, ${color}15, ${color}25)`,
              color: color,
              border: `2px solid ${color}20`
            }}
          >
            <div style={{ fontSize: '28px' }}>
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {footer && (
        <div
          className="mt-6 pt-4 relative"
          style={{
            borderTop: `1px solid ${colors.primary}10`
          }}
        >
          <div className="flex items-center justify-between">
            {footer}
            {onClick && (
              <div className="text-xs text-gray-400 font-sukhumvit">
                คลิกเพื่อดูรายละเอียด
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Hover glow effect */}
      <style jsx>{`
        .admin-card:hover {
          box-shadow: 0 15px 40px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.15) !important;
        }
      `}</style>
    </Card>
  );
};

export default StatCard;