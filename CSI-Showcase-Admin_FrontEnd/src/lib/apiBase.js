// Centralized API base/url helpers for Admin Frontend (Vite)
// Usage:
//   import { getApiBaseUrl, BASE_API_URL, BASE_PATH } from './apiBase';

export const getApiBaseUrl = () => {
  const isProd = import.meta.env.PROD;
  const base =
    (isProd
      ? (import.meta.env.VITE_API_URL_PROD || import.meta.env.VITE_API_URL)
      : import.meta.env.VITE_API_URL) || '';
  const apiPrefix = import.meta.env.VITE_API_BASE_PREFIX || '/csie/backend2';
  const resolved = base || `${window.location.origin}${apiPrefix}`;
  return resolved.replace(/\/+$/, '');
};

export const BASE_API_URL = `${getApiBaseUrl()}/api`;
export const BASE_PATH = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/+$/, '') + '/';