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

// ฟังก์ชันสำหรับดึงสีของ Tag ตามประเภท
export const getTagColor = (type) => {
  switch (type) {
    case "academic":
      return "blue"; // หรือใช้โค้ดสี #90278E
    case "coursework":
      return "green"; // หรือใช้โค้ดสี #B252B0
    case "competition":
      return "gold"; // หรือใช้โค้ดสี #5E1A5C
    default:
      return "default";
  }
};

// ฟังก์ชันคำนวณจำนวน items ต่อหน้าตามขนาดหน้าจอ
export const getItemsPerPage = () => {
  if (typeof window === "undefined") return 4; // สำหรับ SSR
  
  // ปรับตามขนาดหน้าจอ
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 768) return 2;
  if (window.innerWidth < 1024) return 3;
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
  const x = (mouseX / window.innerWidth - 0.5) * depth;
  const y = (mouseY / window.innerHeight - 0.5) * depth;
  return `translate3d(${x}px, ${y}px, 0)`;
};

// Background decoration blob
export const getRenderDecorationBlob = (position = 'left') => {
  const transformValue = position === 'left' 
    ? "translate(-30%, -20%)" 
    : "translate(20%, -30%)";
  
  return (
    <div 
      className={`absolute -z-10 top-0 ${position}-0 opacity-20 blur-3xl`} 
      style={{
        width: "40%",
        height: "40%",
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

// Gradient ต่างๆ ตามธีม
export const gradients = {
  primary: 'linear-gradient(to bottom, #90278E, #B252B0, #5E1A5C)',
  coursework: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(245, 234, 255, 0.9))',
  competition: 'linear-gradient(to bottom, rgba(245, 234, 255, 0.9), rgba(224, 209, 255, 0.9))',
  academic: 'linear-gradient(to bottom, rgba(224, 209, 255, 0.9), rgba(144, 39, 142, 0.9))'
};