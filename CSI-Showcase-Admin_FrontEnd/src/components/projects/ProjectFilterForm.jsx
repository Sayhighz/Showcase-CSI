import React from 'react';
import { Form, Select, DatePicker, Button, Card, Row, Col, Input, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/th_TH';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ProjectFilterForm = ({
  filters = {},
  onFilter,
  onReset,
  loading = false,
  filterOptions = {
    showTypeFilter: true,
    showStatusFilter: true,
    showYearFilter: true,
    showStudyYearFilter: true,
    showSemesterFilter: true,
    showDateRangeFilter: true,
    showTagFilter: false,
  }
}) => {
  const [form] = Form.useForm();

  // กำหนดค่าเริ่มต้นสำหรับฟอร์ม
  React.useEffect(() => {
    // แปลงค่า startDate และ endDate กลับเป็น dateRange สำหรับ DatePicker
    const initialValues = { ...filters };
    
    if (filters.startDate && filters.endDate) {
      initialValues.dateRange = [
        // แปลงจาก string เป็น moment object
        filters.startDate,
        filters.endDate
      ];
    }
    
    form.setFieldsValue(initialValues);
  }, [filters, form]);

  // เรียกใช้ฟังก์ชัน filter เมื่อกดปุ่มค้นหา
  const handleFinish = (values) => {
    // แปลงค่า RangePicker เป็นรูปแบบที่เหมาะสม
    const formattedValues = { ...values };
    
    if (values.dateRange && values.dateRange.length === 2) {
      formattedValues.startDate = values.dateRange[0].format('YYYY-MM-DD');
      formattedValues.endDate = values.dateRange[1].format('YYYY-MM-DD');
      delete formattedValues.dateRange;
    }
    
    if (onFilter) {
      onFilter(formattedValues);
    }
  };

  // รีเซ็ตค่าทั้งหมดในฟอร์ม
  const handleReset = () => {
    form.resetFields();
    
    if (onReset) {
      onReset();
    }
  };

  return (
    <Card className="mb-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={filters}
      >
        <Row gutter={[16, 16]}>
          {/* ตัวกรองประเภทโครงงาน */}
          {filterOptions.showTypeFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ประเภทโครงงาน" name="type">
                <Select placeholder="เลือกประเภท" allowClear>
                  <Option value="coursework">ผลงานการเรียน</Option>
                  <Option value="academic">บทความวิชาการ</Option>
                  <Option value="competition">การแข่งขัน</Option>
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองสถานะโครงงาน */}
          {filterOptions.showStatusFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="สถานะโครงงาน" name="status">
                <Select placeholder="เลือกสถานะ" allowClear>
                  <Option value="pending">รอตรวจสอบ</Option>
                  <Option value="approved">อนุมัติแล้ว</Option>
                  <Option value="rejected">ถูกปฏิเสธ</Option>
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองปีการศึกษา */}
          {filterOptions.showYearFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ปีการศึกษา" name="year">
                <Select placeholder="เลือกปีการศึกษา" allowClear>
                  {/* สร้างตัวเลือกปีการศึกษาย้อนหลัง 5 ปีจากปีปัจจุบัน */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() + 543 - i; // ปี พ.ศ.
                    return (
                      <Option key={year} value={year.toString()}>
                        {year}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองชั้นปี */}
          {filterOptions.showStudyYearFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ชั้นปี" name="studyYear">
                <Select placeholder="เลือกชั้นปี" allowClear>
                  <Option value="1">ปี 1</Option>
                  <Option value="2">ปี 2</Option>
                  <Option value="3">ปี 3</Option>
                  <Option value="4">ปี 4</Option>
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* ตัวกรองภาคการศึกษา */}
          {filterOptions.showSemesterFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ภาคการศึกษา" name="semester">
                <Select placeholder="เลือกภาคการศึกษา" allowClear>
                  <Option value="1">ภาคต้น</Option>
                  <Option value="2">ภาคปลาย</Option>
                  <Option value="3">ภาคฤดูร้อน</Option>
                </Select>
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

          {/* ตัวกรองแท็ก */}
          {filterOptions.showTagFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="แท็ก" name="tag">
                <Input placeholder="ระบุแท็ก" />
              </Form.Item>
            </Col>
          )}
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

export default ProjectFilterForm;