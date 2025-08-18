// Import functions from cookie-simple.js
import { setAuthToken, removeAuthToken, getAuthToken } from './cookie-simple';

/**
 * Set admin authentication cookie
 * @param {string} token - JWT token
 * @returns {boolean} - Success status
 */
export const setAdminAuthCookie = (token) => {
  return setAuthToken(token);
};

/**
 * Remove admin authentication cookie
 * @returns {boolean} - Success status
 */
export const removeAdminAuthCookie = () => {
  return removeAuthToken();
};

/**
 * Get admin authentication cookie
 * @returns {string|null} - Auth token or null
 */
export const getAdminAuthCookie = () => {
  return getAuthToken();
};

// Export default object
export default {
  setAdminAuthCookie,
  removeAdminAuthCookie,
  getAdminAuthCookie
};