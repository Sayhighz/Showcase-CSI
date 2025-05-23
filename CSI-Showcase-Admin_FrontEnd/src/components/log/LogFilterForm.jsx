import React, { useEffect } from 'react';
import { Form, DatePicker, Select, Button, Card, Row, Col, Input, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/th_TH';
import dayjs from 'dayjs';  // Make sure to import dayjs

const { Option } = Select;
const { RangePicker } = DatePicker;

const LogFilterForm = ({
  filters = {},
  onFilter,
  onReset,
  loading = false,
  filterOptions = {
    showUserFilter: false,
    showProjectFilter: false,
    showAdminFilter: false,
    showDateRangeFilter: true,
    showLoginStatusFilter: false,
    showReviewStatusFilter: false,
    showVisitorTypeFilter: false,
  }
}) => {
  const [form] = Form.useForm();

  // เรียกใช้ฟังก์ชัน filter เมื่อกดปุ่มค้นหา
  const handleFinish = (values) => {
    // แปลงค่า RangePicker เป็นรูปแบบที่เหมาะสม
    const formattedValues = { ...values };
    
    if (values.dateRange && values.dateRange.length === 2) {
      // Make sure we're using dayjs format method
      formattedValues.startDate = values.dateRange[0].format('YYYY-MM-DD');
      formattedValues.endDate = values.dateRange[1].format('YYYY-MM-DD');
      delete formattedValues.dateRange;
    }
    
    // ลบค่าที่เป็น undefined หรือ empty string ออกจาก formattedValues
    Object.keys(formattedValues).forEach(key => {
      if (formattedValues[key] === undefined || formattedValues[key] === '') {
        delete formattedValues[key];
      }
    });
    
    if (onFilter) {
      onFilter(formattedValues);
    }
  };

  // รีเซ็ตค่าทั้งหมดในฟอร์ม
  const handleReset = () => {
    // Reset form fields
    form.resetFields();
    
    // Explicitly clear dateRange separately if needed
    form.setFieldsValue({ dateRange: null });
    
    // Important: Call onReset with empty values to ensure parent component gets reset notification
    if (onReset) {
      onReset({
        search: '',
        userId: '',
        projectId: '',
        status: '',
        adminId: '',
        startDate: '',
        endDate: '',
        visitorType: '',
        dateRange: null
      });
    }
  };
  
  // กำหนดค่าเริ่มต้นสำหรับฟอร์ม
  useEffect(() => {
    // แปลงค่า startDate และ endDate กลับเป็น dateRange สำหรับ DatePicker
    const initialValues = { ...filters };
    
    // Convert string dates to dayjs objects for the DatePicker
    if (filters.startDate && filters.endDate) {
      const startDate = typeof filters.startDate === 'object' 
        ? filters.startDate 
        : dayjs(filters.startDate);
      
      const endDate = typeof filters.endDate === 'object' 
        ? filters.endDate 
        : dayjs(filters.endDate);
      
      initialValues.dateRange = [startDate, endDate];
      
      // ลบค่า startDate และ endDate เพื่อไม่ให้เกิดความสับสน
      delete initialValues.startDate;
      delete initialValues.endDate;
    }
    
    form.setFieldsValue(initialValues);
  }, [filters, form]);

  return (
    <Card className="mb-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={filters}
      >
        <Row gutter={[16, 16]}>
          {/* ตัวกรองผู้ใช้ */}
          {filterOptions.showUserFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ผู้ใช้" name="userId">
                <Input placeholder="รหัสผู้ใช้" />
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองโครงงาน */}
          {filterOptions.showProjectFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="โครงงาน" name="projectId">
                <Input placeholder="รหัสโครงงาน" />
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองผู้ดูแลระบบ */}
          {filterOptions.showAdminFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ผู้ดูแลระบบ" name="adminId">
                <Input placeholder="รหัสผู้ดูแลระบบ" />
                </Form.Item>
            </Col>
          )}

          {/* ตัวกรองช่วงวันที่ */}
          {filterOptions.showDateRangeFilter && (
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="ช่วงวันที่" name="dateRange">
                <RangePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  locale={locale}
                  placeholder={['วันเริ่มต้น', 'วันสิ้นสุด']}
                />
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองสถานะการเข้าสู่ระบบ */}
          {filterOptions.showLoginStatusFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="สถานะการเข้าสู่ระบบ" name="status">
                <Select placeholder="เลือกสถานะ" allowClear>
                  <Option value="success">สำเร็จ</Option>
                  <Option value="failed">ล้มเหลว</Option>
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองสถานะการตรวจสอบ */}
          {filterOptions.showReviewStatusFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="สถานะการตรวจสอบ" name="status">
                <Select placeholder="เลือกสถานะ" allowClear>
                  <Option value="approved">อนุมัติ</Option>
                  <Option value="rejected">ปฏิเสธ</Option>
                  <Option value="updated">อัปเดต</Option>
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองประเภทผู้เยี่ยมชม */}
          {filterOptions.showVisitorTypeFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ประเภทผู้เยี่ยมชม" name="visitorType">
                <Select placeholder="เลือกประเภท" allowClear>
                  <Option value="visitor">ผู้เยี่ยมชมทั่วไป</Option>
                  <Option value="company">บริษัท</Option>
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* เพิ่มฟิลเตอร์ค้นหา */}
          <Col xs={24} md={12} lg={12}>
            <Form.Item label="ค้นหา" name="search">
              <Input placeholder="ค้นหาตามคำสำคัญ" allowClear />
            </Form.Item>
          </Col>
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
    </Card>
  );
};

export default LogFilterForm;