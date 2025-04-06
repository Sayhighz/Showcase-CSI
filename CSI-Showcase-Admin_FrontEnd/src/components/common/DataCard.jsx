// src/components/common/DataCard.jsx
import React from 'react';
import { Card, Statistic, Progress, Badge, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';

/**
 * Component สำหรับแสดงข้อมูลสถิติในรูปแบบการ์ด
 * 
 * @param {Object} props
 * @param {string} props.title - หัวข้อของการ์ด
 * @param {number|string} props.value - ค่าที่ต้องการแสดง
 * @param {string} props.prefix - ข้อความหรือไอคอนนำหน้าค่า
 * @param {string} props.suffix - ข้อความหรือไอคอนต่อท้ายค่า
 * @param {number} props.precision - จำนวนตำแหน่งทศนิยม
 * @param {number} props.change - ค่าการเปลี่ยนแปลง (%)
 * @param {number} props.percent - เปอร์เซ็นต์สำหรับแสดง Progress
 * @param {string} props.status - สถานะของข้อมูล ('success', 'processing', 'warning', 'error')
 * @param {string} props.color - สีของการ์ด
 * @param {React.ReactNode} props.icon - ไอคอนประกอบ
 * @param {string} props.description - คำอธิบายเพิ่มเติม
 * @param {string} props.tooltip - ข้อความที่แสดงเมื่อ hover
 * @param {boolean} props.loading - สถานะกำลังโหลดข้อมูล
 * @param {string} props.size - ขนาดของการ์ด ('small', 'medium', 'large')
 * @param {string} props.className - className เพิ่มเติม
 */
const DataCard = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  change,
  percent,
  status,
  color,
  icon,
  description,
  tooltip,
  loading = false,
  size = 'medium',
  className = ''
}) => {
  // กำหนดสไตล์ตามขนาด
  let paddingClass = 'p-4';
  let titleClass = 'text-sm';
  let valueClass = 'text-2xl';
  
  if (size === 'small') {
    paddingClass = 'p-3';
    titleClass = 'text-xs';
    valueClass = 'text-xl';
  } else if (size === 'large') {
    paddingClass = 'p-5';
    titleClass = 'text-base';
    valueClass = 'text-3xl';
  }

  // กำหนดสถานะและสีสำหรับการเปลี่ยนแปลง
  const renderChange = () => {
    if (change === undefined || change === null) return null;
    
    const isPositive = change > 0;
    const changeIcon = isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    const changeColor = isPositive ? '#52c41a' : '#f5222d';
    
    return (
      <div 
        className="flex items-center text-sm ml-2" 
        style={{ color: changeColor }}
      >
        {changeIcon}
        <span className="ml-1">{Math.abs(change)}%</span>
      </div>
    );
  };

  // กำหนดสีพื้นหลังถ้ามี
  const cardStyle = color ? { backgroundColor: color } : {};
  
  // กำหนดสีข้อความตามสีพื้นหลัง
  const textColorClass = color ? 'text-white' : '';

  return (
    <Card 
      className={`${paddingClass} ${className} h-full`}
      style={cardStyle}
      loading={loading}
      bordered
    >
      <div className={`flex items-center mb-2 ${textColorClass}`}>
        <div className={`font-medium ${titleClass} flex-grow`}>
          {title}
          {tooltip && (
            <Tooltip title={tooltip}>
              <InfoCircleOutlined className="ml-1 text-gray-400" />
            </Tooltip>
          )}
        </div>
        {status && (
          <Badge 
            status={status} 
            text={status === 'success' ? 'ดี' : 
                  status === 'processing' ? 'กำลังดำเนินการ' : 
                  status === 'warning' ? 'ต้องการความสนใจ' : 
                  status === 'error' ? 'มีปัญหา' : ''}
            className="ml-2"
          />
        )}
      </div>
      
      <div className="flex items-center">
        {icon && <div className="mr-3 text-xl">{icon}</div>}
        <div>
          <div className="flex items-center">
            <Statistic 
              value={value} 
              precision={precision}
              prefix={prefix}
              suffix={suffix}
              valueStyle={{ 
                fontSize: valueClass.replace('text-', ''),
                color: color ? 'white' : undefined
              }}
            />
            {renderChange()}
          </div>
          
          {description && (
            <div className={`mt-1 text-sm ${color ? 'text-white opacity-80' : 'text-gray-500'}`}>
              {description}
            </div>
          )}
        </div>
      </div>
      
      {percent !== undefined && (
        <Progress 
          percent={percent} 
          showInfo={false} 
          status={status || (percent >= 100 ? 'success' : 'active')}
          className="mt-3"
          strokeColor={color ? 'white' : undefined}
          trailColor={color ? 'rgba(255, 255, 255, 0.3)' : undefined}
        />
      )}
    </Card>
  );
};

export default DataCard;