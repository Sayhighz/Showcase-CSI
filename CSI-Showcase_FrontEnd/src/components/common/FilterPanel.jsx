import React, { useState } from 'react';
import { Card, Collapse, Typography, Button, Space, Tag, Divider, Row, Col } from 'antd';
import { FilterOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;

/**
 * FilterPanel component ใช้สำหรับแสดงตัวเลือกการกรองในรูปแบบที่สวยงาม
 * 
 * @param {Object} props - Props ของ component
 * @param {React.ReactNode} props.children - เนื้อหาภายใน FilterPanel
 * @param {string} props.title - หัวข้อของ FilterPanel
 * @param {Object} props.activeFilters - ตัวกรองที่ใช้งานอยู่
 * @param {Function} props.onClearFilters - ฟังก์ชันที่จะทำงานเมื่อล้างตัวกรองทั้งหมด
 * @param {Function} props.onRemoveFilter - ฟังก์ชันที่จะทำงานเมื่อลบตัวกรองออก
 * @param {boolean} props.collapsible - สามารถพับเก็บได้หรือไม่
 * @param {boolean} props.defaultCollapsed - พับเก็บตอนเริ่มต้นหรือไม่
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {string} props.layout - รูปแบบการแสดงผล ('horizontal', 'vertical')
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} FilterPanel component
 */
const FilterPanel = ({
  children,
  title = 'ตัวกรอง',
  activeFilters = {},
  onClearFilters,
  onRemoveFilter,
  collapsible = true,
  defaultCollapsed = false,
  loading = false,
  layout = 'vertical',
  style
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // ตรวจสอบว่ามีตัวกรองที่ใช้งานอยู่หรือไม่
  const hasActiveFilters = Object.keys(activeFilters).length > 0 && 
    Object.values(activeFilters).some(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    );

  // ฟังก์ชันสำหรับการพับเก็บ/แสดงเนื้อหา
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // ฟังก์ชันสำหรับการล้างตัวกรองทั้งหมด
  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // ฟังก์ชันสำหรับการลบตัวกรองออก
  const handleRemoveFilter = (key) => {
    if (onRemoveFilter) {
      onRemoveFilter(key);
    }
  };

  // แปลง activeFilters เป็น tags
  const renderActiveFilterTags = () => {
    return Object.entries(activeFilters).map(([key, value]) => {
      // ข้ามรายการที่ไม่มีค่า
      if (value === undefined || value === null || value === '' || 
         (Array.isArray(value) && value.length === 0)) {
        return null;
      }

      // ฟังก์ชันเพื่อแสดงค่าของตัวกรอง
      const getFilterValue = () => {
        if (Array.isArray(value)) {
          return value.join(', ');
        } else if (typeof value === 'boolean') {
          return value ? 'ใช่' : 'ไม่ใช่';
        } else {
          return value.toString();
        }
      };

      // แปลงชื่อ key เป็นชื่อที่อ่านได้
      const getDisplayKey = (key) => {
        // ตัวอย่างการแปลงชื่อ key
        const keyMap = {
          type: 'ประเภท',
          year: 'ปี',
          studyYear: 'ชั้นปี',
          keyword: 'คำค้นหา',
          tags: 'แท็ก',
          // เพิ่มเติมตามต้องการ
        };
        
        return keyMap[key] || key;
      };

      return (
        <Tag
          key={key}
          closable
          onClose={() => handleRemoveFilter(key)}
          color="blue"
          style={{ margin: '4px' }}
        >
          {getDisplayKey(key)}: {getFilterValue()}
        </Tag>
      );
    }).filter(Boolean); // กรองรายการที่เป็น null ออก
  };

  // เนื้อหาสำหรับแสดงในส่วนตัวกรองที่ใช้งานอยู่
  const activeFiltersContent = hasActiveFilters ? (
    <div style={{ marginTop: 16 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Text strong>ตัวกรองที่ใช้งาน</Text>
        <Button 
          type="link" 
          icon={<ReloadOutlined />}
          onClick={handleClearFilters}
          disabled={loading}
          size="small"
        >
          ล้างทั้งหมด
        </Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {renderActiveFilterTags()}
      </div>
    </div>
  ) : null;

  // แสดงผลในรูปแบบที่พับเก็บได้
  if (collapsible) {
    return (
      <Card style={{ marginBottom: 16, ...style }}>
        <Collapse 
          defaultActiveKey={defaultCollapsed ? [] : ['1']}
          ghost
          expandIconPosition="end"
        >
          <Panel 
            header={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FilterOutlined style={{ marginRight: 8 }} />
                <Title level={5} style={{ margin: 0 }}>{title}</Title>
                {hasActiveFilters && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {Object.values(activeFilters).filter(v => 
                      v !== undefined && v !== null && v !== '' && 
                      (Array.isArray(v) ? v.length > 0 : true)
                    ).length}
                  </Tag>
                )}
              </div>
            } 
            key="1"
          >
            {children}
            {activeFiltersContent}
          </Panel>
        </Collapse>
      </Card>
    );
  }

  // แสดงผลในรูปแบบปกติ (ไม่พับเก็บ)
  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FilterOutlined style={{ marginRight: 8 }} />
          {title}
          {hasActiveFilters && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {Object.values(activeFilters).filter(v => 
                v !== undefined && v !== null && v !== '' && 
                (Array.isArray(v) ? v.length > 0 : true)
              ).length}
            </Tag>
          )}
        </div>
      }
      style={{ marginBottom: 16, ...style }}
    >
      {layout === 'horizontal' ? (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {children}
          </Col>
          {hasActiveFilters && (
            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 8
              }}>
                <Text strong>ตัวกรองที่ใช้งาน</Text>
                <Button 
                  type="link" 
                  icon={<ReloadOutlined />}
                  onClick={handleClearFilters}
                  disabled={loading}
                  size="small"
                >
                  ล้างทั้งหมด
                </Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {renderActiveFilterTags()}
              </div>
            </Col>
          )}
        </Row>
      ) : (
        <>
          {children}
          {activeFiltersContent}
        </>
      )}
    </Card>
  );
};

export default FilterPanel;