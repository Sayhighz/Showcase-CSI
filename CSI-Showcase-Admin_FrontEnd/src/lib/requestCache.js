// src/lib/requestCache.js
// Global request cache to prevent duplicate API calls

class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Generate a cache key from request details
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} params - Query parameters
   * @param {Object} data - Request body
   * @returns {string} Cache key
   */
  generateKey(method, url, params = {}, data = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    const sortedData = Object.keys(data)
      .sort()
      .reduce((result, key) => {
        result[key] = data[key];
        return result;
      }, {});

    return `${method}_${url}_${JSON.stringify(sortedParams)}_${JSON.stringify(sortedData)}`;
  }

  /**
   * Check if a request is cached and not expired
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
   * @returns {Object|null} Cached response or null
   */
  get(key, maxAge = 5 * 60 * 1000) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }

  /**
   * Store a response in cache
   * @param {string} key - Cache key
   * @param {Object} data - Response data
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Check if a request is currently pending
   * @param {string} key - Cache key
   * @returns {Promise|null} Pending request promise or null
   */
  getPending(key) {
    return this.pendingRequests.get(key) || null;
  }

  /**
   * Mark a request as pending
   * @param {string} key - Cache key
   * @param {Promise} promise - Request promise
   */
  setPending(key, promise) {
    this.pendingRequests.set(key, promise);

    // Clean up when promise resolves
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clear cache for specific URL pattern
   * @param {string} urlPattern - URL pattern to match
   */
  clearByUrl(urlPattern) {
    for (const [key] of this.cache.entries()) {
      if (key.includes(urlPattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      cachedRequests: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheEntries: Array.from(this.cache.keys())
    };
  }
}

// Create a singleton instance
const requestCache = new RequestCache();

export default requestCache;