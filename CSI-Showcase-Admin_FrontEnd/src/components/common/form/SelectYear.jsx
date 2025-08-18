import React from 'react';
import { Form, Select } from 'antd';

const { Option } = Select;

const SelectYear = ({
  name = 'year',
  label = 'ปีการศึกษา',
  yearsBack = 5,
  valueType = 'string', // 'string' or 'number'
  ...rest
}) => {
  const currentThaiYear = new Date().getFullYear() + 543;
  const yearOptions = Array.from({ length: yearsBack }, (_, i) => currentThaiYear - i);
  return (
    <Form.Item label={label} name={name}>
      <Select placeholder="เลือกปีการศึกษา" allowClear {...rest}>
        {yearOptions.map((year) => (
          <Option key={year} value={valueType === 'number' ? year : String(year)}>
            {year}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SelectYear;