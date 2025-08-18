-- Migration: Update project_groups table to support flexible member addition
-- Date: 2025-08-17
-- Description: Add columns to support team members who may not exist in the users table

-- Add new columns to project_groups table
ALTER TABLE project_groups 
ADD COLUMN member_name VARCHAR(255) NULL COMMENT 'Name of external member (not in users table)',
ADD COLUMN member_student_id VARCHAR(50) NULL COMMENT 'Student ID of external member',
ADD COLUMN member_email VARCHAR(255) NULL COMMENT 'Email of external member',
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the member was added',
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When the member info was last updated';

-- Modify user_id to be nullable (for external members)
ALTER TABLE project_groups 
MODIFY COLUMN user_id INT NULL COMMENT 'User ID from users table (NULL for external members)';

-- Add constraint to ensure either user_id OR member_name is provided
ALTER TABLE project_groups 
ADD CONSTRAINT chk_member_info 
CHECK (
  (user_id IS NOT NULL AND member_name IS NULL) OR 
  (user_id IS NULL AND member_name IS NOT NULL)
);

-- Add index for better performance on external member queries
CREATE INDEX idx_project_groups_member_name ON project_groups(member_name);
CREATE INDEX idx_project_groups_member_student_id ON project_groups(member_student_id);

-- Add comments to existing columns for clarity
ALTER TABLE project_groups 
MODIFY COLUMN project_id INT NOT NULL COMMENT 'Project ID reference',
MODIFY COLUMN role ENUM('owner', 'contributor', 'advisor') DEFAULT 'contributor' COMMENT 'Role of the member in the project';