// src/components/SearchBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, AutoComplete, Avatar, Spin, Empty, Tag, Tooltip } from 'antd';
import { SearchOutlined, BookOutlined, TrophyOutlined, ReadOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSearch } from '../../hooks';
import { colors } from '../../config/themeConfig';
import { API_ENDPOINTS } from '../../constants';

const categoryIcons = {
  academic: <BookOutlined className="text-blue-500" />, // งานวิจัย
  competition: <TrophyOutlined className="text-yellow-500" />, // การแข่งขัน
  coursework: <ReadOutlined className="text-green-500" />, // รายวิชา
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const SearchBar = () => {
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  const searchInputRef = useRef(null);
  const {
    keyword,
    searchResults,
    isSearching,
    handleKeywordChange,
    submitSearch,
    searchProjects,
    updateFilters,
  } = useSearch();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // เมื่อข้อความค้นหาเปลี่ยน ทำการค้นหาอัตโนมัติหลังจาก debounce
  const handleSearch = (value) => {
    handleKeywordChange(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value) {
      debounceTimeout.current = setTimeout(() => {
        // ทำการค้นหาโดยส่งคำค้นหาไปพร้อมกับตั้งค่า limit เป็น 5
        searchProjects(value, { limit: 5 });
      }, 500);
    }
  };

  // จัดการเมื่อเลือกผลลัพธ์การค้นหา
  const handleSelect = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // จัดการกับการกดปุ่มลูกศรขึ้น/ลงและปุ่ม Enter
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && selectedIndex < searchResults.length - 1) {
      setSelectedIndex(prev => prev + 1);
    } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    } else if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelect(searchResults[selectedIndex].id);
      } else if (keyword) {
        // ส่งแบบฟอร์มค้นหาหากไม่มีผลลัพธ์การค้นหาแต่มีคำค้นหา
        submitSearch(keyword);
      }
    }
  };

  // รีเซ็ต selectedIndex เมื่อ searchResults เปลี่ยน
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // สร้างตัวเลือกสำหรับ AutoComplete
  const getOptions = () => {
    if (searchResults.length > 0) {
      return searchResults.map((project, index) => ({
        value: project.id.toString(), // ใช้ ID เป็น value
        label: (
          <motion.div
            key={`${project.id}-${index}`}
            onClick={() => handleSelect(project.id)}
            className={`flex items-start p-4 cursor-pointer rounded-xl transition-all duration-200 ${index === selectedIndex ? 'bg-purple-50' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ backgroundColor: '#f5eaff', boxShadow: '0 4px 12px rgba(144, 39, 142, 0.1)' }}
          >
            <div className="relative mr-4">
              <div className="relative">
                <Avatar 
                  src={project.image ? (API_ENDPOINTS.BASE + '/' + project.image) : null} 
                  size={56} 
                  shape="square"
                  className="shadow-md rounded-xl"
                  style={{ border: `2px solid ${colors.primary}` }}
                >
                  {project.title ? project.title.charAt(0).toUpperCase() : '?'}
                </Avatar>
                
                {/* Floating Tag for Category */}
                <Tag 
                  color={
                    project.category === 'academic' ? 'blue' : 
                    project.category === 'competition' ? 'gold' : 
                    project.category === 'coursework' ? 'green' : 
                    'purple'
                  } 
                  className="absolute -top-2 -right-2 rounded-full shadow-sm border-white border-2"
                >
                  {categoryIcons[project.category] || <StarOutlined className="text-purple-500" />}
                </Tag>
              </div>
            </div>
            <div className="flex-1 overflow-hidden ml-2">
              <div className="font-bold text-base text-purple-900 truncate max-w-xs">
                {truncateText(project.title, 50)}
              </div>
              <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-1">
                <span className="font-medium">{project.student || project.author?.fullName || 'ไม่ระบุผู้สร้าง'}</span>
                {project.level && <span className="text-purple-600">• ชั้นปี {project.level}</span>}
                {project.year && <span className="text-purple-600">• ปี {project.year}</span>}
              </div>
              {project.description && (
                <div className="text-sm text-gray-500 mt-2 line-clamp-2 pr-4">
                  {truncateText(project.description, 100)}
                </div>
              )}
            </div>
          </motion.div>
        ),
      }));
    }
    return [];
  };

  // คลิกหรือกด Enter ที่ปุ่มค้นหา
  const handleSubmitSearch = () => {
    if (keyword) {
      submitSearch(keyword);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl px-4 relative">
      <motion.div
        className={`bg-white bg-opacity-20 backdrop-filter backdrop-blur-xl rounded-xl flex items-center pl-5 pr-3 py-3 w-full shadow-lg border-2 transition-all duration-300 ${isFocused ? 'border-white' : 'border-white border-opacity-30'}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ boxShadow: `0 8px 32px rgba(255, 255, 255, 0.2)` }}
      >
        <div className="relative">
          <motion.div
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0"
            style={{
              filter: 'blur(8px)',
              zIndex: -1
            }}
          />
          <motion.div
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSubmitSearch}
            className="cursor-pointer"
          >
            <SearchOutlined className="text-white text-xl mr-3" />
          </motion.div>
        </div>
        
        <AutoComplete
          ref={searchInputRef}
          options={getOptions()}
          onSearch={handleSearch}
          value={keyword}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full text-lg"
          popupClassName="cosmic-search-dropdown"
          dropdownStyle={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            boxShadow: '0 8px 32px rgba(144, 39, 142, 0.25)', 
            border: `1px solid rgba(145, 107, 216, 0.3)`,
            marginTop: '10px',
            padding: '8px'
          }}
          notFoundContent={
            isSearching ? (
              <div className="flex justify-center items-center py-10">
                <Spin size="large" />
              </div>
            ) : keyword ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-purple-700 py-4">
                    <div className="text-lg font-medium mb-2">ไม่พบข้อมูลที่ตรงกับคำค้นหา</div>
                    <div className="mt-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Tag 
                          color="purple" 
                          className="cursor-pointer px-3 py-1 text-base"
                          onClick={handleSubmitSearch}
                        >
                          <SearchOutlined className="mr-1" /> ค้นหา "{keyword}" แบบละเอียด
                        </Tag>
                      </motion.div>
                    </div>
                  </div>
                }
                className="py-8"
              />
            ) : null
          }
        >
          <Input
            placeholder="ค้นหาโปรเจค ชื่อนักศึกษา หรือคำสำคัญ..."
            className="flex-1 border-none focus:outline-none text-lg"
            style={{ 
              backgroundColor: 'transparent', 
              color: 'white',
              caretColor: 'white',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }}
            onPressEnter={handleSubmitSearch}
            suffix={
              isSearching ? (
                <Spin size="small" style={{ color: 'white' }} /> 
              ) : isFocused ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <RocketOutlined className="text-white text-lg" />
                </motion.div>
              ) : null
            }
          />
        </AutoComplete>
      </motion.div>
      
      {/* Suggested searches */}
      <motion.div 
        className="flex flex-wrap gap-2 mt-3 justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {['Machine Learning', 'ปี 2024', 'IoT', 'การแข่งขัน', 'Blockchain'].map((tag, index) => (
          <motion.div
            key={tag}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
          >
            <Tag 
              className="cursor-pointer px-3 py-1 text-sm rounded-full border-white border-opacity-30 text-white bg-white bg-opacity-20 backdrop-filter backdrop-blur-md hover:bg-white hover:bg-opacity-30 transition-all duration-200"
              onClick={() => {
                handleKeywordChange(tag);
                searchProjects(tag, { limit: 5 });
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
            >
              {tag}
            </Tag>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Cosmic search style */}
      <style jsx global>{`
        .cosmic-search-dropdown .ant-select-item {
          padding: 0 !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          margin-bottom: 8px !important;
        }
        
        .cosmic-search-dropdown .ant-empty-image {
          margin-bottom: 8px !important;
        }
        
        /* Make the placeholder text more visible on a dark background */
        .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.8) !important;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;