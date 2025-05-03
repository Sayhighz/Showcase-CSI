import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, Select, Tooltip } from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { createProjectStatusChartData, getStatusName, getStatusColor } from '../../utils/projectUtils';

const { Option } = Select;

// คอมโพเนนต์ tooltip ที่กำหนดเอง
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md">
        <p className="font-medium text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center mt-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.fill }}
            ></div>
            <span className="text-gray-800">{entry.name}: </span>
            <span className="ml-1 font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const ProjectStatusChart = ({
  projects = [],
  loading = false,
  error = null,
  title = 'สถานะโครงงาน',
  height = 300,
}) => {
  const [chartData, setChartData] = useState([]);
  const [displayType, setDisplayType] = useState('status'); // 'status' หรือ 'month'

  // สร้างข้อมูลสำหรับแผนภูมิ
  useEffect(() => {
    if (!projects || projects.length === 0) {
      setChartData([]);
      return;
    }

    let data = [];
    
    if (displayType === 'status') {
      // แสดงตามสถานะ
      data = createProjectStatusChartData(projects);
    } else {
      // แสดงตามเดือน
      const monthlyData = projects.reduce((acc, project) => {
        const createdAt = new Date(project.created_at);
        const month = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[month]) {
          acc[month] = {
            month,
            pending: 0,
            approved: 0,
            rejected: 0,
          };
        }
        
        const status = project.status || 'pending';
        acc[month][status] += 1;
        
        return acc;
      }, {});
      
      // แปลงเป็นอาร์เรย์และเรียงตามเดือน
      data = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
      
      // แปลงชื่อเดือนให้อ่านง่ายขึ้น
      data = data.map(item => {
        const [year, month] = item.month.split('-');
        const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return {
          ...item,
          month: `${monthNames[parseInt(month) - 1]} ${parseInt(year) + 543}`
        };
      });
    }

    setChartData(data);
  }, [projects, displayType]);

  // จัดการเมื่อเปลี่ยนประเภทการแสดงผล
  const handleDisplayTypeChange = value => {
    setDisplayType(value);
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
        <Select
          defaultValue={displayType}
          onChange={handleDisplayTypeChange}
          style={{ width: 150 }}
          size="small"
        >
          <Option value="status">แสดงตามสถานะ</Option>
          <Option value="month">แสดงตามเดือน</Option>
        </Select>
      }
    >
      <div style={{ height: height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={displayType === 'status' ? 'name' : 'month'} 
              style={{ fontSize: '12px' }}
            />
            <YAxis style={{ fontSize: '12px' }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            {displayType === 'status' ? (
              <Bar 
                dataKey="value" 
                name="จำนวนโครงงาน" 
                fill="#90278E" 
              />
            ) : (
              <>
                <Bar dataKey="pending" name={getStatusName('pending')} fill={getStatusColor('pending')} />
                <Bar dataKey="approved" name={getStatusName('approved')} fill={getStatusColor('approved')} />
                <Bar dataKey="rejected" name={getStatusName('rejected')} fill={getStatusColor('rejected')} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProjectStatusChart;