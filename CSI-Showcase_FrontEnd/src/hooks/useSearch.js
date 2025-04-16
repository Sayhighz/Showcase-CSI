/**
 * Custom hook สำหรับจัดการการค้นหา
 * จัดการ state และฟังก์ชันที่เกี่ยวข้องกับการค้นหาโปรเจค, ผู้ใช้, แท็ก เป็นต้น
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';

// นำเข้า services ที่เกี่ยวข้อง
import {
  searchProjects,
  searchUsers,
  searchProjectsByTag,
  getPopularTags,
  getPopularSearches,
  logSearch,
  getUserSearchHistory,
  advancedSearch,
  getSearchSuggestions,
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
  const [suggestions, setSuggestions] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
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
   * ดึงข้อมูลแท็กยอดนิยม
   */
  const fetchPopularTags = useCallback(async () => {
    try {
      const response = await getPopularTags();
      if (response) {
        setPopularTags(response);
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแท็กยอดนิยม:', err);
    }
  }, []);

  /**
   * ดึงข้อมูลการค้นหายอดนิยม
   */
  const fetchPopularSearches = useCallback(async () => {
    try {
      const response = await getPopularSearches();
      if (response) {
        setPopularSearches(response);
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการค้นหายอดนิยม:', err);
    }
  }, []);

  /**
   * ดึงข้อมูลประวัติการค้นหาของผู้ใช้
   */
  const fetchSearchHistory = useCallback(async () => {
    try {
      const response = await getUserSearchHistory();
      if (response) {
        setSearchHistory(response);
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการค้นหา:', err);
    }
  }, []);

  /**
   * บันทึกการค้นหา
   * @param {string} term - คำค้นหา
   */
  const recordSearch = useCallback(async (term) => {
    if (!term || term.trim() === '') return;
    
    try {
      await logSearch(term);
      
      // อัปเดตประวัติการค้นหาหลังจากบันทึก
      fetchSearchHistory();
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึกการค้นหา:', err);
    }
  }, [fetchSearchHistory]);

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
        
        // บันทึกการค้นหา
        if (term && term.trim() !== '') {
          recordSearch(term);
        }
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาโปรเจค');
      console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจค:', err);
    } finally {
      setIsSearching(false);
    }
  }, [keyword, pagination, advancedFilters, recordSearch]);

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
        
        // บันทึกการค้นหา
        if (term && term.trim() !== '') {
          recordSearch(term);
        }
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาผู้ใช้');
      console.error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้:', err);
    } finally {
      setIsSearching(false);
    }
  }, [keyword, recordSearch]);

  /**
   * ค้นหาโปรเจคตามแท็ก
   * @param {string} tag - แท็กที่ต้องการค้นหา
   * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
   */
  const handleSearchByTag = useCallback(async (tag, params = {}) => {
    if (!tag) {
      message.error('กรุณาระบุแท็กที่ต้องการค้นหา');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      // รวมพารามิเตอร์จาก pagination และพารามิเตอร์ที่ส่งมา
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...params
      };
      
      const response = await searchProjectsByTag(tag, queryParams);
      
      if (response) {
        setSearchResults(response.projects || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
          current: response.page || 1,
        });
        
        // บันทึกการค้นหา
        recordSearch(`#${tag}`);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาโปรเจคตามแท็ก');
      console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจคตามแท็ก:', err);
    } finally {
      setIsSearching(false);
    }
  }, [pagination, recordSearch]);

  /**
   * ค้นหาขั้นสูง
   * @param {Object} filters - ตัวกรองสำหรับการค้นหา
   * @param {Object} paginationParams - ข้อมูลการแบ่งหน้า
   */
  const handleAdvancedSearch = useCallback(async (filters = {}, paginationParams = {}) => {
    setIsSearching(true);
    setError(null);
    
    try {
      // รวมตัวกรองจาก advancedFilters และ filters ที่ส่งมา
      const combinedFilters = {
        ...advancedFilters,
        ...filters
      };
      
      // รวมข้อมูลการแบ่งหน้าจาก pagination และ paginationParams ที่ส่งมา
      const combinedPagination = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...paginationParams
      };
      
      // อัปเดต state ของตัวกรองขั้นสูง
      setAdvancedFilters(combinedFilters);
      
      const response = await advancedSearch(combinedFilters, combinedPagination);
      
      if (response) {
        setSearchResults(response.projects || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
          current: response.page || 1,
        });
        
        // บันทึกการค้นหา
        if (combinedFilters.keyword && combinedFilters.keyword.trim() !== '') {
          recordSearch(combinedFilters.keyword);
        }
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหาขั้นสูง');
      console.error('เกิดข้อผิดพลาดในการค้นหาขั้นสูง:', err);
    } finally {
      setIsSearching(false);
    }
  }, [advancedFilters, pagination, recordSearch]);

  /**
   * ดึงคำแนะนำการค้นหา
   * @param {string} searchTerm - คำค้นหา
   */
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    
    try {
      const response = await getSearchSuggestions(searchTerm);
      setSuggestions(response || []);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงคำแนะนำการค้นหา:', err);
      setSuggestions([]);
    }
  }, []);

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
    
    // สร้าง timeout ใหม่
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300); // รอ 300ms ก่อนดึงคำแนะนำ
  }, [fetchSuggestions]);

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

  // ดึงข้อมูลแท็กยอดนิยมและการค้นหายอดนิยมเมื่อ hook ถูกเรียกใช้
  useEffect(() => {
    fetchPopularTags();
    fetchPopularSearches();
    fetchSearchHistory();
  }, [fetchPopularTags, fetchPopularSearches, fetchSearchHistory]);

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
    suggestions,
    popularTags,
    popularSearches,
    searchHistory,
    pagination,
    advancedFilters,
    
    // Actions
    searchProjects: handleSearchProjects,
    searchUsers: handleSearchUsers,
    searchByTag: handleSearchByTag,
    advancedSearch: handleAdvancedSearch,
    changePage,
    handleKeywordChange,
    submitSearch,
    updateAdvancedFilters,
    clearAdvancedFilters,
    
    // Utilities
    fetchPopularTags,
    fetchPopularSearches,
    fetchSearchHistory
  };
};

export default useSearch;