import React from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Typography, Divider } from 'antd';
import { BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { PROJECT_TYPE, PROJECT_TYPE_DISPLAY } from '../../constants/projectTypes';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * Component for entering additional project information based on project type
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectType - Selected project type
 * @param {Object} props.additionalInfo - Additional information object
 * @param {Function} props.setAdditionalInfo - Function to update additional information
 * @returns {React.ReactElement} - Additional information form component
 */
const AdditionalInfoStep = ({ projectType, additionalInfo, setAdditionalInfo }) => {
  // Handle input changes
  const handleInputChange = (field, value) => {
    setAdditionalInfo({
      ...additionalInfo,
      [field]: value
    });
  };

  const renderCourseworkForm = () => (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item 
            label="รหัสวิชา" 
            required
            tooltip="รหัสวิชาของรายวิชาที่เกี่ยวข้องกับโครงงาน"
          >
            <Input 
              placeholder="เช่น CS401" 
              value={additionalInfo.course_code || ''}
              onChange={(e) => handleInputChange('course_code', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item 
            label="ชื่อวิชา" 
            required
            tooltip="ชื่อของรายวิชาที่เกี่ยวข้องกับโครงงาน"
          >
            <Input 
              placeholder="เช่น การพัฒนาเว็บแอปพลิเคชัน" 
              value={additionalInfo.course_name || ''}
              onChange={(e) => handleInputChange('course_name', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item 
            label="อาจารย์ผู้สอน"
            tooltip="ชื่อของอาจารย์ผู้สอนรายวิชานี้"
          >
            <Input 
              placeholder="เช่น ดร.สมชาย รักเรียน" 
              value={additionalInfo.instructor || ''}
              onChange={(e) => handleInputChange('instructor', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const renderAcademicForm = () => (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item 
            label="บทคัดย่อ" 
            required
            tooltip="สรุปย่อเกี่ยวกับบทความวิชาการของคุณ"
          >
            <TextArea 
              placeholder="กรอกบทคัดย่อของบทความวิชาการ" 
              value={additionalInfo.abstract || ''}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
              autoSize={{ minRows: 4, maxRows: 8 }}
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item 
            label="วันที่ตีพิมพ์"
            tooltip="วันที่บทความได้รับการตีพิมพ์"
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="เลือกวันที่ตีพิมพ์"
              value={additionalInfo.publication_date ? dayjs(additionalInfo.publication_date) : null}
              onChange={(date, dateString) => handleInputChange('publication_date', dateString)}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item 
            label="ปีที่ตีพิมพ์"
            tooltip="ปีที่บทความได้รับการตีพิมพ์"
          >
            <Input 
              placeholder="เช่น 2023" 
              value={additionalInfo.published_year || ''}
              onChange={(e) => handleInputChange('published_year', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item 
            label="ผู้เขียน" 
            required
            tooltip="รายชื่อผู้เขียนบทความ คั่นด้วยเครื่องหมายจุลภาค (,)"
          >
            <Input 
              placeholder="เช่น สมชาย ใจดี, สมหญิง ชาญฉลาด" 
              value={additionalInfo.authors || ''}
              onChange={(e) => handleInputChange('authors', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item 
            label="สถานที่ตีพิมพ์"
            tooltip="ชื่อวารสาร, การประชุมวิชาการ หรือแหล่งตีพิมพ์"
          >
            <Input 
              placeholder="เช่น International Conference on Computer Science 2023" 
              value={additionalInfo.publication_venue || ''}
              onChange={(e) => handleInputChange('publication_venue', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const renderCompetitionForm = () => (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item 
            label="ชื่อการแข่งขัน" 
            required
            tooltip="ชื่อของการแข่งขันที่คุณเข้าร่วม"
          >
            <Input 
              placeholder="เช่น AI Hackathon 2023" 
              value={additionalInfo.competition_name || ''}
              onChange={(e) => handleInputChange('competition_name', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item 
            label="ปีที่แข่งขัน"
            tooltip="ปีที่จัดการแข่งขัน"
          >
            <Input 
              placeholder="เช่น 2023" 
              value={additionalInfo.competition_year || ''}
              onChange={(e) => handleInputChange('competition_year', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item 
            label="ระดับการแข่งขัน" 
            required
            tooltip="ระดับของการแข่งขัน"
          >
            <Select
              placeholder="เลือกระดับการแข่งขัน"
              value={additionalInfo.competition_level || undefined}
              onChange={(value) => handleInputChange('competition_level', value)}
            >
              <Option value="university">มหาวิทยาลัย</Option>
              <Option value="national">ระดับประเทศ</Option>
              <Option value="international">นานาชาติ</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item 
            label="ผลงานที่ได้รับ" 
            required
            tooltip="รางวัลหรือผลงานที่ได้รับจากการแข่งขัน"
          >
            <Input 
              placeholder="เช่น รองชนะเลิศอันดับ 1" 
              value={additionalInfo.achievement || ''}
              onChange={(e) => handleInputChange('achievement', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item 
            label="สมาชิกในทีม"
            tooltip="รายชื่อสมาชิกในทีม คั่นด้วยเครื่องหมายจุลภาค (,)"
          >
            <Input 
              placeholder="เช่น สมชาย ใจดี, สมหญิง ชาญฉลาด, สมศรี เก่งกาจ" 
              value={additionalInfo.team_members || ''}
              onChange={(e) => handleInputChange('team_members', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
  
  // Get current year for defaults
  const currentYear = new Date().getFullYear();

  // Render form based on project type
  const renderForm = () => {
    switch (projectType) {
      case PROJECT_TYPE.COURSEWORK:
        return renderCourseworkForm();
      case PROJECT_TYPE.ACADEMIC:
        return renderAcademicForm();
      case PROJECT_TYPE.COMPETITION:
        return renderCompetitionForm();
      default:
        return (
          <div className="text-center py-8">
            <Text type="secondary">โปรดเลือกประเภทโครงงานในขั้นตอนแรก</Text>
          </div>
        );
    }
  };

  return (
    <div className="additional-info-step">
      <div className="mb-6">
        <Title level={3}>ข้อมูลเฉพาะประเภทโครงงาน</Title>
        <Paragraph className="text-gray-600">
          กรุณากรอกข้อมูลเพิ่มเติมสำหรับโครงงานประเภท{' '}
          <Text strong>{PROJECT_TYPE_DISPLAY[projectType] || 'ที่เลือก'}</Text>
        </Paragraph>
      </div>

      <Divider />

      <div className="mt-4">
        {renderForm()}
      </div>
    </div>
  );
};

export default AdditionalInfoStep;