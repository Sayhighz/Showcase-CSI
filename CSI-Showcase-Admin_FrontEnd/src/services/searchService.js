// src/services/searchService.js
import { axiosGet } from '../lib/axios';
import { SEARCH } from '../constants/apiEndpoints';

/**
 * Search registered students for autocomplete usage
 * @param {string} keyword - search keyword (username, full_name, or email)
 * @param {number} limit - max results to return
 * @returns {Promise<Array>} - array of students [{ user_id, username, full_name, email, image }]
 */
export const searchStudents = async (keyword, limit = 10) => {
  try {
    if (!keyword || !keyword.trim()) return [];
    const url = `${SEARCH.USERS}?keyword=${encodeURIComponent(keyword)}&limit=${encodeURIComponent(
      limit
    )}`;
    const resp = await axiosGet(url);

    // Backend returns successResponse({ data }) in most cases
    const data = resp?.data ?? resp;

    // Normalize possible shapes
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.students)) return data.students;
    if (Array.isArray(data?.results)) return data.results;

    return [];
  } catch (err) {
    console.error('searchStudents error:', err);
    return [];
  }
};

export default {
  searchStudents
};