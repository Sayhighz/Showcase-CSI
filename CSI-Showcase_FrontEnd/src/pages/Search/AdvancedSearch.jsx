import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Divider, 
  Row, 
  Col,
  Space,
  Tag
} from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSearch, useProject } from '../../hooks';
import { PROJECT_TYPES } from '../../constants/projectTypes';
import { SEARCH } from '../../constants/routes';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * AdvancedSearch component ใช้สำหรับการค้นหาขั้นสูง
 * 
 * @param {Object} props - Props ของ component
 * @param {boolean} props.showPopularQueries - แสดงการค้นหายอดนิยมหรือไม่
 * @param {boolean} props.showPopularTags - แสดงแท็กยอดนิยมหรือไม่
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} AdvancedSearch component
 */
const AdvancedSearch = ({
  showPopularQueries = true,
  showPopularTags = true,
  style
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  // เรียกใช้ hook เพื่อจัดการการค้นหา
  const { 
    popularTags,
    popularSearches,
    searchHistory,
    advancedSearch,
    handleKeywordChange,
  } = useSearch();

  // เรียกใช้ hook เพื่อดึงข้อมูลประเภทโปรเจค และปีที่มีในระบบ
  const { 
    fetchProjectTypes, 
    fetchProjectYears, 
    fetchStudyYears,
    projectTypes, 
    projectYears, 
    studyYears 
  } = useProject();

  // ดึงข้อมูลตัวเลือกสำหรับการกรอง
  useEffect(() => {
    fetchProjectTypes();
    fetchProjectYears();
    fetchStudyYears();
  }, [fetchProjectTypes, fetchProjectYears, fetchStudyYears]);

  // ฟังก์ชันสำหรับการค้นหาขั้นสูง
  const handleSearch = (values) => {
    // สร้าง query parameters สำหรับ URL
    const queryParams = new URLSearchParams();
    
    // เพิ่มพารามิเตอร์ที่ไม่ใช่ค่าว่างลงใน URL
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // ถ้าเป็น Array ให้แปลงเป็น string คั่นด้วยเครื่องหมายจุลภาค
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    // นำทางไปยังหน้าผลการค้นหาพร้อมพารามิเตอร์
    navigate(`${SEARCH.RESULTS}?${queryParams.toString()}`);
    
    // ค้นหาโดยใช้ API
    advancedSearch(values);
  };

  // ฟังก์ชันสำหรับรีเซ็ตฟอร์ม
  const handleReset = () => {
    form.resetFields();
  };

  // ฟังก์ชันสำหรับการเลือกแท็กหรือการค้นหายอดนิยม
  const handleQuickSearch = (keyword) => {
    form.setFieldsValue({ keyword });
    handleKeywordChange(keyword);
  };

  return (
    <div style={{ ...style }}>
      <Card>
        <Title level={3}>
          <FilterOutlined style={{ marginRight: 8 }} />
          ค้นหาขั้นสูง
        </Title>
        <Paragraph>
          ใช้ตัวกรองต่อไปนี้เพื่อค้นหาโปรเจคที่ตรงกับความต้องการของคุณ
        </Paragraph>
        
        <Divider />
        
        <Form
          form={form}
          name="advanced_search"
          layout="vertical"
          onFinish={handleSearch}
          requiredMark={false}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                name="keyword" 
                label="คำค้นหา"
              >
                <Input 
                  placeholder="ค้นหาตามชื่อ, คำอธิบาย, หรือเนื้อหา" 
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                name="type" 
                label="ประเภทโปรเจค"
              >
                <Select placeholder="เลือกประเภทโปรเจค" allowClear>
                  {PROJECT_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                name="year" 
                label="ปีของโปรเจค"
              >
                <Select placeholder="เลือกปีของโปรเจค" allowClear>
                  {projectYears.map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                name="studyYear" 
                label="ชั้นปีของผู้สร้าง"
              >
                <Select placeholder="เลือกชั้นปีของผู้สร้าง" allowClear>
                  {studyYears.map(year => (
                    <Option key={year} value={year}>ปี {year}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                name="tags" 
                label="แท็ก"
              >
                <Select
                  mode="tags"
                  placeholder="เลือกหรือเพิ่มแท็ก"
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                name="dateRange" 
                label="ช่วงเวลาที่สร้าง"
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  placeholder={['วันเริ่มต้น', 'วันสิ้นสุด']}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Space size="middle">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
              >
                รีเซ็ต
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
                size="large"
              >
                ค้นหา
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
      
      {/* แสดงการค้นหายอดนิยม */}
      {showPopularQueries && popularSearches && popularSearches.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>การค้นหายอดนิยม</Title>
          <div>
            {popularSearches.map((item, index) => (
              <Tag
                key={index}
                color="blue"
                style={{ margin: '4px', cursor: 'pointer' }}
                onClick={() => handleQuickSearch(item.keyword)}
              >
                {item.keyword} ({item.count})
              </Tag>
            ))}
          </div>
        </Card>
      )}
      
      {/* แสดงแท็กยอดนิยม */}
      {showPopularTags && popularTags && popularTags.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>แท็กยอดนิยม</Title>
          <div>
            {popularTags.map((tag, index) => (
              <Tag
                key={index}
                color="green"
                style={{ margin: '4px', cursor: 'pointer' }}
                onClick={() => form.setFieldsValue({ tags: [tag.name] })}
              >
                {tag.name} ({tag.count})
              </Tag>
            ))}
          </div>
        </Card>
      )}
      
      {/* แสดงประวัติการค้นหาของผู้ใช้ */}
      {searchHistory && searchHistory.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>ประวัติการค้นหาของคุณ</Title>
            <Button type="link">ล้างประวัติ</Button>
          </div>
          <div>
            {searchHistory.map((item, index) => (
              <Tag
                key={index}
                style={{ margin: '4px', cursor: 'pointer' }}
                onClick={() => handleQuickSearch(item.keyword)}
              >
                {item.keyword}
              </Tag>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;