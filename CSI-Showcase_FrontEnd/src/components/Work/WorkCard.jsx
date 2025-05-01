import React, { useState, useEffect } from "react";
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
  // Card styles based on display mode
  const cardHeight = displayMode === "column" ? "auto" : "260px";
  const imageHeight = displayMode === "column" ? 180 : "100%";

  // Animation styles for hover effects
  const hoverScaleEffect = isHovering === item.id ? 1.08 : 1;
  const hoverBrightnessEffect = isHovering === item.id ? "brightness(1.05)" : "brightness(1)";
  const hoverShadowEffect = isHovering === item.id 
    ? "0 15px 30px rgba(144, 39, 142, 0.15)" 
    : "0 5px 15px rgba(0, 0, 0, 0.05)";

  // Render image or placeholder for the card
  const renderCoverImage = () => {
    if (item.image) {
      return (
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
      );
    } else {
      // Placeholder when no image is available
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <FilePdfOutlined style={{ 
            fontSize: displayMode === "column" ? '48px' : '64px', 
            color: '#90278E' 
          }} />
          <div className="mt-3 text-center text-gray-500 px-4">
            <p className="text-sm truncate max-w-full">{item.title}</p>
            {displayMode === "row" && (
              <p className="text-xs text-gray-500 mt-1">ไม่มีภาพประกอบ</p>
            )}
          </div>
        </div>
      );
    }
  };

  if (displayMode === "column") {
    // Column mode card
    return (
      <motion.div
        key={item.id || index}
        className="w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onMouseEnter={() => onMouseEnter(item.id)}
        onMouseLeave={() => onMouseLeave(null)}
        whileHover={{ y: -8 }}
      >
        <Card
          hoverable
          className="overflow-hidden border-0 rounded-xl bg-white h-full"
          style={{
            width: "100%",
            boxShadow: hoverShadowEffect,
            transition: "all 0.5s ease"
          }}
          cover={
            <div 
              className="relative overflow-hidden"
              style={{ height: imageHeight }}
            >
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
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)'
                }}
              />
              
              {/* Hover overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-5"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isHovering === item.id ? 1 : 0,
                  y: isHovering === item.id ? 0 : 20
                }}
                transition={{ duration: 0.3 }}
              >
                <Link to={item.projectLink} className="text-white hover:text-white">
                  <motion.h2 
                    className="text-base sm:text-xl font-semibold mb-2"
                    initial={{ y: 20 }}
                    animate={{ y: isHovering === item.id ? 0 : 20 }}
                    transition={{ duration: 0.4 }}
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
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Link to={item.projectLink} className="text-[#90278E] hover:text-[#B252B0] transition-colors duration-300">
            <Tooltip title={item.title}>
              <h3 className="text-base sm:text-lg font-semibold truncate mb-2">{item.title}</h3>
            </Tooltip>
          </Link>
          
          <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 mb-3">
            <div className="flex-1">
              <p className="m-0 truncate">ปี {item.year} | ระดับ: {item.level}</p>
            </div>
            
            {/* แสดงไอคอนจำนวนผู้เข้าชม */}
            {item.viewsCount > 0 && (
              <Tooltip title={`${item.viewsCount} ครั้ง`}>
                <span className="flex items-center">
                  <EyeOutlined className="mr-1 text-gray-500" /> 
                  {item.viewsCount}
                </span>
              </Tooltip>
            )}
          </div>
          
          {/* เจ้าของผลงาน */}
          <div className="flex items-center mb-3">
            {item.userImage ? (
              <img 
                src={`${API_ENDPOINTS.BASE}/${item.userImage}`}
                alt={item.student}
                className="w-6 h-6 rounded-full mr-2 object-cover"
              />
            ) : (
              <div 
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2 text-xs"
                style={{
                  background: 'rgba(144, 39, 142, 0.1)',
                  color: '#90278E'
                }}
              >
                {item.student ? item.student.charAt(0).toUpperCase() : <UserOutlined />}
              </div>
            )}
            <p className="text-xs sm:text-sm text-gray-600 m-0 truncate flex-1">
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
    // Row mode card
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
        onMouseLeave={() => onMouseLeave(null)}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          className="w-full shadow-md hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden border-0 bg-white"
          bodyStyle={{ padding: 0 }}
          style={{ 
            boxShadow: hoverShadowEffect,
            height: cardHeight
          }}
        >
          <div className="flex flex-col lg:flex-row h-full">
            {/* Project Image Section */}
            <div className="relative w-full lg:w-2/5 h-48 sm:h-60 lg:h-full overflow-hidden" style={{ minHeight: "240px" }}>
              <div className="absolute inset-0">
                {renderCoverImage()}
              </div>
              
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
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)'
                }}
              />
              
              {/* Hover Overlay */}
              {item.image && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isHovering === item.id ? 1 : 0,
                    y: isHovering === item.id ? 0 : 20
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-white">
                    <motion.h3 
                      className="text-lg sm:text-xl font-semibold mb-2"
                      initial={{ y: 20 }}
                      animate={{ y: isHovering === item.id ? 0 : 20 }}
                      transition={{ duration: 0.4 }}
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
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag
                      icon={getCategoryIcon(item.category)}
                      color={getTagColor(item.category)}
                      className="px-2 sm:px-3 py-1 rounded-full border-0 font-medium text-xs sm:text-sm"
                    >
                      {getTypeLabel(item.category)}
                    </Tag>
                    
                    <Tag 
                      color="default" 
                      className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                    >
                      ระดับ: {item.level}
                    </Tag>
                    
                    {item.viewsCount > 0 && (
                      <Tag 
                        icon={<EyeOutlined />} 
                        color="default"
                        className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                      >
                        {item.viewsCount} ครั้ง
                      </Tag>
                    )}
                  </div>
                </div>
                
                {/* Project Description */}
                <div className="flex-grow overflow-hidden" style={{ maxHeight: "80px" }}>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {item.description || "รายละเอียดโครงการจะแสดงที่นี่ เพื่อให้ผู้ชมเข้าใจเกี่ยวกับโครงการนี้มากขึ้น"}
                  </p>
                </div>
                
                {/* Student Information & CTA Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    {item.userImage ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img 
                          src={`${API_ENDPOINTS.BASE}/${item.userImage}`}
                          alt={item.student}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[rgba(144,39,142,0.15)] flex items-center justify-center"
                        style={{ color: '#90278E' }}
                      >
                        {item.student ? item.student.charAt(0).toUpperCase() : <UserOutlined />}
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm sm:text-base font-medium text-gray-800 m-0">
                        {item.student || "ชื่อนักศึกษา"}
                      </p>
                      <p className="text-xs text-gray-500 m-0">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : "อัพโหลดโดย"}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
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