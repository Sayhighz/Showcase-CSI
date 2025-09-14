import Cookies from 'js-cookie';

// Production detection: Vite sets import.meta.env.PROD
const isProd = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;
const isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
const BASE_PATH = (() => {
  try {
    const bp = (import.meta?.env?.VITE_BASE_PATH ?? '/csif');
    const trimmed = (typeof bp === 'string' ? bp : '/csif').replace(/\/+$/, '');
    return trimmed || '/';
  } catch {
    return '/csif';
  }
})();

const AUTH_COOKIE_NAME_V1 = 'csi_auth_token';
const AUTH_COOKIE_NAME_V2 = 'csi_auth_token_v2';

const DEBUG = String(import.meta?.env?.VITE_AUTH_COOKIE_DEBUG || '').toLowerCase() === 'true' || String(import.meta?.env?.VITE_DEBUG || '').toLowerCase() === 'true';

const SECURITY_CONFIG = {
  isProduction: !!isProd,
  isSecure: isHttps && !!isProd,
  sameSite: import.meta?.env?.VITE_COOKIE_SAME_SITE || 'None',
  defaultExpiry: parseInt(import.meta?.env?.VITE_AUTH_TOKEN_EXPIRY) || 7,
  domain: isProd ? (import.meta?.env?.VITE_COOKIE_DOMAIN || '.sitspu.com') : undefined,
  path: BASE_PATH
};

const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
const PATHS_TO_CLEAN = unique(['/', SECURITY_CONFIG.path, '/csif', '/csie', '/admin']);
const SAMESITE_TO_TRY = ['Lax', 'None', 'Strict'];

const getSecureCookieOptions = (expires = SECURITY_CONFIG.defaultExpiry) => {
  const baseOptions = {
    expires,
    path: SECURITY_CONFIG.path || '/',
    secure: SECURITY_CONFIG.isSecure,
    sameSite: SECURITY_CONFIG.sameSite
  };
  if (SECURITY_CONFIG.domain && SECURITY_CONFIG.isProduction) {
    baseOptions.domain = SECURITY_CONFIG.domain;
  }
  // In dev, be permissive
  if (!SECURITY_CONFIG.isProduction) {
    baseOptions.secure = false;
    baseOptions.sameSite = 'Lax';
  }
  return baseOptions;
};

const tryRemoveAll = (name) => {
  try {
    const domainVariants = unique([SECURITY_CONFIG.domain, undefined]);
    const secureVariants = [true, false];
    PATHS_TO_CLEAN.forEach((p) => {
      domainVariants.forEach((d) => {
        SAMESITE_TO_TRY.forEach((ss) => {
          secureVariants.forEach((sec) => {
            const opt = { path: p };
            if (d) opt.domain = d;
            try { Cookies.remove(name, opt); } catch (e) { if (DEBUG) console.debug('[cookie-remove]', e?.message || ''); }
            try { Cookies.remove(name, { ...opt, sameSite: ss }); } catch (e) { if (DEBUG) console.debug('[cookie-remove]', e?.message || ''); }
            try { Cookies.remove(name, { ...opt, secure: sec }); } catch (e) { if (DEBUG) console.debug('[cookie-remove]', e?.message || ''); }
            try { Cookies.remove(name, { ...opt, sameSite: ss, secure: sec }); } catch (e) { if (DEBUG) console.debug('[cookie-remove]', e?.message || ''); }
          });
        });
      });
    });
  } catch (e) {
    if (DEBUG) console.error('❌ Error in tryRemoveAll:', e);
  }
};

export const setAuthToken = (token, expires = SECURITY_CONFIG.defaultExpiry) => {
  if (!token || typeof token !== 'string') {
    if (DEBUG) console.error('❌ Invalid token for cookie storage');
    return false;
  }
  try {
    const cookieOptions = getSecureCookieOptions(expires);
    // Set new v2 cookie at canonical path
    Cookies.set(AUTH_COOKIE_NAME_V2, token, cookieOptions);

    // Remove legacy v1 cookies across paths
    tryRemoveAll(AUTH_COOKIE_NAME_V1);

    // Verify
    const verification = Cookies.get(AUTH_COOKIE_NAME_V2);
    if (verification !== token) {
      if (DEBUG) console.warn('⚠️ Cookie verification mismatch for v2; attempting permissive set for dev');
      Cookies.set(AUTH_COOKIE_NAME_V2, token, { expires, path: '/', secure: false, sameSite: 'Lax' });
    }

    return true;
  } catch (error) {
    console.error('❌ Error setting auth token cookie:', error);
    return false;
  }
};

export const getAuthToken = () => {
  try {
    // Prefer v2
    let token = Cookies.get(AUTH_COOKIE_NAME_V2);
    if (token && typeof token === 'string') {
      if (!token.includes('.')) {
        if (DEBUG) console.warn('⚠️ Invalid token format in v2 cookie, cleaning up');
        tryRemoveAll(AUTH_COOKIE_NAME_V2);
        token = null;
      } else {
        return token;
      }
    }

    // Fallback to v1 then migrate
    const legacy = Cookies.get(AUTH_COOKIE_NAME_V1);
    if (legacy && typeof legacy === 'string' && legacy.includes('.')) {
      setAuthToken(legacy);
      tryRemoveAll(AUTH_COOKIE_NAME_V1);
      return legacy;
    }
    return null;
  } catch (error) {
    console.error('❌ Error retrieving auth token:', error);
    return null;
  }
};

export const removeAuthToken = () => {
  try {
    tryRemoveAll(AUTH_COOKIE_NAME_V2);
    tryRemoveAll(AUTH_COOKIE_NAME_V1);
    return true;
  } catch (error) {
    console.error('❌ Error removing auth token cookie:', error);
    return false;
  }
};

export const hasValidAuthCookies = () => {
  try {
    const token = getAuthToken();
    return !!(token && typeof token === 'string' && token.includes('.'));
  } catch (error) {
    console.error('❌ Error checking auth cookies validity:', error);
    return false;
  }
};

export const getCSRFToken = () => {
  return 'csrf-token-placeholder';
};

export const initializeCookieSecurity = () => {
  try {
    // One-time sanitation/migration on init
    // If only legacy exists, migrate to v2 and clean up
    const v2 = Cookies.get(AUTH_COOKIE_NAME_V2);
    const v1 = Cookies.get(AUTH_COOKIE_NAME_V1);
    if (!v2 && v1 && typeof v1 === 'string' && v1.includes('.')) {
      setAuthToken(v1);
      tryRemoveAll(AUTH_COOKIE_NAME_V1);
    } else if (v2 && v1) {
      // If both exist, prefer v2 and remove v1 to avoid path-based overshadowing
      tryRemoveAll(AUTH_COOKIE_NAME_V1);
    }
    return true;
  } catch (error) {
    console.error('❌ Error initializing cookie security:', error);
    return false;
  }
};

export default {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  hasValidAuthCookies,
  getCSRFToken,
  initializeCookieSecurity
};