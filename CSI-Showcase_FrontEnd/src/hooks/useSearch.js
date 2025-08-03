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
  const [filters, setFilters] = useState({
    type: null,       // ประเภทโปรเจค (coursework, academic, competition)
    year: null,       // ปีของโปรเจค
    studyYear: null,  // ชั้นปีของผู้สร้างโปรเจค
    tags: []          // แท็กที่เกี่ยวข้อง
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
      // รวมพารามิเตอร์จาก pagination, filters และพารามิเตอร์ที่ส่งมา
      const queryParams = {
        keyword: term,
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        ...params
      };
      
      // กรองค่า null และ undefined ออก
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      // console.log('Searching with params:', queryParams);
      
      const response = await searchProjects(queryParams);
      
      if (response && response.projects) {
        setSearchResults(response.projects || []);
        setPagination({
          ...pagination,
          total: response.pagination?.total || 0,
          current: response.pagination?.page || 1,
          pageSize: response.pagination?.limit || pagination.pageSize
        });
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาโปรเจค');
      console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจค:', err);
    } finally {
      setIsSearching(false);
    }
  }, [keyword, pagination, filters]);

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
    
    // ค้นหาใหม่เมื่อเปลี่ยนหน้า
    handleSearchProjects(keyword, { 
      page: page, 
      limit: pageSize || pagination.pageSize
    });
  }, [keyword, pagination.pageSize, handleSearchProjects]);

  /**
   * ส่งแบบฟอร์มค้นหา
   * @param {string} searchTerm - คำค้นหา
   * @param {Object} additionalParams - พารามิเตอร์เพิ่มเติม
   */
  const submitSearch = useCallback((searchTerm = '', additionalParams = {}) => {
    const term = searchTerm || keyword;
    
    if (!term && !Object.keys(additionalParams).length && !Object.keys(filters).some(key => filters[key])) {
      message.warning('กรุณาระบุคำค้นหาหรือตัวกรอง');
      return;
    }
    
    // สร้าง URL สำหรับการค้นหา
    const queryParams = {
      keyword: term,
      ...filters,
      ...additionalParams
    };
    
    // กรองค่า null และ undefined ออก
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
        delete queryParams[key];
      }
    });
    
    const searchPath = `${SEARCH.RESULTS}?${buildSearchQuery(queryParams)}`;
    
    // นำทางไปยังหน้าผลการค้นหา
    navigate(searchPath);
    
    // ค้นหาโปรเจค
    handleSearchProjects(term, additionalParams);
  }, [keyword, filters, navigate, handleSearchProjects]);

  /**
   * อัปเดตตัวกรอง
   * @param {Object} newFilters - ตัวกรองใหม่
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
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
   * ล้างตัวกรองทั้งหมด
   */
  const clearFilters = useCallback(() => {
    setFilters({
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
    const typeFromURL = searchParams.get('type') || searchParams.get('category');
    const yearFromURL = searchParams.get('year');
    const studyYearFromURL = searchParams.get('studyYear') || searchParams.get('level');
    const tagsFromURL = searchParams.get('tags');
    
    // อัปเดตฟิลเตอร์และคำค้นหาถ้ามีพารามิเตอร์ใน URL
    const updatedFilters = {};
    let shouldSearch = false;
    
    if (termFromURL) {
      setKeyword(termFromURL);
      shouldSearch = true;
    }
    
    if (typeFromURL) {
      updatedFilters.type = typeFromURL;
      shouldSearch = true;
    }
    
    if (yearFromURL) {
      updatedFilters.year = yearFromURL;
      shouldSearch = true;
    }
    
    if (studyYearFromURL) {
      updatedFilters.studyYear = studyYearFromURL;
      shouldSearch = true;
    }
    
    if (tagsFromURL) {
      updatedFilters.tags = tagsFromURL.split(',');
      shouldSearch = true;
    }
    
    if (Object.keys(updatedFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...updatedFilters
      }));
    }
    
    // ค้นหาอัตโนมัติถ้ามีพารามิเตอร์ใน URL
    if (shouldSearch) {
      const searchQueryParams = {
        keyword: termFromURL,
        ...updatedFilters
      };
      handleSearchProjects(termFromURL, updatedFilters);
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
    filters,
    
    // Actions
    searchProjects: handleSearchProjects,
    searchUsers: handleSearchUsers,
    changePage,
    handleKeywordChange,
    submitSearch,
    updateFilters,
    clearFilters,
  };
};

export default useSearch;