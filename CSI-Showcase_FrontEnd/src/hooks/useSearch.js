/**
 * Custom hook สำหรับจัดการการค้นหา
 * จัดการ state และฟังก์ชันที่เกี่ยวข้องกับการค้นหาโปรเจค, ผู้ใช้ เป็นต้น
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';

// นำเข้า services ที่เกี่ยวข้อง
import {
  searchProjects,
  searchUsers,
  buildSearchQuery
} from '../services/searchService';

// นำเข้า routes
import { SEARCH } from '../constants/routes';

/**
 * Custom hook สำหรับจัดการการค้นหา
 * @returns {Object} - state และฟังก์ชันสำหรับจัดการการค้นหา
 */
const useSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    type: null,
    year: null,
    studyYear: null,
    tags: []
  });
  
  const debounceTimeout = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * ค้นหาโปรเจค
   * @param {string} searchTerm - คำค้นหา
   * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
   */
  const handleSearchProjects = useCallback(async (searchTerm = '', params = {}) => {
    setIsSearching(true);
    setError(null);
    
    const term = searchTerm || keyword;
    
    try {
      // รวมพารามิเตอร์จาก pagination, advancedFilters และพารามิเตอร์ที่ส่งมา
      const queryParams = {
        keyword: term,
        page: pagination.current,
        limit: pagination.pageSize,
        ...advancedFilters,
        ...params
      };
      
      // กรองค่า null และ undefined ออก
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const response = await searchProjects(queryParams);
      
      if (response) {
        setSearchResults(response.projects || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
          current: response.page || 1,
        });
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาโปรเจค');
      console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจค:', err);
    } finally {
      setIsSearching(false);
    }
  }, [keyword, pagination, advancedFilters]);

  /**
   * ค้นหาผู้ใช้
   * @param {string} searchTerm - คำค้นหา
   * @param {number} limit - จำนวนผลลัพธ์ที่ต้องการ
   */
  const handleSearchUsers = useCallback(async (searchTerm = '', limit = 10) => {
    setIsSearching(true);
    setError(null);
    
    const term = searchTerm || keyword;
    
    try {
      const response = await searchUsers(term, limit);
      
      if (response) {
        setSearchResults(response || []);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาผู้ใช้');
      console.error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้:', err);
    } finally {
      setIsSearching(false);
    }
  }, [keyword]);

  /**
   * จัดการการเปลี่ยนแปลงคำค้นหา
   * @param {string} searchTerm - คำค้นหา
   */
  const handleKeywordChange = useCallback((searchTerm) => {
    setKeyword(searchTerm);
    
    // ยกเลิก timeout เดิม
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  }, []);

  /**
   * เปลี่ยนหน้าของผลลัพธ์การค้นหา
   * @param {number} page - หน้าที่ต้องการ
   * @param {number} pageSize - จำนวนรายการต่อหน้า
   */
  const changePage = useCallback((page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  }, []);

  /**
   * ส่งแบบฟอร์มค้นหา
   * @param {string} searchTerm - คำค้นหา
   */
  const submitSearch = useCallback((searchTerm = '') => {
    const term = searchTerm || keyword;
    
    if (!term || term.trim() === '') {
      message.warning('กรุณาระบุคำค้นหา');
      return;
    }
    
    // สร้าง URL สำหรับการค้นหา
    const queryParams = {
      keyword: term
    };
    
    const searchPath = `${SEARCH.RESULTS}?${buildSearchQuery(queryParams)}`;
    
    // นำทางไปยังหน้าผลการค้นหา
    navigate(searchPath);
    
    // ค้นหาโปรเจค
    handleSearchProjects(term);
  }, [keyword, navigate, handleSearchProjects]);

  /**
   * อัปเดตตัวกรองขั้นสูง
   * @param {Object} newFilters - ตัวกรองใหม่
   */
  const updateAdvancedFilters = useCallback((newFilters) => {
    setAdvancedFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    
    // Reset pagination to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  }, []);

  /**
   * ล้างตัวกรองขั้นสูง
   */
  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({
      type: null,
      year: null,
      studyYear: null,
      tags: []
    });
    
    // Reset pagination to page 1
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  }, []);

  // ดึงค่า query parameters จาก URL เมื่อ location เปลี่ยนแปลง
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const termFromURL = searchParams.get('keyword');
    
    if (termFromURL) {
      setKeyword(termFromURL);
      handleSearchProjects(termFromURL);
    }
  }, [location.search, handleSearchProjects]);

  // ยกเลิก timeout เมื่อ component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return {
    // State
    searchResults,
    isSearching,
    error,
    keyword,
    pagination,
    advancedFilters,
    
    // Actions
    searchProjects: handleSearchProjects,
    searchUsers: handleSearchUsers,
    changePage,
    handleKeywordChange,
    submitSearch,
    updateAdvancedFilters,
    clearAdvancedFilters,
  };
};

export default useSearch;