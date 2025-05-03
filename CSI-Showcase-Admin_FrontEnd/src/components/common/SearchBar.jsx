import React, { useState } from 'react';
import { Input, Button, Tooltip } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { Search } = Input;

const SearchBar = ({ 
  placeholder = 'ค้นหา...',
  allowClear = true,
  onSearch,
  onChange,
  loading = false,
  style = {},
  size = 'middle',
  defaultValue = '',
  className = '',
  width = '100%',
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setValue('');
    
    if (onChange) {
      onChange('');
    }
    
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`flex items-center ${className}`} style={{ width }}>
      <Search
        placeholder={placeholder}
        allowClear={allowClear}
        onChange={handleChange}
        onSearch={handleSearch}
        value={value}
        loading={loading}
        size={size}
        style={{ 
          ...style,
          width: '100%',
        }}
        enterButton={
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            loading={loading}
          >
            ค้นหา
          </Button>
        }
      />
      
      {value && (
        <Tooltip title="ล้างการค้นหา">
          <Button
            className="ml-2"
            icon={<ClearOutlined />}
            onClick={handleClear}
            size={size}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default SearchBar;