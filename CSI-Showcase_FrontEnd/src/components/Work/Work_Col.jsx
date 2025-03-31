import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftOutlined, RightOutlined } from '@ant-design/icons'; // นำเข้าไอคอนจาก Ant Design

const Work_Col = ({ title, items, side, description }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const itemsPerPage = 4; // จำนวนแสดง 4 card ต่อครั้ง
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const displayedItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

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

  // หากไม่มีข้อมูลใน items
  if (items.length === 0) {
    return (
      <div className="work-section mt-10 text-center">
        <h1 className={`text-3xl text-${side} font-bold text-[#90278E]`}>{title}</h1>
        <p className={`text-[#424242] text-${side}`}>{description}</p>
        <p className="text-gray-500 mt-4">ไม่มีผลงานที่จะแสดงในขณะนี้</p>
      </div>
    );
  }

  return (
    <div className="work-section mt-10">
      <h1 className={`text-3xl text-${side} font-bold text-[#90278E]`}>{title}</h1>
      <p className={`text-[#424242] text-${side}`}>{description}</p>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6"
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 50 }}
          transition={{ duration: 0.5 }}
        >
          {displayedItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 w-64 mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="text-[#90278E] pt-1 rounded-t-lg">
                <Link to={item.projectLink} className="text-[#90278E] hover:underline">
                  <h1 className="text-lg font-semibold">{item.title}</h1>
                </Link>
              </div>
              <div className="text-xs text-gray-700">
                <p>ผลงานในปี {item.year}</p>
                <p>ระดับ: {item.level}</p>
                <p className="text-xs text-gray-500">หมวดหมู่: {getTypeLabel(item.category)}</p>
              </div>
              <div className="text-right"></div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-3">
          <motion.button
            onClick={prevPage}
            className="w-10 h-10 flex items-center justify-center border rounded-full text-gray-700 hover:bg-gray-200"
            whileTap={{ scale: 0.9 }}
          >
            <LeftOutlined /> {/* ใช้ไอคอนลูกศรย้อนกลับ */}
          </motion.button>

          {Array.from({ length: totalPages }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-10 h-10 flex items-center justify-center border rounded-full ${
                currentPage === index ? 'bg-[#90278E] text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {index + 1}
            </motion.button>
          ))}

          <motion.button
            onClick={nextPage}
            className="w-10 h-10 flex items-center justify-center border rounded-full text-gray-700 hover:bg-gray-200"
            whileTap={{ scale: 0.9 }}
          >
            <RightOutlined /> {/* ใช้ไอคอนลูกศรไปข้างหน้า */}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Work_Col;
