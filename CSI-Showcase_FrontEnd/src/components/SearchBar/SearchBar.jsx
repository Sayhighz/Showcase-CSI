import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const SearchBar = () => {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl px-4">
      <div className="bg-white rounded flex items-center px-4 py-2 w-full">
        {/* Select สำหรับเลือกสาขา */}
        <Select
          defaultValue="สาขา"
          className="w-24 border-none outline-none focus:outline-none"
        >
          <Option value="สาขา">สาขา</Option>
          <Option value="อื่นๆ">อื่นๆ</Option>
        </Select>

        {/* Input ช่องค้นหา */}
        <Input
          placeholder="ค้นหาความ..."
          className="flex-1 border-none focus:outline-none"
        />

        {/* ปุ่มค้นหา */}
        <Button
          type="primary"
          icon={<SearchOutlined />}
          className="bg-[#90278E] hover:bg-[#6d216c] border-none"
        >
          ค้นหา
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
