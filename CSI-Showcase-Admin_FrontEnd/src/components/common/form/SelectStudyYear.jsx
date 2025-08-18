import React from 'react';
import { Form, Select } from 'antd';

const { Option } = Select;

const SelectStudyYear = ({
  name = 'studyYear',
  label = 'ชั้นปี',
  allowClear = true,
  years = [1, 2, 3, 4],
  ...rest
}) => {
  return (
    <Form.Item label={label} name={name}>
      <Select placeholder="เลือกชั้นปี" allowClear={allowClear} {...rest}>
        {years.map((y) => (
          <Option key={y} value={String(y)}>
            ปี {y}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SelectStudyYear;