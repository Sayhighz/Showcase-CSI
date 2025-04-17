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
  Tag,
  Tooltip,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  FireOutlined,
  HistoryOutlined,
  TagOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSearch, useProject } from '../../hooks';
import { PROJECT_TYPES } from '../../constants/projectTypes';
import { SEARCH } from '../../constants/routes';
import { colors, spaceTheme } from '../../config/themeConfig';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
  const [showInfo, setShowInfo] = useState(true);
  
  // เรียกใช้ hook เพื่อจัดการการค้นหา
  const { 
    popularTags,
    popularSearches,
    searchHistory,
    advancedSearch,
    handleKeywordChange,
    isSearching
  } = useSearch();

  // เรียกใช้ hook เพื่อดึงข้อมูลตัวกรอง
  const { 
    projectTypes, 
    projectYears, 
    studyYears,
    isLoading: isLoadingFilters, 
    fetchFilterOptions
  } = useProject();

  // ดึงข้อมูลตัวกรอง
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // จัดการการค้นหาขั้นสูง
  const handleSearch = (values) => {
    // สร้าง query parameters สำหรับ URL
    const queryParams = new URLSearchParams();
    
    // เพิ่มพารามิเตอร์ที่ไม่ใช่ค่าว่างลงใน URL
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // ถ้าเป็น Array ให้แปลงเป็น string คั่นด้วยเครื่องหมายจุลภาค
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } 
        // ถ้าเป็น Moment object (Date) ให้แปลงเป็น ISO string
        else if (value._isAMomentObject) {
          queryParams.append(key, value.toISOString());
        } 
        // กรณีอื่นๆ
        else {
          queryParams.append(key, value);
        }
      }
    });
    
    // นำทางไปยังหน้าผลการค้นหาพร้อมพารามิเตอร์
    navigate(`${SEARCH.RESULTS}?${queryParams.toString()}`);
    
    // ค้นหาโดยใช้ API
    advancedSearch(values);
  };

  // จัดการการรีเซ็ตฟอร์ม
  const handleReset = () => {
    form.resetFields();
  };

  // จัดการการเลือกแท็กหรือการค้นหายอดนิยม
  const handleQuickSearch = (keyword) => {
    form.setFieldsValue({ keyword });
    handleKeywordChange(keyword);
  };

  if (isLoadingFilters) {
    return <LoadingSpinner tip="กำลังโหลดตัวกรอง..." />;
  }

  return (
    <motion.div 
      style={{ ...style }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {showInfo && (
        <Alert
          message="เคล็ดลับการค้นหา"
          description="ใช้การค้นหาขั้นสูงเพื่อกรองผลลัพธ์อย่างละเอียด คุณสามารถค้นหาตามประเภทโปรเจค ปีที่สร้าง หรือชั้นปีของผู้สร้างได้"
          type="info"
          showIcon
          closable
          onClose={() => setShowInfo(false)}
          style={{ marginBottom: 24 }}
        />
      )}

      <Card 
        className="search-card"
        style={{ 
          ...spaceTheme.glassCard, 
          background: 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Title level={3} style={{ color: colors.primary, marginBottom: 16 }}>
          <FilterOutlined style={{ marginRight: 8 }} />
          ค้นหาขั้นสูง
        </Title>
        <Paragraph>
          ใช้ตัวกรองต่อไปนี้เพื่อค้นหาโปรเจคที่ตรงกับความต้องการของคุณ
        </Paragraph>
        
        <Divider style={{ borderColor: `${colors.primary}30` }} />
        
        <Form
          form={form}
          name="advanced_search"
          layout="vertical"
          onFinish={handleSearch}
          requiredMark={false}
          validateMessages={{
            required: 'กรุณากรอก${label}'
          }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                name="keyword" 
                label="คำค้นหา"
              >
                <Input 
                  placeholder="ค้นหาตามชื่อ, คำอธิบาย, หรือเนื้อหา" 
                  prefix={<SearchOutlined style={{ color: colors.primary }} />}
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                name="type" 
                label="ประเภทโปรเจค"
              >
                <Select 
                  placeholder="เลือกประเภทโปรเจค" 
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
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
                <Select 
                  placeholder="เลือกปีของโปรเจค" 
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
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
                <Select 
                  placeholder="เลือกชั้นปีของผู้สร้าง" 
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
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
                  allowClear
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
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider style={{ borderColor: `${colors.primary}20` }} />
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Space size="middle">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
              >
                รีเซ็ต
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SearchOutlined />}
                  size="large"
                  loading={isSearching}
                  style={{ 
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    borderColor: 'transparent'
                  }}
                >
                  ค้นหา
                </Button>
              </motion.div>
            </Space>
          </div>
        </Form>
      </Card>
      
      {/* แสดงการค้นหายอดนิยม */}
      {showPopularQueries && popularSearches && popularSearches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            style={{ 
              marginTop: 24, 
              ...spaceTheme.glassCard,
              background: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FireOutlined style={{ color: '#f5222d' }} /> การค้นหายอดนิยม
            </Title>
            <div style={{ marginTop: 16 }}>
              {popularSearches.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Tag
                    color="blue"
                    style={{ margin: '4px', cursor: 'pointer', padding: '4px 8px' }}
                    onClick={() => handleQuickSearch(item.keyword)}
                  >
                    {item.keyword} <span style={{ color: '#fff', fontWeight: 'bold' }}>({item.count})</span>
                  </Tag>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
      
      {/* แสดงแท็กยอดนิยม */}
      {showPopularTags && popularTags && popularTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card 
            style={{ 
              marginTop: 24, 
              ...spaceTheme.glassCard,
              background: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TagOutlined style={{ color: '#52c41a' }} /> แท็กยอดนิยม
            </Title>
            <div style={{ marginTop: 16 }}>
              {popularTags.map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Tag
                    color="green"
                    style={{ margin: '4px', cursor: 'pointer', padding: '4px 8px' }}
                    onClick={() => form.setFieldsValue({ tags: [tag.name] })}
                  >
                    {tag.name} <span style={{ color: '#fff', fontWeight: 'bold' }}>({tag.count})</span>
                  </Tag>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
      
      {/* แสดงประวัติการค้นหาของผู้ใช้ */}
      {searchHistory && searchHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card 
            style={{ 
              marginTop: 24, 
              ...spaceTheme.glassCard,
              background: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HistoryOutlined style={{ color: colors.primary }} /> ประวัติการค้นหาของคุณ
              </Title>
              <Button type="link">ล้างประวัติ</Button>
            </div>
            <div style={{ marginTop: 16 }}>
              {searchHistory.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Tag
                    style={{ margin: '4px', cursor: 'pointer', padding: '4px 8px' }}
                    onClick={() => handleQuickSearch(item.keyword || item)}
                  >
                    {item.keyword || item}
                  </Tag>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdvancedSearch;