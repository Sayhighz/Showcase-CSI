// src/components/SearchBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, AutoComplete, Avatar, Spin, Empty, Tag, Tooltip } from 'antd';
import { SearchOutlined, BookOutlined, TrophyOutlined, ReadOutlined } from '@ant-design/icons';
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
      }, 300);
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
            className={`flex items-start p-3 cursor-pointer rounded-lg transition-all duration-200 ${index === selectedIndex ? 'bg-indigo-50' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ backgroundColor: '#f0f7ff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="relative mr-4">
              <Avatar 
                src={project.image ? (API_ENDPOINTS.BASE + '/' + project.image) : null} 
                size={50} 
                shape="square"
                className="shadow-md rounded-lg"
                style={{ border: `2px solid ${colors.primary}` }}
              >
                {project.title ? project.title.charAt(0).toUpperCase() : '?'}
              </Avatar>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="font-bold text-base text-indigo-900 truncate max-w-xs">
                  {truncateText(project.title, 50)}
                </div>
                {project.category && (
                  <Tooltip title={project.category === 'academic' ? 'บทความวิชาการ' : 
                              project.category === 'competition' ? 'การแข่งขัน' : 
                              project.category === 'coursework' ? 'งานในชั้นเรียน' : 
                              project.category}>
                    <Tag color={
                      project.category === 'academic' ? 'blue' : 
                      project.category === 'competition' ? 'gold' : 
                      project.category === 'coursework' ? 'green' : 
                      'default'
                    } className="rounded-full">
                      {categoryIcons[project.category] || <BookOutlined className="text-blue-500" />}
                    </Tag>
                  </Tooltip>
                )}
              </div>
              <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
                <span>{project.student || project.author?.fullName || 'ไม่ระบุผู้สร้าง'}</span>
                {project.level && <span>• ชั้นปี {project.level}</span>}
                {project.year && <span>• ปี {project.year}</span>}
              </div>
              {project.description && (
                <div className="text-xs text-gray-400 mt-1 truncate max-w-md">
                  {truncateText(project.description, 80)}
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
        className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-xl rounded-full flex items-center pl-5 pr-3 py-3 w-full shadow-2xl border border-indigo-200"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ boxShadow: `0 8px 32px rgba(78, 16, 145, 0.2)`, borderColor: colors.primary }}
      >
        <SearchOutlined 
          className="text-purple-600 text-xl mr-3 cursor-pointer" 
          onClick={handleSubmitSearch}
        />
        <AutoComplete
          options={getOptions()}
          onSearch={handleSearch}
          value={keyword}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          className="w-full text-lg"
          popupClassName="space-search-dropdown"
          dropdownStyle={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', 
            border: `1px solid rgba(145, 107, 216, 0.3)` 
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
                  <div className="text-indigo-700 py-2">
                    ไม่พบข้อมูลที่ตรงกับคำค้นหา
                    <div className="mt-2">
                      <Tag 
                        color="purple" 
                        className="cursor-pointer"
                        onClick={handleSubmitSearch}
                      >
                        ค้นหา "{keyword}" แบบละเอียด
                      </Tag>
                    </div>
                  </div>
                }
                className="py-8"
              />
            ) : null
          }
        >
          <Input
            placeholder="ค้นหาโปรเจค ชื่อ ชั้นปี ปีที่สร้าง..."
            className="flex-1 border-none focus:outline-none text-lg"
            style={{ backgroundColor: 'transparent', color: '#4C2A85' }}
            onPressEnter={handleSubmitSearch}
            suffix={
              isSearching ? <Spin size="small" /> : null
            }
          />
        </AutoComplete>
      </motion.div>
    </div>
  );
};

export default SearchBar;