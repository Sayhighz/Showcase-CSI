import React from "react";
import { motion } from "framer-motion";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const WorkPagination = ({ 
  currentPage, 
  totalPages, 
  goToPage, 
  prevPage, 
  nextPage, 
  loading 
}) => {
  // ไม่แสดง pagination ถ้ามีแค่หน้าเดียว
  if (totalPages <= 1) return null;

  // ปรับจำนวนปุ่มหน้าตามขนาดหน้าจอ
  const getVisiblePageCount = () => {
    if (window.innerWidth <= 480) return 3;
    if (window.innerWidth <= 768) return 4;
    return 5;
  };

  const visiblePageCount = getVisiblePageCount();

  // จัดการปุ่มหน้าสำหรับหน้าจอขนาดเล็ก
  const getVisiblePages = () => {
    if (totalPages <= visiblePageCount) {
      return Array.from({ length: totalPages }).map((_, i) => i);
    }

    // จัดการหน้าที่แสดงในกรณีที่มีหลายหน้า
    let startPage = Math.max(0, currentPage - Math.floor(visiblePageCount / 2));
    if (startPage + visiblePageCount > totalPages) {
      startPage = Math.max(0, totalPages - visiblePageCount);
    }

    return Array.from({ length: visiblePageCount }).map((_, i) => startPage + i);
  };

  return (
    <motion.div 
      className="flex justify-center items-center mt-6 sm:mt-8 md:mt-10 space-x-1 sm:space-x-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Previous Button */}
      <motion.button
        onClick={prevPage}
        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center border border-[rgba(144,39,142,0.2)] rounded-full text-[#90278E] hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors bg-white backdrop-filter backdrop-blur-md bg-opacity-80 shadow-sm"
        whileHover={{ 
          scale: 1.1, 
          boxShadow: "0 5px 15px rgba(144,39,142,0.15)",
          borderColor: "#90278E"
        }}
        whileTap={{ scale: 0.9 }}
        disabled={loading}
        aria-label="Previous page"
      >
        <LeftOutlined style={{ fontSize: '12px' }} />
      </motion.button>

      {/* Page Number Buttons */}
      <div className="flex space-x-1 sm:space-x-2">
        {getVisiblePages().map((pageNumber) => {
          // Skip if page number is out of range
          if (pageNumber >= totalPages) return null;
          
          return (
            <motion.button
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center border rounded-full transition-all text-xs sm:text-sm ${
                currentPage === pageNumber 
                  ? 'bg-gradient-to-r from-[#90278E] to-[#B252B0] text-white border-[#90278E] shadow-md' 
                  : 'text-[#90278E] border-[rgba(144,39,142,0.2)] hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] bg-white backdrop-filter backdrop-blur-md bg-opacity-80'
              }`}
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 5px 15px rgba(144,39,142,0.15)",
                borderColor: "#90278E"
              }}
              whileTap={{ scale: 0.9 }}
              disabled={loading}
              aria-label={`Page ${pageNumber + 1}`}
              style={{
                boxShadow: currentPage === pageNumber 
                  ? "0 5px 15px rgba(144,39,142,0.3)" 
                  : "0 5px 15px rgba(0,0,0,0.05)"
              }}
            >
              {pageNumber + 1}
            </motion.button>
          );
        })}
      </div>

      {/* Next Button */}
      <motion.button
        onClick={nextPage}
        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center border border-[rgba(144,39,142,0.2)] rounded-full text-[#90278E] hover:bg-[#F8E9F8] hover:border-[#90278E] hover:text-[#90278E] transition-colors bg-white backdrop-filter backdrop-blur-md bg-opacity-80 shadow-sm"
        whileHover={{ 
          scale: 1.1, 
          boxShadow: "0 5px 15px rgba(144,39,142,0.15)",
          borderColor: "#90278E"
        }}
        whileTap={{ scale: 0.9 }}
        disabled={loading}
        aria-label="Next page"
      >
        <RightOutlined style={{ fontSize: '12px' }} />
      </motion.button>
    </motion.div>
  );
};

export default WorkPagination;