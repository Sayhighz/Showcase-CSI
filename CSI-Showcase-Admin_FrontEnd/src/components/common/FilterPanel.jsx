import React, { useState } from 'react';
import { Form, Select, DatePicker, Button, Card, Row, Col, Divider, Space, Typography } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/th_TH';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FilterPanel = ({
  filters = [],
  onFilter,
  onReset,
  loading = false,
  initialValues = {},
  title = 'ตัวกรองข้อมูล',
  collapsed = false,
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(!collapsed);

  // เรียกใช้ฟังก์ชัน filter เมื่อกดปุ่มค้นหา
  const handleFinish = (values) => {
    if (onFilter) {
      onFilter(values);
    }
  };

  // รีเซ็ตค่าทั้งหมดในฟอร์ม
  const handleReset = () => {
    form.resetFields();
    
    if (onReset) {
      onReset();
    }
  };

  // สลับระหว่างแสดง/ซ่อนตัวกรอง
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card 
      className="mb-4 shadow-sm"
      style={{ borderRadius: '8px' }}
      bodyStyle={{ padding: expanded ? '16px' : '12px' }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <FilterOutlined className="mr-2 text-purple-700" />
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
        </div>
        <Button 
          type="text" 
          onClick={toggleExpanded}
          size="small"
        >
          {expanded ? 'ย่อ' : 'ขยาย'}
        </Button>
      </div>
      
      {expanded && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={initialValues}
          >
            <Row gutter={[16, 16]}>
              {filters.map((filter) => (
                <Col xs={24} sm={12} md={8} lg={6} key={filter.name}>
                  <Form.Item 
                    label={filter.label} 
                    name={filter.name}
                    tooltip={filter.tooltip}
                  >
                    {filter.type === 'select' && (
                      <Select 
                        placeholder={filter.placeholder || `เลือก${filter.label}`}
                        allowClear={filter.allowClear !== false}
                        showSearch={filter.showSearch !== false}
                        mode={filter.mode}
                        optionFilterProp="children"
                      >
                        {filter.options.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    )}
                    
                    {filter.type === 'date' && (
                      <DatePicker 
                        style={{ width: '100%' }}
                        format={filter.format || 'DD/MM/YYYY'}
                        locale={locale}
                        placeholder={filter.placeholder || 'เลือกวันที่'}
                      />
                    )}
                    
                    {filter.type === 'dateRange' && (
                      <RangePicker 
                        style={{ width: '100%' }}
                        format={filter.format || 'DD/MM/YYYY'}
                        locale={locale}
                        placeholder={filter.placeholder || ['เริ่มต้น', 'สิ้นสุด']}
                      />
                    )}
                    
                    {filter.type === 'custom' && filter.render && filter.render()}
                  </Form.Item>
                </Col>
              ))}
            </Row>
            
            <div className="flex justify-end mt-4">
              <Space>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={handleReset}
                >
                  รีเซ็ต
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<FilterOutlined />}
                  loading={loading}
                >
                  กรองข้อมูล
                </Button>
              </Space>
            </div>
          </Form>
        </>
      )}
    </Card>
  );
};

export default FilterPanel;