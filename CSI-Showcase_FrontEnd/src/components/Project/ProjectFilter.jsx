import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Select, Button, Space, Typography, Card, Row, Col, Input, Tooltip } from 'antd';
import { FilterOutlined, ReloadOutlined, SearchOutlined, InfoCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT_TYPES } from '../../constants/projectTypes';
import {
  FILTER_THEME_COLORS,
  CARD_HOVER_ANIMATION,
  useResponsive
} from '../../utils/filterUtils';

const { Option } = Select;
const { Title } = Typography;

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
  const { windowWidth, responsiveSize, isMobile, isTablet } = useResponsive();
  
  // ใช้ useRef เพื่อเก็บค่า initialValues ล่าสุด และป้องกันการทำงานที่ไม่จำเป็น
  const previousInitialValues = React.useRef(initialValues);

  // ตรวจสอบว่าควรใช้ vertical layout หรือไม่
  useEffect(() => {
    if (window.innerWidth < 768 && layout !== 'vertical') {
      // ถ้าหน้าจอเล็กและไม่ได้กำหนด layout เป็น vertical
      console.log('Auto switch to vertical layout on small screen');
    }
  }, [layout]);

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

// สร้างรายการตัวเลือกปีโปรเจค (ใช้ พ.ศ. ทั้งแสดงผลและค่า filter)
const yearOptions = useMemo(() => {
  if (projectYears.length > 0) {
    // projectYears ถูกสร้างให้เป็น พ.ศ. แล้วจาก hook
    return projectYears.map((yearBE) => (
      <Option key={yearBE} value={yearBE}>{yearBE}</Option>
    ));
  } else {
    // fallback: สร้างย้อนหลัง 10 ปีเป็น พ.ศ.
    const currentBE = new Date().getFullYear() + 543;
    return Array.from({ length: 10 }, (_, i) => {
      const yearBE = currentBE - i;
      return <Option key={yearBE} value={yearBE}>{yearBE}</Option>;
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
  // ใช้ vertical layout โดยอัตโนมัติสำหรับหน้าจอขนาดเล็ก
  const autoLayout = windowWidth < 768 ? 'vertical' : layout;
  
  switch (autoLayout) {
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
        labelCol: { span: windowWidth < 992 ? 6 : 8 },
        wrapperCol: { span: windowWidth < 992 ? 18 : 16 }
      };
  }
}, [layout, windowWidth]);

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
      variants={CARD_HOVER_ANIMATION}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className="project-filter-card" 
        bordered={false} 
        style={{ 
          boxShadow: '0 4px 12px rgba(144, 39, 142, 0.06)',
          borderRadius: isMobile ? '8px' : '12px',
          border: '1px solid rgba(144, 39, 142, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)'
        }}
        styles={{
          body: {
            padding: isMobile ? '12px' : (isTablet ? '16px' : '20px')
          }
        }}
      >
        <Title 
          level={isMobile ? 5 : 4} 
          style={{ 
            marginBottom: isMobile ? 12 : 16, 
            display: 'flex', 
            alignItems: 'center',
            background: `linear-gradient(135deg, ${FILTER_THEME_COLORS.primary} 0%, ${FILTER_THEME_COLORS.secondary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: isMobile ? '16px' : (isTablet ? '18px' : '20px')
          }}
        >
          <FilterOutlined style={{ 
            marginRight: isMobile ? 6 : 8,
            color: FILTER_THEME_COLORS.primary,
            fontSize: isMobile ? '14px' : (isTablet ? '16px' : '18px')
          }} /> 
          ตัวกรองโปรเจค
          <Tooltip title="เลือกตัวกรองเพื่อค้นหาโปรเจคที่ต้องการ">
            <InfoCircleOutlined style={{ 
              marginLeft: isMobile ? 6 : 8, 
              color: FILTER_THEME_COLORS.secondary,
              fontSize: isMobile ? '12px' : '16px' 
            }} />
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
                  backgroundColor: FILTER_THEME_COLORS.primary,
                  borderColor: FILTER_THEME_COLORS.primary,
                  boxShadow: '0 2px 4px rgba(144, 39, 142, 0.2)'
                }}
              >
                {!isMobile && "ค้นหา"}
              </Button>
            }
            size={isMobile ? "middle" : "large"}
            loading={loading}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={() => handleSearch()}
            style={{ 
              marginBottom: isMobile ? 12 : 16,
              boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)',
              borderRadius: isMobile ? '6px' : '8px'
            }}
          />
        )}
        
        <Form
          form={form}
          {...formLayout}
          onValuesChange={handleFilterChange}
          className="project-filter-form"
        >
          <Row gutter={[isMobile ? 8 : (isTablet ? 12 : 16), isMobile ? 8 : (isTablet ? 12 : 16)]}>
            <Col xs={24} sm={expanded ? 12 : 24} md={expanded ? 8 : 12} lg={expanded ? 6 : 8}>
              <Form.Item
                name="type"
                label={
                  <span style={{
                    color: FILTER_THEME_COLORS.dark,
                    fontWeight: 500,
                    fontSize: isMobile ? '13px' : (isTablet ? '14px' : '15px')
                  }}>
                    ประเภทโปรเจค
                  </span>
                }
                labelCol={formLayout.layout === 'horizontal' ? { span: formLayout.labelCol.span } : undefined}
                wrapperCol={formLayout.layout === 'horizontal' ? { span: formLayout.wrapperCol.span } : undefined}
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
                  size={isMobile ? "middle" : "large"}
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
                  <span style={{
                    color: FILTER_THEME_COLORS.dark,
                    fontWeight: 500,
                    fontSize: isMobile ? '13px' : (isTablet ? '14px' : '15px')
                  }}>
                    ปีการศึกษา (พ.ศ.)
                  </span>
                }
                labelCol={formLayout.layout === 'horizontal' ? { span: formLayout.labelCol.span } : undefined}
                wrapperCol={formLayout.layout === 'horizontal' ? { span: formLayout.wrapperCol.span } : undefined}
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
                  size={isMobile ? "middle" : "large"}
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
                        <span style={{
                          color: FILTER_THEME_COLORS.dark,
                          fontWeight: 500,
                          fontSize: isMobile ? '13px' : (isTablet ? '14px' : '15px')
                        }}>
                          ชั้นปีของผู้สร้าง
                        </span>
                      }
                      labelCol={formLayout.layout === 'horizontal' ? { span: formLayout.labelCol.span } : undefined}
                      wrapperCol={formLayout.layout === 'horizontal' ? { span: formLayout.wrapperCol.span } : undefined}
                    >
                      <Select
                        placeholder="เลือกชั้นปีของผู้สร้าง"
                        allowClear
                        loading={loading}
                        className="custom-select"
                        disabled={loading}
                        dropdownStyle={{ boxShadow: '0 3px 6px rgba(144, 39, 142, 0.15)' }}
                        style={{ borderColor: 'rgba(144, 39, 142, 0.2)' }}
                        size={isMobile ? "middle" : "large"}
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
            marginTop: isMobile ? 12 : 16, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderTop: '1px solid rgba(144, 39, 142, 0.1)',
            paddingTop: isMobile ? 12 : 16,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? '8px' : '0'
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
                color: FILTER_THEME_COLORS.primary,
                fontSize: isMobile ? '12px' : '14px',
                padding: 0,
                order: isMobile ? 3 : 1,
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'center' : 'flex-start',
                marginTop: isMobile ? '8px' : 0
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {expanded ? (
                <>
                  <UpOutlined style={{ marginRight: 8, fontSize: isMobile ? 10 : 12 }} />
                  ซ่อนตัวกรองเพิ่มเติม
                </>
              ) : (
                <>
                  <DownOutlined style={{ marginRight: 8, fontSize: isMobile ? 10 : 12 }} />
                  แสดงตัวกรองเพิ่มเติม
                </>
              )}
            </motion.button>
            
            <Space size={isMobile ? 'small' : 'middle'} style={{
              order: isMobile ? 2 : 2,
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'space-between' : 'flex-end'
            }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  disabled={loading}
                  style={{
                    borderColor: FILTER_THEME_COLORS.primary,
                    color: FILTER_THEME_COLORS.primary,
                    borderRadius: isMobile ? '6px' : '8px',
                    fontSize: isMobile ? '12px' : 'inherit'
                  }}
                  size={isMobile ? "middle" : "large"}
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
                    backgroundColor: FILTER_THEME_COLORS.primary,
                    borderColor: FILTER_THEME_COLORS.primary,
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.2)',
                    borderRadius: isMobile ? '6px' : '8px',
                    fontSize: isMobile ? '12px' : 'inherit'
                  }}
                  size={isMobile ? "middle" : "large"}
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