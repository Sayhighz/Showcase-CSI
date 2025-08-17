import React from 'react';
import { motion } from 'framer-motion';
import { Empty, Tag } from 'antd';
import LoadingSpinner from '../common/LoadingSpinner';
import FilterPanel from '../common/FilterPanel';
import ProjectFilter from './ProjectFilter';
import WorkGrid from '../Work/WorkGrid';

const ProjectContentArea = ({
  isLoading,
  error,
  projects,
  filters,
  themeColors,
  theme,
  projectYears,
  level,
  projectTypes,
  filterTitle,
  workGridTitle,
  workGridDescription,
  emptyIcon: EmptyIcon,
  emptyMessage,
  emptySubMessage,
  countMessage,
  onFilterChange,
  onResetFilters,
  onUpdateFilters,
  hideTypeFilter = false
}) => {
  const renderResetButton = (onClick, text = "ล้างตัวกรอง") => (
    <motion.button
      onClick={onClick}
      className="mt-4 px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-white text-sm sm:text-base rounded-full shadow-md"
      style={{ 
        background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
        boxShadow: `0 4px 12px ${themeColors.primary}30`
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 6px 15px ${themeColors.primary}40` 
      }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
    </motion.button>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-6xl mb-4 sm:mb-6 md:mb-8 px-3 sm:px-4 relative z-10"
      >
        <FilterPanel
          title={filterTitle}
          activeFilters={filters}
          onClearFilters={onResetFilters}
          onRemoveFilter={(key) => onUpdateFilters({ [key]: null })}
          collapsible={true}
          defaultCollapsed={window.innerWidth < 768}
          loading={isLoading}
          theme={theme}
          style={{
            borderColor: themeColors.primary + '30'
          }}
        >
          <ProjectFilter
            projectTypes={projectTypes}
            projectYears={projectYears}
            level={level}
            initialValues={filters}
            onFilterChange={onFilterChange}
            onSearch={onFilterChange}
            onReset={onResetFilters}
            loading={isLoading}
            layout={window.innerWidth < 768 ? "vertical" : "horizontal"}
            hideTypeFilter={hideTypeFilter}
          />
        </FilterPanel>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="w-full max-w-6xl rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-3 sm:p-4 md:p-6 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] mx-3 sm:mx-4 relative z-10"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${themeColors.primary}20`,
          boxShadow: `0 4px 16px ${themeColors.primary}10, 0 6px 24px ${themeColors.primary}08, 0 8px 32px ${themeColors.primary}05`
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-40 sm:h-48 md:h-64">
            <LoadingSpinner tip={`กำลังโหลด${workGridTitle}...`} />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40 sm:h-48 md:h-64 flex-col">
            <Empty 
              description={
                <span className="text-gray-500 text-base sm:text-lg">เกิดข้อผิดพลาด: {error}</span>
              }
            />
            {renderResetButton(onResetFilters, "ล้างตัวกรองและลองใหม่")}
          </div>
        ) : projects.length > 0 ? (
          <WorkGrid
            title={workGridTitle}
            description={workGridDescription}
            items={projects}
            displayMode="list"
            side='center'
            autoPlay={true}
          />
        ) : (
          <div className="flex justify-center items-center h-40 sm:h-48 md:h-64 flex-col">
            <Empty 
              image={EmptyIcon && <EmptyIcon className="text-6xl mb-4" style={{ color: themeColors.primary }} />}
              description={
                <div className="text-center">
                  <span style={{ color: themeColors.dark }} className="text-base sm:text-lg block mb-2">
                    {emptyMessage}
                  </span>
                  <span className="text-sm text-gray-500">
                    {emptySubMessage}
                  </span>
                </div>
              }
            />
            {renderResetButton(onResetFilters)}
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
          <div className="text-center">
            <Tag 
              className="px-4 py-2 text-base font-medium rounded-full"
              style={{
                backgroundColor: themeColors.light,
                color: themeColors.primary,
                border: `1px solid ${themeColors.primary}30`
              }}
            >
              {countMessage.replace('{count}', projects.length)}
            </Tag>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ProjectContentArea;