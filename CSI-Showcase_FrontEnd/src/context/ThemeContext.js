/**
 * Context สำหรับจัดการธีม
 * ใช้สำหรับจัดการและแชร์ state ที่เกี่ยวข้องกับธีมระหว่าง component ต่างๆ
 */
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { ConfigProvider } from 'antd';

// นำเข้าธีมสำหรับ Ant Design
import { theme, colors, breakpoints, spaceTheme } from '../config/themeConfig';

// ค่าเริ่มต้นของธีม
const defaultTheme = {
  mode: 'light', // light หรือ dark
  primaryColor: colors.primary,
  backgroundColor: colors.lightBackground,
  customization: {},
  textColor: colors.textDark,
};

// คีย์สำหรับเก็บการตั้งค่าธีมใน localStorage
const THEME_STORAGE_KEY = 'csi_showcase_theme';

// สร้าง Context
export const ThemeContext = createContext();

/**
 * Provider สำหรับ ThemeContext
 * @param {Object} props - Props ของ component
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - Provider component
 */
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [antdTheme, setAntdTheme] = useState(theme);

  /**
   * โหลดการตั้งค่าธีมจาก localStorage
   */
  const loadThemeFromStorage = useCallback(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        setCurrentTheme(parsedTheme);
        
        // อัปเดตธีมของ Ant Design
        updateAntdTheme(parsedTheme);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดธีมจาก localStorage:', error);
    }
  }, []);

  /**
   * บันทึกการตั้งค่าธีมลง localStorage
   * @param {Object} theme - ธีมที่ต้องการบันทึก
   */
  const saveThemeToStorage = useCallback((theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกธีมลง localStorage:', error);
    }
  }, []);

  /**
   * อัปเดตธีมของ Ant Design
   * @param {Object} theme - ธีมที่ต้องการอัปเดต
   */
  const updateAntdTheme = useCallback((themeConfig) => {
    const { mode, primaryColor, backgroundColor, textColor } = themeConfig;
    
    // สร้างธีมใหม่โดยการรวมกับธีมพื้นฐาน
    const updatedTheme = {
      ...theme,
      algorithm: mode === 'dark' ? 
        [ConfigProvider.theme.darkAlgorithm] : 
        [ConfigProvider.theme.defaultAlgorithm],
      token: {
        ...theme.token,
        colorPrimary: primaryColor,
        colorBgBase: backgroundColor,
        colorText: textColor,
      },
    };
    
    setAntdTheme(updatedTheme);
  }, []);

  /**
   * เปลี่ยนโหมดธีม (light/dark)
   * @param {'light'|'dark'} mode - โหมดธีมที่ต้องการ
   */
  const toggleThemeMode = useCallback((mode = null) => {
    setCurrentTheme(prevTheme => {
      // ถ้าไม่ระบุโหมด ให้สลับไปมาระหว่าง light กับ dark
      const newMode = mode || (prevTheme.mode === 'light' ? 'dark' : 'light');
      
      // กำหนดค่าสีตามโหมด
      const newBackgroundColor = newMode === 'light' ? colors.lightBackground : colors.darkBackground;
      const newTextColor = newMode === 'light' ? colors.textDark : colors.textLight;
      
      const newTheme = {
        ...prevTheme,
        mode: newMode,
        backgroundColor: newBackgroundColor,
        textColor: newTextColor,
      };
      
      // อัปเดตธีมของ Ant Design
      updateAntdTheme(newTheme);
      
      // บันทึกธีมลง localStorage
      saveThemeToStorage(newTheme);
      
      return newTheme;
    });
  }, [updateAntdTheme, saveThemeToStorage]);

  /**
   * เปลี่ยนสีหลัก (primary color)
   * @param {string} color - สีหลักในรูปแบบ HEX code
   */
  const changePrimaryColor = useCallback((color) => {
    if (!color) return;
    
    setCurrentTheme(prevTheme => {
      const newTheme = {
        ...prevTheme,
        primaryColor: color,
      };
      
      // อัปเดตธีมของ Ant Design
      updateAntdTheme(newTheme);
      
      // บันทึกธีมลง localStorage
      saveThemeToStorage(newTheme);
      
      return newTheme;
    });
  }, [updateAntdTheme, saveThemeToStorage]);

  /**
   * ปรับแต่งธีมเพิ่มเติม
   * @param {Object} customization - การปรับแต่งธีมเพิ่มเติม
   */
  const customizeTheme = useCallback((customization) => {
    if (!customization) return;
    
    setCurrentTheme(prevTheme => {
      const newTheme = {
        ...prevTheme,
        customization: {
          ...prevTheme.customization,
          ...customization,
        },
      };
      
      // บันทึกธีมลง localStorage
      saveThemeToStorage(newTheme);
      
      return newTheme;
    });
  }, [saveThemeToStorage]);

  /**
   * รีเซ็ตธีมกลับไปเป็นค่าเริ่มต้น
   */
  const resetTheme = useCallback(() => {
    setCurrentTheme(defaultTheme);
    updateAntdTheme(defaultTheme);
    saveThemeToStorage(defaultTheme);
  }, [updateAntdTheme, saveThemeToStorage]);

  // โหลดการตั้งค่าธีมจาก localStorage เมื่อ component mount
  useEffect(() => {
    loadThemeFromStorage();
  }, [loadThemeFromStorage]);

  // สร้าง global CSS variables ตามธีม
  useEffect(() => {
    const root = document.documentElement;
    
    // กำหนด CSS variables
    root.style.setProperty('--primary-color', currentTheme.primaryColor);
    root.style.setProperty('--background-color', currentTheme.backgroundColor);
    root.style.setProperty('--text-color', currentTheme.textColor);
    
    // กำหนด class ของ body ตามโหมด
    if (currentTheme.mode === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [currentTheme]);

  // สร้าง value object สำหรับ context
  const value = {
    // State
    theme: currentTheme,
    antdTheme,
    
    // Theme Constants
    colors,
    breakpoints,
    spaceTheme,
    
    // Actions
    toggleThemeMode,
    changePrimaryColor,
    customizeTheme,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook สำหรับใช้งาน ThemeContext
 * @returns {Object} - Theme context
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useThemeContext ต้องใช้ภายใน ThemeProvider');
  }
  
  return context;
};

export default { ThemeContext, ThemeProvider, useThemeContext };