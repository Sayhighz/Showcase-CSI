// src/components/SearchBar.jsx - แก้ไขให้มีขนาดเต็มพื้นที่บนหน้าจอใหญ่และตำแหน่ง dropdown ถูกต้อง

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, AutoComplete, Avatar, Spin, Empty, Tag, Tooltip } from 'antd';
import { SearchOutlined, BookOutlined, TrophyOutlined, ReadOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
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

// สร้างตัวย่อจากชื่อ (อักษรแรกของ 2 คำแรก)
const getInitials = (name = '') => {
  try {
    if (!name || typeof name !== 'string') return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  } catch {
    return 'U';
  }
};

// ดึงรายชื่อผู้ร่วมโปรเจคให้เป็นรูปแบบเดียว และตัดเจ้าของโปรเจคออก
const normalizeContributors = (project) => {
  try {
    const ownerName =
      project?.student ||
      project?.author?.fullName ||
      project?.author?.full_name ||
      '';

    // 1) ใช้ collaborators หากมี
    let raw = [];
    if (Array.isArray(project?.collaborators)) {
      raw = project.collaborators;
    } else if (project?.contributors) {
      // 2) รองรับ contributors ทั้งกรณีเป็น string(JSON) หรือ array
      if (typeof project.contributors === 'string') {
        try {
          const parsed = JSON.parse(project.contributors);
          if (Array.isArray(parsed)) raw = parsed;
        } catch {
          raw = [];
        }
      } else if (Array.isArray(project.contributors)) {
        raw = project.contributors;
      }
    }

    // 3) แปลงให้เป็นรูปแบบ { name, image, role }
    const mapped = raw
      .map((c) => {
        const name =
          c?.fullName ||
          c?.full_name ||
          c?.memberName ||
          c?.member_name ||
          c?.username ||
          c?.name ||
          '';

        const image = c?.image || null;
        const role = c?.role || 'contributor';

        return { name, image, role };
      })
      // ตัดคนที่ไม่มีชื่อทิ้ง
      .filter((c) => c.name && typeof c.name === 'string');

    // 4) ตัดเจ้าของโปรเจคออก (ถ้าชื่อซ้ำ)
    const withoutOwner = mapped.filter(
      (c) => c.name.trim() !== (ownerName || '').trim()
    );

    // 5) ลบรายชื่อซ้ำตามชื่อ
    const uniqueByName = [];
    const seen = new Set();
    for (const c of withoutOwner) {
      const key = c.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueByName.push(c);
      }
    }

    return uniqueByName;
  } catch {
    return [];
  }
};

const SearchBar = () => {
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
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
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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

  // เพิ่มฟังก์ชันจัดการการแสดง dropdown
  const onDropdownVisibleChange = (visible) => {
    setDropdownVisible(visible);
  };

  // รีเซ็ต selectedIndex เมื่อ searchResults เปลี่ยน
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // สร้างตัวเลือกสำหรับ AutoComplete
  const getOptions = () => {
    if (searchResults.length > 0) {
      return searchResults.map((project, index) => {
        const collabs = normalizeContributors(project);
        const maxToShow = isMobile ? 5 : 8;
        const shown = collabs.slice(0, maxToShow);
        const remaining = Math.max(collabs.length - shown.length, 0);

        return {
          value: project.id.toString(), // ใช้ ID เป็น value
          label: (
            <motion.div
              key={`${project.id}-${index}`}
              onClick={() => handleSelect(project.id)}
              className={`flex items-start p-2 sm:p-4 cursor-pointer rounded-xl transition-all duration-200 ${index === selectedIndex ? 'bg-purple-50' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ backgroundColor: '#f5eaff', boxShadow: '0 4px 12px rgba(144, 39, 142, 0.1)' }}
            >
              <div className="relative mr-2 sm:mr-4">
                <div className="relative">
                  <Avatar
                    src={project.image ? (API_ENDPOINTS.BASE + '/' + project.image) : null}
                    size={isMobile ? 40 : 56}
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
                    className="absolute -top-2 -right-2 rounded-full shadow-sm border-white border-2 text-xs"
                  >
                    {categoryIcons[project.category] || <StarOutlined className="text-purple-500" />}
                  </Tag>
                </div>
              </div>
              <div className="flex-1 overflow-hidden ml-1 sm:ml-2">
                <div className="font-bold text-sm sm:text-base text-purple-900 truncate max-w-[180px] sm:max-w-xs">
                  {truncateText(project.title, isMobile ? 30 : 50)}
                </div>

                {/* Owner + meta */}
                <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <span className="font-medium">{project.student || project.author?.fullName || 'ไม่ระบุผู้สร้าง'}</span>
                  {project.level && <span className="text-purple-600 hidden xs:inline">• ชั้นปี {project.level}</span>}
                  {project.year && <span className="text-purple-600 hidden xs:inline">• ปี {project.year}</span>}
                </div>

                {/* Contributors: แสดงผู้ร่วมโปรเจคครบทุกคน (รูป/ชื่อย่อ) */}
                {shown.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1 sm:gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs text-gray-500 mr-1">ผู้ร่วมโปรเจค:</span>
                    <div className="flex items-center flex-wrap gap-1">
                      {/* แสดงเป็น Avatar/ชื่อย่อ พร้อม Tooltip เป็นชื่อเต็ม */}
                      {shown.map((c, idx) => {
                        const title = c.name;
                        const imgSrc =
                          c.image
                            ? (typeof c.image === 'string' && c.image.startsWith('http')
                                ? c.image
                                : `${API_ENDPOINTS.BASE}/${c.image}`)
                            : null;
                        return (
                          <Tooltip key={`${c.name}-${idx}`} title={title}>
                            <Avatar
                              size={20}
                              src={imgSrc || undefined}
                              style={{ backgroundColor: '#b666ff' }}
                              className="shadow-sm"
                            >
                              {!imgSrc && getInitials(c.name)}
                            </Avatar>
                          </Tooltip>
                        );
                      })}
                      {remaining > 0 && (
                        <Tooltip title={collabs.slice(maxToShow).map(c => c.name).join(', ')}>
                          <Avatar size={20} style={{ backgroundColor: '#8b5cf6' }} className="shadow-sm">
                            +{remaining}
                          </Avatar>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                )}

                {project.description && (
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 line-clamp-2 pr-2 sm:pr-4 hidden xs:block">
                    {truncateText(project.description, isMobile ? 60 : 100)}
                  </div>
                )}
              </div>
            </motion.div>
          ),
        };
      });
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
    // ลบ max-width ออกและปรับให้ใช้ width: 100% เพื่อให้เต็มพื้นที่แพเรนต์
    <div className="w-full px-2 sm:px-4 relative">
      <motion.div
        className={`bg-white bg-opacity-20 backdrop-filter backdrop-blur-xl rounded-xl flex items-center pl-3 sm:pl-5 pr-2 sm:pr-3 py-2 sm:py-3 w-full shadow-lg border-2 transition-all duration-300 ${isFocused ? 'border-white' : 'border-white border-opacity-30'}`}
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
            <SearchOutlined className="text-white text-base sm:text-xl mr-2 sm:mr-3" />
          </motion.div>
        </div>
        
        <div className="w-full relative">
          <AutoComplete
            ref={(ref) => {
              searchInputRef.current = ref;
              autocompleteRef.current = ref;
            }}
            options={getOptions()}
            onSearch={handleSearch}
            value={keyword}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full text-base sm:text-lg"
            popupClassName="cosmic-search-dropdown"
            placement="bottomLeft"
            onDropdownVisibleChange={onDropdownVisibleChange}
            getPopupContainer={() => document.body}
            dropdownAlign={{
              offset: [0, 10], // ปรับระยะห่างของ dropdown จากข้อความค้นหา
            }}
            dropdownStyle={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(144, 39, 142, 0.25)',
              border: `1px solid rgba(145, 107, 216, 0.3)`,
              padding: '8px',
              maxWidth: '100%',
              width: 'min(800px, 100%)',
              position: 'absolute',
              zIndex: 1050
            }}
            notFoundContent={
              isSearching ? (
                <div className="flex justify-center items-center py-6 sm:py-10">
                  <Spin size={isMobile ? "default" : "large"} />
                </div>
              ) : keyword ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-purple-700 py-2 sm:py-4">
                      <div className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">ไม่พบข้อมูลที่ตรงกับคำค้นหา</div>
                      <div className="mt-1 sm:mt-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Tag 
                            color="purple" 
                            className="cursor-pointer px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-base"
                            onClick={handleSubmitSearch}
                          >
                            <SearchOutlined className="mr-1" /> ค้นหา "{keyword}" แบบละเอียด
                          </Tag>
                        </motion.div>
                      </div>
                    </div>
                  }
                  className="py-4 sm:py-8"
                />
              ) : null
            }
          >
            <div className="relative w-full">
              <Input
                placeholder=""
                className="flex-1 border-none focus:outline-none text-sm sm:text-lg"
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
                      <RocketOutlined className="text-white text-base sm:text-lg" />
                    </motion.div>
                  ) : null
                }
              />
              {/* Animated Placeholder */}
              {!keyword && !isFocused && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-none text-sm sm:text-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <TypeAnimation
                    sequence={[
                      'ค้นหาด้วยชื่อนักศึกษา โปรเจค...',
                      2000,
                      'นาย ก ไก่...',
                      2000,
                      'Search CSI Projects...',
                      2000,
                      'โปรเจค AI & ML...',
                      2000,
                      'งานวิจัย...',
                      2000,
                      'Web Development...',
                      2000,
                      'งานแข่งขัน...',
                      2000,
                      'โปรเจครายวิชา...',
                      2000,
                    ]}
                    wrapper="span"
                    speed={50}
                    style={{
                      fontSize: 'inherit',
                      display: 'inline-block',
                      textShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
                    }}
                    repeat={Infinity}
                    cursor={false}
                  />
                </div>
              )}
            </div>
          </AutoComplete>
        </div>
      </motion.div>
      
      
      
      {/* Cosmic search style */}
      <style>{`
        .cosmic-search-dropdown {
          z-index: 1050 !important;
        }
        
        .cosmic-search-dropdown .ant-select-dropdown {
          position: absolute !important;
        }
        
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
        
        * Responsive styles */
        @media (max-width: 640px) {
          .cosmic-search-dropdown .ant-select-item {
            padding: 0 !important;
            margin-bottom: 4px !important;
          }
          
          .cosmic-search-dropdown .ant-empty-image {
            margin-bottom: 4px !important;
            height: 40px !important;
          }
          
          .cosmic-search-dropdown .ant-empty-description {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;