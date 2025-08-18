import React from 'react';
import { Form, DatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/th_TH';

const { RangePicker } = DatePicker;

const DateRangeField = ({
  name = 'dateRange',
  label = 'ช่วงวันที่',
  format = 'DD/MM/YYYY',
  placeholder = ['วันเริ่มต้น', 'วันสิ้นสุด'],
  ...rest
}) => {
  return (
    <Form.Item label={label} name={name}>
      <RangePicker
        style={{ width: '100%' }}
        format={format}
        locale={locale}
        placeholder={placeholder}
        {...rest}
      />
    </Form.Item>
  );
};

export default DateRangeField;