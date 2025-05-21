import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const SectionDivider = ({ 
  colorFrom = "#FFFFFF", 
  colorTo = "#F5EAFF",
  wave = true,
  height = 120,
  className = "",
  scrollToNext = false,
  scrollToTop = false,
  onClick
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform values based on scroll
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  // ปรับความสูงตามขนาดหน้าจอแบบสมมาตร
  const responsiveHeight = window.innerWidth < 768 ? height * 0.6 : height;

  // ฟังก์ชันสร้างรูปแบบ Wave Style ที่สมมาตร
  const createWaveDivider = () => {
    return (
      <div 
        className="w-full overflow-hidden" 
        style={{ height: `${responsiveHeight}px` }}
      >
        <svg 
          width="100%" 
          height={responsiveHeight} 
          viewBox={`0 0 1440 ${responsiveHeight}`} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path 
            d={`M0,0 L1440,0 L1440,${responsiveHeight * 0.7} C1080,${responsiveHeight * 1.1} 360,${responsiveHeight * 0.3} 0,${responsiveHeight * 0.8} L0,0 Z`} 
            fill={`url(#divider-gradient-${colorFrom.replace('#', '')})`}
          />
          <defs>
            <linearGradient 
              id={`divider-gradient-${colorFrom.replace('#', '')}`} 
              x1="0%" 
              y1="0%" 
              x2="0%" 
              y2="100%" 
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div 
      ref={ref}
      className={`relative ${className}`} 
      style={{ zIndex: 5 }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ 
          opacity,
          y: translateY 
        }}
      >
        {createWaveDivider()}
      </motion.div>

      {/* Unified scroll button for both directions */}
      {(scrollToNext || scrollToTop) && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ 
              opacity: { duration: 0.3 },
              y: { 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div className="px-3 sm:px-4 py-1 sm:py-2 bg-[#90278E] text-white rounded-full shadow-lg text-xs sm:text-sm font-medium">
              {scrollToTop ? "↑" : "↓"}
            </div>
            <div className="text-[#90278E] mt-2 font-medium text-xs sm:text-sm">
              {scrollToTop ? "กลับสู่ด้านบน" : "เลื่อนลงมา"}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SectionDivider;