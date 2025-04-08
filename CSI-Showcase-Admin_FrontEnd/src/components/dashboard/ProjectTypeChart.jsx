// src/components/dashboard/ProjectTypeChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Empty } from 'antd';
import { PROJECT_TYPE_NAMES, PROJECT_TYPE_COLORS } from '../../constants/projectConstants';

/**
 * Component แสดงกราฟวงกลมสัดส่วนประเภทโปรเจค
 * 
 * @param {Object} props
 * @param {Array} props.data - ข้อมูลสำหรับแสดงกราฟ
 */
const ProjectTypeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="ไม่มีข้อมูลสำหรับการแสดงกราฟ" />;
  }

//   const data = Array.isArray(data) ? data : [];
  

  // เตรียมข้อมูลสำหรับแสดงกราฟ
  const chartData = data.map(item => ({
    name: PROJECT_TYPE_NAMES[item.type] || item.type,
    value: item.count,
    color: PROJECT_TYPE_COLORS[item.type] || '#8884d8'
  }));

  // Custom Tooltip สำหรับแสดงเมื่อ hover ที่กราฟ
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-gray-600">
            จำนวน: <span className="font-medium">{payload[0].value}</span> โปรเจค
          </p>
          <p className="text-gray-600">
            สัดส่วน: <span className="font-medium">
              {((payload[0].value / data.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectTypeChart;