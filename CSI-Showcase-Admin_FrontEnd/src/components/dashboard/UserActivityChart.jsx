// src/components/dashboard/UserActivityChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';
import { formatThaiDate } from '../../utils/dataUtils';

/**
 * Component แสดงกราฟเส้นกิจกรรมผู้ใช้งาน
 * 
 * @param {Object} props
 * @param {Array} props.data - ข้อมูลสำหรับแสดงกราฟ
 */
const UserActivityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="ไม่มีข้อมูลสำหรับการแสดงกราฟ" />;
  }

  // Custom Tooltip สำหรับแสดงเมื่อ hover ที่กราฟ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{formatThaiDate(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-gray-600">
              {getActivityLabel(entry.name)}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Helper function to get appropriate activity label
  const getActivityLabel = (activityName) => {
    const labels = {
      logins: 'การเข้าสู่ระบบ',
      projects: 'โปรเจคใหม่',
      reviews: 'การตรวจสอบ'
    };
    return labels[activityName] || activityName;
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => {
              // Format date to be shorter on x-axis
              const date = new Date(tick);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="logins" 
            name="การเข้าสู่ระบบ" 
            stroke="#1890ff" 
            activeDot={{ r: 8 }} 
          />
          <Line 
            type="monotone" 
            dataKey="projects" 
            name="โปรเจคใหม่" 
            stroke="#52c41a" 
          />
          <Line 
            type="monotone" 
            dataKey="reviews" 
            name="การตรวจสอบ" 
            stroke="#722ed1" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserActivityChart;