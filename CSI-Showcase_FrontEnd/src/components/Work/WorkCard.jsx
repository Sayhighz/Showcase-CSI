import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Card, 
  Tooltip, 
  Tag, 
  Badge 
} from "antd";
import { 
  EyeOutlined, 
  ArrowRightOutlined, 
  UserOutlined, 
  CalendarOutlined,
  FilePdfOutlined 
} from "@ant-design/icons";
import { API_ENDPOINTS } from "../../constants";
import { getCategoryIcon, getTypeLabel, getTagColor } from "./WorkUtils";

const WorkCard = ({ 
  item, 
  index, 
  displayMode = "column",
  isHovering,
  onMouseEnter,
  onMouseLeave
}) => {
  // ลบตัวแปรสำหรับการทำ 3D effect
  const cardRef = useRef(null);

  // สร้าง aspect ratio ของภาพตามประเภทของโปรเจค
  const getImageAspectRatio = () => {
    switch (item.category) {
      case "coursework": // สำหรับโปสเตอร์ (tall)
        return "aspect-[2/3]";
      case "competition": // สำหรับผลงานแข่งขัน (square)
        return "aspect-square";
      case "academic": // สำหรับผลงานวิชาการ (wide)
        return "aspect-[16/9]";
      default:
        return "aspect-[4/3]"; // default
    }
  };

  // การรีเซ็ตเมื่อเมาส์ออกจากการ์ด (ลบ x, y transform)
  const handleMouseLeave = () => {
    onMouseLeave(null);
  };

  // Card styles based on display mode
  const cardHeight = displayMode === "column" ? "auto" : "260px";
  const imageHeight = displayMode === "column" ? "auto" : "100%";

  // Animation styles for hover effects
  const hoverScaleEffect = isHovering === item.id ? 1.05 : 1;
  const hoverBrightnessEffect = isHovering === item.id ? "brightness(1.05)" : "brightness(1)";
  const hoverShadowEffect = isHovering === item.id 
    ? "0 15px 30px rgba(144, 39, 142, 0.2)" 
    : "0 5px 15px rgba(144, 39, 142, 0.05)";

  // เพิ่ม effect blur สำหรับฉากหลังเมื่อ hover
  const hoverBlurEffect = isHovering === item.id ? "blur(3px)" : "blur(0px)";

  // Render image or placeholder for the card
  const renderCoverImage = () => {
    if (item.image) {
      return (
        <motion.div 
          className={`w-full h-full relative overflow-hidden ${getImageAspectRatio()}`}
        >
          <motion.img 
            src={`${API_ENDPOINTS.BASE}/${item.image}`} 
            alt={item.title} 
            className="w-full h-full object-cover"
            animate={{ 
              scale: hoverScaleEffect,
              filter: hoverBrightnessEffect
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Add a subtle overlay gradient at the bottom */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-[#5E1A5C]/60 via-transparent to-transparent opacity-0"
            animate={{ 
              opacity: isHovering === item.id ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      );
    } else {
      // Placeholder with different aspect ratios
      return (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-[#F5EAFF] ${getImageAspectRatio()}`}>
          <FilePdfOutlined style={{ 
            fontSize: displayMode === "column" ? '48px' : '64px', 
            color: '#90278E' 
          }} />
          <div className="mt-3 text-center text-gray-500 px-4">
            <p className="text-sm truncate max-w-full">{item.title}</p>
            {displayMode === "row" && (
              <p className="text-xs text-[#8b949e] mt-1">ไม่มีภาพประกอบ</p>
            )}
          </div>
          
          {/* Add a subtle pattern background */}
          <div className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: 'radial-gradient(#90278E 0.5px, transparent 0.5px)',
              backgroundSize: '15px 15px'
            }}
          />
        </div>
      );
    }
  };

  if (displayMode === "column") {
    // Column mode card (ลบ 3D effect แล้ว)
    return (
      <motion.div
        key={item.id || index}
        className="w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onMouseEnter={() => onMouseEnter(item.id)}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
        whileHover={{ y: -8 }}
      >
        <Card
          hoverable
          className="overflow-hidden border-0 rounded-xl bg-white bg-opacity-80 backdrop-filter backdrop-blur-md h-full"
          style={{
            width: "100%",
            boxShadow: hoverShadowEffect,
            transition: "all 0.5s ease",
            border: "1px solid rgba(144, 39, 142, 0.1)"
          }}
          cover={
            <div className="relative overflow-hidden">
              {renderCoverImage()}
              
              {/* Category tag */}
              <Tag 
                color={getTagColor(item.category)} 
                className="absolute top-4 left-4 rounded-full px-2 sm:px-3 py-1 border-0 text-white font-medium shadow-md z-10 text-xs sm:text-sm"
                icon={getCategoryIcon(item.category)}
              >
                {getTypeLabel(item.category)}
              </Tag>
              
              {/* Year badge */}
              <Badge 
                count={
                  <span className="flex items-center text-white text-xs sm:text-sm">
                    <CalendarOutlined className="mr-1" /> {item.year}
                  </span>
                } 
                className="absolute top-4 right-4 z-10"
                style={{ 
                  backgroundColor: 'rgba(144, 39, 142, 0.9)',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  boxShadow: '0 3px 10px rgba(144, 39, 142, 0.15)'
                }}
              />
              
              {/* Hover overlay with info */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-[#5E1A5C]/80 via-[#90278E]/30 to-transparent flex flex-col justify-end p-4 sm:p-5"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isHovering === item.id ? 1 : 0,
                  y: isHovering === item.id ? 0 : 20
                }}
                transition={{ duration: 0.3 }}
              >
                <Link to={item.projectLink} className="text-[#FFE6FF] hover:text-white">
                  <motion.h2 
                    className="text-base sm:text-xl font-semibold mb-2"
                    initial={{ y: 20 }}
                    animate={{ y: isHovering === item.id ? 0 : 20 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      textShadow: '0 0 20px rgba(144,39,142,0.5)'
                    }}
                  >
                    {item.title}
                  </motion.h2>
                  
                  <motion.div 
                    className="flex justify-between text-xs sm:text-sm"
                    initial={{ y: 20 }}
                    animate={{ y: isHovering === item.id ? 0 : 20 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <span>ระดับ: {item.level}</span>
                    <Tooltip title="เข้าชม">
                      <span className="flex items-center">
                        <EyeOutlined className="mr-1" /> 
                        {item.viewsCount || 0}
                      </span>
                    </Tooltip>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          }
          bodyStyle={{ padding: '16px' }}
        >
          <Link to={item.projectLink} className="text-[#90278E] hover:text-[#B252B0] transition-colors duration-300">
            <Tooltip title={item.title}>
              <h3 className="text-base sm:text-lg font-semibold truncate mb-2">{item.title}</h3>
            </Tooltip>
          </Link>
          
          <div className="flex justify-between items-center text-xs sm:text-sm text-[#8b949e] mb-3">
            <div className="flex-1">
              <p className="m-0 truncate">ปี {item.year} | ระดับ: {item.level}</p>
            </div>
            
            {/* จำนวนผู้เข้าชม */}
            {item.viewsCount > 0 && (
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Tooltip title={`${item.viewsCount} ครั้ง`}>
                  <span className="flex items-center">
                    <EyeOutlined className="mr-1 text-[#8b949e]" /> 
                    {item.viewsCount}
                  </span>
                </Tooltip>
              </motion.div>
            )}
          </div>
          
          {/* เจ้าของผลงาน */}
          <div className="flex items-center mb-3">
            {item.userImage ? (
              <motion.img 
                src={`${API_ENDPOINTS.BASE}/${item.userImage}`}
                alt={item.student}
                className="w-6 h-6 rounded-full mr-2 object-cover"
                whileHover={{ scale: 1.1 }}
              />
            ) : (
              <motion.div 
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2 text-xs"
                style={{
                  background: 'rgba(144, 39, 142, 0.1)',
                  color: '#90278E'
                }}
                whileHover={{ scale: 1.1 }}
              >
                {item.student ? item.student.charAt(0).toUpperCase() : <UserOutlined />}
              </motion.div>
            )}
            <p className="text-xs sm:text-sm text-[#8b949e] m-0 truncate flex-1">
              {item.student || "ไม่ระบุเจ้าของผลงาน"}
            </p>
          </div>
          
          {/* ปุ่มดูเพิ่มเติม */}
          <motion.div 
            className="mt-2"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: isHovering === item.id ? 1 : 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to={item.projectLink}
              className="text-[#90278E] hover:text-[#B252B0] text-xs sm:text-sm font-medium flex items-center"
            >
              ดูเพิ่มเติม <ArrowRightOutlined className="ml-1" />
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    );
  } else {
    // Row mode card (ลบ 3D effect แล้ว)
    return (
      <motion.div
        key={item.id || index}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
          }
        }}
        onMouseEnter={() => onMouseEnter(item.id)}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          className="w-full shadow-md hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden border-0 bg-white bg-opacity-80 backdrop-filter backdrop-blur-md"
          bodyStyle={{ padding: 0 }}
          style={{ 
            boxShadow: hoverShadowEffect,
            height: cardHeight,
            border: "1px solid rgba(144, 39, 142, 0.1)"
          }}
        >
          <div className="flex flex-col lg:flex-row h-full">
            {/* Project Image Section - Adjusted for different aspect ratios */}
            <div className={`relative w-full lg:w-2/5 overflow-hidden flex items-center justify-center bg-[#F5EAFF]`}>
              {renderCoverImage()}
              
              {/* Year Badge */}
              <Badge 
                count={
                  <span className="flex items-center text-white">
                    <CalendarOutlined className="mr-1" /> {item.year}
                  </span>
                } 
                className="absolute top-4 right-4 z-10"
                style={{ 
                  backgroundColor: 'rgba(144, 39, 142, 0.9)',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  boxShadow: '0 3px 10px rgba(144, 39, 142, 0.15)'
                }}
              />
              
              {/* Hover Overlay with animation effect */}
              {item.image && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-[#5E1A5C]/80 via-[#90278E]/30 to-transparent flex flex-col justify-end p-4 sm:p-6"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isHovering === item.id ? 1 : 0,
                    y: isHovering === item.id ? 0 : 20
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-[#FFE6FF]">
                    <motion.h3 
                      className="text-lg sm:text-xl font-semibold mb-2"
                      initial={{ y: 20 }}
                      animate={{ y: isHovering === item.id ? 0 : 20 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        textShadow: '0 0 20px rgba(144,39,142,0.5)'
                      }}
                    >
                      {item.title}
                    </motion.h3>
                    <motion.div 
                      className="flex justify-between w-full"
                      initial={{ y: 20 }}
                      animate={{ y: isHovering === item.id ? 0 : 20 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <span className="flex items-center text-sm sm:text-base">
                        <EyeOutlined className="mr-2" /> 
                        {item.viewsCount || 0} เข้าชม
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Project Details Section */}
            <div className="w-full lg:w-3/5 p-5 sm:p-6 lg:p-8 flex flex-col h-full">
              <div className="flex flex-col h-full">
                <div>
                  <Link
                    to={item.projectLink}
                    className="text-[#90278E] hover:text-[#B252B0] transition-colors duration-300"
                  >
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3 line-clamp-1">{item.title}</h2>
                  </Link>
                  
                  {/* Tags with animated effects */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Tag
                        icon={getCategoryIcon(item.category)}
                        color={getTagColor(item.category)}
                        className="px-2 sm:px-3 py-1 rounded-full border-0 font-medium text-xs sm:text-sm"
                      >
                        {getTypeLabel(item.category)}
                      </Tag>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Tag 
                        color="default" 
                        className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-[#F5EAFF] text-[#90278E] border-0"
                      >
                        ระดับ: {item.level}
                      </Tag>
                    </motion.div>
                    
                    {item.viewsCount > 0 && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Tag 
                          icon={<EyeOutlined />} 
                          color="default"
                          className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-[#F5EAFF] text-[#90278E] border-0"
                        >
                          {item.viewsCount} ครั้ง
                        </Tag>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Project Description with scroll effect */}
                <div className="flex-grow overflow-hidden relative" style={{ maxHeight: "90px" }}>
                  <motion.p 
                    className="text-[#24292f] text-sm sm:text-base leading-relaxed line-clamp-3"
                    animate={{
                      y: isHovering === item.id ? -5 : 0,
                      opacity: isHovering === item.id ? 1 : 0.9
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.description || "รายละเอียดโครงการจะแสดงที่นี่ เพื่อให้ผู้ชมเข้าใจเกี่ยวกับโครงการนี้มากขึ้น"}
                  </motion.p>
                  
                  {/* Gradient fade-out effect at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                </div>
                
                {/* Student Information & CTA Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    {item.userImage ? (
                      <motion.div 
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm"
                        whileHover={{ scale: 1.1 }}
                      >
                        <img 
                          src={`${API_ENDPOINTS.BASE}/${item.userImage}`}
                          alt={item.student}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[rgba(144,39,142,0.15)] flex items-center justify-center"
                        style={{ color: '#90278E' }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {item.student ? item.student.charAt(0).toUpperCase() : <UserOutlined />}
                      </motion.div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm sm:text-base font-medium text-[#24292f] m-0">
                        {item.student || "ชื่อนักศึกษา"}
                      </p>
                      <p className="text-xs text-[#8b949e] m-0">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : "อัพโหลดโดย"}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link 
                      to={item.projectLink}
                      className="inline-flex items-center px-4 py-2 rounded-full text-white font-medium text-sm bg-gradient-to-r from-[#90278E] to-[#B252B0] hover:from-[#B252B0] hover:to-[#90278E] shadow-md transition-all duration-300"
                    >
                      ดูเพิ่มเติม <ArrowRightOutlined className="ml-1" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
};

export default WorkCard;