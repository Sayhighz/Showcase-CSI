import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Tooltip, Tag } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  EyeOutlined, 
  FireOutlined,
  TrophyOutlined,
  BookOutlined,
  TeamOutlined
} from '@ant-design/icons';

const Work_Col = ({ title, items, side, description }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(null);
  const itemsPerPage = 4; // จำนวนแสดง 4 card ต่อครั้ง
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const displayedItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // กำหนดขนาดคงที่สำหรับ card
  const cardWidth = 280; // ขนาดความกว้างคงที่
  const cardHeight = 320; // ขนาดความสูงคงที่ (ถ้าต้องการ)
  const imageHeight = 160; // ขนาดความสูงของภาพคงที่

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
    if (items.length > itemsPerPage) {
      const interval = setInterval(() => {
        nextPage();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentPage, items.length]); // ใช้ useEffect เมื่อจำนวนผลงานเปลี่ยน

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

  // หากไม่มีข้อมูลใน items
  if (items.length === 0) {
    return (
      <div className="work-section mt-12 text-center">
        <h1 className={`text-3xl text-${side} font-bold text-[#90278E] mb-3`}>{title}</h1>
        <p className={`text-[#424242] text-${side} mb-8`}>{description}</p>
        <motion.div 
          className="p-10 bg-gray-50 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-500">ไม่มีผลงานที่จะแสดงในขณะนี้</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="work-section mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl text-${side} font-bold text-[#90278E] mb-2`}>{title}</h1>
        <p className={`text-[#424242] text-${side} mb-6`}>{description}</p>
      </motion.div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 justify-center"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setIsHovering(index)}
              onMouseLeave={() => setIsHovering(null)}
              whileHover={{ y: -5 }}
              style={{
                width: cardWidth,
                maxWidth: '100%'
              }}
            >
              <Card
                hoverable
                className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-0 rounded-xl"
                style={{
                  width: '100%',
                  height: cardHeight
                }}
                cover={
                  <div 
                    className="relative overflow-hidden"
                    style={{ height: imageHeight }}
                  >
                    <motion.img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover bg-gray-200"
                      animate={{ 
                        scale: isHovering === index ? 1.05 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Category tag */}
                    <Tag 
                      color={item.category === 'competition' ? 'gold' : 
                            item.category === 'academic' ? 'blue' : 'green'} 
                      className="absolute top-3 left-3 rounded-full px-3 py-1 border-0 text-white font-medium"
                      icon={getCategoryIcon(item.category)}
                    >
                      {getTypeLabel(item.category)}
                    </Tag>
                    
                    {/* Year badge */}
                    <Badge 
                      count={item.year} 
                      className="absolute top-3 right-3"
                      style={{ 
                        backgroundColor: '#90278E',
                        padding: '0 8px',
                        borderRadius: '10px'
                      }}
                    />
                    
                    {/* Hover overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovering === index ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link to={item.projectLink} className="text-white hover:text-white">
                        <motion.h2 
                          className="text-lg font-semibold mb-2"
                          initial={{ y: 20 }}
                          animate={{ y: isHovering === index ? 0 : 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.title}
                        </motion.h2>
                        
                        <motion.div 
                          className="flex justify-between text-sm"
                          initial={{ y: 20 }}
                          animate={{ y: isHovering === index ? 0 : 20 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
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
                <Link to={item.projectLink} className="text-[#90278E] hover:text-[#B252B0]">
                  <Tooltip title={item.title}>
                    <h3 className="text-lg font-semibold truncate mb-2">{item.title}</h3>
                  </Tooltip>
                </Link>
                
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <div className="flex-1">
                    <p>ปี {item.year} | ระดับ: {item.level}</p>
                  </div>
                  
                  {Math.random() > 0.7 && (
                    <Tooltip title="ผลงานยอดนิยม">
                      <FireOutlined className="text-red-500 text-sm" />
                    </Tooltip>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div 
          className="flex justify-center items-center mt-8 space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={prevPage}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
            >
              {index + 1}
            </motion.button>
          ))}

          <motion.button
            onClick={nextPage}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RightOutlined />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Work_Col;