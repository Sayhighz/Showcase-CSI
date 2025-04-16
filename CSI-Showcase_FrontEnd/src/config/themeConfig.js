import { theme as antdTheme } from 'antd';

// Define custom colors that will be used throughout the app
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
};

// Create a custom theme configuration for Ant Design
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
    borderRadius: 6,
    
    // Font settings
    fontFamily: "'Prompt', 'Kanit', sans-serif", // Thai font support
    fontSize: 16,
    
    // Color settings
    colorText: colors.textDark,
    colorTextSecondary: colors.textMuted,
    colorBgContainer: colors.lightBackground,
    
    // Other settings
    motionUnit: 0.1, // Faster animations
    wireframe: false, // Use non-wireframe mode
  },
  
  // Component-specific settings
  components: {
    Button: {
      colorPrimary: colors.primary,
      algorithm: true, // Use default button algorithm
      borderRadius: 20, // Rounded buttons
    },
    Card: {
      borderRadius: 12,
    },
    Input: {
      borderRadius: 6,
    },
    Modal: {
      borderRadius: 12,
    },
    Select: {
      borderRadius: 6,
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

// Define space theme styles for various components
export const spaceTheme = {
  // Background with stars
  starBackground: {
    background: colors.darkBackground,
    backgroundImage: `
      radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px), 
      radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px, 100px 100px',
    opacity: 0.2,
  },
  
  // Card with glass effect
  glassCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    border: `1px solid rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.3)`,
    borderRadius: '12px',
  },
  
  // Glow effects
  glow: {
    boxShadow: `0 0 15px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.6)`,
  },
};

export default {
  colors,
  theme,
  breakpoints,
  spaceTheme,
};