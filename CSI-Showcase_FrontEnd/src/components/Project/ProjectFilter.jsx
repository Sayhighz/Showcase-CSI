import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Space, Typography, Card, Row, Col, Input } from 'antd';
import { FilterOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { PROJECT_TYPES } from '../../constants/projectTypes';

const { Option } = Select;
const { Title } = Typography;

/**
 * ProjectFilter component ใช้สำหรับกรองโปรเจคตามเงื่อนไขต่างๆ
 * 
 * @param {Object} props - Props ของ component
 * @param {Array} props.projectTypes - รายการประเภทของโปรเจค
 * @param {Array} props.projectYears - รายการปีของโปรเจค
 * @param {Array} props.studyYears - รายการชั้นปีของผู้สร้างโปรเจค
 * @param {Object} props.initialValues - ค่าเริ่มต้นของฟิลเตอร์
 * @param {Function} props.onFilterChange - ฟังก์ชันที่จะทำงานเมื่อฟิลเตอร์เปลี่ยนแปลง
 * @param {Function} props.onSearch - ฟังก์ชันที่จะทำงานเมื่อค้นหา
 * @param {Function} props.onReset - ฟังก์ชันที่จะทำงานเมื่อรีเซ็ตฟิลเตอร์
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {boolean} props.showSearch - แสดงช่องค้นหาหรือไม่
 * @param {string} props.layout - รูปแบบการแสดงผล ('inline', 'horizontal', 'vertical')
 * @returns {JSX.Element} ProjectFilter component
 */
const ProjectFilter = ({
  projectTypes = PROJECT_TYPES,
  projectYears = [],
  studyYears = [],
  initialValues = {},
  onFilterChange,
  onSearch,
  onReset,
  loading = false,
  showSearch = true,
  layout = 'horizontal'
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(initialValues.keyword || '');

  // รีเซ็ตค่าฟอร์มเมื่อ initialValues เปลี่ยนแปลง
  useEffect(() => {
    form.setFieldsValue(initialValues);
    setSearchKeyword(initialValues.keyword || '');
  }, [form, initialValues]);

  // ฟังก์ชันสำหรับการกรองข้อมูล
  const handleFilterChange = (changedValues, allValues) => {
    if (onFilterChange) {
      onFilterChange(allValues);
    }
  };

  // ฟังก์ชันสำหรับการค้นหา
  const handleSearch = () => {
    const values = form.getFieldsValue();
    values.keyword = searchKeyword;
    
    if (onSearch) {
      onSearch(values);
    }
  };

  // ฟังก์ชันสำหรับการรีเซ็ตฟิลเตอร์
  const handleReset = () => {
    form.resetFields();
    setSearchKeyword('');
    
    if (onReset) {
      onReset();
    }
  };

  // สร้างรายการตัวเลือกปีโปรเจค
  const yearOptions = projectYears.map(year => (
    <Option key={year} value={year}>{year}</Option>
  ));

  // สร้างรายการตัวเลือกชั้นปีของผู้สร้าง
  const studyYearOptions = studyYears.map(year => (
    <Option key={year} value={year}>ปี {year}</Option>
  ));

  // Layout สำหรับฟอร์มที่แตกต่างกัน
  const getFormLayout = () => {
    switch (layout) {
      case 'inline':
        return {
          layout: 'inline',
          labelCol: undefined,
          wrapperCol: undefined
        };
      case 'vertical':
        return {
          layout: 'vertical',
          labelCol: undefined,
          wrapperCol: undefined
        };
      case 'horizontal':
      default:
        return {
          layout: 'horizontal',
          labelCol: { span: 8 },
          wrapperCol: { span: 16 }
        };
    }
  };

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        <FilterOutlined /> ตัวกรองโปรเจค
      </Title>
      
      {showSearch && (
        <Input.Search
          placeholder="ค้นหาโปรเจค"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          loading={loading}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        {...getFormLayout()}
        initialValues={initialValues}
        onValuesChange={handleFilterChange}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={expanded ? 12 : 24} md={expanded ? 8 : 12} lg={expanded ? 6 : 8}>
            <Form.Item
              name="type"
              label="ประเภทโปรเจค"
              labelCol={layout === 'horizontal' ? { span: 8 } : undefined}
              wrapperCol={layout === 'horizontal' ? { span: 16 } : undefined}
            >
              <Select
                placeholder="เลือกประเภทโปรเจค"
                allowClear
                loading={loading}
              >
                {projectTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.emoji} {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={expanded ? 12 : 24} md={expanded ? 8 : 12} lg={expanded ? 6 : 8}>
            <Form.Item
              name="year"
              label="ปีของโปรเจค"
              labelCol={layout === 'horizontal' ? { span: 8 } : undefined}
              wrapperCol={layout === 'horizontal' ? { span: 16 } : undefined}
            >
              <Select
                placeholder="เลือกปีของโปรเจค"
                allowClear
                loading={loading}
              >
                {yearOptions}
              </Select>
            </Form.Item>
          </Col>
          
          {expanded && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="studyYear"
                label="ชั้นปีของผู้สร้าง"
                labelCol={layout === 'horizontal' ? { span: 8 } : undefined}
                wrapperCol={layout === 'horizontal' ? { span: 16 } : undefined}
              >
                <Select
                  placeholder="เลือกชั้นปีของผู้สร้าง"
                  allowClear
                  loading={loading}
                >
                  {studyYearOptions}
                </Select>
              </Form.Item>
            </Col>
          )}
          
          {expanded && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="tags"
                label="แท็ก"
                labelCol={layout === 'horizontal' ? { span: 8 } : undefined}
                wrapperCol={layout === 'horizontal' ? { span: 16 } : undefined}
              >
                <Select
                  placeholder="เลือกแท็ก"
                  mode="tags"
                  allowClear
                  loading={loading}
                />
              </Form.Item>
            </Col>
          )}
        </Row>
        
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="link"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'ซ่อนตัวกรองเพิ่มเติม' : 'แสดงตัวกรองเพิ่มเติม'}
          </Button>
          
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={loading}
            >
              รีเซ็ต
            </Button>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              กรอง
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
};

export default ProjectFilter;