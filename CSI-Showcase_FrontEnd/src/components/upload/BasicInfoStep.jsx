import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Row, Col, Typography, Divider } from 'antd';
import { InfoCircleOutlined, TagOutlined } from '@ant-design/icons';
import { PROJECT_TYPE_DISPLAY } from '../../constants/projectTypes';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * Component for entering basic project information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.basicInfo - Basic information object
 * @param {Function} props.setBasicInfo - Function to update basic information
 * @param {string} props.projectType - Selected project type
 * @returns {React.ReactElement} - Basic information form component
 */
const BasicInfoStep = ({ basicInfo, setBasicInfo, projectType }) => {
  // Generate years (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);
  
  // Study years for dropdown
  const studyYears = [1, 2, 3, 4];
  
  // Semesters for dropdown
  const semesters = [1, 2];

  // Handle input changes
  const handleInputChange = (field, value) => {
    setBasicInfo({
      ...basicInfo,
      [field]: value
    });
  };

  return (
    <div className="basic-info-step">
      <div className="mb-6">
        <Title level={3}>ข้อมูลพื้นฐานของโครงงาน</Title>
        <Paragraph className="text-gray-600">
          กรุณากรอกข้อมูลพื้นฐานของโครงงาน {projectType && <Text strong>({PROJECT_TYPE_DISPLAY[projectType]})</Text>}
        </Paragraph>
      </div>

      <Divider />

      <Form layout="vertical" className="mt-4">
        <Row gutter={16}>
          <Col xs={24} md={24}>
            <Form.Item 
              label="ชื่อโครงงาน" 
              required 
              tooltip="ชื่อโครงงานควรสั้นกระชับและสื่อถึงเนื้อหาของโครงงาน"
            >
              <Input 
                placeholder="กรอกชื่อโครงงาน" 
                value={basicInfo.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={200}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item 
              label="รายละเอียดโครงงาน" 
              required
              tooltip="อธิบายเกี่ยวกับโครงงานของคุณอย่างละเอียด"
            >
              <TextArea 
                placeholder="กรอกรายละเอียดโครงงาน" 
                value={basicInfo.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                autoSize={{ minRows: 4, maxRows: 8 }}
                maxLength={2000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="ชั้นปีที่ทำโครงงาน" required>
              <Select
                placeholder="เลือกชั้นปี"
                value={basicInfo.study_year || undefined}
                onChange={(value) => handleInputChange('study_year', value)}
              >
                {studyYears.map((year) => (
                  <Option key={year} value={year.toString()}>
                    ปี {year}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="ปีการศึกษา" required>
              <Select
                placeholder="เลือกปีการศึกษา"
                value={basicInfo.year || undefined}
                onChange={(value) => handleInputChange('year', value)}
              >
                {years.map((year) => (
                  <Option key={year} value={year.toString()}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="ภาคการศึกษา" required>
              <Select
                placeholder="เลือกภาคการศึกษา"
                value={basicInfo.semester || undefined}
                onChange={(value) => handleInputChange('semester', value)}
              >
                {semesters.map((semester) => (
                  <Option key={semester} value={semester.toString()}>
                    {semester}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item 
              label={
                <span>
                  <TagOutlined /> แท็ก
                </span>
              }
              tooltip="ใส่แท็กที่เกี่ยวข้องกับโครงงาน คั่นด้วยเครื่องหมายจุลภาค (,)"
            >
              <Input 
                placeholder="web, react, programming" 
                value={basicInfo.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
              <Text type="secondary" className="text-xs mt-1 block">
                แท็กจะช่วยให้ผู้อื่นค้นหาโครงงานของคุณได้ง่ายขึ้น (คั่นด้วยเครื่องหมาย , เช่น react, web, programming)
              </Text>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item 
              label="การมองเห็น"
              tooltip="โครงงานที่เผยแพร่จะสามารถมองเห็นได้โดยทุกคน"
            >
              <div className="flex items-center">
                <Switch 
                  checked={basicInfo.visibility === 1} 
                  onChange={(checked) => handleInputChange('visibility', checked ? 1 : 0)}
                  className="mr-2"
                />
                <Text>
                  {basicInfo.visibility === 1 ? 'เผยแพร่' : 'ส่วนตัว'}
                </Text>
              </div>
              <Text type="secondary" className="text-xs mt-1 block">
                <InfoCircleOutlined className="mr-1" />
                หมายเหตุ: โครงงานจะยังคงต้องได้รับการอนุมัติจากผู้ดูแลระบบก่อนจึงจะปรากฏต่อสาธารณะ
              </Text>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default BasicInfoStep;