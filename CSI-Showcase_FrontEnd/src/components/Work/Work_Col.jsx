import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Tooltip, Tag, Empty, Skeleton } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  EyeOutlined, 
  FireOutlined,
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  UserOutlined,
  FileOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS } from '../../constants';

const Work_Col = ({ title, items = [], side = 'center', description }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  // ข้อมูลต้องไม่เป็น null หรือ undefined
  const safeItems = items || [];
  
  // ปรับจำนวนแสดง card ต่อหน้าตามขนาดหน้าจอ
  const getItemsPerPage = () => {
    // ถ้าเป็นโมบายล์แสดง 1 หรือ 2 ชิ้น แท็บเล็ต 2 หรือ 3 ชิ้น เดสก์ท็อป 4 ชิ้น
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };
  
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
  
  // อัปเดตจำนวนไอเทมต่อหน้าเมื่อขนาดหน้าจอเปลี่ยน
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const totalPages = Math.ceil(safeItems.length / itemsPerPage);
  
  useEffect(() => {
    // รีเซ็ตหน้าถ้าหน้าปัจจุบันเกินจำนวนหน้าที่มี (เกิดจากการเปลี่ยนขนาดหน้าจอ)
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [itemsPerPage, totalPages, currentPage]);
  
  const displayedItems = safeItems.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  // กำหนดขนาดคงที่สำหรับ card
  const cardWidth = '100%';
  const imageHeight = 180;

  const goToPage = (page) => {
    setDirection(page > currentPage ? 1 : -1);
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 300);
  };

  const nextPage = () => {
    if (totalPages <= 1) return;
    setDirection(1);
    setLoading(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
      setLoading(false);
    }, 300);
  };

  const prevPage = () => {
    if (totalPages <= 1) return;
    setDirection(-1);
    setLoading(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
      setLoading(false);
    }, 300);
  };

  // ปิด auto-pagination ถ้ามีผลงานแค่ 4 อันหรือน้อยกว่าจำนวนที่แสดงต่อหน้า
  useEffect(() => {
    if (safeItems.length > itemsPerPage && autoPlay) {
      const interval = setInterval(() => {
        nextPage();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [currentPage, safeItems.length, itemsPerPage, autoPlay]);

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
      <div className="work-section py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-${side} max-w-3xl mx-auto`}
        >
          <h1 
            className={`text-2xl sm:text-3xl font-bold mb-3`}
            style={headingGradient}
          >
            {title}
          </h1>
          <p className="text-gray-600 mb-8 text-base sm:text-lg">{description}</p>
        </motion.div>
        
        <motion.div 
          className="p-8 sm:p-12 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm border border-gray-100"
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

  // ฟังก์ชันสำหรับเลือกการแสดงผลเมื่อไม่มีรูปภาพ
  const renderCoverImage = (item) => {
    if (item.image) {
      return (
        <motion.img 
          src={`${API_ENDPOINTS.BASE}/${item.image}`} 
          alt={item.title} 
          className="w-full h-full object-cover"
          animate={{ 
            scale: isHovering === item.id ? 1.08 : 1,
            filter: isHovering === item.id ? "brightness(1.05)" : "brightness(1)"
          }}
          transition={{ duration: 0.5 }}
        />
      );
    } else {
      // แสดงไอคอนเอกสารเมื่อไม่มีรูปภาพ
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <FilePdfOutlined style={{ fontSize: '48px', color: '#90278E' }} />
          <div className="mt-3 text-center text-gray-500 px-4">
            <p className="text-sm truncate max-w-full">{item.title}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="work-section py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* ตกแต่งพื้นหลังด้วย blob */}
      <div 
        className="absolute -z-10 top-0 left-0 opacity-10 blur-3xl" 
        style={{
          width: "40%",
          height: "40%",
          background: "radial-gradient(circle, rgba(144,39,142,0.3) 0%, rgba(144,39,142,0) 70%)",
          borderRadius: "50%",
          transform: "translate(-30%, -20%)"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-${side} max-w-3xl mx-auto lg:mx-0`}
      >
        <h1 
          className={`text-2xl sm:text-3xl font-bold mb-3`}
          style={headingGradient}
        >
          {title}
        </h1>
        <p className="text-gray-600 mb-8 text-base sm:text-lg">{description}</p>
      </motion.div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-6"
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 50 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            // แสดง Skeleton ขณะโหลด
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="w-full">
                <Card
                  className="overflow-hidden border-0 rounded-xl bg-white h-full"
                  style={{
                    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
                  }}
                  cover={
                    <Skeleton.Image active style={{ width: '100%', height: imageHeight }} />
                  }
                >
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </div>
            ))
          ) : (
            displayedItems.map((item, index) => (
              <motion.div
                key={item.id || index}
                className="w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setIsHovering(item.id)}
                onMouseLeave={() => setIsHovering(null)}
                whileHover={{ y: -8 }}
              >
                <Card
                  hoverable
                  className="overflow-hidden border-0 rounded-xl bg-white h-full"
                  style={{
                    width: cardWidth,
                    boxShadow: isHovering === item.id 
                      ? "0 15px 30px rgba(144, 39, 142, 0.15)" 
                      : "0 5px 15px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.5s ease"
                  }}
                  cover={
                    <div 
                      className="relative overflow-hidden"
                      style={{ height: imageHeight }}
                    >
                      {renderCoverImage(item)}
                      
                      {/* Category tag */}
                      <Tag 
                        color={item.category === 'competition' ? 'gold' : 
                              item.category === 'academic' ? 'blue' : 'green'} 
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
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div 
          className="flex justify-center items-center mt-8 sm:mt-10 space-x-2 sm:space-x-3"
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
            aria-label="Previous page"
          >
            <LeftOutlined style={{ fontSize: '14px' }} />
          </motion.button>

          <div className="flex space-x-1 sm:space-x-2">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
              // แสดงปุ่มกดเฉพาะ 5 หน้าแรก หรือน้อยกว่า
              const pageNumber = index;
              return (
                <motion.button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border rounded-full transition-all ${
                    currentPage === pageNumber 
                      ? 'bg-gradient-to-r from-[#90278E] to-[#B252B0] text-white border-[#90278E] shadow-md' 
                      : 'text-gray-700 border-gray-200 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] bg-white'
                  }`}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  disabled={loading}
                  aria-label={`Page ${pageNumber + 1}`}
                >
                  {pageNumber + 1}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            onClick={nextPage}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors bg-white shadow-sm"
            whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
            aria-label="Next page"
          >
            <RightOutlined style={{ fontSize: '14px' }} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Work_Col;