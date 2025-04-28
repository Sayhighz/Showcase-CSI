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
  const [currentFilters, setCurrentFilters] = useState(initialValues);

  // Debug log
  console.log('ProjectFilter rendered with initialValues:', initialValues);
  console.log('studyYears provided:', studyYears);

  // รีเซ็ตค่าฟอร์มเมื่อ initialValues เปลี่ยนแปลง
  useEffect(() => {
    console.log('🔄 รีเซ็ตฟอร์มด้วยค่า:', initialValues);
    
    // ตั้งค่า searchKeyword
    setSearchKeyword(initialValues.keyword || '');
    setCurrentFilters(initialValues);
    
    // สำหรับ category/type
    let categoryValue = null;
    if (initialValues.category !== undefined) {
      categoryValue = initialValues.category;
    } else if (initialValues.type !== undefined) {
      categoryValue = initialValues.type;
    }
    
    // สำหรับ level/studyYear - รองรับทั้งสองรูปแบบ
    let levelValue = null;
    if (initialValues.level !== undefined) {
      levelValue = initialValues.level;
    } else if (initialValues.studyYear !== undefined) {
      levelValue = initialValues.studyYear;
    }
    
    // ตั้งค่าฟอร์ม - เก็บทั้ง level และ studyYear ไว้ในฟอร์ม
    // เพื่อให้แน่ใจว่ามีการส่งค่าไปที่ API ทั้งสองรูปแบบ
    form.setFieldsValue({
      type: categoryValue,
      category: categoryValue,
      year: initialValues.year || null,
      level: levelValue,
      studyYear: levelValue,
      keyword: initialValues.keyword || ''
    });
    
    console.log('Form values after reset:', form.getFieldsValue());
  }, [form, initialValues]);

  // ฟังก์ชันสำหรับการกรองข้อมูล
  const handleFilterChange = (changedValues, allValues) => {
    console.log('🔍 ค่าที่เปลี่ยนแปลง:', changedValues);
    console.log('🔍 ค่าทั้งหมดในฟอร์ม:', allValues);
    
    if (!onFilterChange) return;
    
    // แปลงค่าให้ตรงกับที่ API ต้องการ
    const filters = { ...currentFilters };
    
    // จัดการกับ category/type - กรณีที่ผู้ใช้เปลี่ยนแปลงหนึ่งในสองฟิลด์
    if ('type' in changedValues) {
      filters.category = changedValues.type;
      filters.type = changedValues.type;
      
      // อัปเดตฟิลด์ category ในฟอร์มให้ตรงกัน
      form.setFieldValue('category', changedValues.type);
    } else if ('category' in changedValues) {
      filters.category = changedValues.category;
      filters.type = changedValues.category;
      
      // อัปเดตฟิลด์ type ในฟอร์มให้ตรงกัน
      form.setFieldValue('type', changedValues.category);
    }
    
    // จัดการกับ level/studyYear - กรณีที่ผู้ใช้เปลี่ยนแปลงหนึ่งในสองฟิลด์
    if ('studyYear' in changedValues) {
      filters.level = changedValues.studyYear;
      filters.studyYear = changedValues.studyYear;
      
      // อัปเดตฟิลด์ level ในฟอร์มให้ตรงกัน
      form.setFieldValue('level', changedValues.studyYear);
    } else if ('level' in changedValues) {
      filters.level = changedValues.level;
      filters.studyYear = changedValues.level;
      
      // อัปเดตฟิลด์ studyYear ในฟอร์มให้ตรงกัน
      form.setFieldValue('studyYear', changedValues.level);
    }
    
    // จัดการกับ year
    if ('year' in changedValues) {
      filters.year = changedValues.year;
    }
    
    // อัปเดต state
    setCurrentFilters(filters);
    
    console.log('🔍 ส่งค่าตัวกรองไปยัง onFilterChange:', filters);
    onFilterChange(filters);
  };

  // ฟังก์ชันสำหรับการค้นหา
  const handleSearch = () => {
    if (loading) return;
    
    const values = form.getFieldsValue();
    console.log('Search with form values:', values);
    
    // แปลงค่าให้ตรงกับที่ API ต้องการ
    const filters = { ...currentFilters };
    
    // จัดการกับ category/type
    if (values.type) {
      filters.category = values.type;
      filters.type = values.type;
    } else if (values.category) {
      filters.category = values.category;
      filters.type = values.category;
    }
    
    // จัดการกับ level/studyYear
    if (values.studyYear) {
      filters.level = values.studyYear;
      filters.studyYear = values.studyYear;
    } else if (values.level) {
      filters.level = values.level;
      filters.studyYear = values.level;
    }
    
    // จัดการกับ year และ keyword
    if (values.year) {
      filters.year = values.year;
    }
    
    filters.keyword = searchKeyword;
    
    // อัปเดต state
    setCurrentFilters(filters);
    
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
    
    const resetFilters = {
      category: null,
      type: null,
      year: null,
      level: null,
      studyYear: null,
      keyword: ''
    };
    
    setCurrentFilters(resetFilters);
    
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
        onValuesChange={handleFilterChange}
        className="project-filter-form"
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
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
                >
                  {studyYearOptions}
                </Select>
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

        {/* Hidden form fields to maintain state compatibility with both naming conventions */}
        <Form.Item name="category" hidden={true}>
          <Input />
        </Form.Item>
        <Form.Item name="level" hidden={true}>
          <Input />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProjectFilter;