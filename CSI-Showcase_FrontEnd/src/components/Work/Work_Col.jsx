import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Work_Col = ({ title, items, side, description }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const itemsPerPage = 3;
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

  useEffect(() => {
    const interval = setInterval(() => {
      nextPage();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentPage]);

  return (
    <div className="work-section mt-10">
      <h1 className={`text-3xl text-${side} font-bold text-[#90278E]`}>{title}</h1>
      <p className={`text-[#424242] text-${side}`}>{description}</p>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6"
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 50 }}
          transition={{ duration: 0.5 }}
        >
          {displayedItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="text-[#90278E] pt-1 rounded-t-lg">
                <h1 className="text-lg font-semibold">{item.title}</h1>
              </div>
              <div className="text-sm text-gray-700">
                <p>{item.description}</p>
              </div>
              <div className="mt-4 text-right">
                <Link to={item.projectLink} className="text-[#90278E] hover:underline">
                  ดูรายละเอียดเพิ่มเติม
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-3">
        <motion.button 
          onClick={prevPage} 
          className="w-10 h-10 flex items-center justify-center border rounded-full text-gray-700 hover:bg-gray-200"
          whileTap={{ scale: 0.9 }}
        >
          &lt;
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
          &gt;
        </motion.button>
      </div>
    </div>
  );
};

export default Work_Col;
