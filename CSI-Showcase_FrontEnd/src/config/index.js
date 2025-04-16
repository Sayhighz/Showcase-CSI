import axiosInstance from './axiosConfig';
import themeConfig, { colors, theme, breakpoints, spaceTheme } from './themeConfig';

// Export all config settings from this index file
// This allows importing multiple configs like:
// import { axiosInstance, theme } from './config';

export {
  axiosInstance,
  themeConfig,
  colors,
  theme,
  breakpoints,
  spaceTheme
};

// Default export for simple import
export default {
  axios: axiosInstance,
  theme: themeConfig
};