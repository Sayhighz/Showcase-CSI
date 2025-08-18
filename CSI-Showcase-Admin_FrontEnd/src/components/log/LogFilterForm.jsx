import React from 'react';
import { Form, Select, Card, Row, Col, Input } from 'antd';
import DateRangeField from '../common/form/DateRangeField';
import FilterActions from '../common/form/FilterActions';
import useFilterForm from '../../hooks/useFilterForm';

const { Option } = Select;

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

  const { initialFormValues, handleFinish, handleReset } = useFilterForm({
    filters,
    onFilter,
    onReset,
    dateRangeField: 'dateRange',
    form
  });

  return (
    <Card className="mb-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialFormValues}
      >
        <Row gutter={[16, 16]}>
          {/* ผู้ใช้ */}
          {filterOptions.showUserFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ผู้ใช้" name="userId">
                <Input placeholder="รหัสผู้ใช้" />
              </Form.Item>
            </Col>
          )}

          {/* โครงงาน */}
          {filterOptions.showProjectFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="โครงงาน" name="projectId">
                <Input placeholder="รหัสโครงงาน" />
              </Form.Item>
            </Col>
          )}

          {/* ผู้ดูแลระบบ */}
          {filterOptions.showAdminFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="ผู้ดูแลระบบ" name="adminId">
                <Input placeholder="รหัสผู้ดูแลระบบ" />
              </Form.Item>
            </Col>
          )}

          {/* ช่วงวันที่ */}
          {filterOptions.showDateRangeFilter && (
            <Col xs={24} md={12} lg={8}>
              <DateRangeField name="dateRange" />
            </Col>
          )}

          {/* สถานะการเข้าสู่ระบบ */}
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

          {/* สถานะการตรวจสอบ */}
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

          {/* ประเภทผู้เยี่ยมชม */}
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

          {/* ค้นหา */}
          <Col xs={24} md={12} lg={12}>
            <Form.Item label="ค้นหา" name="search">
              <Input placeholder="ค้นหาตามคำสำคัญ" allowClear />
            </Form.Item>
          </Col>
        </Row>

        <FilterActions onReset={handleReset} loading={loading} />
      </Form>
    </Card>
  );
};

export default LogFilterForm;