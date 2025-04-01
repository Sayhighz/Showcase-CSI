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
  LikeOutlined,
  ShareAltOutlined,
  EyeOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { Card, Button, Skeleton, Tag, Tooltip, Avatar, Divider, Badge, Space, Empty } from "antd";

const Work_Row = ({
  title,
  items,
  description,
  side,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const itemsPerPage = 3; // ลดลงเพื่อให้เห็นแต่ละรายการชัดเจนขึ้น
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Preserve current page across renders
  useEffect(() => {
    // Retrieve the current page from localStorage (or sessionStorage)
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage)); // Set the page from saved state
    }
  }, []);

  useEffect(() => {
    // Save the current page to localStorage (or sessionStorage) whenever it changes
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  // เพิ่ม loading effect เมื่อเปลี่ยนหน้า
  const handlePageChange = (page) => {
    setLoading(true);
    // จำลอง network delay
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 300);
  }

  const displayedItems = items.slice(
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

  return (
    <div className="work-section mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          className={`text-3xl font-bold text-[#90278E] text-${side || "left"} mb-2`}
        >
          {title}
        </h1>
        <p className={`text-[#424242] mb-6 text-${side || "left"}`}>
          {description || ""}
        </p>
      </motion.div>

      {/* Show a message if no items are available */}
      {items.length === 0 ? (
        <motion.div 
          className="text-center p-10 bg-gray-50 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Empty 
            description="ยังไม่มีผลงานในขณะนี้"
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="flex flex-col space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
          >
            {loading ? (
              // Skeleton loading UI
              [...Array(itemsPerPage)].map((_, index) => (
                <Card key={index} className="w-full shadow-sm rounded-xl overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/4">
                      <Skeleton.Image active style={{ width: '100%', height: 180 }} />
                    </div>
                    <div className="w-full md:w-3/4">
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              displayedItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  onMouseEnter={() => setActiveHover(index)}
                  onMouseLeave={() => setActiveHover(null)}
                  whileHover={{ y: -3 }}
                >
                  <Card
                    className="w-full shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border-0"
                    bodyStyle={{ padding: 0 }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Project Image Section with Hover Effect */}
                      <div className="relative w-full md:w-1/3 h-56 md:h-auto overflow-hidden">
                        <motion.img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          animate={{ 
                            scale: activeHover === index ? 1.05 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        {/* Year Badge */}
                        <Badge 
                          count={item.year} 
                          className="absolute top-3 right-3 z-10"
                          style={{ 
                            backgroundColor: '#90278E',
                            padding: '0 8px',
                            borderRadius: '10px'
                          }}
                        />
                        
                        {/* Hover Overlay */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: activeHover === index ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="text-white">
                            <div className="flex justify-between w-full">
                              <span className="flex items-center">
                                <EyeOutlined className="mr-1" /> 
                                {Math.floor(Math.random() * 500) + 50}
                              </span>
                              <span className="flex items-center">
                                <LikeOutlined className="mr-1" /> 
                                {Math.floor(Math.random() * 100) + 10}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      {/* Project Details Section */}
                      <div className="w-full md:w-2/3 p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <Link
                                to={item.projectLink}
                                className="text-[#90278E] hover:text-[#B252B0]"
                              >
                                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                              </Link>
                              
                              {/* Tags and Metadata */}
                              <Space size={[0, 8]} wrap className="mb-3">
                                <Tag
                                  icon={getCategoryIcon(item.category)}
                                  color={getTagColor(item.category)}
                                >
                                  {getTypeLabel(item.category)}
                                </Tag>
                                
                                <Tag color="default">ระดับ: {item.level}</Tag>
                                
                                <Tag icon={<ClockCircleOutlined />} color="default">
                                  ปี {item.year}
                                </Tag>
                              </Space>
                            </div>
                            
                            {/* Action Buttons for Admin */}
                            {showActions && (
                              <Space>
                                <Button
                                  onClick={() => onEdit(item)}
                                  icon={<EditOutlined />}
                                  type="primary"
                                  size="small"
                                  className="bg-blue-500"
                                >
                                  แก้ไข
                                </Button>
                                <Button
                                  onClick={() => onDelete(item)}
                                  icon={<DeleteOutlined />}
                                  type="primary"
                                  danger
                                  size="small"
                                >
                                  ลบ
                                </Button>
                              </Space>
                            )}
                          </div>
                          
                          {/* Project Description */}
                          <p className="text-gray-600 text-sm mb-4 flex-grow">
                            {item.description || "รายละเอียดโครงการจะแสดงที่นี่ เพื่อให้ผู้ชมเข้าใจเกี่ยวกับโครงการนี้มากขึ้น"}
                          </p>
                          
                          {/* Footer with Avatar and View More Button */}
                          <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                            <div className="flex items-center">
                              <Avatar src={item.studentImage} size="small" className="mr-2" />
                              <span className="text-sm text-gray-600">
                                {item.student || "ชื่อนักศึกษา"}
                              </span>
                            </div>
                            
                            <Link to={item.projectLink}>
                              <Button 
                                type="primary" 
                                className="rounded-full bg-[#90278E] hover:bg-[#B252B0] border-0"
                                size="small"
                              >
                                ดูเพิ่มเติม <ArrowRightOutlined />
                              </Button>
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

      {/* Pagination Controls */}
      {items.length > 0 && (
        <motion.div 
          className="flex justify-center items-center mt-8 mb-6 space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={prevPage}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <LeftOutlined />
          </motion.button>

          {Array.from({ length: totalPages }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-10 h-10 flex items-center justify-center border rounded-full transition-all ${
                currentPage === index 
                  ? 'bg-[#90278E] text-white border-[#90278E]' 
                  : 'text-gray-700 border-gray-200 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {index + 1}
            </motion.button>
          ))}

          <motion.button
            onClick={nextPage}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <RightOutlined />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Work_Row;