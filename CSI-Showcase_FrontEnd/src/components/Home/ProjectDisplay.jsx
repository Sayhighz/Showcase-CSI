import React from 'react';
import { motion } from 'framer-motion';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const pageTransitionVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1] // GitHub-style easing
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
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
  paginationClassName,
  buttonColor = "#90278E" 
}) => {
  // GitHub-style button appearance
  const buttonBgColor = "bg-white bg-opacity-90 backdrop-filter backdrop-blur-md border border-[#90278E] border-opacity-20";
  const buttonTextColor = "text-[#90278E]";
  const buttonHoverBg = "rgba(144, 39, 142, 0.1)";
  
  // ตัวบอกตำแหน่งของโปรเจค (เช่น 2/5)
  const ProjectCounter = () => (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 backdrop-filter backdrop-blur-md px-4 py-2 rounded-full border border-[#90278E] border-opacity-20">
      <motion.span
        key={`counter-${currentPage}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {currentPage} / {totalProjects}
      </motion.span>
    </div>
  );

  return (
    <div className="relative">
      {/* Navigation arrows - GitHub styled with depth effect */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
        <motion.button
          className={`w-12 h-12 rounded-full ${buttonBgColor} ${buttonTextColor} flex items-center justify-center shadow-lg mx-4`}
          whileHover={{ scale: 1.1, backgroundColor: buttonHoverBg }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrev}
          disabled={!currentProject}
          style={{ boxShadow: '0 4px 14px rgba(144, 39, 142, 0.15)' }}
        >
          <LeftOutlined />
        </motion.button>
      </div>
      
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
        <motion.button
          className={`w-12 h-12 rounded-full ${buttonBgColor} ${buttonTextColor} flex items-center justify-center shadow-lg mx-4`}
          whileHover={{ scale: 1.1, backgroundColor: buttonHoverBg }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          disabled={!currentProject}
          style={{ boxShadow: '0 4px 14px rgba(144, 39, 142, 0.15)' }}
        >
          <RightOutlined />
        </motion.button>
      </div>

      {/* Project content with GitHub-style page transitions */}
      <motion.div
        key={`project-${currentPage}`}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative"
      >
        {children}
        
        {/* Show counter only if there's a project and multiple projects */}
        {currentProject && totalProjects > 1 && <ProjectCounter />}
      </motion.div>
    </div>
  );
};

export default ProjectDisplay;