import React, { useState, useEffect } from 'react';
import { Input, AutoComplete, Avatar, Spin, Badge, Tooltip, Empty } from 'antd';
import { SearchOutlined, FireOutlined, StarOutlined, HistoryOutlined, TagOutlined, RocketOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosGet } from '../../lib/axios';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [categories, setCategories] = useState(['Web', 'Mobile', 'AI', 'Game', 'IoT']);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
    }
  }, []);

  // Save recent search to localStorage
  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    
    const savedSearches = localStorage.getItem('recentSearches');
    let searches = savedSearches ? JSON.parse(savedSearches) : [];
    
    // Remove duplicate if exists
    searches = searches.filter(item => item.toLowerCase() !== term.toLowerCase());
    
    // Add new search at the beginning
    searches.unshift(term);
    
    // Keep only the 5 most recent searches
    searches = searches.slice(0, 5);
    
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    setRecentSearches(searches);
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);
    
    if (value) {
      setLoading(true);
      try {
        const response = await axiosGet(`/search/projects?keyword=${value}`);
        
        // Remove duplicate projects
        const uniqueProjects = [...new Map(response.map(item => [item.project_id, item])).values()];
        
        setFilteredProjects(uniqueProjects);
        setSelectedIndex(0);
        setShowRecentSearches(false);
      } catch (error) {
        console.error("Search error:", error);
        setFilteredProjects([]);
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredProjects([]);
      setShowRecentSearches(true);
    }
  };

  const handleSelect = (project_id) => {
    if (searchTerm) {
      saveRecentSearch(searchTerm);
    }
    window.location.href = `/projects/${project_id}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && selectedIndex < filteredProjects.length - 1) {
      setSelectedIndex((prevIndex) => prevIndex + 1);
    } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
      setSelectedIndex((prevIndex) => prevIndex - 1);
    } else if (e.key === 'Enter' && filteredProjects.length > 0) {
      saveRecentSearch(searchTerm);
      window.location.href = `/projects/${filteredProjects[selectedIndex].project_id}`;
    }
  };

  const handleFocus = () => {
    if (!searchTerm) {
      setShowRecentSearches(true);
    }
  };

  const handleCategoryClick = async (category) => {
    setSearchTerm(category);
    setLoading(true);
    try {
      const response = await axiosGet(`/search/projects?keyword=${category}`);
      const uniqueProjects = [...new Map(response.map(item => [item.project_id, item])).values()];
      setFilteredProjects(uniqueProjects);
    } catch (error) {
      console.error("Category search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate space-themed background style for categories
  const getCategoryStyle = (index) => {
    const colors = [
      'linear-gradient(135deg, #7928CA, #FF0080)',
      'linear-gradient(135deg, #3A1C71, #D76D77, #FFAF7B)',
      'linear-gradient(135deg, #00C9FF, #92FE9D)',
      'linear-gradient(135deg, #FC466B, #3F5EFB)',
      'linear-gradient(135deg, #0F2027, #203A43, #2C5364)'
    ];
    return {
      background: colors[index % colors.length],
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    };
  };

  // Dropdown options for AutoComplete
  const getOptions = () => {
    if (showRecentSearches && recentSearches.length > 0) {
      // Show recent searches
      return [
        {
          label: <div className="text-purple-400 px-2 py-2 flex items-center gap-2 font-medium"><HistoryOutlined /> Recent Searches</div>,
          options: recentSearches.map(search => ({
            value: search,
            label: (
              <div className="flex items-center px-3 py-3 hover:bg-indigo-50 cursor-pointer rounded-md transition-all duration-200" onClick={() => handleSearch(search)}>
                <HistoryOutlined className="mr-2 text-indigo-400" />
                <span className="text-indigo-900">{search}</span>
              </div>
            ),
          })),
        },
        {
          label: <div className="text-blue-400 px-2 py-2 flex items-center gap-2 font-medium"><TagOutlined /> Categories</div>,
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

    // Show filtered projects
    if (filteredProjects.length > 0) {
      return filteredProjects.map((project, index) => ({
        value: project.title,
        label: (
          <motion.div
            key={`${project.project_id}-${index}`}
            onClick={() => handleSelect(project.project_id)}
            className={`flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200 ${index === selectedIndex ? 'bg-indigo-50' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ backgroundColor: '#f0f7ff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="relative mr-3">
              <Avatar 
                src={project.image} 
                size={50} 
                shape="square"
                className="shadow-md rounded-lg"
                style={{ border: '2px solid #7928CA' }} 
              />
              {project.year && (
                <Badge 
                  count={project.year} 
                  style={{ backgroundColor: '#7928CA' }}
                  className="absolute -top-2 -right-2"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold text-base line-clamp-1 text-indigo-900">{project.title}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{project.student}</span>
                <span>•</span>
                <span>{project.study_year}</span>
              </div>
            </div>
            {Math.random() > 0.6 && (
              <Tooltip title="Popular Project">
                <FireOutlined className="text-red-500 ml-2" />
              </Tooltip>
            )}
            {Math.random() > 0.7 && (
              <Tooltip title="Highly Rated">
                <StarOutlined className="text-yellow-500 ml-2" />
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
        whileHover={{ boxShadow: '0 8px 32px rgba(78, 16, 145, 0.2)', borderColor: '#7928CA' }}
      >
        <SearchOutlined className="text-purple-600 text-xl mr-3" />
        <AutoComplete
          options={getOptions()}
          onSearch={handleSearch}
          value={searchTerm}
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
            border: '1px solid rgba(145, 107, 216, 0.3)'
          }}
          notFoundContent={
            loading ? (
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
              if (searchTerm && filteredProjects.length === 0) {
                saveRecentSearch(searchTerm);
                window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
              }
            }}
            suffix={
              <motion.button
                className="ml-2 bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-full text-white flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (searchTerm) {
                    saveRecentSearch(searchTerm);
                    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
                  }
                }}
              >
                <RocketOutlined style={{ fontSize: '16px' }} />
              </motion.button>
            }
          />
        </AutoComplete>
      </motion.div>

      {/* Popular tags below search */}
      <AnimatePresence>
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mt-4 max-w-xl px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {categories.map((tag, index) => (
            <motion.div
              key={tag}
              className="px-4 py-2 rounded-full cursor-pointer border border-white border-opacity-50 backdrop-filter backdrop-blur-sm"
              style={getCategoryStyle(index)}
              whileHover={{ scale: 1.08, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              onClick={() => handleCategoryClick(tag)}
            >
              <span className="text-white font-medium text-sm">#{tag}</span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;