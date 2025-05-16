import React, { useState, useEffect } from 'react';
import { Select, Empty } from 'antd';
import { motion } from 'framer-motion';

// นำเข้า hooks ที่มีอยู่
import { useProject } from '../../hooks';
import { PROJECT_TYPES } from '../../constants/projectTypes';

// นำเข้า components ของโปรเจค
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProjectFilter from '../../components/Project/ProjectFilter';
import FilterPanel from '../../components/common/FilterPanel';
import WorkGrid from '../../components/Work/WorkGrid';

const { Option } = Select;

const AllProject = () => {
  // CSS Variables สำหรับสีหลักตามธีม
  const themeColors = {
    primary: '#90278E',        // สีม่วงเข้ม
    secondary: '#B252B0',      // สีม่วงอ่อน
    dark: '#5E1A5C',           // สีม่วงเข้มมาก
    lightPurple: '#F5EAFF',    // สีม่วงอ่อนมาก (background)
    mediumPurple: '#E0D1FF',   // สีม่วงกลาง
    textLight: '#FFE6FF',      // สีตัวอักษรบนพื้นเข้ม
    textSecondary: '#F8CDFF'   // สีตัวอักษรรอง
  };

  // ใช้ useProject hook แทนการเรียก axios โดยตรง
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

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // ใช้ useEffect เรียกฟังก์ชันจาก hook เมื่อโหลดคอมโพเนนต์ครั้งแรก
  useEffect(() => {
    // เรียกดึงข้อมูลโปรเจคเมื่อโหลดครั้งแรก
    fetchAllProjects();
  }, []);

  // สลับการแสดงแผงตัวกรอง
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  // ล้างตัวกรอง
  const handleResetFilters = () => {
    updateFilters({
      type: null,
      year: null,
      studyYear: null,
      keyword: '',
    });
  };

  // จัดการการเปลี่ยนแปลงตัวกรอง
  const handleFilterChange = (values) => {
    updateFilters(values);
  };
  
  // จัดการการเปลี่ยนแปลงหน้า
  const handlePageChange = (page, pageSize) => {
    changePage(page, pageSize);
  };

  // กำหนด styles สำหรับ gradient text
  const headingGradient = {
    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
    textShadow: '0 0 20px rgba(144,39,142,0.1)'
  };

  return (
    <div className="flex flex-col items-center w-full py-20 px-4 min-h-screen bg-gradient-to-b from-[#F5EAFF] to-white relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-0 w-64 h-64 rounded-full opacity-30 blur-3xl"
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
          className="absolute top-40 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, rgba(178,82,176,0.3) 0%, rgba(94,26,92,0) 70%)` }}
          animate={{ 
            x: [0, -70, 0], 
            y: [0, 50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* เพิ่มดาวกระพริบเบาๆ ในฉากหลัง */}
        {Array.from({ length: 30 }).map((_, i) => {
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
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <motion.h1
          className="text-4xl font-bold"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={headingGradient}
        >
          ผลงานทั้งหมด
        </motion.h1>
        <motion.div
          className="h-1 w-24 mx-auto mt-2 rounded-full"
          style={{ background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` }}
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-2xl mb-12"
      >
        {/* <SearchBar onSearch={handleSearch} defaultValue={filters.keyword || ''} /> */}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-6xl mb-8"
      >
        {/* ใช้ FilterPanel component ที่มีอยู่ในโปรเจค */}
        <FilterPanel
          title="ตัวกรองโปรเจค"
          activeFilters={filters}
          onClearFilters={handleResetFilters}
          onRemoveFilter={(key) => updateFilters({ [key]: null })}
          collapsible={true}
          defaultCollapsed={true}
          loading={isLoading}
          theme="gradient" // ใช้ธีม gradient ที่เราปรับแต่งไว้ใน FilterPanel
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
            layout="horizontal"
          />
        </FilterPanel>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-6 min-h-[300px]"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(144, 39, 142, 0.1)',
          boxShadow: '0 8px 32px rgba(144, 39, 142, 0.08)'
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner tip="กำลังโหลดข้อมูล..." />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 flex-col">
            <Empty 
              description={
                <span className="text-gray-500 text-lg">เกิดข้อผิดพลาด: {error}</span>
              }
            />
            <motion.button
              onClick={handleResetFilters}
              className="mt-4 px-6 py-2 text-white rounded-full shadow-md"
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
              ล้างตัวกรองและลองใหม่
            </motion.button>
          </div>
        ) : projects.length > 0 ? (
          <WorkGrid
            items={projects}
            displayMode='row'
            side='left'/>
        ) : (
          <div className="flex justify-center items-center h-64 flex-col">
            <Empty 
              description={
                <span style={{ color: themeColors.dark }} className="text-lg">ไม่พบผลงานที่ตรงกับเงื่อนไขที่เลือก</span>
              }
            />
            <motion.button
              onClick={handleResetFilters}
              className="mt-4 px-6 py-2 text-white rounded-full shadow-md"
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
              ล้างตัวกรอง
            </motion.button>
          </div>
        )}
      </motion.div>
      
      {!isLoading && projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="mt-8 w-full max-w-6xl"
        >
          <div className="flex flex-col items-center">
            <div className="mb-4" style={{ color: themeColors.dark }}>
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