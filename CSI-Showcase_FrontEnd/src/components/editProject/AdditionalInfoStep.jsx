import React from 'react';
import { Form, Input, Select, Typography, Row, Col, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * AdditionalInfoStep component for entering project-specific information
 * based on the selected project type
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectType - Selected project type
 * @param {Object} props.additionalInfo - Additional project information
 * @param {Function} props.setAdditionalInfo - Function to update additional info
 * @param {boolean} props.isEditing - Whether we're editing an existing project
 * @returns {JSX.Element} AdditionalInfoStep component
 */
const AdditionalInfoStep = ({ projectType, additionalInfo, setAdditionalInfo, isEditing = false }) => {
  // Handle changes in form inputs
  const handleChange = (key, value) => {
    setAdditionalInfo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Render form based on project type
  const renderFormByType = () => {
    switch (projectType) {
      case 'coursework':
        return renderCourseworkForm();
      case 'academic':
        return renderAcademicForm();
      case 'competition':
        return renderCompetitionForm();
      default:
        return (
          <Alert
            message="โปรดเลือกประเภทโครงงาน"
            description="กรุณากลับไปเลือกประเภทโครงงานก่อน เพื่อแสดงฟอร์มที่เหมาะสม"
            type="warning"
            showIcon
          />
        );
    }
  };

  // Form for Coursework project type
  const renderCourseworkForm = () => (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="รหัสวิชา"
            required
            tooltip={{ title: 'รหัสวิชาที่เกี่ยวข้องกับโครงงานนี้', icon: <InfoCircleOutlined /> }}
          >
            <Input
              placeholder="เช่น CS101, COMP101"
              value={additionalInfo.course_code}
              onChange={(e) => handleChange('course_code', e.target.value)}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            label="ชื่อวิชา"
            required
            tooltip={{ title: 'ชื่อวิชาที่เกี่ยวข้องกับโครงงานนี้', icon: <InfoCircleOutlined /> }}
          >
            <Input
              placeholder="เช่น การเขียนโปรแกรมคอมพิวเตอร์"
              value={additionalInfo.course_name}
              onChange={(e) => handleChange('course_name', e.target.value)}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24}>
          <Form.Item
            label="อาจารย์ผู้สอน"
            tooltip={{ title: 'ชื่ออาจารย์ผู้สอนวิชานี้', icon: <InfoCircleOutlined /> }}
          >
            <Input
              placeholder="เช่น ผศ.ดร. ชื่อ นามสกุล"
              value={additionalInfo.instructor}
              onChange={(e) => handleChange('instructor', e.target.value)}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24}>
          <Form.Item
            label="สมาชิกในทีม"
            tooltip={{ title: 'ชื่อสมาชิกในทีมทั้งหมด คั่นด้วยเครื่องหมายจุลภาค', icon: <InfoCircleOutlined /> }}
          >
            <TextArea
              placeholder="เช่น 6310110555 นาย ก, 6310110666 นางสาว ข"
              value={additionalInfo.team_members}
              onChange={(e) => handleChange('team_members', e.target.value)}
              rows={3}
            />
            <Text type="secondary">คั่นด้วยเครื่องหมายจุลภาค (,) ระหว่างแต่ละคน</Text>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  // Form for Academic project type
  const renderAcademicForm = () => (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            label="บทคัดย่อ"
            required
            tooltip={{ title: 'บทคัดย่อของบทความวิชาการหรืองานวิจัย', icon: <InfoCircleOutlined /> }}
          >
            <TextArea
              placeholder="บทคัดย่อของบทความวิชาการหรืองานวิจัย"
              value={additionalInfo.abstract}
              onChange={(e) => handleChange('abstract', e.target.value)}
              rows={5}
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Col>
        
        <Col xs={24}>
          <Form.Item
            label="ผู้เขียน/คณะผู้วิจัย"
            required
            tooltip={{ title: 'รายชื่อผู้เขียนหรือคณะผู้วิจัยทั้งหมด', icon: <InfoCircleOutlined /> }}
          >
            <TextArea
              placeholder="เช่น นาย ก นามสกุล, ผศ.ดร. ข นามสกุล"
              value={additionalInfo.authors}
              onChange={(e) => handleChange('authors', e.target.value)}
              rows={3}
            />
            <Text type="secondary">คั่นด้วยเครื่องหมายจุลภาค (,) ระหว่างแต่ละคน</Text>
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            label="แหล่งตีพิมพ์"
            tooltip={{ title: 'ชื่อวารสาร การประชุมวิชาการ หรือแหล่งตีพิมพ์', icon: <InfoCircleOutlined /> }}
          >
            <Input
              placeholder="เช่น ECTI-CARD 2023, IEEE Transactions on AI"
              value={additionalInfo.publication}
              onChange={(e) => handleChange('publication', e.target.value)}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            label="DOI (ถ้ามี)"
            tooltip={{ title: 'Digital Object Identifier ของบทความ', icon: <InfoCircleOutlined /> }}
          >
            <Input
              placeholder="เช่น 10.1109/example.2023.123456"
              value={additionalInfo.doi}
              onChange={(e) => handleChange('doi', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  // Form for Competition project type
  const renderCompetitionForm = () => (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            label="ชื่อการแข่งขัน"
            required
            tooltip={{ title: 'ชื่อการแข่งขันที่เข้าร่วม', icon: <InfoCircleOutlined /> }}
          >
            <Input
              placeholder="เช่น การแข่งขันพัฒนาโมบายแอปพลิเคชัน, การแข่งขันหุ่นยนต์"
              value={additionalInfo.competition_name}
              onChange={(e) => handleChange('competition_name', e.target.value)}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            label="ระดับการแข่งขัน"
            required
            tooltip={{ title: 'ระดับของการแข่งขัน เช่น ระดับมหาวิทยาลัย, ระดับประเทศ', icon: <InfoCircleOutlined /> }}
          >
            <Select
              placeholder="เลือกระดับการแข่งขัน"
              value={additionalInfo.competition_level}
              onChange={(value) => handleChange('competition_level', value)}
            >
              <Option value="university">ระดับมหาวิทยาลัย</Option>
              <Option value="regional">ระดับภูมิภาค</Option>
              <Option value="national">ระดับประเทศ</Option>
              <Option value="international">ระดับนานาชาติ</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            label="ผลการแข่งขัน"
            required
            tooltip={{ title: 'ผลการแข่งขันหรือรางวัลที่ได้รับ', icon: <InfoCircleOutlined /> }}
          >
            <Input
              placeholder="เช่น รางวัลชนะเลิศ, รองชนะเลิศอันดับ 1"
              value={additionalInfo.achievement}
              onChange={(e) => handleChange('achievement', e.target.value)}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24}>
          <Form.Item
            label="สมาชิกในทีม"
            tooltip={{ title: 'ชื่อสมาชิกในทีมทั้งหมด คั่นด้วยเครื่องหมายจุลภาค', icon: <InfoCircleOutlined /> }}
          >
            <TextArea
              placeholder="เช่น นาย ก นามสกุล (ผู้พัฒนาหลัก), นางสาว ข นามสกุล (ผู้ออกแบบ)"
              value={additionalInfo.team_members}
              onChange={(e) => handleChange('team_members', e.target.value)}
              rows={3}
            />
            <Text type="secondary">คั่นด้วยเครื่องหมายจุลภาค (,) ระหว่างแต่ละคน</Text>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
  
  return (
    <div className="additional-info-step">
      <Title level={3} className="mb-6">
        {projectType === 'coursework' && 'ข้อมูลรายวิชา'}
        {projectType === 'academic' && 'ข้อมูลบทความวิชาการ'}
        {projectType === 'competition' && 'ข้อมูลการแข่งขัน'}
        {!projectType && 'ข้อมูลเพิ่มเติม'}
      </Title>
      
      {renderFormByType()}
    </div>
  );
};

export default AdditionalInfoStep;