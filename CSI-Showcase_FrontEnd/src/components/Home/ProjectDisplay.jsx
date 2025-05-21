import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const pageTransitionVariants = {
  initial: { opacity: 0, scale: 0.98, x: 30 },
  animate: { 
    opacity: 1, 
    scale: 1,
    x: 0,
    transition: { 
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    x: -30,
    transition: { 
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1]
    }
  }
};

const ProjectDisplay = ({ 
  currentProject,
  currentPage,
  totalProjects,
  onPageChange,
  onNext,
  onPrev,
  children,
  paginationClassName = "",
  buttonColor = "#90278E",
  colorScheme = "light"
}) => {
  // Navigation button styles - สมมาตรและสอดคล้อง
  const buttonStyles = {
    base: "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
    light: "bg-white bg-opacity-90 backdrop-filter backdrop-blur-md border border-[#90278E] border-opacity-20 text-[#90278E]",
    dark: "bg-[#90278E] bg-opacity-20 backdrop-filter backdrop-blur-md border border-white border-opacity-20 text-white"
  };

  const buttonStyle = `${buttonStyles.base} ${buttonStyles[colorScheme]}`;
  const hoverColor = colorScheme === 'light' ? 'rgba(144, 39, 142, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  
  // Project counter component
  const ProjectCounter = () => (
    <motion.div 
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full border text-xs sm:text-sm font-medium shadow-lg ${
        colorScheme === 'light' 
          ? 'bg-white bg-opacity-90 backdrop-filter backdrop-blur-md border-[#90278E] border-opacity-20 text-[#90278E]'
          : 'bg-[#90278E] bg-opacity-20 backdrop-filter backdrop-blur-md border-white border-opacity-20 text-white'
      }`}>
        <motion.span
          key={`counter-${currentPage}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentPage} / {totalProjects}
        </motion.span>
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      {/* Navigation arrows - สมมาตรและสอดคล้อง */}
      <div className="absolute -left-2 sm:-left-6 top-1/2 transform -translate-y-1/2 z-20">
        <motion.button
          className={buttonStyle}
          whileHover={{ 
            scale: 1.1, 
            backgroundColor: hoverColor,
            boxShadow: '0 8px 25px rgba(144, 39, 142, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrev}
          disabled={!currentProject}
        >
          <LeftOutlined className="text-sm sm:text-base" />
        </motion.button>
      </div>
      
      <div className="absolute -right-2 sm:-right-6 top-1/2 transform -translate-y-1/2 z-20">
        <motion.button
          className={buttonStyle}
          whileHover={{ 
            scale: 1.1, 
            backgroundColor: hoverColor,
            boxShadow: '0 8px 25px rgba(144, 39, 142, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          disabled={!currentProject}
        >
          <RightOutlined className="text-sm sm:text-base" />
        </motion.button>
      </div>

      {/* Project content with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`project-${currentPage}`}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative px-2 sm:px-8"
        >
          {children}
          
          {/* Counter - แสดงเฉพาะเมื่อมีโปรเจคและมีมากกว่า 1 โปรเจค */}
          {currentProject && totalProjects > 1 && <ProjectCounter />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProjectDisplay;