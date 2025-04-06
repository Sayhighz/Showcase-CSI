// src/components/common/FilterForm.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { 
  PROJECT_TYPE_NAMES, 
  PROJECT_STATUS_NAMES,
  STUDY_YEAR_NAMES 
} from '../../constants/projectConstants';
import useDebounce from '../../hooks/useDebounce';
import { FILTER_LABELS } from '../../constants/thaiMessages';
import locale from 'antd/es/date-picker/locale/th_TH';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Component สำหรับฟอร์มค้นหาและกรองข้อมูล
 * สามารถปรับแต่งได้ตามประเภทของข้อมูล
 * 
 * @param {Object} props
 * @param {string} props.type - ประเภทของข้อมูล ('project', 'user', 'log')
 * @param {Function} props.onFilterChange - ฟังก์ชันที่เรียกเมื่อมีการเปลี่ยนแปลงตัวกรอง
 * @param {Function} props.onReset - ฟังก์ชันที่เรียกเมื่อกดปุ่มรีเซ็ต
 * @param {Object} props.filters - ค่าตัวกรองปัจจุบัน
 * @param {Array} props.yearOptions - ตัวเลือกปีการศึกษา (เฉพาะกรณี type='project')
 */
const FilterForm = ({ 
  type = 'project',
  onFilterChange,
  onReset, 
  filters = {},
  yearOptions = []
}) => {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState(filters.search || '');
  
  // ใช้ debounce เพื่อลดการส่งค่าค้นหาบ่อยเกินไป
  const debouncedSearch = useDebounce(searchValue, 500);

  // เมื่อค่า debounced search เปลี่ยน จึงค่อยส่งค่าไปยัง onFilterChange
  React.useEffect(() => {
    if (onFilterChange && (debouncedSearch !== filters.search)) {
      onFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  // จัดการเมื่อมีการเปลี่ยนแปลงค่าในฟอร์ม
  const handleValuesChange = (changedValues, allValues) => {
    // ถ้ามีการเปลี่ยนค่าค้นหา ให้อัพเดต state แต่ยังไม่ส่งค่าไปยัง onFilterChange (รอให้ debounce ทำงาน)
    if ('search' in changedValues) {
      setSearchValue(changedValues.search);
      return;
    }

    // สำหรับตัวกรองอื่นๆ ส่งค่าไปยัง onFilterChange ทันที
    if (onFilterChange) {
      onFilterChange(changedValues);
    }
  };

  // รีเซ็ตฟอร์ม
  const handleReset = () => {
    form.resetFields();
    setSearchValue('');
    if (onReset) {
      onReset();
    }
  };

  // สร้างฟิลด์ตามประเภทของข้อมูล
  const renderFields = () => {
    switch (type) {
      case 'project':
        return (
          <>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="search" label={FILTER_LABELS.SEARCH_PROJECT}>
                <Input 
                  prefix={<SearchOutlined />} 
                  placeholder={FILTER_LABELS.SEARCH_PROJECT}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="type" label={FILTER_LABELS.PROJECT_TYPE}>
                <Select placeholder="ทั้งหมด" allowClear>
                  {Object.entries(PROJECT_TYPE_NAMES).map(([key, value]) => (
                    <Option key={key} value={key}>{value}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="status" label={FILTER_LABELS.PROJECT_STATUS}>
                <Select placeholder="ทั้งหมด" allowClear>
                  {Object.entries(PROJECT_STATUS_NAMES).map(([key, value]) => (
                    <Option key={key} value={key}>{value}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="year" label={FILTER_LABELS.ACADEMIC_YEAR}>
                <Select placeholder="ทั้งหมด" allowClear>
                  {yearOptions.map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="studyYear" label={FILTER_LABELS.STUDY_YEAR}>
                <Select placeholder="ทั้งหมด" allowClear>
                  {Object.entries(STUDY_YEAR_NAMES).map(([key, value]) => (
                    <Option key={key} value={key}>{value}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </>
        );
      
      case 'user':
        return (
          <>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="search" label={FILTER_LABELS.SEARCH_USER}>
                <Input 
                  prefix={<SearchOutlined />} 
                  placeholder={FILTER_LABELS.SEARCH_USER}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="status" label="สถานะ">
                <Select placeholder="ทั้งหมด" allowClear>
                  <Option value="active">ใช้งานอยู่</Option>
                  <Option value="inactive">ไม่ได้ใช้งาน</Option>
                  <Option value="suspended">ถูกระงับการใช้งาน</Option>
                </Select>
              </Form.Item>
            </Col>
          </>
        );

      case 'log':
        return (
          <>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="search" label="ค้นหา">
                <Input 
                  prefix={<SearchOutlined />} 
                  placeholder="ค้นหาข้อมูล"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={16} lg={12}>
              <Form.Item name="dateRange" label={FILTER_LABELS.DATE_RANGE}>
                <RangePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  locale={locale}
                />
              </Form.Item>
            </Col>
          </>
        );

      default:
        return (
          <Col xs={24}>
            <Form.Item name="search" label="ค้นหา">
              <Input 
                prefix={<SearchOutlined />} 
                placeholder="ค้นหาข้อมูล"
                allowClear
              />
            </Form.Item>
          </Col>
        );
    }
  };

  return (
    <Card className="mb-6">
      <Form
        form={form}
        initialValues={filters}
        onValuesChange={handleValuesChange}
        layout="vertical"
      >
        <Row gutter={[16, 16]}>
          {renderFields()}
          
          <Col xs={24} className="flex justify-end">
            <Space>
              <Button 
                onClick={handleReset}
                icon={<ReloadOutlined />}
              >
                {FILTER_LABELS.RESET_FILTER}
              </Button>
              <Button 
                type="primary" 
                icon={<FilterOutlined />}
                onClick={() => form.submit()}
              >
                กรอง
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default FilterForm;