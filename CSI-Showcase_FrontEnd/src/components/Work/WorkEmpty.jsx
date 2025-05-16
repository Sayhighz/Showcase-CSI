import React from "react";
import { motion } from "framer-motion";
import { Empty } from "antd";

const WorkEmpty = ({ title, description }) => {
  // สร้างระดับของตัวอักษรในหัวข้อ
  const headingGradient = {
    background: "linear-gradient(135deg, #90278E 0%, #B252B0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block",
    textShadow: "0 0 20px rgba(144,39,142,0.1)"
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
        <p className="text-[#8b949e] mb-8 text-base sm:text-lg">{description}</p>
      </motion.div>
      
      <motion.div 
        className="p-8 sm:p-12 bg-gradient-to-b from-[#F5EAFF] to-white rounded-xl shadow-sm border border-[rgba(144,39,142,0.1)] backdrop-filter backdrop-blur-md bg-opacity-80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Empty 
          description={
            <span className="text-[#8b949e] text-lg">ไม่มีผลงานที่จะแสดงในขณะนี้</span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
        
        {/* เพิ่ม decoration elements */}
        <div className="absolute -z-10 top-0 right-0 opacity-10 blur-3xl" 
          style={{
            width: "40%",
            height: "40%",
            background: "radial-gradient(circle, rgba(144,39,142,0.3) 0%, rgba(144,39,142,0) 70%)",
            borderRadius: "50%",
            transform: "translate(20%, -30%)"
          }}
        />
        
        {/* เพิ่ม subtle star pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => {
            const size = Math.random() * 4 + 2;
            return (
              <div 
                key={i} 
                className="absolute rounded-full bg-[#90278E]"
                style={{
                  width: size,
                  height: size,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  boxShadow: `0 0 ${size * 2}px rgba(144, 39, 142, 0.8)`
                }}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default WorkEmpty;