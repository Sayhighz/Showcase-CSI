-- Migration: Ensure competitions.image can store JSON arrays
-- Date: 2025-09-13
-- Description: Add image LONGTEXT column on competitions to store JSON array of image paths; backfill existing data

-- Add image column as LONGTEXT with explanatory comment
ALTER TABLE competitions
  ADD COLUMN image LONGTEXT NULL COMMENT 'JSON array of image paths (primary image at index 0)' AFTER poster;

-- Normalize empty strings to NULL
UPDATE competitions
SET image = NULL
WHERE image IS NOT NULL AND TRIM(image) = '';

-- Backfill non-JSON plain string values to JSON array form: ["<path>"]
-- Requires MySQL 5.7+ for JSON_VALID and JSON_QUOTE
UPDATE competitions
SET image = CONCAT('[', JSON_QUOTE(image), ']')
WHERE image IS NOT NULL
  AND TRIM(image) <> ''
  AND JSON_VALID(image) = 0;