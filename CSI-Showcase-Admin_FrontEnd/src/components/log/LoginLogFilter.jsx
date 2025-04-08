// src/components/logs/LoginLogFilter.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Row, Col, Space, Divider, Collapse } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  CalendarOutlined,
  UserOutlined, 
  CheckCircleOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import { LOGIN_STATUS } from '../../constants/userConstants';
import locale from 'antd/es/date-picker/locale/th_TH';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;

/**
 * Component สำหรับฟอร์มค้นหาและกรองข้อมูลประวัติการเข้าสู่ระบบ
 * 
 * @param {Object} props
 * @param {Function} props.onFilterChange - ฟังก์ชันที่เรียกเมื่อมีการเปลี่ยนแปลงตัวกรอง
 * @param {Function} props.onReset - ฟังก์ชันที่เรียกเมื่อกดปุ่มรีเซ็ต
 * @param {Object} props.filters - ค่าตัวกรองปัจจุบัน
 */
const LoginLogFilter = ({ 
  onFilterChange,
  onReset, 
  filters = {}
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  // จัดการเมื่อมีการ submit ฟอร์ม
  const handleFinish = (values) => {
    // แปลงค่าจาก DatePicker เป็น ISO string
    let filterValues = { ...values };
    
    if (values.dateRange && values.dateRange.length === 2) {
      const startDate = new Date(values.dateRange[0]);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(values.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      
      filterValues.startDate = startDate.toISOString();
      filterValues.endDate = endDate.toISOString();
      delete filterValues.dateRange;
    }
    
    if (onFilterChange) {
      onFilterChange(filterValues);
    }
  };

  // รีเซ็ตฟอร์ม
  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
  };

  // แปลงค่าวันที่จาก filters เพื่อแสดงใน DatePicker
  const getInitialDateRange = () => {
    if (filters.startDate && filters.endDate) {
      return [
        filters.startDate ? new Date(filters.startDate) : null,
        filters.endDate ? new Date(filters.endDate) : null
      ];
    }
    return undefined;
  };

  // ตรวจสอบว่ามีการตั้งค่าตัวกรองหรือไม่
  const hasActiveFilters = () => {
    return filters.search || filters.status || filters.startDate || filters.endDate;
  };

  return (
    <Card 
      className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
      title={
        <div className="flex items-center">
          <FilterOutlined className="mr-2 text-blue-500" />
          <span className="font-medium">ตัวกรองข้อมูล</span>
          {hasActiveFilters() && (
            <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
              กำลังใช้งาน
            </span>
          )}
        </div>
      }
      extra={
        <Button 
          type="text" 
          icon={expanded ? <UpOutlined /> : <DownOutlined />}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "ย่อ" : "ขยาย"}
        </Button>
      }
      bodyStyle={{ display: expanded ? 'block' : 'none' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          ...filters,
          dateRange: getInitialDateRange()
        }}
        className="transition-all duration-300"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="search" label={
              <span className="flex items-center">
                <SearchOutlined className="mr-1 text-blue-500" />
                ค้นหา
              </span>
            }>
              <Input 
                placeholder="ค้นหาตามชื่อผู้ใช้, อีเมล, IP"
                allowClear
                suffix={<UserOutlined style={{ color: '#d9d9d9' }} />}
                className="hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label={
              <span className="flex items-center">
                <CheckCircleOutlined className="mr-1 text-green-500" />
                สถานะ
              </span>
            }>
              <Select 
                placeholder="เลือกสถานะ" 
                allowClear
                className="hover:border-blue-400"
                dropdownClassName="rounded-lg shadow-lg"
              >
                <Option value={LOGIN_STATUS.SUCCESS}>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    สำเร็จ
                  </span>
                </Option>
                <Option value={LOGIN_STATUS.FAILED}>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    ล้มเหลว
                  </span>
                </Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={24} md={8} lg={12}>
            <Form.Item name="dateRange" label={
              <span className="flex items-center">
                <CalendarOutlined className="mr-1 text-orange-500" />
                ช่วงวันที่
              </span>
            }>
              <RangePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                locale={locale}
                className="hover:border-blue-400"
                ranges={{
                  'วันนี้': [new Date(), new Date()],
                  'สัปดาห์นี้': [
                    new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
                    new Date()
                  ],
                  'เดือนนี้': [
                    new Date(new Date().setDate(1)),
                    new Date()
                  ],
                }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} className="flex justify-end">
            <Space>
              <Button 
                onClick={handleReset} 
                icon={<ReloadOutlined />}
                className="hover:bg-gray-100 hover:text-blue-500 hover:border-blue-500 transition-colors duration-300"
              >
                รีเซ็ตตัวกรอง
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<FilterOutlined />}
                className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 transition-colors duration-300 hover:shadow-md"
              >
                กรอง
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
      
      {!expanded && hasActiveFilters() && (
        <div className="p-2 flex flex-wrap gap-2">
          {filters.search && (
            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center">
              <SearchOutlined className="mr-1" />
              ค้นหา: {filters.search}
            </div>
          )}
          
          {filters.status && (
            <div className={`px-2 py-1 rounded-md text-xs flex items-center ${
              filters.status === LOGIN_STATUS.SUCCESS 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              <CheckCircleOutlined className="mr-1" />
              สถานะ: {filters.status === LOGIN_STATUS.SUCCESS ? 'สำเร็จ' : 'ล้มเหลว'}
            </div>
          )}
          
          {filters.startDate && filters.endDate && (
            <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs flex items-center">
              <CalendarOutlined className="mr-1" />
              วันที่: {new Date(filters.startDate).toLocaleDateString('th-TH')} - {new Date(filters.endDate).toLocaleDateString('th-TH')}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default LoginLogFilter;