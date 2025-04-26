import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Space, Typography, Card, Row, Col, Input, Tooltip } from 'antd';
import { FilterOutlined, ReloadOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
    console.log('🔄 รีเซ็ตฟอร์มด้วยค่า:', initialValues);
    
    // สำหรับ category/type
    let categoryValue = null;
    if (initialValues.category !== undefined) {
      categoryValue = initialValues.category;
    } else if (initialValues.type !== undefined) {
      categoryValue = initialValues.type;
    }
    
    // สำหรับ level/studyYear
    let levelValue = null;
    if (initialValues.level !== undefined) {
      levelValue = initialValues.level;
    } else if (initialValues.studyYear !== undefined) {
      levelValue = initialValues.studyYear;
    }
    
    form.setFieldsValue({
      category: categoryValue,
      year: initialValues.year || null,
      level: levelValue,
      // ใช้ studyYear ในฟอร์มเพื่อความเข้ากันได้กับ component เดิม
      studyYear: levelValue,
      // ใช้ type ในฟอร์มเพื่อความเข้ากันได้กับ component เดิม
      type: categoryValue
    });
    
    setSearchKeyword(initialValues.keyword || '');
  }, [form, initialValues]);

  // ฟังก์ชันสำหรับการกรองข้อมูล
  const handleFilterChange = (changedValues, allValues) => {
    console.log('🔍 ค่าที่เปลี่ยนแปลง:', changedValues);
    console.log('🔍 ค่าทั้งหมดในฟอร์ม:', allValues);
    
    if (!onFilterChange) return;
    
    // แปลงค่าให้ตรงกับที่ API ต้องการ
    const filters = {};
    
    // จัดการกับ category/type
    if ('type' in changedValues) {
      filters.category = changedValues.type;
    } else if ('category' in changedValues) {
      filters.category = changedValues.category;
    }
    
    // จัดการกับ level/studyYear
    if ('studyYear' in changedValues) {
      filters.level = changedValues.studyYear;
    } else if ('level' in changedValues) {
      filters.level = changedValues.level;
    }
    
    // จัดการกับ year
    if ('year' in changedValues) {
      filters.year = changedValues.year;
    }
    
    console.log('🔍 ส่งค่าตัวกรองไปยัง onFilterChange:', filters);
    onFilterChange(filters);
  };

  // ฟังก์ชันสำหรับการค้นหา
  const handleSearch = () => {
    if (loading) return;
    
    const values = form.getFieldsValue();
    
    // แปลงค่าให้ตรงกับที่ API ต้องการ
    const filters = {};
    
    // จัดการกับ category/type
    if (values.type) {
      filters.category = values.type;
    } else if (values.category) {
      filters.category = values.category;
    }
    
    // จัดการกับ level/studyYear
    if (values.studyYear) {
      filters.level = values.studyYear;
    } else if (values.level) {
      filters.level = values.level;
    }
    
    // จัดการกับ year และ keyword
    if (values.year) {
      filters.year = values.year;
    }
    
    filters.keyword = searchKeyword;
    
    console.log('🔍 ค้นหาด้วยค่า:', filters);
    
    if (onSearch) {
      onSearch(filters);
    }
  };

  // ฟังก์ชันสำหรับการรีเซ็ตฟิลเตอร์
  const handleReset = () => {
    if (loading) return;
    
    form.resetFields();
    setSearchKeyword('');
    
    if (onReset) {
      onReset();
    }
  };

  // สร้างรายการตัวเลือกปีโปรเจค
  const yearOptions = projectYears.length > 0 
    ? projectYears.map(year => (
        <Option key={year} value={year}>{year}</Option>
      ))
    : Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return <Option key={year} value={year}>{year}</Option>;
      });

  // สร้างรายการตัวเลือกชั้นปีของผู้สร้าง
  const studyYearOptions = studyYears.length > 0
    ? studyYears.map(year => (
        <Option key={year} value={year}>ปี {year}</Option>
      ))
    : [1, 2, 3, 4].map(year => (
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
    <Card className="project-filter-card" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <Title level={4} style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <FilterOutlined style={{ marginRight: 8, color: '#1890ff' }} /> 
        ตัวกรองโปรเจค
        <Tooltip title="เลือกตัวกรองเพื่อค้นหาโปรเจคที่ต้องการ">
          <InfoCircleOutlined style={{ marginLeft: 8, color: '#999', fontSize: 16 }} />
        </Tooltip>
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
          onSearch={() => handleSearch()}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        {...getFormLayout()}
        initialValues={{
          type: initialValues.category || initialValues.type || null,
          year: initialValues.year || null,
          studyYear: initialValues.level || initialValues.studyYear || null
        }}
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
                showSearch
                optionFilterProp="children"
                className="custom-select"
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
                showSearch
                optionFilterProp="children"
                className="custom-select"
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
                  className="custom-select"
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
                  className="custom-select"
                />
              </Form.Item>
            </Col>
          )}
        </Row>
        
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="link"
            onClick={() => setExpanded(!expanded)}
            style={{ padding: 0 }}
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