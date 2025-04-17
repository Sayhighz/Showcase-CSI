import React, { useState, useEffect } from 'react';
import { Select, Empty } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterOutlined, RocketOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';

// นำเข้า hooks ที่มีอยู่
import { useProject } from '../../hooks';
import { PROJECT_TYPES } from '../../constants/projectTypes';

// นำเข้า components ของโปรเจค
import SearchBar from '../../components/SearchBar/SearchBar';
import Work_Row from '../../components/Work/Work_Row';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProjectFilter from '../../components/Project/ProjectFilter';
import FilterPanel from '../../components/common/FilterPanel';

const { Option } = Select;

const AllProject = () => {
  // ใช้ useProject hook แทนการเรียก axios โดยตรง
  const { 
    projects, 
    isLoading, 
    error, 
    fetchAllProjects, 
    projectTypes, 
    projectYears, 
    studyYears,
    filters,
    updateFilters,
    pagination,
    changePage
  } = useProject();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // ใช้ useEffect เรียกฟังก์ชันจาก hook
  useEffect(() => {
    fetchAllProjects();
  }, [fetchAllProjects, filters, pagination.current]);

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

  return (
    <div className="flex flex-col items-center w-full py-20 px-4 min-h-screen bg-gradient-to-b from-[#F9F2FF] to-white relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-0 w-64 h-64 rounded-full bg-gradient-to-r from-purple-200 to-purple-300 opacity-30 blur-3xl"
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
          className="absolute top-40 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 opacity-20 blur-3xl"
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-700 text-transparent bg-clip-text inline-block"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          ผลงานทั้งหมด
        </motion.h1>
        <motion.div
          className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-2 rounded-full"
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
        <SearchBar />
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
        >
          <ProjectFilter
            projectTypes={projectTypes.length > 0 ? projectTypes : PROJECT_TYPES}
            projectYears={projectYears}
            studyYears={studyYears}
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
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ล้างตัวกรองและลองใหม่
            </motion.button>
          </div>
        ) : projects.length > 0 ? (
          <Work_Row 
            title="" 
            items={projects} 
            side="center" 
          />
        ) : (
          <div className="flex justify-center items-center h-64 flex-col">
            <Empty 
              description={
                <span className="text-gray-500 text-lg">ไม่พบผลงานที่ตรงกับเงื่อนไขที่เลือก</span>
              }
            />
            <motion.button
              onClick={handleResetFilters}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-md"
              whileHover={{ scale: 1.05 }}
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
          className="mt-8 text-center text-gray-500"
        >
          แสดงผลงานทั้งหมด {projects.length} ชิ้น จากทั้งหมด {pagination.total} ชิ้น
        </motion.div>
      )}
    </div>
  );
};

export default AllProject;