import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, AutoComplete, Avatar, Spin, Badge, Tooltip, Empty, Space, Tag } from 'antd';
import { 
  SearchOutlined, 
  FireOutlined, 
  HistoryOutlined, 
  TagOutlined, 
  RocketOutlined,
  FilterOutlined,
  BookOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../../hooks';
import { colors } from '../../config/themeConfig';
import { API_ENDPOINTS } from '../../constants';

/**
 * SearchBar component สำหรับการค้นหาโปรเจค
 * 
 * @returns {JSX.Element} SearchBar component
 */
const SearchBar = () => {
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  
  // เรียกใช้ hook เพื่อจัดการการค้นหา
  const {
    keyword, 
    searchResults, 
    isSearching,
    popularTags,
    searchHistory,
    handleKeywordChange,
    submitSearch,
    searchProjects
  } = useSearch();

  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // ดึงแท็กยอดนิยมเมื่อ component mount
  useEffect(() => {
    if (popularTags && popularTags.length > 0) {
      // ดึงแท็กยอดนิยม 5 อันดับแรก
      setCategories(popularTags.slice(0, 5).map(tag => tag.name));
    } else {
      // ถ้ายังไม่มีข้อมูลแท็กยอดนิยม ให้ใช้ค่าเริ่มต้น
      setCategories(['Web', 'Mobile', 'AI', 'Game', 'IoT']);
    }
  }, [popularTags]);

  // จัดการการเปลี่ยนแปลงคำค้นหา
  const handleSearch = (value) => {
    handleKeywordChange(value);
    
    // ยกเลิก timeout เดิม
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    if (value) {
      // สร้าง timeout ใหม่
      debounceTimeout.current = setTimeout(() => {
        searchProjects(value, { limit: 5 });
        setShowRecentSearches(false);
      }, 300);
    } else {
      setShowRecentSearches(true);
    }
  };

  // จัดการการเลือกโปรเจค
  const handleSelect = (project_id) => {
    navigate(`/projects/${project_id}`);
  };

  // จัดการการกดปุ่มลูกศรขึ้น/ลง, Enter
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && selectedIndex < searchResults.length - 1) {
      setSelectedIndex(prevIndex => prevIndex + 1);
    } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
      setSelectedIndex(prevIndex => prevIndex - 1);
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      handleSelect(searchResults[selectedIndex].id);
    } else if (e.key === 'Enter' && keyword) {
      submitSearch(keyword);
    }
  };

  // จัดการการกดปุ่ม focus
  const handleFocus = () => {
    if (!keyword) {
      setShowRecentSearches(true);
    }
  };

  // จัดการการคลิกหมวดหมู่
  const handleCategoryClick = (category) => {
    handleKeywordChange(category);
    submitSearch(category);
  };

  // สร้าง style สำหรับหมวดหมู่
  const getCategoryStyle = (index) => {
    const colorPalette = [
      colors.primary,
      '#3A1C71',
      '#00C9FF',
      '#FC466B',
      '#0F2027'
    ];
    
    return {
      background: colorPalette[index % colorPalette.length],
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    };
  };

  // สร้างตัวเลือกสำหรับ AutoComplete
  const getOptions = () => {
    if (showRecentSearches && searchHistory && searchHistory.length > 0) {
      // แสดงประวัติการค้นหา
      return [
        {
          label: <div className="text-purple-400 px-2 py-2 flex items-center gap-2 font-medium"><HistoryOutlined /> การค้นหาล่าสุด</div>,
          options: searchHistory.map(search => ({
            value: search.keyword || search,
            label: (
              <div className="flex items-center px-3 py-3 hover:bg-indigo-50 cursor-pointer rounded-md transition-all duration-200" onClick={() => handleSearch(search.keyword || search)}>
                <HistoryOutlined className="mr-2 text-indigo-400" />
                <span className="text-indigo-900">{search.keyword || search}</span>
              </div>
            ),
          })),
        },
        {
          label: <div className="text-blue-400 px-2 py-2 flex items-center gap-2 font-medium"><TagOutlined /> หมวดหมู่</div>,
          options: categories.map((category, index) => ({
            value: category,
            label: (
              <div className="flex items-center px-3 py-3 hover:bg-blue-50 cursor-pointer rounded-md transition-all duration-200" onClick={() => handleCategoryClick(category)}>
                <TagOutlined className="mr-2 text-blue-500" />
                <span className="text-blue-900">{category}</span>
              </div>
            ),
          })),
        }
      ];
    }

    // แสดงโปรเจคที่ค้นหาได้
    if (searchResults && searchResults.length > 0) {
      return searchResults.map((project, index) => ({
        value: project.title,
        label: (
          <motion.div
            key={`${project.id}-${index}`}
            onClick={() => handleSelect(project.id)}
            className={`flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200 ${index === selectedIndex ? 'bg-indigo-50' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ backgroundColor: '#f0f7ff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="relative mr-3">
              <Avatar 
                src={API_ENDPOINTS.BASE+'/'+(project.coverImage || project.image)} 
                size={50} 
                shape="square"
                className="shadow-md rounded-lg"
                style={{ border: `2px solid ${colors.primary}` }} 
              >
                {project.title ? project.title.charAt(0) : '?'}
              </Avatar>
              {project.viewsCount && (
                <Badge 
                  count={project.viewsCount} 
                  style={{ backgroundColor: colors.primary }}
                  className="absolute -top-2 -right-2"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold text-base line-clamp-1 text-indigo-900">{project.title}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{project.creator?.fullName || project.student || 'ไม่ระบุผู้สร้าง'}</span>
                <span>•</span>
                <span>{project.level || project.studyYear || ''}</span>
                {project.category && (
                  <>
                    <span>•</span>
                    <Tag color="blue" size="small">{project.category}</Tag>
                  </>
                )}
              </div>
            </div>
            {project.views > 100 && (
              <Tooltip title="ยอดนิยม">
                <FireOutlined className="text-red-500 ml-2" />
              </Tooltip>
            )}
          </motion.div>
        ),
      }));
    }

    return [];
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
        <SearchOutlined className="text-purple-600 text-xl mr-3" />
        <AutoComplete
          options={getOptions()}
          onSearch={handleSearch}
          value={keyword}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
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
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-indigo-700 py-2">ไม่พบข้อมูลที่ตรงกับคำค้นหา</div>
                }
                className="py-8"
              />
            )
          }
        >
          <Input
            placeholder="ค้นหาโปรเจค ชื่อ ชั้นปี ปีที่สร้าง..."
            className="flex-1 border-none focus:outline-none text-lg"
            style={{ backgroundColor: 'transparent', color: '#4C2A85' }}
            onPressEnter={() => {
              if (keyword && (searchResults.length === 0 || !searchResults)) {
                submitSearch(keyword);
              }
            }}
          />
        </AutoComplete>
      </motion.div>
    </div>
  );
};

export default SearchBar;