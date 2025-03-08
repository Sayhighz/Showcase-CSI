import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Work_Row = ({ title, items, description, side }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const displayedItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  return (
    <div className="work-section mt-10">
      <h1 className={`text-3xl font-bold text-[#90278E] text-${side || 'left'}`}>{title}</h1>
      <p className={`text-[#424242] mb-4 text-${side || 'left'}`}>{description || ''}</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="flex flex-col space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {displayedItems.map((item, index) => (
            <div key={index} className="flex space-x-6 items-center">
              <div className="w-1/4 h-32 rounded-lg overflow-hidden bg-gray-200">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="w-full bg-white p-4 rounded-lg shadow-md">
                <p className="text-sm text-gray-400">Jan 1 2025</p>
                <h2 className="text-lg font-bold text-[#90278E]">{item.title}</h2>
                <p className="text-gray-700 text-sm mt-2">{item.description}</p>
                <div className="mt-3">
                  <Link to={item.projectLink} className="text-[#90278E] hover:underline">
                    ดูรายละเอียดเพิ่มเติม
                  </Link>
                </div>
              </div>
            </div>
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

export default Work_Row;
