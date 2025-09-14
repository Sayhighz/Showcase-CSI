-- Migration: Ensure courseworks.image can store JSON arrays
-- Date: 2025-09-13
-- Description: Modify courseworks.image to LONGTEXT and backfill plain string values to JSON arrays

-- Change column type to LONGTEXT for JSON arrays and add explanatory comment
ALTER TABLE courseworks
  MODIFY COLUMN image LONGTEXT NULL COMMENT 'JSON array of image paths (primary image at index 0)';

-- Normalize empty strings to NULL
UPDATE courseworks
SET image = NULL
WHERE image IS NOT NULL AND TRIM(image) = '';

-- Backfill non-JSON plain string values to JSON array form: ["<path>"]
-- Requires MySQL 5.7+ for JSON_VALID and JSON_QUOTE
UPDATE courseworks
SET image = CONCAT('[', JSON_QUOTE(image), ']')
WHERE image IS NOT NULL
  AND TRIM(image) <> ''
  AND JSON_VALID(image) = 0;