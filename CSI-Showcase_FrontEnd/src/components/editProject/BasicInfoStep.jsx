import React from 'react';
import { Form, Input, Select, Typography, Row, Col, InputNumber, Radio } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * BasicInfoStep component for entering basic project information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.basicInfo - Basic project information
 * @param {Function} props.setBasicInfo - Function to update basic info
 * @param {string} props.projectType - Selected project type
 * @param {boolean} props.isEditing - Whether we're editing an existing project
 * @returns {JSX.Element} BasicInfoStep component
 */
const BasicInfoStep = ({ basicInfo, setBasicInfo, projectType, isEditing = false }) => {
  // Handle changes in form inputs
  const handleChange = (key, value) => {
    setBasicInfo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Generate years for dropdown (current year and 10 years prior)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      const year = currentYear - i;
      years.push(
        <Option key={year} value={year.toString()}>
          {year}
        </Option>
      );
    }
    return years;
  };

  // Generate study years for dropdown (1-8)
  const generateStudyYears = () => {
    const years = [];
    for (let i = 1; i <= 8; i++) {
      years.push(
        <Option key={i} value={i.toString()}>
          ปี {i}
        </Option>
      );
    }
    return years;
  };

  return (
    <div className="basic-info-step">
      <Title level={3} className="mb-6">ข้อมูลพื้นฐานโครงงาน</Title>
      
      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              label="ชื่อโครงงาน"
              required
              tooltip={{ title: 'ชื่อโครงงานที่แสดงในหน้าแรก', icon: <InfoCircleOutlined /> }}
            >
              <Input
                placeholder="ระบุชื่อโครงงาน"
                value={basicInfo.title}
                onChange={(e) => handleChange('title', e.target.value)}
                maxLength={100}
                showCount
              />
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item
              label="คำอธิบายโครงงาน"
              required
              tooltip={{ title: 'อธิบายรายละเอียดของโครงงานโดยย่อ', icon: <InfoCircleOutlined /> }}
            >
              <TextArea
                placeholder="อธิบายรายละเอียดของโครงงานโดยย่อ"
                value={basicInfo.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="ชั้นปีของผู้จัดทำ"
              required
              tooltip={{ title: 'ชั้นปีของผู้จัดทำโครงงานในขณะที่ทำโครงงานนี้', icon: <InfoCircleOutlined /> }}
            >
              <Select
                placeholder="เลือกชั้นปี"
                value={basicInfo.study_year}
                onChange={(value) => handleChange('study_year', value)}
              >
                {generateStudyYears()}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="ปีการศึกษา"
              required
              tooltip={{ title: 'ปีการศึกษาที่จัดทำโครงงานนี้', icon: <InfoCircleOutlined /> }}
            >
              <Select
                placeholder="เลือกปีการศึกษา"
                value={basicInfo.year}
                onChange={(value) => handleChange('year', value)}
              >
                {generateYears()}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="ภาคการศึกษา"
              required
              tooltip={{ title: 'ภาคการศึกษาที่จัดทำโครงงานนี้', icon: <InfoCircleOutlined /> }}
            >
              <Select
                placeholder="เลือกภาคการศึกษา"
                value={basicInfo.semester}
                onChange={(value) => handleChange('semester', value)}
              >
                <Option value="1">ภาคการศึกษาที่ 1</Option>
                <Option value="2">ภาคการศึกษาที่ 2</Option>
                <Option value="3">ภาคฤดูร้อน</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item
              label="แท็ก (Tags)"
              tooltip={{ title: 'คั่นแต่ละแท็กด้วยเครื่องหมายจุลภาค (,)', icon: <InfoCircleOutlined /> }}
            >
              <Input
                placeholder="เช่น AI, Mobile App, Data Science"
                value={basicInfo.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
              />
              <Text type="secondary">คั่นแท็กด้วยเครื่องหมายจุลภาค (,) เช่น Python, Machine Learning, Computer Vision</Text>
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item
              label="การมองเห็น"
              required
              tooltip={{ title: 'กำหนดว่าใครสามารถมองเห็นโครงงานนี้ได้บ้าง', icon: <InfoCircleOutlined /> }}
            >
              <Radio.Group
                value={basicInfo.visibility}
                onChange={(e) => handleChange('visibility', e.target.value)}
              >
                <Radio value={1}>เผยแพร่ (ทุกคนสามารถเข้าชมได้)</Radio>
                <Radio value={0}>ส่วนตัว (เฉพาะผู้ที่มีลิงก์เท่านั้น)</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default BasicInfoStep;