-- Migration: Add user account status and soft delete fields
-- Date: 2025-09-15
-- Description: Adds 'status' ENUM('active','inactive','suspended') DEFAULT 'active' and 'deleted_at' DATETIME NULL to users table.

-- Add status column if not exists
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN status ENUM(''active'',''inactive'',''suspended'') NOT NULL DEFAULT ''active'' AFTER role',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add deleted_at column if not exists
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'deleted_at'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL AFTER created_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill status to active for nulls (if any)
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Create index on status if not exists
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_status'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_users_status ON users(status)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;