import React, { useState, useMemo, memo } from 'react';
import { Card, Spin, Empty, Radio } from 'antd';
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Sector, Tooltip as RechartsTooltip } from 'recharts';
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
  } = props;

  return (
    <g>
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
  title = 'ประเภทโครงงาน',
  height = 300,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartType, setChartType] = useState('count'); // 'count' หรือ 'views'

  const chartData = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [];
    }

    let data = [];
    
    if (chartType === 'count') {
      data = createProjectTypeChartData(projects);
    } else {
      // สร้างข้อมูลสำหรับแสดงจำนวนการเข้าชม
      // ตรวจสอบว่าโปรเจคมีฟิลด์ views_count หรือไม่
      const hasViewsCount = projects.some(project => project.views_count !== undefined);
      
      if (!hasViewsCount) {
        // หากไม่มีฟิลด์ views_count ให้ใช้ค่าเริ่มต้นเป็น 0
        const viewsByType = projects.reduce((acc, project) => {
          const type = project.type || 'unknown';
          acc[type] = (acc[type] || 0) + 0; // ใช้ค่าเริ่มต้นเป็น 0
          return acc;
        }, {});

        data = Object.keys(viewsByType).map(type => ({
          name: getCategoryName(type),
          value: viewsByType[type],
          fill: getCategoryColor(type)
        }));
      } else {
        // กรณีมีฟิลด์ views_count
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
    }

    return data;
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
              isAnimationActive={false}
              onMouseEnter={onPieEnter}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill || `#${((1 << 24) * Math.random() | 0).toString(16)}`} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default memo(ProjectTypeChart);