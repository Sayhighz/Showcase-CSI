import React from 'react';
import { Form, Select, Button, Card, Row, Col, Input } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import DateRangeField from '../common/form/DateRangeField';
import SelectYear from '../common/form/SelectYear';
import SelectSemester from '../common/form/SelectSemester';
import SelectStudyYear from '../common/form/SelectStudyYear';
import FilterActions from '../common/form/FilterActions';
import useFilterForm from '../../hooks/useFilterForm';

const { Option } = Select;

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
          {/* ประเภทโครงงาน */}
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

          {/* สถานะโครงงาน */}
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

          {/* ปีการศึกษา */}
          {filterOptions.showYearFilter && (
            <Col xs={24} md={8} lg={6}>
              <SelectYear name="year" />
            </Col>
          )}

          {/* ชั้นปี */}
          {filterOptions.showStudyYearFilter && (
            <Col xs={24} md={8} lg={6}>
              <SelectStudyYear name="studyYear" />
            </Col>
          )}

          {/* ภาคการศึกษา */}
          {filterOptions.showSemesterFilter && (
            <Col xs={24} md={8} lg={6}>
              <SelectSemester name="semester" />
            </Col>
          )}

          {/* ช่วงวันที่ */}
          {filterOptions.showDateRangeFilter && (
            <Col xs={24} md={12} lg={8}>
              <DateRangeField name="dateRange" />
            </Col>
          )}

          {/* แท็ก */}
          {filterOptions.showTagFilter && (
            <Col xs={24} md={8} lg={6}>
              <Form.Item label="แท็ก" name="tag">
                <Input placeholder="ระบุแท็ก" />
              </Form.Item>
            </Col>
          )}
        </Row>

        <FilterActions onReset={handleReset} loading={loading} />
      </Form>
    </Card>
  );
};

export default ProjectFilterForm;