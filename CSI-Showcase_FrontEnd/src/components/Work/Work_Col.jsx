import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Tooltip, Tag, Empty } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  EyeOutlined, 
  FireOutlined,
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const Work_Col = ({ title, items = [], side, description }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(null);

  // ข้อมูลต้องไม่เป็น null หรือ undefined
  const safeItems = items || [];
  
  // จำนวนแสดง 4 card ต่อครั้ง
  const itemsPerPage = 4; 
  const totalPages = Math.ceil(safeItems.length / itemsPerPage);
  const displayedItems = safeItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // กำหนดขนาดคงที่สำหรับ card
  const cardWidth = 280;
  const cardHeight = 350; // เพิ่มความสูงเล็กน้อยเพื่อรองรับการตกแต่งเพิ่มเติม
  const imageHeight = 180; // เพิ่มความสูงของภาพให้มากขึ้น

  const goToPage = (page) => {
    setDirection(page > currentPage ? 1 : -1);
    setCurrentPage(page);
  };

  const nextPage = () => {
    setDirection(1);
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const prevPage = () => {
    setDirection(-1);
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  // ปิด auto-pagination ถ้ามีผลงานแค่ 4 อัน
  useEffect(() => {
    if (safeItems.length > itemsPerPage) {
      const interval = setInterval(() => {
        nextPage();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentPage, safeItems.length]);

  // Function to convert the type to display name
  const getTypeLabel = (type) => {
    switch (type) {
      case 'academic':
        return 'วิชาการ';
      case 'coursework':
        return 'ในชั้นเรียน';
      case 'competition':
        return 'การแข่งขัน';
      default:
        return type;
    }
  };

  // Icon ตามประเภทของผลงาน
  const getCategoryIcon = (type) => {
    switch (type) {
      case 'academic':
        return <BookOutlined />;
      case 'coursework':
        return <TeamOutlined />;
      case 'competition':
        return <TrophyOutlined />;
      default:
        return null;
    }
  };

  // ตรวจสอบว่ามีข้อมูลหรือไม่
  // console.log("Items in Work_Col:", safeItems);

  // สร้างระดับของตัวอักษรในหัวข้อ
  const headingGradient = {
    background: "linear-gradient(135deg, #90278E 0%, #B252B0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block"
  };

  // หากไม่มีข้อมูลใน items
  if (safeItems.length === 0) {
    return (
      <div className="work-section mt-12 text-center">
        <h1 
          className={`text-3xl text-${side} font-bold mb-3`}
          style={headingGradient}
        >
          {title}
        </h1>
        <p className={`text-[#424242] text-${side} mb-8 max-w-3xl mx-auto`}>{description}</p>
        <motion.div 
          className="p-12 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Empty 
            description={
              <span className="text-gray-500 text-lg">ไม่มีผลงานที่จะแสดงในขณะนี้</span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="work-section mt-12 relative">
      {/* ตกแต่งพื้นหลังด้วย blob */}
      <div 
        className="absolute -z-10 top-0 left-0 opacity-10 blur-3xl" 
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(144,39,142,0.3) 0%, rgba(144,39,142,0) 70%)",
          borderRadius: "50%",
          transform: "translate(-30%, -20%)"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 
          className={`text-3xl text-${side} font-bold mb-2`}
          style={headingGradient}
        >
          {title}
        </h1>
        <p className={`text-[#424242] text-${side} mb-8 max-w-3xl`}>{description}</p>
      </motion.div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6 justify-center"
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 50 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {displayedItems.map((item, index) => (
            <motion.div
              key={index}
              className="flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setIsHovering(index)}
              onMouseLeave={() => setIsHovering(null)}
              whileHover={{ y: -8 }}
              style={{
                width: cardWidth,
                maxWidth: '100%'
              }}
            >
              <Card
                hoverable
                className="overflow-hidden border-0 rounded-xl bg-white"
                style={{
                  width: '100%',
                  height: cardHeight,
                  boxShadow: isHovering === index 
                    ? "0 15px 30px rgba(144, 39, 142, 0.15)" 
                    : "0 5px 15px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.5s ease"
                }}
                cover={
                  <div 
                    className="relative overflow-hidden"
                    style={{ height: imageHeight }}
                  >
                    <motion.img 
                      src={`http://localhost:4000/${item.image}`} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      animate={{ 
                        scale: isHovering === index ? 1.08 : 1,
                        filter: isHovering === index ? "brightness(1.05)" : "brightness(1)"
                      }}
                      transition={{ duration: 0.5 }}
                    />
                    
                    {/* Category tag - Enhanced */}
                    <Tag 
                      color={item.category === 'competition' ? 'gold' : 
                            item.category === 'academic' ? 'blue' : 'green'} 
                      className="absolute top-4 left-4 rounded-full px-3 py-1 border-0 text-white font-medium shadow-md z-10"
                      icon={getCategoryIcon(item.category)}
                    >
                      {getTypeLabel(item.category)}
                    </Tag>
                    
                    {/* Year badge - Enhanced */}
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
                    
                    {/* Hover overlay - Enhanced with better animations */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: isHovering === index ? 1 : 0,
                        y: isHovering === index ? 0 : 20
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link to={item.projectLink} className="text-white hover:text-white">
                        <motion.h2 
                          className="text-xl font-semibold mb-2"
                          initial={{ y: 20 }}
                          animate={{ y: isHovering === index ? 0 : 20 }}
                          transition={{ duration: 0.4 }}
                        >
                          {item.title}
                        </motion.h2>
                        
                        <motion.div 
                          className="flex justify-between text-sm"
                          initial={{ y: 20 }}
                          animate={{ y: isHovering === index ? 0 : 20 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <span>ระดับ: {item.level}</span>
                          <Tooltip title="เข้าชม">
                            <span className="flex items-center">
                              <EyeOutlined className="mr-1" /> 
                              {Math.floor(Math.random() * 500) + 50}
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
                    <h3 className="text-lg font-semibold truncate mb-3">{item.title}</h3>
                  </Tooltip>
                </Link>
                
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <div className="flex-1">
                    <p className="m-0">ปี {item.year} | ระดับ: {item.level}</p>
                  </div>
                  
                  {/* แสดงไอคอนเฉพาะบางรายการ หรือสามารถกำหนดเงื่อนไขได้ */}
                  {(item.featured || Math.random() > 0.7) && (
                    <Tooltip title="ผลงานยอดนิยม">
                      <FireOutlined className="text-red-500 text-base" />
                    </Tooltip>
                  )}
                </div>
                
                {/* เพิ่มปุ่มดูเพิ่มเติม */}
                <motion.div 
                  className="mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovering === index ? 1 : 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to={item.projectLink}
                    className="text-[#90278E] hover:text-[#B252B0] text-sm font-medium flex items-center"
                  >
                    ดูเพิ่มเติม <ArrowRightOutlined className="ml-1" />
                  </Link>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls - Enhanced */}
      {totalPages > 1 && (
        <motion.div 
          className="flex justify-center items-center mt-10 space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={prevPage}
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors bg-white shadow-sm"
            whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.9 }}
          >
            <LeftOutlined style={{ fontSize: '16px' }} />
          </motion.button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-12 h-12 flex items-center justify-center border rounded-full transition-all ${
                  currentPage === index 
                    ? 'bg-gradient-to-r from-[#90278E] to-[#B252B0] text-white border-[#90278E] shadow-md' 
                    : 'text-gray-700 border-gray-200 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] bg-white'
                }`}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={nextPage}
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors bg-white shadow-sm"
            whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.9 }}
          >
            <RightOutlined style={{ fontSize: '16px' }} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Work_Col;