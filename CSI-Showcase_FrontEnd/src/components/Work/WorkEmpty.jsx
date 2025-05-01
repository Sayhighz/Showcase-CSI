import React from "react";
import { motion } from "framer-motion";
import { Empty } from "antd";

const WorkEmpty = ({ title, description }) => {
  // สร้างระดับของตัวอักษรในหัวข้อ
  const headingGradient = {
    background: "linear-gradient(135deg, #90278E 0%, #B252B0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block"
  };

  return (
    <div className="work-section py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h1 
          className="text-2xl sm:text-3xl font-bold mb-3"
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
};

export default WorkEmpty;