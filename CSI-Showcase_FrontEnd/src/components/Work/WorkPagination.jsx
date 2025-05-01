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

  return (
    <motion.div 
      className="flex justify-center items-center mt-8 sm:mt-10 space-x-2 sm:space-x-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Previous Button */}
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

      {/* Page Number Buttons */}
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

      {/* Next Button */}
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
  );
};

export default WorkPagination;