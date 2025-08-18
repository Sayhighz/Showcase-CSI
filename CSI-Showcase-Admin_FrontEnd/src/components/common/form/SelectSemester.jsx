import React from 'react';
import { Form, Select } from 'antd';

const { Option } = Select;

const SelectSemester = ({
  name = 'semester',
  label = 'ภาคการศึกษา',
  allowClear = true,
  ...rest
}) => {
  return (
    <Form.Item label={label} name={name}>
      <Select placeholder="เลือกภาคการศึกษา" allowClear={allowClear} {...rest}>
        <Option value="1">ภาคต้น</Option>
        <Option value="2">ภาคปลาย</Option>
        <Option value="3">ภาคฤดูร้อน</Option>
      </Select>
    </Form.Item>
  );
};

export default SelectSemester;