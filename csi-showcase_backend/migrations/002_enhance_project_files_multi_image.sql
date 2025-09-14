-- Migration: Enhance project_files table to support multi-image uploads
-- Date: 2025-09-13
-- Description: Add field_name column and improve indexing for better multi-image support

-- Add field_name column to identify which form field the file came from
ALTER TABLE project_files 
ADD COLUMN field_name VARCHAR(100) NULL COMMENT 'Form field name that uploaded this file (e.g., courseworkImage, gallery, etc.)' AFTER file_type;

-- Add display_order column for managing image sequence
ALTER TABLE project_files 
ADD COLUMN display_order INT DEFAULT 0 COMMENT 'Order for displaying images in galleries' AFTER field_name;

-- Add is_primary column to mark primary/cover images
ALTER TABLE project_files 
ADD COLUMN is_primary BOOLEAN DEFAULT FALSE COMMENT 'Whether this is the primary/cover image for the project' AFTER display_order;

-- Add alt_text column for accessibility
ALTER TABLE project_files 
ADD COLUMN alt_text TEXT NULL COMMENT 'Alternative text for images (accessibility)' AFTER is_primary;

-- Add timestamps for better tracking
ALTER TABLE project_files 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the file was uploaded' AFTER alt_text,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When the file info was last updated' AFTER created_at;

-- Create indexes for better performance
CREATE INDEX idx_project_files_field_name ON project_files(field_name);
CREATE INDEX idx_project_files_type_field ON project_files(file_type, field_name);
CREATE INDEX idx_project_files_project_type ON project_files(project_id, file_type);
CREATE INDEX idx_project_files_primary ON project_files(project_id, is_primary);
CREATE INDEX idx_project_files_display_order ON project_files(project_id, field_name, display_order);

-- Update existing records to have proper field_name based on file_type
UPDATE project_files 
SET field_name = CASE 
    WHEN file_type = 'image' THEN 'images'
    WHEN file_type = 'document' THEN 'documents'
    WHEN file_type = 'video' THEN 'videos'
    ELSE 'other'
END 
WHERE field_name IS NULL;

-- Add comments to existing columns for clarity
ALTER TABLE project_files 
MODIFY COLUMN project_id INT NOT NULL COMMENT 'Reference to projects table',
MODIFY COLUMN file_type ENUM('image', 'video', 'document', 'other') NOT NULL COMMENT 'Type of file uploaded',
MODIFY COLUMN file_path VARCHAR(500) NOT NULL COMMENT 'Path to the uploaded file',
MODIFY COLUMN file_name VARCHAR(255) NULL COMMENT 'Original filename from user',
MODIFY COLUMN file_size BIGINT DEFAULT 0 COMMENT 'File size in bytes';