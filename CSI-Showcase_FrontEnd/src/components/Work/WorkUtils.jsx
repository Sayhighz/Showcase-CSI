import React from "react";
import { 
  BookOutlined, 
  TeamOutlined, 
  TrophyOutlined 
} from "@ant-design/icons";

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
      return "blue";
    case "coursework":
      return "green";
    case "competition":
      return "gold";
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
  display: "inline-block"
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

// Background decoration blob
export const getRenderDecorationBlob = (position = 'left') => {
  const transformValue = position === 'left' 
    ? "translate(-30%, -20%)" 
    : "translate(20%, -30%)";
  
  return (
    <div 
      className={`absolute -z-10 top-0 ${position}-0 opacity-10 blur-3xl`} 
      style={{
        width: "40%",
        height: "40%",
        background: "radial-gradient(circle, rgba(144,39,142,0.3) 0%, rgba(144,39,142,0) 70%)",
        borderRadius: "50%",
        transform: transformValue
      }}
    />
  );
};