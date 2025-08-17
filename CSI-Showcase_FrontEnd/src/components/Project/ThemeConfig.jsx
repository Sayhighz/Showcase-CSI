import { getCategoryTheme } from '../Work/WorkUtils';
import { BookOutlined, FileTextOutlined, TrophyOutlined, CrownOutlined, TeamOutlined, FileImageOutlined } from '@ant-design/icons';

export const createThemeColors = (category) => {
  const baseTheme = getCategoryTheme(category);
  
  const themes = {
    academic: {
      primary: baseTheme.primary,
      secondary: '#40a9ff',
      dark: '#0050b3',
      light: baseTheme.light,
      lightBackground: '#e6f7ff',
      mediumBackground: '#bae7ff',
      gradientMid: '50%',
      gradientOpacity: '20'
    },
    competition: {
      primary: baseTheme.primary,
      secondary: '#ffc53d',
      dark: '#d48806',
      light: baseTheme.light,
      lightBackground: '#fffbef',
      mediumBackground: '#fff2d3',
      gradientMid: '35%',
      gradientOpacity: '40'
    },
    coursework: {
      primary: baseTheme.primary,
      secondary: '#73d13d',
      dark: '#389e0d',
      light: baseTheme.light,
      lightBackground: '#f6ffed',
      mediumBackground: '#d9f7be',
      gradientMid: '40%',
      gradientOpacity: '30'
    }
  };
  
  return themes[category] || themes.academic;
};

export const createBackgroundConfig = (category, themeColors) => {
  const configs = {
    academic: {
      icons: [
        {
          icon: BookOutlined,
          className: 'top-20 left-10 text-6xl opacity-10',
          color: themeColors.primary,
          animation: { y: [0, -20, 0], rotate: [0, 5, 0] },
          transition: { duration: 6, repeat: Infinity, repeatType: "reverse" }
        },
        {
          icon: FileTextOutlined,
          className: 'top-40 right-20 text-5xl opacity-10',
          color: themeColors.secondary,
          animation: { y: [0, 15, 0], rotate: [0, -3, 0] },
          transition: { duration: 8, repeat: Infinity, repeatType: "reverse" }
        }
      ],
      blobs: [
        {
          className: 'top-32 left-0 w-64 h-64 opacity-20',
          style: { background: `radial-gradient(circle, ${themeColors.primary}30 0%, transparent 70%)` },
          animation: { x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] },
          transition: { duration: 20, repeat: Infinity, repeatType: "reverse" }
        },
        {
          className: 'bottom-20 right-10 w-96 h-96 opacity-15',
          style: { background: `radial-gradient(circle, ${themeColors.secondary}40 0%, transparent 70%)` },
          animation: { x: [0, -40, 0], y: [0, -30, 0], scale: [1, 1.3, 1] },
          transition: { duration: 25, repeat: Infinity, repeatType: "reverse" }
        }
      ]
    },
    competition: {
      icons: [
        {
          icon: TrophyOutlined,
          className: 'top-12 left-12 text-7xl opacity-12',
          color: themeColors.primary,
          animation: { y: [0, -25, 0], rotate: [0, 8, 0], scale: [1, 1.1, 1] },
          transition: { duration: 4, repeat: Infinity, repeatType: "reverse" }
        },
        {
          icon: CrownOutlined,
          className: 'top-32 right-10 text-5xl opacity-10',
          color: themeColors.secondary,
          animation: { y: [0, 18, 0], rotate: [0, -6, 0] },
          transition: { duration: 6, repeat: Infinity, repeatType: "reverse" }
        }
      ],
      blobs: [
        {
          className: 'top-20 left-0 w-80 h-80 opacity-18',
          style: { 
            background: `radial-gradient(ellipse 130% 70%, ${themeColors.primary}50 0%, transparent 70%)`,
            transform: 'rotate(20deg)'
          },
          animation: { x: [0, 45, 0], y: [0, 20, 0], scale: [1, 1.2, 1], rotate: [20, 35, 20] },
          transition: { duration: 16, repeat: Infinity, repeatType: "reverse" }
        }
      ]
    },
    coursework: {
      icons: [
        {
          icon: TeamOutlined,
          className: 'top-16 left-8 text-6xl opacity-10',
          color: themeColors.primary,
          animation: { y: [0, -15, 0], rotate: [0, 3, 0] },
          transition: { duration: 5, repeat: Infinity, repeatType: "reverse" }
        },
        {
          icon: FileImageOutlined,
          className: 'top-36 right-16 text-5xl opacity-10',
          color: themeColors.secondary,
          animation: { y: [0, 20, 0], rotate: [0, -5, 0] },
          transition: { duration: 7, repeat: Infinity, repeatType: "reverse" }
        }
      ],
      blobs: [
        {
          className: 'top-24 left-0 w-72 h-72 opacity-15',
          style: { 
            background: `radial-gradient(ellipse 120% 80%, ${themeColors.primary}40 0%, transparent 70%)`,
            transform: 'rotate(-15deg)'
          },
          animation: { x: [0, 40, 0], y: [0, 25, 0], scale: [1, 1.15, 1], rotate: [-15, -10, -15] },
          transition: { duration: 18, repeat: Infinity, repeatType: "reverse" }
        }
      ]
    }
  };
  
  return configs[category] || configs.academic;
};