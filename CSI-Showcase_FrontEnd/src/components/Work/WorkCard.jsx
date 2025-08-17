import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Tooltip, Tag, Badge } from "antd";
import { 
  EyeOutlined, 
  ArrowRightOutlined, 
  UserOutlined, 
  CalendarOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { API_ENDPOINTS } from "../../constants";
import {
  getCategoryIcon,
  getTypeLabel,
  getCategoryTheme,
  getCategoryPlaceholder
} from "./WorkUtils";

const WorkCard = ({ 
  item, 
  index, 
  displayMode = "column",
  isHovering,
  onMouseEnter,
  onMouseLeave
}) => {
  const cardRef = useRef(null);
  const categoryTheme = getCategoryTheme(item.category);
  const placeholderConfig = getCategoryPlaceholder(item.category);

  const handleMouseLeave = () => {
    onMouseLeave(null);
  };

  const cardStyles = {
    height: displayMode === "column" ? "auto" : "auto sm:h-[260px]",
    hoverScale: isHovering === item.id ? 1.05 : 1,
    hoverBrightness: isHovering === item.id ? "brightness(1.05)" : "brightness(1)",
    hoverShadow: isHovering === item.id
      ? "0 15px 30px rgba(144, 39, 142, 0.2)"
      : "0 5px 15px rgba(144, 39, 142, 0.05)"
  };

  const renderCoverImage = () => {
    const hasImage = item.image && categoryTheme.mediaType === 'image';

    if (hasImage) {
      return (
        <motion.div
          className={`w-full h-full relative overflow-hidden ${categoryTheme.aspectRatio}`}
          style={{ background: categoryTheme.gradient }}
        >
          <motion.img
            src={`${API_ENDPOINTS.BASE}/${item.image}`}
            alt={item.title}
            className="w-full h-full object-cover"
            animate={{
              scale: cardStyles.hoverScale,
              filter: cardStyles.hoverBrightness
            }}
            transition={{ duration: 0.5 }}
          />
          
          <motion.div
            className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0"
            style={{
              backgroundImage: `linear-gradient(to top, ${categoryTheme.primary}60, transparent)`
            }}
            animate={{
              opacity: isHovering === item.id ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      );
    } else {
      const IconComponent = placeholderConfig.icon === 'FilePdfOutlined' ? FilePdfOutlined :
                           placeholderConfig.icon === 'FileImageOutlined' ? FileImageOutlined :
                           TrophyOutlined;
      
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center relative ${categoryTheme.aspectRatio}`}
          style={{
            background: placeholderConfig.background,
            borderRadius: '8px 8px 0 0'
          }}
        >
          <motion.div
            className="relative z-10 p-4 rounded-full mb-2"
            style={{
              backgroundColor: categoryTheme.light,
              boxShadow: categoryTheme.shadow
            }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <IconComponent
              style={{
                fontSize: displayMode === "column" ? '32px' : placeholderConfig.iconSize,
                color: placeholderConfig.iconColor
              }}
            />
          </motion.div>
          
          <div className="mt-2 text-center z-10 px-3">
            <p
              className="text-xs sm:text-sm font-medium truncate max-w-full mb-1"
              style={{ color: categoryTheme.primary }}
            >
              {placeholderConfig.title}
            </p>
            <p className="text-xs text-gray-500">{placeholderConfig.subtitle}</p>
            {displayMode === "row" && (
              <p className="text-xs text-gray-400 mt-1 hidden sm:block line-clamp-1">
                {item.title}
              </p>
            )}
          </div>
          
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: placeholderConfig.pattern,
              backgroundSize: placeholderConfig.patternSize
            }}
          />
          
          <div
            className="absolute inset-0 border-2 border-dashed opacity-20 rounded-lg"
            style={{ borderColor: categoryTheme.primary }}
          />
        </div>
      );
    }
  };

  const renderHoverOverlay = (className, children) => (
    <motion.div 
      className={`absolute inset-0 bg-gradient-to-t from-[#5E1A5C]/80 via-[#90278E]/30 to-transparent flex flex-col justify-end ${className}`}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isHovering === item.id ? 1 : 0,
        y: isHovering === item.id ? 0 : 20
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );

  const renderUserInfo = (className = "") => {
    return (
      <div className={`flex items-center ${className}`}>
        {item.userImage ? (
          <motion.img 
            src={`${API_ENDPOINTS.BASE}/${item.userImage}`}
            alt={item.student}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-1.5 sm:mr-2 object-cover"
            whileHover={{ scale: 1.1 }}
          />
        ) : (
          <motion.div 
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center mr-1.5 sm:mr-2 text-xs"
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
    );
  };

  if (displayMode === "column") {
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
            boxShadow: cardStyles.hoverShadow,
            background: categoryTheme.gradient,
            transition: "all 0.5s ease",
            border: `1px solid ${categoryTheme.primary}20`
          }}
          cover={
            <div className="relative overflow-hidden">
              {renderCoverImage()}
              
              <Tag
                className="absolute top-2 sm:top-4 left-2 sm:left-4 rounded-full px-1.5 sm:px-3 py-0.5 sm:py-1 border-0 font-medium shadow-md z-10 text-xs"
                icon={getCategoryIcon(item.category)}
                style={categoryTheme.tagStyle}
              >
                <span className="hidden xs:inline">{getTypeLabel(item.category)}</span>
              </Tag>
              
              <Badge 
                count={
                  <span className="flex items-center text-white text-xs">
                    <CalendarOutlined className="mr-0.5 sm:mr-1" /> {item.year}
                  </span>
                }
                className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10"
                style={{
                  backgroundColor: categoryTheme.primary + 'E6',
                  padding: '1px 6px sm:2px 8px',
                  borderRadius: '20px',
                  boxShadow: categoryTheme.shadow
                }}
              />
              
              {renderHoverOverlay("p-2 sm:p-4 md:p-5", (
                <Link to={item.projectLink} className="text-[#FFE6FF] hover:text-white">
                  <motion.h2 
                    className="text-sm sm:text-base md:text-xl font-semibold mb-1 sm:mb-2"
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
              ))}
            </div>
          }
          styles={{ body: { padding: '12px 16px' } }}
        >
          <Link to={item.projectLink} className="text-[#90278E] hover:text-[#B252B0] transition-colors duration-300">
            <Tooltip title={item.title}>
              <h3 className="text-sm sm:text-base font-semibold truncate mb-1 sm:mb-2">{item.title}</h3>
            </Tooltip>
          </Link>
          
          <div className="flex justify-between items-center text-xs sm:text-sm text-[#8b949e] mb-2 sm:mb-3">
            <div className="flex-1">
              <p className="m-0 truncate">ปี {item.year} | ระดับ: {item.level}</p>
            </div>
            
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
          
          {renderUserInfo("mb-2 sm:mb-3")}
          
          <motion.div 
            className="mt-1 sm:mt-2"
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
  } else if (displayMode === "row") {
    return (
      <motion.div
        key={item.id || index}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}
        onMouseEnter={() => onMouseEnter(item.id)}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          className="w-full shadow-md hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden border-0 bg-white bg-opacity-80 backdrop-filter backdrop-blur-md"
          styles={{ body: { padding: 0 } }}
          style={{
            boxShadow: cardStyles.hoverShadow,
            background: categoryTheme.gradient,
            height: cardStyles.height,
            border: `1px solid ${categoryTheme.primary}20`
          }}
        >
          <div className="flex flex-col lg:flex-row h-full">
            <div className={`relative w-full lg:w-2/5 overflow-hidden flex items-center justify-center bg-[#F5EAFF] min-h-[200px] lg:min-h-0`}>
              {renderCoverImage()}
              
              <Badge
                count={
                  <span className="flex items-center text-white text-xs sm:text-sm">
                    <CalendarOutlined className="mr-0.5 sm:mr-1" /> {item.year}
                  </span>
                }
                className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10"
                style={{
                  backgroundColor: categoryTheme.primary + 'E6',
                  padding: '1px 6px sm:2px 10px',
                  borderRadius: '20px',
                  boxShadow: categoryTheme.shadow
                }}
              />
              
              {item.image && renderHoverOverlay("p-3 sm:p-4 md:p-6", (
                <div className="text-[#FFE6FF]">
                  <motion.h3
                    className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2"
                    initial={{ y: 20 }}
                    animate={{ y: isHovering === item.id ? 0 : 20 }}
                    transition={{ duration: 0.4 }}
                    style={{ textShadow: '0 0 20px rgba(144,39,142,0.5)' }}
                  >
                    {item.title}
                  </motion.h3>
                  <motion.div
                    className="flex justify-between w-full"
                    initial={{ y: 20 }}
                    animate={{ y: isHovering === item.id ? 0 : 20 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <span className="flex items-center text-xs sm:text-sm md:text-base">
                      <EyeOutlined className="mr-1 sm:mr-2" />
                      {item.viewsCount || 0} เข้าชม
                    </span>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <div className="w-full lg:w-3/5 p-4 sm:p-5 lg:p-6 xl:p-8 flex flex-col h-full">
              <div className="flex flex-col h-full">
                <div>
                  <Link
                    to={item.projectLink}
                    className="text-[#90278E] hover:text-[#B252B0] transition-colors duration-300"
                  >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 line-clamp-1">{item.title}</h2>
                  </Link>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Tag
                        icon={getCategoryIcon(item.category)}
                        className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full border-0 font-medium text-xs sm:text-sm"
                        style={categoryTheme.tagStyle}
                      >
                        {getTypeLabel(item.category)}
                      </Tag>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Tag
                        className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm border-0"
                        style={{
                          backgroundColor: categoryTheme.light,
                          color: categoryTheme.primary,
                          border: `1px solid ${categoryTheme.primary}20`
                        }}
                      >
                        ระดับ: {item.level}
                      </Tag>
                    </motion.div>
                    
                    {item.viewsCount > 0 && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Tag
                          icon={<EyeOutlined />}
                          className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm border-0"
                          style={{
                            backgroundColor: categoryTheme.light,
                            color: categoryTheme.primary,
                            border: `1px solid ${categoryTheme.primary}20`
                          }}
                        >
                          {item.viewsCount} ครั้ง
                        </Tag>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <div className="flex-grow overflow-hidden relative" style={{ maxHeight: "120px", minHeight: "80px", textAlign: "center" }}>
                  <motion.p
                    className="text-[#24292f] text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3 sm:line-clamp-4"
                    animate={{
                      y: isHovering === item.id ? -5 : 0,
                      opacity: isHovering === item.id ? 1 : 0.9
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.description || "รายละเอียดโครงการจะแสดงที่นี่ เพื่อให้ผู้ชมเข้าใจเกี่ยวกับโครงการนี้มากขึ้น"}
                  </motion.p>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-t from-white to-transparent"></div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                  {renderUserInfo()}
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      to={item.projectLink}
                      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-medium text-xs sm:text-sm bg-gradient-to-r from-[#90278E] to-[#B252B0] hover:from-[#B252B0] hover:to-[#90278E] shadow-md transition-all duration-300"
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
  } else {
    // List mode
    return (
      <motion.div
        key={item.id || index}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}
        onMouseEnter={() => onMouseEnter(item.id)}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          className="w-full shadow-sm hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden border border-gray-200 bg-white"
          styles={{ body: { padding: 0 } }}
          style={{
            boxShadow: cardStyles.hoverShadow,
            border: `1px solid ${categoryTheme.primary}15`
          }}
        >
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-48 h-32 sm:h-auto overflow-hidden flex-shrink-0">
              <div className="w-full h-full">
                {renderCoverImage()}
              </div>
              
              <Tag
                className="absolute top-2 left-2 rounded-full px-2 py-0.5 border-0 font-medium shadow-sm z-10 text-xs"
                icon={getCategoryIcon(item.category)}
                style={categoryTheme.tagStyle}
              >
                {getTypeLabel(item.category)}
              </Tag>
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <Link
                    to={item.projectLink}
                    className="text-[#90278E] hover:text-[#B252B0] transition-colors duration-300 flex-1 mr-3"
                  >
                    <h3 className="text-base sm:text-lg font-semibold line-clamp-2 mb-1">{item.title}</h3>
                  </Link>
                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
                    <CalendarOutlined className="mr-1" /> {item.year}
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                  {item.description || "รายละเอียดโครงการจะแสดงที่นี่"}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    ระดับ: {item.level}
                  </span>
                  {item.viewsCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                      <EyeOutlined className="mr-1" /> {item.viewsCount} ครั้ง
                    </span>
                  )}
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        <UserOutlined className="text-gray-400 mr-1 text-xs" />
                        <span className="text-xs text-gray-500">สมาชิก:</span>
                      </div>
                      
                      <div className="flex items-center mr-2">
                        {item.userImage ? (
                          <motion.div
                            className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-sm"
                            whileHover={{ scale: 1.1 }}
                          >
                            <img
                              src={`${API_ENDPOINTS.BASE}/${item.userImage}`}
                              alt={item.student || item.full_name}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-xs"
                            style={{ color: categoryTheme.primary }}
                            whileHover={{ scale: 1.1 }}
                          >
                            {(item.student || item.full_name || 'U').charAt(0).toUpperCase()}
                          </motion.div>
                        )}
                        <Tooltip title={`${item.student || item.full_name || 'ไม่ระบุชื่อ'} (เจ้าของโปรเจค)`}>
                          <span className="ml-1 text-xs text-gray-700 max-w-20 truncate">
                            {item.student || item.full_name || 'ไม่ระบุ'}
                          </span>
                        </Tooltip>
                      </div>

                      {item.collaborators && item.collaborators.length > 0 && (
                        <div className="flex items-center">
                          {item.collaborators.slice(0, 3).map((collaborator, idx) => (
                            <div key={collaborator.userId || collaborator.user_id || idx} className="flex items-center mr-1 -ml-1">
                              {collaborator.image ? (
                                <motion.div
                                  className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-sm"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <img
                                    src={`${API_ENDPOINTS.BASE}/${collaborator.image}`}
                                    alt={collaborator.fullName || collaborator.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                </motion.div>
                              ) : (
                                <motion.div
                                  className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-xs"
                                  style={{ color: categoryTheme.primary }}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  {(collaborator.fullName || collaborator.full_name || 'U').charAt(0).toUpperCase()}
                                </motion.div>
                              )}
                              <Tooltip title={`${collaborator.fullName || collaborator.full_name} (${collaborator.role === 'contributor' ? 'ผู้ร่วมงาน' : collaborator.role === 'advisor' ? 'ที่ปรึกษา' : collaborator.role})`}>
                                <span className="ml-1 text-xs text-gray-600 max-w-16 truncate">
                                  {collaborator.fullName || collaborator.full_name}
                                </span>
                              </Tooltip>
                            </div>
                          ))}
                          
                          {item.collaborators.length > 3 && (
                            <Tooltip title={`และอีก ${item.collaborators.length - 3} คน`}>
                              <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                                +{item.collaborators.length - 3}
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={item.projectLink}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-white font-medium text-xs bg-gradient-to-r from-[#90278E] to-[#B252B0] hover:from-[#B252B0] hover:to-[#90278E] shadow-sm transition-all duration-300"
                      >
                        ดูรายละเอียด <ArrowRightOutlined className="ml-1" />
                      </Link>
                    </motion.div>
                  </div>
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