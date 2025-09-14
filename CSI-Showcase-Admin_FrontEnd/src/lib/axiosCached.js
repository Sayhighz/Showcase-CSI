// src/lib/axiosCached.js
// Enhanced axios wrapper with request deduplication and caching

import { axiosGet, axiosPost, axiosPut, axiosDelete, axiosUpload } from './axios';
import requestCache from './requestCache';

/**
 * Cached GET request
 * @param {string} url - Request URL
 * @param {Object} config - Axios config
 * @param {Object} options - Cache options
 * @returns {Promise} Response
 */
export const cachedGet = async (url, config = {}, options = {}) => {
  const { useCache = true, cacheKey, maxAge = 5 * 60 * 1000 } = options;

  // Generate cache key
  const key = cacheKey || requestCache.generateKey('GET', url, config.params);

  // Check cache first
  if (useCache) {
    const cached = requestCache.get(key, maxAge);
    if (cached) {
      return cached;
    }
  }

  // Check if request is already pending
  const pending = requestCache.getPending(key);
  if (pending) {
    return pending;
  }

  // Make the request
  const promise = axiosGet(url, config);
  requestCache.setPending(key, promise);

  const response = await promise;

  // Cache successful responses
  if (response && useCache) {
    requestCache.set(key, response);
  }

  return response;
};

/**
 * Cached POST request
 * @param {string} url - Request URL
 * @param {Object} data - Request data
 * @param {Object} config - Axios config
 * @returns {Promise} Response
 */
export const cachedPost = async (url, data = {}, config = {}) => {
  // POST requests are not cached by default since they modify data
  return axiosPost(url, data, config);
};

/**
 * Cached PUT request
 * @param {string} url - Request URL
 * @param {Object} data - Request data
 * @param {Object} config - Axios config
 * @returns {Promise} Response
 */
export const cachedPut = async (url, data = {}, config = {}) => {
  // PUT requests are not cached by default since they modify data
  return axiosPut(url, data, config);
};

/**
 * Cached DELETE request
 * @param {string} url - Request URL
 * @param {Object} config - Axios config
 * @returns {Promise} Response
 */
export const cachedDelete = async (url, config = {}) => {
  // DELETE requests are not cached by default since they modify data
  return axiosDelete(url, config);
};

/**
 * Cached upload request
 * @param {string} url - Request URL
 * @param {FormData} formData - Form data
 * @param {Object} config - Axios config
 * @returns {Promise} Response
 */
export const cachedUpload = async (url, formData, config = {}) => {
  // Upload requests are not cached by default
  return axiosUpload(url, formData, config);
};

/**
 * Clear cache for specific URL pattern
 * @param {string} urlPattern - URL pattern to clear
 */
export const clearCacheByUrl = (urlPattern) => {
  requestCache.clearByUrl(urlPattern);
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  requestCache.clear();
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return requestCache.getStats();
};

// Export original axios functions for backward compatibility
export { axiosGet, axiosPost, axiosPut, axiosDelete, axiosUpload };

export default {
  get: cachedGet,
  post: cachedPost,
  put: cachedPut,
  delete: cachedDelete,
  upload: cachedUpload,
  clearCacheByUrl,
  clearAllCache,
  getCacheStats
};