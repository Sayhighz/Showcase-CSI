import React, { useState, useEffect } from 'react';
import { Card, Collapse, Typography, Button, Space, Tag, Divider, Row, Col, Badge } from 'antd';
import { FilterOutlined, CloseOutlined, ReloadOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Panel } = Collapse;
const { Title, Text } = Typography;

/**
 * FilterPanel component ใช้สำหรับแสดงตัวเลือกการกรองในรูปแบบที่สวยงามและใช้งานง่าย
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
 * @param {string} props.theme - ธีมของ FilterPanel ('light', 'dark', 'gradient')
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
  style,
  theme = 'light'
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);

  // เก็บการตั้งค่าพับเก็บไว้ใน localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('filterPanelCollapsed');
    if (savedState !== null) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('filterPanelCollapsed', String(collapsed));
  }, [collapsed]);

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

  // นับจำนวนตัวกรองที่ใช้งานอยู่
  const countActiveFilters = () => {
    return Object.values(activeFilters).filter(v => 
      v !== undefined && v !== null && v !== '' && 
      (Array.isArray(v) ? v.length > 0 : true)
    ).length;
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
          // ถ้าค่าเป็น array และมีความยาวมากกว่า 2 ให้ย่อ
          if (value.length > 2) {
            return `${value.slice(0, 2).join(', ')} +${value.length - 2}`;
          }
          return value.join(', ');
        } else if (typeof value === 'boolean') {
          return value ? 'ใช่' : 'ไม่ใช่';
        } else {
          // ถ้าค่าเป็นข้อความยาวเกินไป ให้ย่อ
          const strValue = value.toString();
          return strValue.length > 20 ? strValue.substring(0, 20) + '...' : strValue;
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

      // ฟังก์ชันเพื่อกำหนดสีของ tag ตาม key
      const getTagColor = (key) => {
        const colorMap = {
          type: 'blue',
          year: 'green',
          studyYear: 'purple',
          keyword: 'magenta',
          tags: 'orange',
          // เพิ่มเติมตามต้องการ
        };
        
        return colorMap[key] || 'blue';
      };

      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-block', margin: '4px' }}
        >
          <Tag
            closable
            onClose={() => handleRemoveFilter(key)}
            color={getTagColor(key)}
            style={{ 
              borderRadius: '16px', 
              padding: '4px 10px', 
              display: 'flex', 
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Text strong style={{ color: 'inherit', fontSize: '12px' }}>
              {getDisplayKey(key)}:
            </Text>
            <Text style={{ color: 'inherit', fontSize: '12px' }}>
              {getFilterValue()}
            </Text>
          </Tag>
        </motion.div>
      );
    }).filter(Boolean); // กรองรายการที่เป็น null ออก
  };

  // เนื้อหาสำหรับแสดงในส่วนตัวกรองที่ใช้งานอยู่
  const activeFiltersContent = hasActiveFilters ? (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginTop: 16 }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Text strong style={{ fontSize: '14px' }}>ตัวกรองที่ใช้งาน</Text>
        <Button 
          type="primary"
          ghost
          icon={<ReloadOutlined />}
          onClick={handleClearFilters}
          disabled={loading}
          size="small"
          style={{ 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ล้างทั้งหมด
        </Button>
      </div>
      <AnimatePresence>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {renderActiveFilterTags()}
        </div>
      </AnimatePresence>
    </motion.div>
  ) : null;

  // กำหนดสไตล์ตามธีม
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          card: {
            backgroundColor: '#1f1f1f',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          header: {
            color: '#fff'
          }
        };
      case 'gradient':
        return {
          card: {
            background: 'linear-gradient(135deg, #f7f9fc 0%, #eef1f5 100%)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          },
          header: {
            background: 'linear-gradient(90deg, #1890ff 0%, #52c41a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }
        };
      default: // light
        return {
          card: {
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          },
          header: {
            color: 'inherit'
          }
        };
    }
  };

  const themeStyles = getThemeStyles();
  
  // แสดงผลในรูปแบบที่พับเก็บได้
  if (collapsible) {
    return (
      <Card 
        style={{ 
          marginBottom: 16, 
          borderRadius: '12px', 
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          ...themeStyles.card,
          ...style 
        }}
        bodyStyle={{ padding: '12px 16px' }}
        bordered={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Custom Collapse Header */}
        <div 
          onClick={toggleCollapse}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            padding: '8px 0',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FilterOutlined
              style={{ 
                marginRight: 8, 
                fontSize: '16px',
                color: hasActiveFilters ? '#1890ff' : 'inherit'
              }} 
            />
            <Title 
              level={5} 
              style={{ 
                margin: 0,
                fontWeight: hasActiveFilters ? 600 : 500,
                ...themeStyles.header
              }}
            >
              {title}
            </Title>
            {hasActiveFilters && (
              <Badge 
                count={countActiveFilters()} 
                style={{ 
                  backgroundColor: '#1890ff',
                  marginLeft: '8px'
                }}
              />
            )}
          </div>
          {collapsed ? 
            <RightOutlined style={{ transition: 'transform 0.3s' }} /> : 
            <DownOutlined style={{ transition: 'transform 0.3s' }} />
          }
        </div>
        
        {/* Custom Collapse Content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <Divider style={{ margin: '12px 0' }} />
              <div className="filter-panel-content">
                {children}
                {activeFiltersContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  }

  // แสดงผลในรูปแบบปกติ (ไม่พับเก็บ)
  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FilterOutlined 
            style={{ 
              marginRight: 8, 
              color: hasActiveFilters ? '#1890ff' : 'inherit'
            }} 
          />
          <span style={{ ...themeStyles.header }}>{title}</span>
          {hasActiveFilters && (
            <Badge 
              count={countActiveFilters()} 
              style={{ 
                backgroundColor: '#1890ff',
                marginLeft: '8px'
              }}
            />
          )}
        </div>
      }
      style={{ 
        marginBottom: 16, 
        borderRadius: '12px', 
        overflow: 'hidden',
        ...themeStyles.card,
        ...style 
      }}
      bodyStyle={{ padding: layout === 'horizontal' ? '16px' : '16px 24px' }}
      bordered={false}
    >
      {layout === 'horizontal' ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <div className="filter-panel-content">{children}</div>
          </Col>
          {hasActiveFilters && (
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 8,
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <Text strong style={{ fontSize: '14px' }}>ตัวกรองที่ใช้งาน</Text>
                <Button 
                  type="primary"
                  ghost
                  icon={<ReloadOutlined />}
                  onClick={handleClearFilters}
                  disabled={loading}
                  size="small"
                  style={{ 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ล้างทั้งหมด
                </Button>
              </div>
              <AnimatePresence>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {renderActiveFilterTags()}
                </div>
              </AnimatePresence>
            </Col>
          )}
        </Row>
      ) : (
        <>
          <div className="filter-panel-content">{children}</div>
          {activeFiltersContent}
        </>
      )}
    </Card>
  );
};

export default FilterPanel;