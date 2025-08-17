import React, { useEffect } from 'react';
import { Empty } from 'antd';
import { motion } from 'framer-motion';

import { useProject } from '../../hooks';
import { PROJECT_TYPES } from '../../constants/projectTypes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProjectFilter from '../../components/Project/ProjectFilter';
import FilterPanel from '../../components/common/FilterPanel';
import WorkGrid from '../../components/Work/WorkGrid';

const AllProject = () => {
  const themeColors = {
    primary: '#90278E',
    secondary: '#B252B0',
    dark: '#5E1A5C',
    lightPurple: '#F5EAFF',
    mediumPurple: '#E0D1FF',
    textLight: '#FFE6FF',
    textSecondary: '#F8CDFF'
  };

  const { 
    projects, 
    isLoading, 
    error, 
    fetchAllProjects, 
    projectTypes, 
    projectYears, 
    level,
    filters,
    updateFilters,
    pagination,
    changePage
  } = useProject();

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const handleResetFilters = () => {
    updateFilters({
      type: null,
      year: null,
      studyYear: null,
      keyword: '',
    });
  };

  const handleFilterChange = (values) => {
    updateFilters(values);
  };

  const headingGradient = {
    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
    textShadow: '0 0 20px rgba(144,39,142,0.1)'
  };

  const renderStars = () => {
    const starCount = window.innerWidth < 768 ? 15 : 30;
    return Array.from({ length: starCount }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.5 + 0.3;
      
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            backgroundColor: '#90278E',
            boxShadow: `0 0 ${parseInt(size) * 2}px rgba(144, 39, 142, ${opacity})`
          }}
          animate={{ 
            opacity: [opacity * 0.7, opacity, opacity * 0.7] 
          }}
          transition={{ 
            duration: Math.random() * 3 + 2,
            repeat: Infinity
          }}
        />
      );
    });
  };

  const renderResetButton = (text = "ล้างตัวกรอง") => (
    <motion.button
      onClick={handleResetFilters}
      className="mt-4 px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-white text-sm sm:text-base rounded-full shadow-md"
      style={{ 
        background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
        boxShadow: '0 4px 12px rgba(144, 39, 142, 0.3)'
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 6px 15px rgba(144, 39, 142, 0.4)' 
      }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
    </motion.button>
  );

  return (
    <div className="flex flex-col items-center w-full py-8 md:py-16 lg:py-20 px-3 sm:px-4 min-h-screen bg-gradient-to-b from-[#F5EAFF] to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 rounded-full opacity-30 blur-3xl"
          style={{ background: `radial-gradient(circle, rgba(144,39,142,0.3) 0%, rgba(144,39,142,0) 70%)` }}
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-40 right-0 sm:right-10 md:right-20 w-40 sm:w-64 md:w-96 h-40 sm:h-64 md:h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, rgba(178,82,176,0.3) 0%, rgba(94,26,92,0) 70%)` }}
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 30, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="absolute inset-0 overflow-hidden -z-10 opacity-30">
          {renderStars()}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-4 sm:mb-6 md:mb-8 relative z-10"
      >
        <motion.h1
          className="text-3xl sm:text-4xl font-bold"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={headingGradient}
        >
          ผลงานทั้งหมด
        </motion.h1>
        <motion.div
          className="h-1 w-16 sm:w-20 md:w-24 mx-auto mt-2 rounded-full"
          style={{ background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` }}
          initial={{ width: 0 }}
          animate={{ width: '6rem' }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-6xl mb-4 sm:mb-6 md:mb-8 px-3 sm:px-4 relative z-10"
      >
        <FilterPanel
          title="ตัวกรองโปรเจค"
          activeFilters={filters}
          onClearFilters={handleResetFilters}
          onRemoveFilter={(key) => updateFilters({ [key]: null })}
          collapsible={true}
          defaultCollapsed={window.innerWidth < 768}
          loading={isLoading}
          theme="gradient"
        >
          <ProjectFilter
            projectTypes={projectTypes.length > 0 ? projectTypes : PROJECT_TYPES}
            projectYears={projectYears}
            level={level}
            initialValues={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleFilterChange}
            onReset={handleResetFilters}
            loading={isLoading}
            layout={window.innerWidth < 768 ? "vertical" : "horizontal"}
          />
        </FilterPanel>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="w-full max-w-6xl bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-3 sm:p-4 md:p-6 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] mx-3 sm:mx-4 relative z-10"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(144, 39, 142, 0.1)',
          boxShadow: '0 4px 16px sm:0 6px 24px md:0 8px 32px rgba(144, 39, 142, 0.08)'
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-40 sm:h-48 md:h-64">
            <LoadingSpinner tip="กำลังโหลดข้อมูล..." />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40 sm:h-48 md:h-64 flex-col">
            <Empty 
              description={
                <span className="text-gray-500 text-base sm:text-lg">เกิดข้อผิดพลาด: {error}</span>
              }
            />
            {renderResetButton("ล้างตัวกรองและลองใหม่")}
          </div>
        ) : projects.length > 0 ? (
          <WorkGrid
            items={projects}
            displayMode="list"
            side='left'
          />
        ) : (
          <div className="flex justify-center items-center h-40 sm:h-48 md:h-64 flex-col">
            <Empty 
              description={
                <span style={{ color: themeColors.dark }} className="text-base sm:text-lg">
                  ไม่พบผลงานที่ตรงกับเงื่อนไขที่เลือก
                </span>
              }
            />
            {renderResetButton()}
          </div>
        )}
      </motion.div>
      
      {!isLoading && projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="mt-4 sm:mt-6 md:mt-8 w-full max-w-6xl px-3 sm:px-4 relative z-10"
        >
          <div className="flex flex-col items-center">
            <div className="mb-2 sm:mb-4 text-xs sm:text-sm md:text-base text-center" style={{ color: themeColors.dark }}>
              แสดงผลงานลำดับที่ {(pagination.current - 1) * pagination.pageSize + 1}-
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} จากทั้งหมด {pagination.total} ชิ้น
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AllProject;