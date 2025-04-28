import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  EditOutlined,
  DeleteOutlined,
  RightOutlined,
  LeftOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  UserOutlined,
  CalendarOutlined,
  FileOutlined,
  FilePdfOutlined
} from "@ant-design/icons";
import { Card, Button, Skeleton, Tag, Avatar, Badge, Space, Empty } from "antd";
import { API_ENDPOINTS } from "../../constants";

const Work_Row = ({
  title,
  items = [],
  description,
  side,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const itemsPerPage = 3;
  const safeItems = items || [];
  const totalPages = Math.ceil((safeItems.length || 0) / itemsPerPage);

  // Preserve current page across renders
  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  // Add loading effect when changing pages
  const handlePageChange = (page) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 300);
  }

  const displayedItems = safeItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const goToPage = (page) => {
    handlePageChange(page);
  };

  const nextPage = () => {
    const nextPageNum = currentPage === totalPages - 1 ? 0 : currentPage + 1;
    handlePageChange(nextPageNum);
  };

  const prevPage = () => {
    const prevPageNum = currentPage === 0 ? totalPages - 1 : currentPage - 1;
    handlePageChange(prevPageNum);
  };

  // Function to convert the type to display name
  const getTypeLabel = (type) => {
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

  // Function to get icon by category
  const getCategoryIcon = (type) => {
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

  const getTagColor = (type) => {
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

  // ฟังก์ชันสำหรับเลือกการแสดงผลเมื่อไม่มีรูปภาพ
  const renderProjectImage = (item) => {
    if (item.image) {
      return (
        <motion.div
          className="w-full h-full"
          animate={{ 
            scale: activeHover === item.id ? 1.08 : 1
          }}
          transition={{ duration: 0.5 }}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden"
          }}
        >
          <img
            src={`${API_ENDPOINTS.BASE}/${item.image}`}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{
              filter: activeHover === item.id ? "brightness(1.05)" : "brightness(1)"
            }}
          />
        </motion.div>
      );
    } else {
      // แสดงไอคอนเอกสารเมื่อไม่มีรูปภาพ
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <FilePdfOutlined style={{ fontSize: '64px', color: '#90278E' }} />
          <div className="mt-4 text-center text-gray-600 px-4">
            <p className="text-sm sm:text-base font-medium">{item.title}</p>
            <p className="text-xs text-gray-500 mt-1">ไม่มีภาพประกอบ</p>
          </div>
        </div>
      );
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // สร้างระดับของตัวอักษรในหัวข้อ
  const headingGradient = {
    background: "linear-gradient(135deg, #90278E 0%, #B252B0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block"
  };

  return (
    <div className="work-section py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* ตกแต่งพื้นหลังด้วย blob */}
      <div 
        className="absolute -z-10 top-0 right-0 opacity-10 blur-3xl" 
        style={{
          width: "40%",
          height: "40%",
          background: "radial-gradient(circle, rgba(144,39,142,0.3) 0%, rgba(144,39,142,0) 70%)",
          borderRadius: "50%",
          transform: "translate(20%, -30%)"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-${side || "left"} max-w-3xl mx-auto lg:mx-0`}
      >
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-3`}
          style={headingGradient}
        >
          {title}
        </h1>
        <p className="text-gray-600 mb-8 text-base sm:text-lg">
          {description || ""}
        </p>
      </motion.div>

      {/* Show a message if no items are available */}
      {safeItems.length === 0 ? (
        <motion.div 
          className="text-center p-8 sm:p-12 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Empty 
            description={
              <span className="text-gray-500 text-lg">ยังไม่มีผลงานในขณะนี้</span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="grid grid-cols-1 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
          >
            {loading ? (
              // Skeleton loading UI with enhanced design
              [...Array(itemsPerPage)].map((_, index) => (
                <Card 
                  key={index} 
                  className="w-full shadow-sm rounded-xl overflow-hidden border-0 bg-white"
                  style={{ height: "260px" }}
                >
                  <div className="flex flex-col lg:flex-row gap-6 h-full">
                    <div className="w-full lg:w-2/5 h-full">
                      <Skeleton.Image active style={{ width: '100%', height: '240px', borderRadius: '8px' }} />
                    </div>
                    <div className="w-full lg:w-3/5">
                      <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 4, width: ['90%', '80%', '70%', '60%'] }} />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              displayedItems.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  variants={itemVariants}
                  onMouseEnter={() => setActiveHover(item.id)}
                  onMouseLeave={() => setActiveHover(null)}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    className="w-full shadow-md hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden border-0 bg-white"
                    bodyStyle={{ padding: 0 }}
                    style={{ 
                      boxShadow: activeHover === item.id 
                        ? "0 10px 30px rgba(144, 39, 142, 0.15)" 
                        : "0 4px 20px rgba(0, 0, 0, 0.05)",
                      height: "260px"
                    }}
                  >
                    <div className="flex flex-col lg:flex-row h-full">
                      {/* Project Image Section with Fixed Height and Aspect Ratio */}
                      <div className="relative w-full lg:w-2/5 h-48 sm:h-60 lg:h-full overflow-hidden" style={{ minHeight: "240px" }}>
                        <div className="absolute inset-0">
                          {renderProjectImage(item)}
                        </div>
                        
                        {/* Year Badge - Enhanced */}
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
                        
                        {/* Hover Overlay - Enhanced with animation */}
                        {item.image && (
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: activeHover === item.id ? 1 : 0,
                              y: activeHover === item.id ? 0 : 20
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="text-white">
                              <motion.h3 
                                className="text-lg sm:text-xl font-semibold mb-2"
                                initial={{ y: 20 }}
                                animate={{ y: activeHover === item.id ? 0 : 20 }}
                                transition={{ duration: 0.4 }}
                              >
                                {item.title}
                              </motion.h3>
                              <motion.div 
                                className="flex justify-between w-full"
                                initial={{ y: 20 }}
                                animate={{ y: activeHover === item.id ? 0 : 20 }}
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
                      
                      {/* Project Details Section - Enhanced with fixed height */}
                      <div className="w-full lg:w-3/5 p-5 sm:p-6 lg:p-8 flex flex-col h-full">
                        <div className="flex flex-col h-full">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                            <div>
                              <Link
                                to={item.projectLink}
                                className="text-[#90278E] hover:text-[#B252B0] transition-colors duration-300"
                              >
                                <h2 className="text-xl sm:text-2xl font-semibold mb-3 line-clamp-1">{item.title}</h2>
                              </Link>
                              
                              {/* Tags and Metadata - Enhanced */}
                              <Space size={[0, 8]} wrap className="mb-4">
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
                                
                                <Tag 
                                  icon={<ClockCircleOutlined />} 
                                  color="default"
                                  className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                                >
                                  ปี {item.year}
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
                              </Space>
                            </div>
                            
                            {/* Action Buttons for Admin - Enhanced */}
                            {showActions && (
                              <Space className="mt-2 sm:mt-0">
                                <Button
                                  onClick={() => onEdit && onEdit(item)}
                                  icon={<EditOutlined />}
                                  type="primary"
                                  size="middle"
                                  className="bg-blue-500 hover:bg-blue-600 rounded-full text-xs sm:text-sm"
                                >
                                  แก้ไข
                                </Button>
                                <Button
                                  onClick={() => onDelete && onDelete(item)}
                                  icon={<DeleteOutlined />}
                                  type="primary"
                                  danger
                                  size="middle"
                                  className="rounded-full text-xs sm:text-sm"
                                >
                                  ลบ
                                </Button>
                              </Space>
                            )}
                          </div>
                          
                          {/* Project Description - Fixed height with overflow */}
                          <div className="flex-grow overflow-hidden" style={{ maxHeight: "80px" }}>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                              {item.description || "รายละเอียดโครงการจะแสดงที่นี่ เพื่อให้ผู้ชมเข้าใจเกี่ยวกับโครงการนี้มากขึ้น"}
                            </p>
                          </div>
                          
                          {/* Footer with Avatar and View More Button - Fixed position at bottom */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-center">
                              {item.userImage ? (
                                <Avatar 
                                  size="large"
                                  className="border-2 border-white shadow-sm"
                                  src={`${API_ENDPOINTS.BASE}/${item.userImage}`}
                                />
                              ) : (
                                <Avatar 
                                  size="large"
                                  className="border-2 border-white shadow-sm bg-[rgba(144,39,142,0.15)]"
                                  style={{ color: '#90278E' }}
                                >
                                  {item.student ? item.student.charAt(0).toUpperCase() : <UserOutlined />}
                                </Avatar>
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
                            
                            <Link to={item.projectLink}>
                              <motion.div 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button 
                                  type="primary" 
                                  className="rounded-full px-4 bg-gradient-to-r from-[#90278E] to-[#B252B0] hover:from-[#B252B0] hover:to-[#90278E] border-0 shadow-md"
                                  size="middle"
                                >
                                  ดูเพิ่มเติม <ArrowRightOutlined className="ml-1" />
                                </Button>
                              </motion.div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination Controls - Improved for mobile */}
      {safeItems.length > 0 && totalPages > 1 && (
        <motion.div 
          className="flex justify-center items-center mt-10 mb-4 space-x-2 sm:space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={prevPage}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors bg-white shadow-sm"
            whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
          >
            <LeftOutlined style={{ fontSize: '14px' }} />
          </motion.button>

          <div className="flex space-x-1 sm:space-x-2">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border rounded-full transition-all ${
                  currentPage === index 
                    ? 'bg-gradient-to-r from-[#90278E] to-[#B252B0] text-white border-[#90278E] shadow-md' 
                    : 'text-gray-700 border-gray-200 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] bg-white'
                }`}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.9 }}
                disabled={loading}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={nextPage}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors bg-white shadow-sm"
            whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
          >
            <RightOutlined style={{ fontSize: '14px' }} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Work_Row;