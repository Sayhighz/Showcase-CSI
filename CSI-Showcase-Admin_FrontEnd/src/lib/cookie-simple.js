import Cookies from 'js-cookie';

// Simplified cookie management without encryption for debugging
const SECURITY_CONFIG = {
  isProduction: import.meta.env.NODE_ENV === 'production',
  isSecure: import.meta.env.VITE_COOKIE_SECURE === 'true' || import.meta.env.NODE_ENV === 'production',
  sameSite: import.meta.env.VITE_COOKIE_SAME_SITE || 'Strict',
  defaultExpiry: parseInt(import.meta.env.VITE_AUTH_TOKEN_EXPIRY) || 7,
  domain: import.meta.env.NODE_ENV === 'production' ? '.sitspu.com' : undefined
};

// Simple cookie name
const AUTH_COOKIE_NAME = `${SECURITY_CONFIG.isProduction ? '__Secure-' : ''}csi_auth_token`;

/**
 * Get secure cookie options
 */
const getSecureCookieOptions = (expires = SECURITY_CONFIG.defaultExpiry) => {
  const baseOptions = {
    expires,
    path: '/',
    secure: SECURITY_CONFIG.isSecure,
    sameSite: SECURITY_CONFIG.sameSite
  };

  if (SECURITY_CONFIG.domain && SECURITY_CONFIG.isProduction) {
    baseOptions.domain = SECURITY_CONFIG.domain;
  }

  return baseOptions;
};

/**
 * Set authentication token (simple version)
 */
export const setAuthToken = (token, expires = SECURITY_CONFIG.defaultExpiry) => {
  if (!token || typeof token !== 'string') {
    console.error('❌ Invalid token for cookie storage');
    return false;
  }

  try {
    const cookieOptions = getSecureCookieOptions(expires);
    console.log('🔐 Setting auth token cookie with options:', cookieOptions);
    
    Cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
    
    // Verify cookie was set
    const verification = Cookies.get(AUTH_COOKIE_NAME);
    if (verification !== token) {
      console.error('❌ Cookie verification failed');
      return false;
    }
    
    console.log('✅ Auth token cookie set successfully');
    return true;
  } catch (error) {
    console.error('❌ Error setting auth token cookie:', error);
    return false;
  }
};

/**
 * Get authentication token (simple version)
 */
export const getAuthToken = () => {
  try {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    
    if (!token) {
      console.log('🔍 No auth token cookie found');
      return null;
    }

    // Basic token format validation
    if (typeof token !== 'string' || !token.includes('.')) {
      console.warn('⚠️ Invalid token format in cookie');
      removeAuthToken();
      return null;
    }

    console.log('✅ Auth token retrieved successfully');
    return token;
  } catch (error) {
    console.error('❌ Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Remove authentication token
 */
export const removeAuthToken = () => {
  try {
    const cookieOptions = getSecureCookieOptions(0);
    
    console.log('🗑️ Removing auth token cookie');
    Cookies.remove(AUTH_COOKIE_NAME, cookieOptions);
    
    // Also try removing without domain for localhost
    if (cookieOptions.domain) {
      const optionsWithoutDomain = { ...cookieOptions };
      delete optionsWithoutDomain.domain;
      Cookies.remove(AUTH_COOKIE_NAME, optionsWithoutDomain);
    }
    
    // Legacy cleanup
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/', secure: false, sameSite: 'Lax' });
    
    console.log('✅ Auth token cookie removed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error removing auth token cookie:', error);
    return false;
  }
};

/**
 * Check if valid auth cookies exist
 */
export const hasValidAuthCookies = () => {
  try {
    const token = getAuthToken();
    return !!(token && typeof token === 'string' && token.length > 0);
  } catch (error) {
    console.error('❌ Error checking auth cookies validity:', error);
    return false;
  }
};

/**
 * Get CSRF token (placeholder)
 */
export const getCSRFToken = () => {
  // Simple CSRF token for now
  return 'csrf-token-placeholder';
};

/**
 * Initialize cookie security
 */
export const initializeCookieSecurity = () => {
  try {
    console.log('🔒 Cookie security initialized (simple mode):', {
      secure: SECURITY_CONFIG.isSecure,
      sameSite: SECURITY_CONFIG.sameSite,
      production: SECURITY_CONFIG.isProduction
    });
    return true;
  } catch (error) {
    console.error('❌ Error initializing cookie security:', error);
    return false;
  }
};

// Export default object
export default {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  hasValidAuthCookies,
  getCSRFToken,
  initializeCookieSecurity
};