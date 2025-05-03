import React, { useState, useEffect } from 'react';
import { Card, Tooltip, Spin, Empty, Radio } from 'antd';
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Sector } from 'recharts';
import { createProjectTypeChartData, getCategoryName, getCategoryColor } from '../../utils/projectUtils';

// คอมโพเนนต์สำหรับแสดงส่วนที่ active ใน Pie Chart
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  return (
    <g>
      <Tooltip title={`${payload.name}: ${value} (${(percent * 100).toFixed(0)}%)`} />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

const ProjectTypeChart = ({
  projects = [],
  loading = false,
  error = null,
  title = 'ประเภทโครงงาน',
  height = 300,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('count'); // 'count' หรือ 'views'

  // สร้างข้อมูลสำหรับแผนภูมิ
  useEffect(() => {
    if (!projects || projects.length === 0) {
      setChartData([]);
      return;
    }

    let data = [];
    
    if (chartType === 'count') {
      data = createProjectTypeChartData(projects);
    } else {
      // สร้างข้อมูลสำหรับแสดงจำนวนการเข้าชม
      const viewsByType = projects.reduce((acc, project) => {
        const type = project.type || 'unknown';
        acc[type] = (acc[type] || 0) + (project.views_count || 0);
        return acc;
      }, {});

      data = Object.keys(viewsByType).map(type => ({
        name: getCategoryName(type),
        value: viewsByType[type],
        fill: getCategoryColor(type)
      }));
    }

    setChartData(data);
  }, [projects, chartType]);

  // จัดการเมื่อมีการ hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // จัดการเมื่อเปลี่ยนประเภทแผนภูมิ
  const handleChartTypeChange = e => {
    setChartType(e.target.value);
  };

  // แสดง loading
  if (loading) {
    return (
      <Card title={title} className="h-full">
        <div className="flex items-center justify-center h-64">
          <Spin tip="กำลังโหลดข้อมูล..." />
        </div>
      </Card>
    );
  }

  // แสดงเมื่อไม่มีข้อมูล
  if (!chartData || chartData.length === 0) {
    return (
      <Card title={title} className="h-full">
        <div className="flex items-center justify-center h-64">
          <Empty description="ไม่มีข้อมูลสำหรับแสดงผล" />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={title} 
      className="h-full"
      extra={
        <Radio.Group
          value={chartType}
          onChange={handleChartTypeChange}
          size="small"
          buttonStyle="solid"
        >
          <Radio.Button value="count">จำนวนโครงงาน</Radio.Button>
          <Radio.Button value="views">จำนวนการเข้าชม</Radio.Button>
        </Radio.Group>
      }
    >
      <div style={{ height: height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill || `#${((1 << 24) * Math.random() | 0).toString(16)}`} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProjectTypeChart;