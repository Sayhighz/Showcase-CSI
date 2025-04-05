import React from 'react';
import { Input, Select, Button } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined 
} from '@ant-design/icons';

const { Option } = Select;

const AdminFilter = ({ 
  filters, 
  setFilters, 
  handleResetFilters 
}) => {
  return (
    <div className="mb-4 flex flex-wrap gap-4 items-center">
      <Input
        placeholder="ค้นหาผู้ดูแลระบบ"
        value={filters.search}
        onChange={(e) => setFilters({...filters, search: e.target.value})}
        prefix={<SearchOutlined />}
        style={{ width: 200 }}
        allowClear
      />
    
      
      <Button 
        icon={<FilterOutlined />} 
        onClick={handleResetFilters}
      >
        ล้างตัวกรอง
      </Button>
    </div>
  );
};

export default AdminFilter;