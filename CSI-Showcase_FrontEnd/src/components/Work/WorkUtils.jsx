import React from "react";
import { 
  BookOutlined, 
  TeamOutlined, 
  TrophyOutlined 
} from "@ant-design/icons";

// CSS Variables สำหรับใช้ในคอมโพเนนต์
export const cssVariables = {
  '--primary': '#90278E',
  '--secondary': '#B252B0',
  '--dark': '#5E1A5C',
  '--light-purple': '#F5EAFF',
  '--medium-purple': '#E0D1FF',
  '--text-light': '#FFE6FF',
  '--text-secondary': '#F8CDFF'
};

// ฟังก์ชันสำหรับแปลงประเภทเป็นชื่อที่แสดงได้
export const getTypeLabel = (type) => {
  switch (type) {
    case "academic":
      return "วิชาการ";
    case "coursework":
      return "ในชั้นเรียน";
    case "competition":
      return "การแข่งขัน";
    default:
      return type;
  }
};

// ฟังก์ชันสำหรับดึง Icon ตามประเภทของผลงาน
export const getCategoryIcon = (type) => {
  switch (type) {
    case "academic":
      return <BookOutlined />;
    case "coursework":
      return <TeamOutlined />;
    case "competition":
      return <TrophyOutlined />;
    default:
      return null;
  }
};

// ฟังก์ชันสำหรับดึงสีของ Tag ตามประเภท - ปรับใหม่ให้สอดคล้องกับ brand colors
export const getTagColor = (type) => {
  switch (type) {
    case "academic":
      return "#1890ff"; // Blue สำหรับงานวิชาการ
    case "coursework":
      return "#52c41a"; // Green สำหรับงานในชั้นเรียน
    case "competition":
      return "#faad14"; // Gold สำหรับงานแข่งขัน
    default:
      return "#90278E"; // Primary brand color
  }
};

// ฟังก์ชันคำนวณจำนวน items ต่อหน้าตามขนาดหน้าจอ - ปรับปรุงให้ responsive มากขึ้น
export const getItemsPerPage = () => {
  if (typeof window === "undefined") return 4; // สำหรับ SSR
  
  // ปรับตามขนาดหน้าจอให้ละเอียดมากขึ้น
  if (window.innerWidth < 480) return 1;
  if (window.innerWidth < 640) return 2;
  if (window.innerWidth < 768) return 2;
  if (window.innerWidth < 1024) return 3;
  if (window.innerWidth < 1280) return 3;
  return 4;
};

// gradient style สำหรับ heading
export const getHeadingGradient = () => ({
  background: "linear-gradient(135deg, #90278E 0%, #B252B0 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "inline-block",
  textShadow: "0 0 20px rgba(144,39,142,0.1)"
});

// ฟังก์ชันสำหรับจัดการเปลี่ยนหน้า
export const handlePageChange = (page, setCurrentPage, setLoading, setDirection, currentPage) => {
  if (setDirection) {
    setDirection(page > currentPage ? 1 : -1);
  }
  setLoading(true);
  setTimeout(() => {
    setCurrentPage(page);
    setLoading(false);
  }, 300);
};

// ฟังก์ชันคำนวณ transform สำหรับ Parallax
export const calculateParallaxTransform = (depth, mouseX, mouseY) => {
  // ไม่ใช้ Parallax effect บนอุปกรณ์มือถือเพื่อประสิทธิภาพ
  if (window.innerWidth <= 768) return 'translate3d(0, 0, 0)';
  
  const x = (mouseX / window.innerWidth - 0.5) * depth;
  const y = (mouseY / window.innerHeight - 0.5) * depth;
  return `translate3d(${x}px, ${y}px, 0)`;
};

// Background decoration blob
export const getRenderDecorationBlob = (position = 'left') => {
  // ปรับขนาดตามหน้าจอ
  const size = window.innerWidth <= 768 ? "50%" : "40%";
  
  const transformValue = position === 'left' 
    ? "translate(-30%, -20%)" 
    : "translate(20%, -30%)";
  
  return (
    <div 
      className={`absolute -z-10 top-0 ${position}-0 opacity-20 blur-3xl`} 
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(144,39,142,0.5) 0%, rgba(144,39,142,0) 70%)",
        borderRadius: "50%",
        transform: transformValue
      }}
    />
  );
};

// Glass Morphism Effect
export const getGlassMorphismStyle = (opacity = 0.8) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 12px rgba(144, 39, 142, 0.12)'
});

// Text Shadow Effect
export const getTextShadowEffect = (intensity = 0.5) => ({
  textShadow: `0 0 20px rgba(144, 39, 142, ${intensity})`
});

// Box Shadow Effect
export const getBoxShadowEffect = (intensity = 0.12) => ({
  boxShadow: `0 4px 12px rgba(144, 39, 142, ${intensity})`
});

// Gradient ต่างๆ ตามธีม - ปรับปรุงใหม่สำหรับแต่ละประเภท
export const gradients = {
  primary: 'linear-gradient(to bottom, #90278E, #B252B0, #5E1A5C)',
  coursework: 'linear-gradient(135deg, rgba(82, 196, 26, 0.15) 0%, rgba(82, 196, 26, 0.05) 100%)',
  competition: 'linear-gradient(135deg, rgba(250, 173, 20, 0.15) 0%, rgba(250, 173, 20, 0.05) 100%)',
  academic: 'linear-gradient(135deg, rgba(24, 144, 255, 0.15) 0%, rgba(24, 144, 255, 0.05) 100%)'
};

// ฟังก์ชันสำหรับดึง category-specific styling
export const getCategoryTheme = (category) => {
  const themes = {
    academic: {
      primary: '#1890ff',
      light: 'rgba(24, 144, 255, 0.1)',
      gradient: gradients.academic,
      shadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
      iconBg: 'rgba(24, 144, 255, 0.1)',
      tagStyle: {
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        color: 'white'
      },
      aspectRatio: 'aspect-[16/9]',
      mediaType: 'file'
    },
    coursework: {
      primary: '#52c41a',
      light: 'rgba(82, 196, 26, 0.1)',
      gradient: gradients.coursework,
      shadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
      iconBg: 'rgba(82, 196, 26, 0.1)',
      tagStyle: {
        backgroundColor: '#52c41a',
        borderColor: '#52c41a',
        color: 'white'
      },
      aspectRatio: 'aspect-[2/3]',
      mediaType: 'image'
    },
    competition: {
      primary: '#faad14',
      light: 'rgba(250, 173, 20, 0.1)',
      gradient: gradients.competition,
      shadow: '0 4px 12px rgba(250, 173, 20, 0.15)',
      iconBg: 'rgba(250, 173, 20, 0.1)',
      tagStyle: {
        backgroundColor: '#faad14',
        borderColor: '#faad14',
        color: 'white'
      },
      aspectRatio: 'aspect-square',
      mediaType: 'image'
    }
  };
  
  return themes[category] || {
    primary: '#90278E',
    light: 'rgba(144, 39, 142, 0.1)',
    gradient: gradients.primary,
    shadow: '0 4px 12px rgba(144, 39, 142, 0.15)',
    iconBg: 'rgba(144, 39, 142, 0.1)',
    tagStyle: {
      backgroundColor: '#90278E',
      borderColor: '#90278E',
      color: 'white'
    },
    aspectRatio: 'aspect-[4/3]',
    mediaType: 'image'
  };
};

// ฟังก์ชันสำหรับ placeholder styling ตามประเภท
export const getCategoryPlaceholder = (category) => {
  const theme = getCategoryTheme(category);
  
  const placeholders = {
    academic: {
      icon: 'FilePdfOutlined',
      background: theme.light,
      iconColor: theme.primary,
      iconSize: '48px',
      pattern: `radial-gradient(${theme.primary} 0.5px, transparent 0.5px)`,
      patternSize: '20px 20px',
      title: 'เอกสารงานวิชาการ',
      subtitle: 'ไฟล์ PDF'
    },
    coursework: {
      icon: 'FileImageOutlined',
      background: theme.light,
      iconColor: theme.primary,
      iconSize: '44px',
      pattern: `radial-gradient(${theme.primary} 0.5px, transparent 0.5px)`,
      patternSize: '16px 16px',
      title: 'โปสเตอร์ผลงาน',
      subtitle: 'รูปภาพ'
    },
    competition: {
      icon: 'TrophyOutlined',
      background: theme.light,
      iconColor: theme.primary,
      iconSize: '44px',
      pattern: `radial-gradient(${theme.primary} 0.5px, transparent 0.5px)`,
      patternSize: '18px 18px',
      title: 'ผลงานแข่งขัน',
      subtitle: 'รูปภาพ'
    }
  };
  
  return placeholders[category] || placeholders.coursework;
};

// ฟังก์ชันกำหนดความกว้างของ Container ตามขนาดหน้าจอ
export const getResponsiveContainer = () => {
  if (window.innerWidth <= 480) return "container mx-auto px-3";
  if (window.innerWidth <= 768) return "container mx-auto px-4";
  if (window.innerWidth <= 1024) return "container mx-auto px-6";
  return "container mx-auto px-8";
};

// ปรับขนาดตัวอักษรตามหน้าจอ
export const getResponsiveFontSize = (baseSizes) => {
  const { mobile, tablet, desktop } = baseSizes;
  
  if (window.innerWidth <= 480) return mobile;
  if (window.innerWidth <= 1024) return tablet;
  return desktop;
};