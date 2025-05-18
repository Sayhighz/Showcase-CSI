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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // ตรวจสอบขนาดหน้าจอและอัปเดต state
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

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

  // ตรวจสอบอัตโนมัติว่าควรเริ่มต้นในโหมดพับ
  useEffect(() => {
    if (windowWidth < 768) {
      setCollapsed(true);
    }
  }, [windowWidth]);

  // CSS Variables for theme colors
  const themeColors = {
    primary: '#90278E',       // สีม่วงเข้ม (primary)
    secondary: '#B252B0',     // สีม่วงอ่อน (secondary)
    dark: '#5E1A5C',          // สีม่วงเข้มมาก (dark variant)
    lightPurple: '#F5EAFF',   // สีม่วงอ่อนมาก (background)
    mediumPurple: '#E0D1FF',  // สีม่วงกลาง
    textLight: '#FFE6FF',     // สีตัวอักษรบนพื้นเข้ม
    textSecondary: '#F8CDFF'  // สีตัวอักษรรอง
  };

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

  // ปรับขนาดตาม responsive
  const getResponsiveSize = () => {
    if (windowWidth < 576) return 'xs';
    if (windowWidth < 768) return 'sm';
    if (windowWidth < 992) return 'md';
    if (windowWidth < 1200) return 'lg';
    return 'xl';
  };

  const responsiveSize = getResponsiveSize();

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
          // แสดงข้อความสั้นลงสำหรับหน้าจอเล็ก
          const maxLength = responsiveSize === 'xs' ? 10 : (responsiveSize === 'sm' ? 15 : 20);
          return strValue.length > maxLength ? strValue.substring(0, maxLength) + '...' : strValue;
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
          category: 'หมวดหมู่',
          level: 'ระดับ',
          status: 'สถานะ',
          // เพิ่มเติมตามต้องการ
        };
        
        return keyMap[key] || key;
      };

      // ฟังก์ชันเพื่อกำหนดสีของ tag ตาม key
      const getTagColor = (key) => {
        const colorMap = {
          type: '#90278E',         // สีม่วงเข้ม (primary)
          year: '#B252B0',         // สีม่วงอ่อน (secondary)
          studyYear: '#5E1A5C',    // สีม่วงเข้มมาก
          keyword: '#B252B0',      // สีม่วงอ่อน
          tags: '#90278E',         // สีม่วงเข้ม
          category: '#5E1A5C',     // สีม่วงเข้มมาก
          level: '#B252B0',        // สีม่วงอ่อน
          status: '#90278E',       // สีม่วงเข้ม
          // เพิ่มเติมตามต้องการ
        };
        
        // Default color if not specified
        return colorMap[key] || '#90278E';
      };

      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{ 
            display: 'inline-block', 
            margin: responsiveSize === 'xs' ? '2px' : '4px'
          }}
        >
          <Tag
            closable
            onClose={() => handleRemoveFilter(key)}
            color={getTagColor(key)}
            style={{ 
              borderRadius: '16px', 
              padding: responsiveSize === 'xs' ? '2px 6px' : '4px 10px', 
              display: 'flex', 
              alignItems: 'center',
              gap: responsiveSize === 'xs' ? '2px' : '4px',
              backgroundColor: getTagColor(key),
              color: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(144, 39, 142, 0.2)'
            }}
          >
            <Text strong style={{ 
              color: '#FFFFFF', 
              fontSize: responsiveSize === 'xs' ? '10px' : (responsiveSize === 'sm' ? '11px' : '12px')
            }}>
              {getDisplayKey(key)}:
            </Text>
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: responsiveSize === 'xs' ? '10px' : (responsiveSize === 'sm' ? '11px' : '12px') 
            }}>
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
      style={{ marginTop: responsiveSize === 'xs' ? 8 : 16 }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: responsiveSize === 'xs' ? 4 : 8,
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <Text strong style={{ 
          fontSize: responsiveSize === 'xs' ? '12px' : (responsiveSize === 'sm' ? '13px' : '14px'), 
          color: themeColors.dark 
        }}>
          ตัวกรองที่ใช้งาน
        </Text>
        <Button 
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleClearFilters}
          disabled={loading}
          size={responsiveSize === 'xs' || responsiveSize === 'sm' ? 'small' : 'middle'}
          style={{ 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center',
            gap: '4px',
            backgroundColor: themeColors.primary,
            borderColor: themeColors.primary,
            boxShadow: '0 2px 4px rgba(144, 39, 142, 0.2)',
            padding: responsiveSize === 'xs' ? '0 8px' : undefined
          }}
        >
          ล้างทั้งหมด
        </Button>
      </div>
      <AnimatePresence>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: responsiveSize === 'xs' ? '2px' : '4px' 
        }}>
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
            backgroundColor: '#2B1A2B',  // สีพื้นหลังเข้ม
            color: themeColors.textLight,
            boxShadow: '0 4px 12px rgba(94, 26, 92, 0.25)'
          },
          header: {
            color: themeColors.textLight
          },
          divider: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        };
      case 'gradient':
        return {
          card: {
            background: `linear-gradient(135deg, ${themeColors.lightPurple} 0%, white 100%)`,
            boxShadow: '0 4px 16px rgba(144, 39, 142, 0.12)'
          },
          header: {
            background: `linear-gradient(90deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          },
          divider: {
            background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
            height: '2px'
          }
        };
      default: // light
        return {
          card: {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(144, 39, 142, 0.06)',
            border: '1px solid rgba(144, 39, 142, 0.1)'
          },
          header: {
            color: themeColors.primary
          },
          divider: {
            backgroundColor: 'rgba(144, 39, 142, 0.1)'
          }
        };
    }
  };

  const themeStyles = getThemeStyles();
  
  // Animation variants for hover effect on card
  const cardHoverAnimation = {
    hover: {
      boxShadow: '0 8px 24px rgba(144, 39, 142, 0.15)',
      y: -3,
      transition: { duration: 0.3 }
    },
    initial: {
      boxShadow: themeStyles.card.boxShadow,
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  // แสดงผลในรูปแบบที่พับเก็บได้
  if (collapsible) {
    return (
      <motion.div
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        variants={cardHoverAnimation}
      >
        <Card 
          style={{ 
            marginBottom: responsiveSize === 'xs' ? 8 : 16, 
            borderRadius: responsiveSize === 'xs' ? '8px' : '12px', 
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            ...themeStyles.card,
            ...style 
          }}
          bodyStyle={{ 
            padding: responsiveSize === 'xs' ? '12px 14px' : (responsiveSize === 'sm' ? '14px 16px' : '16px 20px') 
          }}
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
              padding: responsiveSize === 'xs' ? '4px 0' : '8px 0',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined
                style={{ 
                  marginRight: responsiveSize === 'xs' ? 6 : 10, 
                  fontSize: responsiveSize === 'xs' ? '14px' : '18px',
                  color: hasActiveFilters ? themeColors.primary : 'inherit'
                }} 
              />
              <Title 
                level={5} 
                style={{ 
                  margin: 0,
                  fontWeight: hasActiveFilters ? 600 : 500,
                  fontSize: responsiveSize === 'xs' ? '14px' : (responsiveSize === 'sm' ? '15px' : '16px'),
                  ...themeStyles.header
                }}
              >
                {title}
              </Title>
              {hasActiveFilters && (
                <Badge 
                  count={countActiveFilters()} 
                  style={{ 
                    backgroundColor: themeColors.primary,
                    boxShadow: '0 2px 4px rgba(144, 39, 142, 0.2)',
                    marginLeft: '8px',
                    transform: responsiveSize === 'xs' ? 'scale(0.8)' : 'scale(1)'
                  }}
                />
              )}
            </div>
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <DownOutlined 
                style={{ 
                  color: hasActiveFilters ? themeColors.primary : 'inherit',
                  fontSize: responsiveSize === 'xs' ? '12px' : '14px'
                }} 
              />
            </motion.div>
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
                <Divider 
                  style={{ 
                    margin: responsiveSize === 'xs' ? '8px 0' : '12px 0',
                    ...themeStyles.divider
                  }} 
                />
                <div className="filter-panel-content">
                  {children}
                  {activeFiltersContent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  }

  // แสดงผลในรูปแบบปกติ (ไม่พับเก็บ)
  return (
    <motion.div
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      variants={cardHoverAnimation}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FilterOutlined 
              style={{ 
                marginRight: responsiveSize === 'xs' ? 6 : 10, 
                fontSize: responsiveSize === 'xs' ? '14px' : '18px',
                color: hasActiveFilters ? themeColors.primary : 'inherit'
              }} 
            />
            <span style={{ 
              ...themeStyles.header,
              fontWeight: hasActiveFilters ? 600 : 500,
              fontSize: responsiveSize === 'xs' ? '14px' : '16px'
            }}>
              {title}
            </span>
            {hasActiveFilters && (
              <Badge 
                count={countActiveFilters()} 
                style={{ 
                  backgroundColor: themeColors.primary,
                  boxShadow: '0 2px 4px rgba(144, 39, 142, 0.2)',
                  marginLeft: '8px',
                  transform: responsiveSize === 'xs' ? 'scale(0.8)' : 'scale(1)'
                }}
              />
            )}
          </div>
        }
        style={{ 
          marginBottom: responsiveSize === 'xs' ? 8 : 16, 
          borderRadius: responsiveSize === 'xs' ? '8px' : '12px', 
          overflow: 'hidden',
          ...themeStyles.card,
          ...style 
        }}
        bodyStyle={{ 
          padding: responsiveSize === 'xs' 
            ? '12px' 
            : (responsiveSize === 'sm' 
                ? (layout === 'horizontal' ? '14px 16px' : '14px 18px') 
                : (layout === 'horizontal' ? '16px 20px' : '16px 24px'))
        }}
        bordered={false}
        headStyle={{
          backgroundColor: theme === 'dark' ? '#221122' : theme === 'gradient' ? 'transparent' : '#F5EAFF',
          borderBottom: '1px solid rgba(144, 39, 142, 0.1)',
          padding: responsiveSize === 'xs' ? '8px 12px' : undefined
        }}
      >
        {layout === 'horizontal' ? (
          <Row gutter={[responsiveSize === 'xs' ? 8 : 16, responsiveSize === 'xs' ? 8 : 16]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
             <div className="filter-panel-content">{children}</div>
           </Col>
           {hasActiveFilters && (
             <Col xs={24} sm={24} md={24} lg={24} xl={24}>
               <Divider 
                 style={{ 
                   margin: responsiveSize === 'xs' ? '8px 0' : '12px 0',
                   ...themeStyles.divider
                 }} 
               />
               <div style={{ 
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'center',
                 marginBottom: responsiveSize === 'xs' ? 4 : 8,
                 flexWrap: 'wrap',
                 gap: '8px'
               }}>
                 <Text strong style={{ 
                   fontSize: responsiveSize === 'xs' ? '12px' : '14px', 
                   color: themeColors.dark 
                 }}>
                   ตัวกรองที่ใช้งาน
                 </Text>
                 <Button 
                   type="primary"
                   icon={<ReloadOutlined />}
                   onClick={handleClearFilters}
                   disabled={loading}
                   size={responsiveSize === 'xs' || responsiveSize === 'sm' ? 'small' : 'middle'}
                   style={{ 
                     borderRadius: '20px', 
                     display: 'flex', 
                     alignItems: 'center',
                     gap: '4px',
                     backgroundColor: themeColors.primary,
                     borderColor: themeColors.primary,
                     boxShadow: '0 2px 4px rgba(144, 39, 142, 0.2)'
                   }}
                 >
                   ล้างทั้งหมด
                 </Button>
               </div>
               <AnimatePresence>
                 <div style={{ 
                   display: 'flex', 
                   flexWrap: 'wrap', 
                   gap: responsiveSize === 'xs' ? '2px' : '4px' 
                 }}>
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
   </motion.div>
 );
};

export default FilterPanel;