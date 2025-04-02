import React from 'react';
import { Input, Select, Button, Space, DatePicker } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ProjectReviewFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  filters, 
  setFilters, 
  handleResetFilters 
}) => {
  return (
    <div className="mb-4 flex flex-wrap gap-4 items-center">
      <Input
        placeholder="ค้นหาโปรเจค"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        prefix={<SearchOutlined />}
        style={{ width: 200 }}
        allowClear
      />
      
      <Space wrap>
        <Select
          placeholder="ประเภทโปรเจค"
          value={filters.type}
          onChange={(value) => setFilters({...filters, type: value})}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="academic">บทความวิชาการ</Option>
          <Option value="coursework">ผลงานการเรียน</Option>
          <Option value="competition">การแข่งขัน</Option>
        </Select>
        
        <RangePicker 
          placeholder={['วันที่เริ่มต้น', 'วันที่สิ้นสุด']}
          onChange={(dates) => {
            if (dates) {
              setFilters({
                ...filters, 
                startDate: dates[0]?.toDate(), 
                endDate: dates[1]?.toDate()
              });
            } else {
              setFilters({...filters, startDate: null, endDate: null});
            }
          }}
        />
        
        <Button 
          icon={<FilterOutlined />} 
          onClick={handleResetFilters}
        >
          ล้างตัวกรอง
        </Button>
      </Space>
    </div>
  );
};

export default ProjectReviewFilter;