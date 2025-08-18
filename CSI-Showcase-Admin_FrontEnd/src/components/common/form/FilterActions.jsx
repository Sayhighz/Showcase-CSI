import React from 'react';
import { Button, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';

const FilterActions = ({
  onReset,
  loading = false,
  resetLabel = 'รีเซ็ต',
  submitLabel = 'กรองข้อมูล',
  align = 'right',
}) => {
  return (
    <div className={`flex justify-${align} mt-4`}>
      <Space>
        <Button icon={<ClearOutlined />} onClick={onReset}>
          {resetLabel}
        </Button>
        <Button type="primary" htmlType="submit" icon={<FilterOutlined />} loading={loading}>
          {submitLabel}
        </Button>
      </Space>
    </div>
  );
};

export default FilterActions;