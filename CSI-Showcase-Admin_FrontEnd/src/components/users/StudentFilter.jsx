import React from 'react';
import { Input, Select, Button } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined 
} from '@ant-design/icons';

const { Option } = Select;

const StudentFilter = ({ 
    filters, 
    setFilters, 
    handleResetFilters 
  }) => {
    return (
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <Input
          placeholder="ค้นหานักศึกษา"
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          allowClear
        />
        
        <Select
          placeholder="ชั้นปี"
          value={filters.studyYear}
          onChange={(value) => setFilters({...filters, studyYear: value})}
          style={{ width: 120 }}
          allowClear
        >
          <Option value="1">ปี 1</Option>
          <Option value="2">ปี 2</Option>
          <Option value="3">ปี 3</Option>
          <Option value="4">ปี 4</Option>
        </Select>
        
        <Button 
          icon={<FilterOutlined />} 
          onClick={handleResetFilters}
        >
          ล้างตัวกรอง
        </Button>
      </div>
  );
};

export default StudentFilter;