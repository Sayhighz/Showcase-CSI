// Shared utilities for Filter components
import { useState, useEffect } from 'react';

// Theme colors - centralized
export const FILTER_THEME_COLORS = {
  primary: '#90278E',
  secondary: '#B252B0', 
  dark: '#5E1A5C',
  lightPurple: '#F5EAFF',
  mediumPurple: '#E0D1FF',
  textLight: '#FFE6FF',
  textSecondary: '#F8CDFF'
};

// Animation variants - centralized
export const CARD_HOVER_ANIMATION = {
  hover: {
    boxShadow: '0 8px 24px rgba(144, 39, 142, 0.15)',
    y: -3,
    transition: { duration: 0.3 }
  },
  initial: {
    boxShadow: '0 4px 12px rgba(144, 39, 142, 0.06)',
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Custom hook for responsive behavior
export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

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

  const getResponsiveSize = () => {
    if (windowWidth < 576) return 'xs';
    if (windowWidth < 768) return 'sm';
    if (windowWidth < 992) return 'md';
    if (windowWidth < 1200) return 'lg';
    return 'xl';
  };

  const responsiveSize = getResponsiveSize();

  return {
    windowWidth,
    responsiveSize,
    isMobile: responsiveSize === 'xs',
    isTablet: responsiveSize === 'sm' || responsiveSize === 'md',
    isDesktop: responsiveSize === 'lg' || responsiveSize === 'xl'
  };
};

// Filter validation helpers
export const hasActiveFilters = (activeFilters = {}) => {
  return Object.keys(activeFilters).length > 0 && 
    Object.values(activeFilters).some(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
};

export const countActiveFilters = (activeFilters = {}) => {
  return Object.values(activeFilters).filter(v => 
    v !== undefined && v !== null && v !== '' && 
    (Array.isArray(v) ? v.length > 0 : true)
  ).length;
};

// Filter display helpers
export const getDisplayKey = (key) => {
  const keyMap = {
    type: 'ประเภท',
    year: 'ปี', 
    studyYear: 'ชั้นปี',
    keyword: 'คำค้นหา',
    tags: 'แท็ก',
    category: 'หมวดหมู่',
    level: 'ระดับ',
    status: 'สถานะ',
  };
  return keyMap[key] || key;
};

export const getTagColor = (key) => {
  const colorMap = {
    type: '#90278E',
    year: '#B252B0',
    studyYear: '#5E1A5C', 
    keyword: '#B252B0',
    tags: '#90278E',
    category: '#5E1A5C',
    level: '#B252B0',
    status: '#90278E',
  };
  return colorMap[key] || '#90278E';
};