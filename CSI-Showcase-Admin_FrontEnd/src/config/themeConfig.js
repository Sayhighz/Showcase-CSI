import { theme as antdTheme } from 'antd';

// Define custom colors that will be used throughout the admin app
export const colors = {
  // Primary colors
  primary: '#90278E', // Main purple color
  secondary: '#FF5E8C', // Pink accent
  
  // Background colors
  darkBackground: '#0D0221', // Dark space background
  lightBackground: '#F9F5FF', // Light background
  
  // Text colors
  textDark: '#424242',
  textLight: '#FFFFFF',
  textMuted: '#808080',
  
  // Status colors
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',
  
  // Gradients
  primaryGradient: 'linear-gradient(to right, #90278E, #FF5E8C)',
  darkGradient: 'linear-gradient(to bottom, rgba(13, 2, 33, 0.6), rgba(13, 2, 33, 0.9))',
  spaceGradient: 'linear-gradient(180deg, #90278E 0%, #6A1B68 100%)',
};

// Create a custom theme configuration for Ant Design in Admin
export const theme = {
  // Use Ant Design's algorithm
  algorithm: antdTheme.defaultAlgorithm,
  
  // Override the token values
  token: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,
    
    // Border radius
    borderRadius: 8,
    
    // Font settings
    fontFamily: "'SukhumvitSet', 'Kanit', sans-serif", // Thai font support
    fontSize: 16,
    
    // Color settings
    colorText: colors.textDark,
    colorTextSecondary: colors.textMuted,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    
    // Other settings
    motionUnit: 0.1, // Faster animations
    wireframe: false, // Use non-wireframe mode
  },
  
  // Component-specific settings for admin interface
  components: {
    Button: {
      colorPrimary: colors.primary,
      algorithm: true,
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 12,
      paddingLG: 24,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    InputNumber: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Modal: {
      borderRadius: 12,
    },
    Table: {
      borderRadius: 8,
      colorBorderSecondary: '#f0f0f0',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: colors.primary,
      itemSelectedColor: colors.textLight,
      itemColor: '#f6f6f6',
      subMenuItemBg: 'transparent',
    },
    Layout: {
      siderBg: colors.primary,
      headerBg: '#ffffff',
    },
    Breadcrumb: {
      linkColor: colors.primary,
      itemColor: colors.textMuted,
    },
    Steps: {
      colorPrimary: colors.primary,
    },
    Progress: {
      colorSuccess: colors.success,
    },
    Tag: {
      borderRadius: 16,
    },
    Alert: {
      borderRadius: 8,
    },
    Drawer: {
      colorBgElevated: colors.primary,
    },
  },
};

// Define media breakpoints for responsive design
export const breakpoints = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
};

// Define admin theme styles for various components
export const adminTheme = {
  // Sidebar with gradient
  sidebar: {
    background: colors.spaceGradient,
    color: colors.textLight,
  },
  
  // Card with glass effect for admin panels
  glassCard: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    border: `1px solid rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.1)`,
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(144, 39, 142, 0.1)',
  },
  
  // Enhanced card for hover effects
  enhancedCard: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: `1px solid rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.1)`,
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(144, 39, 142, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(144, 39, 142, 0.15)',
    },
  },
  
  // Glow effects for important elements
  glow: {
    primary: {
      boxShadow: `0 0 15px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.6)`,
    },
    secondary: {
      boxShadow: `0 0 15px rgba(${parseInt(colors.secondary.slice(1, 3), 16)}, ${parseInt(colors.secondary.slice(3, 5), 16)}, ${parseInt(colors.secondary.slice(5, 7), 16)}, 0.6)`,
    },
  },
  
  // Button styles
  buttons: {
    primary: {
      background: colors.primaryGradient,
      border: 'none',
      color: colors.textLight,
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 15px rgba(144, 39, 142, 0.4)',
      },
    },
  },
};

// Status color mappings for consistent styling
export const statusColors = {
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  pending: colors.warning,
  approved: colors.success,
  rejected: colors.error,
  draft: colors.textMuted,
};

export default {
  colors,
  theme,
  breakpoints,
  adminTheme,
  statusColors,
};