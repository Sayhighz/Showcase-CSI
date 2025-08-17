import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Tag, Divider, Row, Col, Badge } from 'antd';
import { FilterOutlined, ReloadOutlined, DownOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FILTER_THEME_COLORS,
  CARD_HOVER_ANIMATION,
  useResponsive,
  hasActiveFilters,
  countActiveFilters,
  getDisplayKey,
  getTagColor
} from '../../utils/filterUtils';

const { Title, Text } = Typography;

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
  const { windowWidth, responsiveSize, isMobile } = useResponsive();

  useEffect(() => {
    const savedState = localStorage.getItem('filterPanelCollapsed');
    if (savedState !== null) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('filterPanelCollapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (windowWidth < 768) {
      setCollapsed(true);
    }
  }, [windowWidth]);

  const activeFiltersExist = hasActiveFilters(activeFilters);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const handleRemoveFilter = (key) => {
    if (onRemoveFilter) {
      onRemoveFilter(key);
    }
  };

  const renderActiveFilterTags = () => {
    return Object.entries(activeFilters).map(([key, value]) => {
      if (value === undefined || value === null || value === '' || 
         (Array.isArray(value) && value.length === 0)) {
        return null;
      }

      const getFilterValue = () => {
        if (Array.isArray(value)) {
          if (value.length > 2) {
            return `${value.slice(0, 2).join(', ')} +${value.length - 2}`;
          }
          return value.join(', ');
        } else if (typeof value === 'boolean') {
          return value ? 'ใช่' : 'ไม่ใช่';
        } else {
          const strValue = value.toString();
          const maxLength = responsiveSize === 'xs' ? 10 : (responsiveSize === 'sm' ? 15 : 20);
          return strValue.length > maxLength ? strValue.substring(0, maxLength) + '...' : strValue;
        }
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
    }).filter(Boolean);
  };

  const activeFiltersContent = activeFiltersExist ? (
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
          color: FILTER_THEME_COLORS.dark
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
            backgroundColor: FILTER_THEME_COLORS.primary,
            borderColor: FILTER_THEME_COLORS.primary,
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

  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          card: {
            backgroundColor: '#2B1A2B',
            color: FILTER_THEME_COLORS.textLight,
            boxShadow: '0 4px 12px rgba(94, 26, 92, 0.25)'
          },
          header: {
            color: FILTER_THEME_COLORS.textLight
          },
          divider: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        };
      case 'gradient':
        return {
          card: {
            background: `linear-gradient(135deg, ${FILTER_THEME_COLORS.lightPurple} 0%, white 100%)`,
            boxShadow: '0 4px 16px rgba(144, 39, 142, 0.12)'
          },
          header: {
            background: `linear-gradient(90deg, ${FILTER_THEME_COLORS.primary} 0%, ${FILTER_THEME_COLORS.secondary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          },
          divider: {
            background: `linear-gradient(to right, ${FILTER_THEME_COLORS.primary}, ${FILTER_THEME_COLORS.secondary})`,
            height: '2px'
          }
        };
      default:
        return {
          card: {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(144, 39, 142, 0.06)',
            border: '1px solid rgba(144, 39, 142, 0.1)'
          },
          header: {
            color: FILTER_THEME_COLORS.primary
          },
          divider: {
            backgroundColor: 'rgba(144, 39, 142, 0.1)'
          }
        };
    }
  };

  const themeStyles = getThemeStyles();
  
  if (collapsible) {
    return (
      <motion.div
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        variants={CARD_HOVER_ANIMATION}
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
          styles={{
            body: {
              padding: responsiveSize === 'xs' ? '12px 14px' : (responsiveSize === 'sm' ? '14px 16px' : '16px 20px')
            }
          }}
          bordered={false}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
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
                  color: activeFiltersExist ? FILTER_THEME_COLORS.primary : 'inherit'
                }} 
              />
              <Title 
                level={5} 
                style={{ 
                  margin: 0,
                  fontWeight: activeFiltersExist ? 600 : 500,
                  fontSize: responsiveSize === 'xs' ? '14px' : (responsiveSize === 'sm' ? '15px' : '16px'),
                  ...themeStyles.header
                }}
              >
                {title}
              </Title>
              {activeFiltersExist && (
                <Badge 
                  count={countActiveFilters(activeFilters)}
                  style={{
                    backgroundColor: FILTER_THEME_COLORS.primary,
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
                  color: activeFiltersExist ? FILTER_THEME_COLORS.primary : 'inherit',
                  fontSize: responsiveSize === 'xs' ? '12px' : '14px'
                }} 
              />
            </motion.div>
          </div>
          
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

  return (
    <motion.div
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      variants={CARD_HOVER_ANIMATION}
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
                color: activeFiltersExist ? FILTER_THEME_COLORS.primary : 'inherit'
              }} 
            />
            <span style={{ 
              ...themeStyles.header,
              fontWeight: activeFiltersExist ? 600 : 500,
              fontSize: responsiveSize === 'xs' ? '14px' : '16px'
            }}>
              {title}
            </span>
            {activeFiltersExist && (
              <Badge 
                count={countActiveFilters(activeFilters)}
                style={{
                  backgroundColor: FILTER_THEME_COLORS.primary,
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
        styles={{
          body: {
            padding: responsiveSize === 'xs'
            ? '12px'
            : (responsiveSize === 'sm'
                ? (layout === 'horizontal' ? '14px 16px' : '14px 18px')
                : (layout === 'horizontal' ? '16px 20px' : '16px 24px'))
          }
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
           {activeFiltersExist && (
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
                   color: FILTER_THEME_COLORS.dark
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
                     backgroundColor: FILTER_THEME_COLORS.primary,
                     borderColor: FILTER_THEME_COLORS.primary,
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