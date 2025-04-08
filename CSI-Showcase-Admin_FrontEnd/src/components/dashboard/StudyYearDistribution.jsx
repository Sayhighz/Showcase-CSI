// src/components/dashboard/StudyYearDistribution.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';
import { STUDY_YEAR_NAMES } from '../../constants/projectConstants';

/**
 * Component แสดงกราฟแท่งการกระจายตามชั้นปี
 * 
 * @param {Object} props
 * @param {Array} props.data - ข้อมูลสำหรับแสดงกราฟ
 */
const StudyYearDistribution = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="ไม่มีข้อมูลสำหรับการแสดงกราฟ" />;
  }

  // const data = Array.isArray(data) ? data : [];

  // เตรียมข้อมูลสำหรับแสดงกราฟ
  const chartData = data.map(item => ({
    name: STUDY_YEAR_NAMES[item.study_year] || `ปี ${item.study_year}`,
    count: item.count,
    fill: getColorForStudyYear(item.study_year)
  }));

  // Custom Tooltip สำหรับแสดงเมื่อ hover ที่กราฟ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{label}</p>
          <p className="text-gray-600">
            จำนวน: <span className="font-medium">{payload[0].value}</span> โปรเจค
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="จำนวนโปรเจค" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ฟังก์ชันกำหนดสีตามชั้นปี
const getColorForStudyYear = (studyYear) => {
  const colors = {
    1: '#1890ff', // สีฟ้า
    2: '#52c41a', // สีเขียว
    3: '#faad14', // สีเหลือง
    4: '#eb2f96'  // สีชมพู
  };
  
  return colors[studyYear] || '#8884d8'; // default color
};

export default StudyYearDistribution;