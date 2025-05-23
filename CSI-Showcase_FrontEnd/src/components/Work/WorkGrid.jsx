import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, useViewportScroll, useTransform } from "framer-motion";
import { Skeleton, Card, Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import WorkCard from "./WorkCard";
import WorkPagination from "./WorkPagination";
import WorkEmpty from "./WorkEmpty";
import { getItemsPerPage, handlePageChange, getHeadingGradient, getRenderDecorationBlob } from "./WorkUtils";

const WorkGrid = ({
  title,
  items = [],
  description,
  side = "center",
  displayMode = "column", // "column" หรือ "row"
  showActions = false,
  onEdit,
  onDelete,
  autoPlay = true
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);
  const [itemsPerPage, setItemsPerPage] = useState(
    displayMode === "column" ? getItemsPerPage() : 
    window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 3
  );
  
  // Scroll animation
  const { scrollYProgress } = useViewportScroll();
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.6, 1, 1, 0.6]);
  const sectionY = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [20, 0, 0, 20]);

  // ข้อมูลต้องไม่เป็น null หรือ undefined
  // ต่อจาก WorkGrid.jsx ที่ยังไม่สมบูรณ์

  // ข้อมูลต้องไม่เป็น null หรือ undefined
  const safeItems = items || [];
  const totalPages = Math.ceil(safeItems.length / itemsPerPage);

  // อัปเดตจำนวนไอเทมต่อหน้าเมื่อขนาดหน้าจอเปลี่ยน
  useEffect(() => {
    const handleResize = () => {
      if (displayMode === "column") {
        setItemsPerPage(getItemsPerPage());
      } else {
        // สำหรับ row mode ปรับตามขนาดหน้าจอ
        if (window.innerWidth <= 640) {
          setItemsPerPage(1);
        } else if (window.innerWidth <= 1024) {
          setItemsPerPage(2);
        } else {
          setItemsPerPage(3);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [displayMode]);

  // รีเซ็ตหน้าถ้าหน้าปัจจุบันเกินจำนวนหน้าที่มี
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [itemsPerPage, totalPages, currentPage]);

  // Auto-pagination
  useEffect(() => {
    if (safeItems.length > itemsPerPage && isAutoPlay) {
      const interval = setInterval(() => {
        nextPage();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [currentPage, safeItems.length, itemsPerPage, isAutoPlay]);

  // แสดงเฉพาะรายการในหน้าปัจจุบัน
  const displayedItems = safeItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const goToPage = (page) => {
    handlePageChange(page, setCurrentPage, setLoading, setDirection, currentPage);
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

  // สร้างดาวประกอบฉากหลัง - ปรับให้มีจำนวนน้อยลงบนอุปกรณ์มือถือ
  const renderStars = () => {
    const starCount = window.innerWidth <= 768 ? 15 : 30;
    
    return Array.from({ length: starCount }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.5 + 0.3;
      
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            backgroundColor: '#FFE6FF',
            boxShadow: `0 0 ${parseInt(size) * 2}px rgba(255, 230, 255, ${opacity})`
          }}
          animate={{ 
            opacity: [opacity * 0.7, opacity, opacity * 0.7] 
          }}
          transition={{ 
            duration: Math.random() * 3 + 2,
            repeat: Infinity
          }}
        />
      );
    });
  };

  // หากไม่มีข้อมูลให้แสดง Empty state
  if (safeItems.length === 0) {
    return <WorkEmpty title={title} description={description} />;
  }

  // Container variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: itemsPerPage }).map((_, index) => {
      if (displayMode === "column") {
        return (
          <div key={index} className="w-full">
            <Card
              className="overflow-hidden border-0 rounded-xl bg-white h-full"
              style={{
                boxShadow: "0 5px 15px rgba(144, 39, 142, 0.05)",
                border: "1px solid rgba(144, 39, 142, 0.1)"
              }}
              cover={
                <Skeleton.Image active style={{ width: '100%', height: 180 }} />
              }
            >
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </div>
        );
      } else {
        return (
          <Card 
            key={index} 
            className="w-full shadow-sm rounded-xl overflow-hidden border-0 bg-white"
            style={{ 
              height: window.innerWidth <= 1024 ? "auto" : "260px",
              boxShadow: "0 5px 15px rgba(144, 39, 142, 0.05)",
              border: "1px solid rgba(144, 39, 142, 0.1)"
            }}
          >
            <div className={`flex flex-col ${window.innerWidth <= 1024 ? '' : 'lg:flex-row'} gap-4 h-full`}>
              <div className={`w-full ${window.innerWidth <= 1024 ? '' : 'lg:w-2/5'} h-[180px] lg:h-full`}>
                <Skeleton.Image active style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
              </div>
              <div className={`w-full ${window.innerWidth <= 1024 ? '' : 'lg:w-3/5'}`}>
                <Skeleton active title={{ width: '60%' }} paragraph={{ rows: window.innerWidth <= 768 ? 2 : 4, width: ['90%', '80%', '70%', '60%'] }} />
              </div>
            </div>
          </Card>
        );
      }
    });
  };

  // Render admin action buttons
  const renderActionButtons = (item) => {
    if (!showActions) return null;

    return (
      <Space className="mt-2 sm:mt-0">
        <Button
          onClick={() => onEdit && onEdit(item)}
          icon={<EditOutlined />}
          type="primary"
          size={window.innerWidth <= 768 ? "small" : "middle"}
          className="bg-[#90278E] hover:bg-[#B252B0] rounded-full text-xs sm:text-sm border-0"
          style={{ backgroundColor: '#90278E', borderColor: '#90278E' }}
        >
          <span className="hidden xs:inline">แก้ไข</span>
        </Button>
        <Button
          onClick={() => onDelete && onDelete(item)}
          icon={<DeleteOutlined />}
          type="primary"
          danger
          size={window.innerWidth <= 768 ? "small" : "middle"}
          className="rounded-full text-xs sm:text-sm"
        >
          <span className="hidden xs:inline">ลบ</span>
        </Button>
      </Space>
    );
  };

  // Background section color based on displayMode
  const getSectionBackground = () => {
    if (displayMode === "column") {
      return "bg-gradient-to-b from-white via-[rgba(245,234,255,0.3)] to-[rgba(224,209,255,0.2)]";
    } else {
      return "bg-gradient-to-b from-[rgba(245,234,255,0.9)] to-[rgba(224,209,255,0.9)]";
    }
  };

  // Responsive grid columns based on screen size for column display mode
  const getGridColumns = () => {
    if (displayMode !== "column") return "grid-cols-1 gap-6";
    
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8";
  };

  return (
    <motion.div 
      className={`work-section py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto relative ${getSectionBackground()}`}
      style={{ 
        opacity: sectionOpacity,
        y: sectionY
      }}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(autoPlay)}
    >
      {/* Background decoration blob */}
      {getRenderDecorationBlob(displayMode === "column" ? "left" : "right")}
      
      {/* Background stars decoration */}
      <div className="absolute inset-0 overflow-hidden -z-10 opacity-30">
        {renderStars()}
      </div>

      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-${side} max-w-3xl mx-auto lg:mx-0`}
      >
        <h1 
          className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3`}
          style={getHeadingGradient()}
        >
          {title}
        </h1>
        <p className="text-[#8b949e] mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">{description}</p>
      </motion.div>

      {/* Grid or List Layout */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          className={getGridColumns()}
          variants={containerVariants}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 50 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            renderSkeletons()
          ) : (
            displayedItems.map((item, index) => (
              <React.Fragment key={item.id || index}>
                <WorkCard 
                  item={item}
                  index={index}
                  displayMode={displayMode}
                  isHovering={isHovering}
                  onMouseEnter={setIsHovering}
                  onMouseLeave={setIsHovering}
                />
                {/* Render action buttons if showActions is true */}
                {showActions && displayMode === "row" && renderActionButtons(item)}
              </React.Fragment>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      <WorkPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        goToPage={goToPage}
        prevPage={prevPage}
        nextPage={nextPage}
        loading={loading}
      />
    </motion.div>
  );
};

export default WorkGrid;