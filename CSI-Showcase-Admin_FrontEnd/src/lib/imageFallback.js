// src/lib/imageFallback.js
// Prevent repeated fetching of missing images by caching 404 URLs in-session
// and providing safe fallbacks for <img>, Ant Image, and Avatar components.

const STORAGE_KEY = 'admin_fe_missing_image_urls';

// A transparent 1x1 PNG data URI
export const PIXEL_TRANSPARENT =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

// In-memory registry with sessionStorage persistence
const missingSet = new Set();

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach((u) => u && missingSet.add(u));
      }
    }
  } catch {
    // ignore
  }
}

function persistToStorage() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(missingSet)));
  } catch {
    // ignore
  }
}

if (typeof window !== 'undefined') {
  loadFromStorage();
}

/**
 * Mark a URL as missing (404) to prevent future fetch attempts in this session.
 */
export const markImageMissing = (url) => {
  if (!url) return;
  if (!missingSet.has(url)) {
    missingSet.add(url);
    persistToStorage();
  }
};

/**
 * Check if URL is marked as missing.
 */
export const isImageMissing = (url) => {
  if (!url) return false;
  return missingSet.has(url);
};

/**
 * Return a safe src for standard images. If URL is known missing, return data URI.
 */
export const getSafeImageSrc = (url, fallback = PIXEL_TRANSPARENT) => {
  return isImageMissing(url) ? fallback : url;
};

/**
 * Return a safe src for Avatar. If URL is known missing, return null so Avatar falls back to icon/children.
 */
export const getSafeAvatarSrc = (url) => {
  return isImageMissing(url) ? null : url;
};

/**
 * Generic <img> onError handler: stop error loop, cache URL as missing, and swap to fallback.
 */
export const handleImgError = (e, originalUrl, fallback = PIXEL_TRANSPARENT) => {
  try {
    const img = e?.currentTarget || e?.target;
    if (img) {
      img.onerror = null; // prevent infinite onError loop
      markImageMissing(originalUrl);
      img.src = fallback;
    }
  } catch {
    // ignore
  }
};

/**
 * Optional: clear the missing image cache.
 */
export const clearMissingImageCache = () => {
  try {
    missingSet.clear();
    persistToStorage();
  } catch {
    // ignore
  }
};