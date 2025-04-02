import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

/**
 * คอมโพเนนต์สำหรับการกรองและค้นหาโปรเจค
 */
const ProjectFilter = ({ 
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
      
      <Select
        placeholder="ประเภทโปรเจค"
        value={filters.type}
        onChange={(value) => setFilters({ ...filters, type: value })}
        style={{ width: 150 }}
        allowClear
      >
        <Option value="academic">บทความวิชาการ</Option>
        <Option value="coursework">ผลงานการเรียน</Option>
        <Option value="competition">การแข่งขัน</Option>
      </Select>
      
      <Select
        placeholder="ปีการศึกษา"
        value={filters.year}
        onChange={(value) => setFilters({ ...filters, year: value })}
        style={{ width: 120 }}
        allowClear
      >
        <Option value="2568">2568</Option>
        <Option value="2567">2567</Option>
        <Option value="2566">2566</Option>
        <Option value="2565">2565</Option>
      </Select>
      
      <Select
        placeholder="ชั้นปี"
        value={filters.studyYear}
        onChange={(value) => setFilters({ ...filters, studyYear: value })}
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

export default ProjectFilter;