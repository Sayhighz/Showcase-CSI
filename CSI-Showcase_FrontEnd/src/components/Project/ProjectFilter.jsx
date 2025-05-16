import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Select, Button, Space, Typography, Card, Row, Col, Input, Tooltip } from 'antd';
import { FilterOutlined, ReloadOutlined, SearchOutlined, InfoCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT_TYPES } from '../../constants/projectTypes';

const { Option } = Select;
const { Title } = Typography;

// CSS Variables สำหรับสีหลักตามธีม - ย้ายออกมานอก component เพื่อหลีกเลี่ยงการสร้างใหม่ทุกรอบ
const themeColors = {
  primary: '#90278E',        // สีม่วงเข้ม
  secondary: '#B252B0',      // สีม่วงอ่อน
  dark: '#5E1A5C',           // สีม่วงเข้มมาก
  lightPurple: '#F5EAFF',    // สีม่วงอ่อนมาก (background)
  mediumPurple: '#E0D1FF',   // สีม่วงกลาง
  textLight: '#FFE6FF',      // สีตัวอักษรบนพื้นเข้ม
  textSecondary: '#F8CDFF'   // สีตัวอักษรรอง
};

// Animation variants for hover effect - คงที่ไม่ควรสร้างใหม่ทุกครั้ง
const cardHoverAnimation = {
  hover: {
    boxShadow: '0 8px 24px rgba(144, 39, 142, 0.15)',
    y: -3,
    transition: { duration: 0.3 }
  },
  initial: {
    boxShadow: '0 4px 12px rgba(144, 39, 142, 0.06)',
    y: 0,
    transition: { duration: 0.3 }
  }
};

// ปรับแต่ง CSS สำหรับ Ant Design components - คงที่
const styleOverrides = `
  .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
    border-color: #90278E !important;
  }

  .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-color: #90278E !important;
    box-shadow: 0 0 0 2px rgba(144, 39, 142, 0.2) !important;
  }

  .ant-input:focus, .ant-input-focused {
    border-color: #90278E !important;
    box-shadow: 0 0 0 2px rgba(144, 39, 142, 0.2) !important;
  }

  .ant-input:hover {
    border-color: #90278E !important;
  }

  .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    background-color: rgba(144, 39, 142, 0.1) !important;
    color: #90278E !important;
  }

  .ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
    color: #90278E !important;
  }
`;

/**
 * ProjectFilter component ใช้สำหรับกรองโปรเจคตามเงื่อนไขต่างๆ
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
  const [isHovered, setIsHovered] = useState(false);
  
  // ใช้ useRef เพื่อเก็บค่า initialValues ล่าสุด และป้องกันการทำงานที่ไม่จำเป็น
  const previousInitialValues = React.useRef(initialValues);

  // รีเซ็ตค่าฟอร์มเมื่อ initialValues เปลี่ยนแปลง
  useEffect(() => {
    // ป้องกันการทำงานซ้ำเมื่อ initialValues ไม่เปลี่ยนแปลง
    if (JSON.stringify(previousInitialValues.current) === JSON.stringify(initialValues)) {
      return;
    }
    
    // อัปเดต ref
    previousInitialValues.current = initialValues;
    
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
    const newValues = {
      type: categoryValue,
      category: categoryValue,
      year: initialValues.year || null,
      level: levelValue,
      studyYear: levelValue,
      keyword: initialValues.keyword || ''
    };
    
    form.setFieldsValue(newValues);
    
    console.log('Form values after reset:', form.getFieldsValue());
  }, [form, initialValues]);

  // ฟังก์ชันสำหรับการกรองข้อมูล (ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ทุกครั้ง)
  const handleFilterChange = useCallback((changedValues, allValues) => {
    if (!onFilterChange) return;
    
    // คัดลอก currentFilters เพื่อให้แน่ใจว่าเราไม่แก้ไขค่าเดิม
    const filters = { ...currentFilters };
    const updatedFields = {};
    
    // จัดการกับ category/type - กรณีที่ผู้ใช้เปลี่ยนแปลงหนึ่งในสองฟิลด์
    if ('type' in changedValues) {
      filters.category = changedValues.type;
      filters.type = changedValues.type;
      updatedFields.category = changedValues.type;
    } else if ('category' in changedValues) {
      filters.category = changedValues.category;
      filters.type = changedValues.category;
      updatedFields.type = changedValues.category;
    }
    
    // จัดการกับ level/studyYear - กรณีที่ผู้ใช้เปลี่ยนแปลงหนึ่งในสองฟิลด์
    if ('studyYear' in changedValues) {
      filters.level = changedValues.studyYear;
      filters.studyYear = changedValues.studyYear;
      updatedFields.level = changedValues.studyYear;
    } else if ('level' in changedValues) {
      filters.level = changedValues.level;
      filters.studyYear = changedValues.level;
      updatedFields.studyYear = changedValues.level;
    }
    
    // จัดการกับ year
    if ('year' in changedValues) {
      filters.year = changedValues.year;
    }
    
    // อัปเดต state เฉพาะเมื่อจำเป็น
    setCurrentFilters(filters);
    
    // อัปเดตค่าในฟอร์มที่เปลี่ยนแปลงแบบเงียบๆ (ไม่ทริกเกอร์ onValuesChange อีก)
    if (Object.keys(updatedFields).length > 0) {
      // ทำแบบ batch เพื่อหลีกเลี่ยงการ render หลายครั้ง
      form.setFields(
        Object.entries(updatedFields).map(([name, value]) => ({
          name,
          value
        }))
      );
    }
    
    // แจ้ง parent component
    onFilterChange(filters);
  }, [currentFilters, onFilterChange, form]);

  // ฟังก์ชันสำหรับการค้นหา
  const handleSearch = useCallback(() => {
    if (loading) return;
    
    const values = form.getFieldsValue();
    
    // คัดลอก currentFilters เพื่อให้แน่ใจว่าเราไม่แก้ไขค่าเดิม
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
    
    // แจ้ง parent component
    if (onSearch) {
      onSearch(filters);
    }
  }, [loading, form, currentFilters, searchKeyword, onSearch]);

  // ฟังก์ชันสำหรับการรีเซ็ตฟิลเตอร์
  const handleReset = useCallback(() => {
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
  }, [loading, form, onReset]);

  // สร้างรายการตัวเลือกปีโปรเจค
  const yearOptions = useMemo(() => {
    if (projectYears.length > 0) {
      return projectYears.map(year => (
        <Option key={year} value={year}>{year}</Option>
      ));
    } else {
      return Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return <Option key={year} value={year}>{year}</Option>;
      });
    }
  }, [projectYears]);

  // สร้างรายการตัวเลือกชั้นปีของผู้สร้าง
  const studyYearOptions = useMemo(() => {
    if (studyYears.length > 0) {
      return studyYears.map(year => (
        <Option key={year} value={year}>ปี {year}</Option>
      ));
    } else {
      return [1, 2, 3, 4].map(year => (
        <Option key={year} value={year}>ปี {year}</Option>
      ));
    }
  }, [studyYears]);

  // Layout สำหรับฟอร์มที่แตกต่างกัน
  const formLayout = useMemo(() => {
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
  }, [layout]);

  // Handle toggle expanded
  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  return (
    <>
      <style>{styleOverrides}</style>
      <motion.div
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        variants={cardHoverAnimation}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card 
          className="project-filter-card" 
          bordered={false} 
          style={{ 
            boxShadow: '0 4px 12px rgba(144, 39, 142, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(144, 39, 142, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <Title 
            level={4} 
            style={{ 
              marginBottom: 16, 
              display: 'flex', 
              alignItems: 'center',
              background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            <FilterOutlined style={{ marginRight: 8, color: themeColors.primary }} /> 
            ตัวกรองโปรเจค
            <Tooltip title="เลือกตัวกรองเพื่อค้นหาโปรเจคที่ต้องการ">
              <InfoCircleOutlined style={{ marginLeft: 8, color: themeColors.secondary, fontSize: 16 }} />
            </Tooltip>
          </Title>
          
          {showSearch && (
            <Input.Search
              placeholder="ค้นหาโปรเจค"
              allowClear
              enterButton={
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  style={{ 
                    backgroundColor: themeColors.primary,
                    borderColor: themeColors.primary,
                    boxShadow: '0 2px 4px rgba(144, 39, 142, 0.2)'
                  }}
                >
                  ค้นหา
                </Button>
              }
              size="large"
              loading={loading}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={() => handleSearch()}
              style={{ 
                marginBottom: 16,
                boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)',
                borderRadius: '8px'
              }}
            />
          )}
          
          <Form
            form={form}
            {...formLayout}
            onValuesChange={handleFilterChange}
            className="project-filter-form"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={expanded ? 12 : 24} md={expanded ? 8 : 12} lg={expanded ? 6 : 8}>
                <Form.Item
                  name="type"
                  label={
                    <span style={{ color: themeColors.dark, fontWeight: 500 }}>
                      ประเภทโปรเจค
                    </span>
                  }
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
                    dropdownStyle={{ boxShadow: '0 3px 6px rgba(144, 39, 142, 0.15)' }}
                    style={{ borderColor: 'rgba(144, 39, 142, 0.2)' }}
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
                  label={
                    <span style={{ color: themeColors.dark, fontWeight: 500 }}>
                      ปีของโปรเจค
                    </span>
                  }
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
                    dropdownStyle={{ boxShadow: '0 3px 6px rgba(144, 39, 142, 0.15)' }}
                    style={{ borderColor: 'rgba(144, 39, 142, 0.2)' }}
                  >
                    {yearOptions}
                  </Select>
                </Form.Item>
              </Col>
              
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%' }}
                  >
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Form.Item
                        name="studyYear"
                        label={
                          <span style={{ color: themeColors.dark, fontWeight: 500 }}>
                            ชั้นปีของผู้สร้าง
                          </span>
                        }
                        labelCol={layout === 'horizontal' ? { span: 8 } : undefined}
                        wrapperCol={layout === 'horizontal' ? { span: 16 } : undefined}
                      >
                        <Select
                          placeholder="เลือกชั้นปีของผู้สร้าง"
                          allowClear
                          loading={loading}
                          className="custom-select"
                          disabled={loading}
                          dropdownStyle={{ boxShadow: '0 3px 6px rgba(144, 39, 142, 0.15)' }}
                          style={{ borderColor: 'rgba(144, 39, 142, 0.2)' }}
                        >
                          {studyYearOptions}
                        </Select>
                      </Form.Item>
                    </Col>
                  </motion.div>
                )}
              </AnimatePresence>
            </Row>
            
            <div style={{ 
              marginTop: 16, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: '1px solid rgba(144, 39, 142, 0.1)',
              paddingTop: 16
            }}>
              <motion.button
                type="button"
                onClick={toggleExpanded}
                style={{ 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: themeColors.primary,
                  fontSize: '14px',
                  padding: 0
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {expanded ? (
                  <>
                    <UpOutlined style={{ marginRight: 8, fontSize: 12 }} />
                    ซ่อนตัวกรองเพิ่มเติม
                  </>
                ) : (
                  <>
                    <DownOutlined style={{ marginRight: 8, fontSize: 12 }} />
                    แสดงตัวกรองเพิ่มเติม
                  </>
                )}
              </motion.button>
              
              <Space>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    disabled={loading}
                    style={{
                      borderColor: themeColors.primary,
                      color: themeColors.primary,
                      borderRadius: '8px'
                    }}
                  >
                    รีเซ็ต
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={handleSearch}
                    loading={loading}
                    style={{
                      backgroundColor: themeColors.primary,
                      borderColor: themeColors.primary,
                      boxShadow: '0 2px 6px rgba(144, 39, 142, 0.2)',
                      borderRadius: '8px'
                    }}
                  >
                    กรอง
                  </Button>
                </motion.div>
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
      </motion.div>
    </>
  );
};

export default React.memo(ProjectFilter);