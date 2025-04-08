import React from 'react';
import { Card, Form, Input, Select, Button, Space, Row, Col, Divider, Typography } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  TagOutlined
} from '@ant-design/icons';
import { 
  PROJECT_TYPE_NAMES, 
  PROJECT_STATUS_NAMES
} from '../../constants/projectConstants';
import { FILTER_LABELS } from '../../constants/thaiMessages';

const { Option } = Select;
const { Title } = Typography;

/**
 * Component สำหรับฟอร์มค้นหาและกรองข้อมูลโปรเจค
 * 
 * @param {Object} props
 * @param {Function} props.onFilterChange - ฟังก์ชันที่เรียกเมื่อมีการเปลี่ยนแปลงตัวกรอง
 * @param {Function} props.onReset - ฟังก์ชันที่เรียกเมื่อกดปุ่มรีเซ็ต
 * @param {Object} props.filters - ค่าตัวกรองปัจจุบัน
 * @param {Array} props.yearOptions - ตัวเลือกปีการศึกษา
 */
const ProjectFilter = ({ 
  onFilterChange, 
  onReset, 
  filters = {},
  yearOptions = [] 
}) => {
  const [form] = Form.useForm();

  // จัดการการเปลี่ยนแปลงค่าในฟอร์ม
  const handleValuesChange = (changedValues) => {
    if (onFilterChange) {
      onFilterChange(changedValues);
    }
  };

  // รีเซ็ตฟอร์ม
  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
  };

  return (
    <Card 
      className="mb-6 shadow-sm hover:shadow-md transition-all duration-300"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="mb-4 flex justify-between items-center">
        <Title level={5} style={{ margin: 0 }}>
          <FilterOutlined className="mr-2" />
          ตัวกรองการค้นหา
        </Title>
      </div>
      <Divider className="my-3" />
      
      <Form
        form={form}
        initialValues={filters}
        onValuesChange={handleValuesChange}
        layout="vertical"
        size="middle"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="search" label={FILTER_LABELS.SEARCH_PROJECT}>
              <Input 
                prefix={<SearchOutlined className="text-gray-400" />} 
                placeholder="ค้นหาตามชื่อ, คำอธิบาย, แท็ก"
                allowClear
                size="large"
                className="rounded-md"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="type" label={FILTER_LABELS.PROJECT_TYPE}>
              <Select 
                placeholder="เลือกประเภท" 
                allowClear
                size="large"
                suffixIcon={<AppstoreOutlined className="text-gray-400" />}
                className="rounded-md"
              >
                {Object.entries(PROJECT_TYPE_NAMES).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <div className="flex items-center">
                      <TagOutlined className="mr-2 text-gray-500" />
                      {value}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label={FILTER_LABELS.PROJECT_STATUS}>
              <Select 
                placeholder="เลือกสถานะ" 
                allowClear
                size="large"
                className="rounded-md"
              >
                {Object.entries(PROJECT_STATUS_NAMES).map(([key, value]) => (
                  <Option key={key} value={key}>{value}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="year" label={FILTER_LABELS.ACADEMIC_YEAR}>
              <Select 
                placeholder="เลือกปีการศึกษา" 
                allowClear
                size="large"
                suffixIcon={<CalendarOutlined className="text-gray-400" />}
                className="rounded-md"
              >
                {yearOptions.map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Divider className="my-2" />
            <div className="flex justify-end">
              <Space>
                <Button 
                  onClick={handleReset}
                  icon={<ReloadOutlined />}
                  size="large"
                  className="rounded-md"
                >
                  {FILTER_LABELS.RESET_FILTER}
                </Button>
                <Button 
                  type="primary" 
                  icon={<FilterOutlined />}
                  onClick={() => form.submit()}
                  size="large"
                  className="rounded-md shadow-sm hover:shadow"
                >
                  ใช้ตัวกรอง
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default ProjectFilter;