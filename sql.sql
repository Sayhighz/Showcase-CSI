USE `zulpszwh_db_e`;

-- Set foreign key checks to 0 for clean setup
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist (reverse order of dependencies)
DROP TABLE IF EXISTS `upload_sessions`;
DROP TABLE IF EXISTS `project_changes`;
DROP TABLE IF EXISTS `project_files`;
DROP TABLE IF EXISTS `project_reviews`;
DROP TABLE IF EXISTS `project_groups`;
DROP TABLE IF EXISTS `visitor_views`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `notification_settings`;
DROP TABLE IF EXISTS `login_logs`;
DROP TABLE IF EXISTS `courseworks`;
DROP TABLE IF EXISTS `competitions`;
DROP TABLE IF EXISTS `academic_papers`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `users`;

-- 1. Create users table first (no dependencies)
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสผู้ใช้งาน (Primary Key)',
  `username` varchar(50) NOT NULL COMMENT 'ชื่อผู้ใช้งานสำหรับเข้าสู่ระบบ',
  `password_hash` varchar(255) NOT NULL COMMENT 'รหัสผ่านที่ถูกเข้ารหัสแล้ว',
  `full_name` varchar(100) NOT NULL COMMENT 'ชื่อ-นามสกุลของผู้ใช้งาน',
  `email` varchar(100) NOT NULL COMMENT 'อีเมลของผู้ใช้งาน',
  `image` varchar(255) DEFAULT NULL COMMENT 'รูปโปรไฟล์ของผู้ใช้งาน',
  `role` enum('visitor','student','admin') NOT NULL COMMENT 'บทบาทของผู้ใช้งาน: visitor (ผู้เยี่ยมชม), student (นักศึกษา), admin (ผู้ดูแลระบบ)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันเวลาที่สร้างบัญชีผู้ใช้',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลผู้ใช้งานทั้งหมดในระบบ';

-- 2. Create projects table (depends on users)
CREATE TABLE `projects` (
  `project_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('coursework','academic','competition') NOT NULL,
  `description` text,
  `study_year` int NOT NULL,
  `year` int NOT NULL,
  `semester` enum('1','2','3') NOT NULL,
  `visibility` tinyint(1) DEFAULT '1',
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `admin_id` int DEFAULT NULL,
  `views_count` int DEFAULT '0',
  PRIMARY KEY (`project_id`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create academic_papers table (depends on projects)
CREATE TABLE `academic_papers` (
  `paper_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสบทความวิชาการ (Primary Key)',
  `project_id` int NOT NULL COMMENT 'รหัสผลงานที่เชื่อมโยง (Foreign Key)',
  `publication_date` date NOT NULL COMMENT 'วันที่ตีพิมพ์บทความ',
  `published_year` int NOT NULL COMMENT 'ปีที่ตีพิมพ์บทความ',
  `paper_file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'เส้นทางไฟล์เอกสารบทความวิชาการ',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันเวลาที่อัปเดตข้อมูลล่าสุด',
  PRIMARY KEY (`paper_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `academic_papers_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลเฉพาะของผลงานประเภทบทความวิชาการ';

-- 4. Create competitions table (depends on projects)
CREATE TABLE `competitions` (
  `competition_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสการแข่งขัน (Primary Key)',
  `project_id` int NOT NULL COMMENT 'รหัสผลงานที่เชื่อมโยง (Foreign Key)',
  `competition_name` varchar(255) NOT NULL COMMENT 'ชื่อการแข่งขัน',
  `competition_year` int NOT NULL COMMENT 'ปีที่จัดการแข่งขัน',
  `poster` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`competition_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `competitions_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลเฉพาะของผลงานประเภทการแข่งขัน';

-- 5. Create courseworks table (depends on projects)
CREATE TABLE `courseworks` (
  `coursework_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสผลงานประเภทการเรียนการสอน (Primary Key)',
  `project_id` int NOT NULL COMMENT 'รหัสผลงานที่เชื่อมโยง (Foreign Key)',
  `poster` varchar(255) DEFAULT NULL,
  `clip_video` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`coursework_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `courseworks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลเฉพาะของผลงานประเภทการเรียนการสอน';

-- 6. Create project_files table (depends on projects)
CREATE TABLE `project_files` (
  `file_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสไฟล์ (Primary Key)',
  `project_id` int NOT NULL COMMENT 'รหัสโปรเจค (Foreign Key)',
  `file_type` enum('image','video','document','poster','other') NOT NULL COMMENT 'ประเภทไฟล์',
  `file_path` varchar(500) NOT NULL COMMENT 'เส้นทางไฟล์',
  `file_name` varchar(255) NOT NULL COMMENT 'ชื่อไฟล์ต้นฉบับ',
  `file_size` bigint DEFAULT NULL COMMENT 'ขนาดไฟล์ (bytes)',
  `mime_type` varchar(100) DEFAULT NULL COMMENT 'MIME type ของไฟล์',
  `uploaded_by` int DEFAULT NULL COMMENT 'ผู้อัปโหลดไฟล์ (Foreign Key)',
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่อัปโหลด',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'สถานะการใช้งานไฟล์',
  PRIMARY KEY (`file_id`),
  KEY `project_id` (`project_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `project_files_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  CONSTRAINT `project_files_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บไฟล์ที่เกี่ยวข้องกับโปรเจค';

-- 7. Create login_logs table (depends on users)
CREATE TABLE `login_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสบันทึกการเข้าสู่ระบบ (Primary Key)',
  `user_id` int NOT NULL COMMENT 'รหัสผู้ใช้งานที่เข้าสู่ระบบ (Foreign Key)',
  `login_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันเวลาที่เข้าสู่ระบบ',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'หมายเลข IP ที่ใช้เข้าสู่ระบบ',
  `device_type` varchar(50) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `browser` varchar(50) DEFAULT NULL,
  `user_agent` text,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27518 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางบันทึกประวัติการเข้าสู่ระบบ';

-- 8. Create notification_settings table (depends on users)
CREATE TABLE `notification_settings` (
  `setting_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสการตั้งค่า (Primary Key)',
  `user_id` int NOT NULL COMMENT 'รหัสผู้ใช้ (Foreign Key)',
  `email_notifications` tinyint(1) DEFAULT '1' COMMENT 'เปิด/ปิดการแจ้งเตือนทางอีเมล',
  `web_notifications` tinyint(1) DEFAULT '1' COMMENT 'เปิด/ปิดการแจ้งเตือนบนเว็บ',
  `project_status_updates` tinyint(1) DEFAULT '1' COMMENT 'แจ้งเตือนเมื่อสถานะโปรเจคเปลี่ยน',
  `weekly_digest` tinyint(1) DEFAULT '0' COMMENT 'รับสรุปข้อมูลประจำสัปดาห์',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `notification_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางตั้งค่าการแจ้งเตือนของผู้ใช้';

-- 9. Create notifications table (depends on users)
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL COMMENT 'ประเภทการแจ้งเตือน: project_approved, project_rejected, project_updated, etc.',
  `title` varchar(255) NOT NULL COMMENT 'หัวข้อการแจ้งเตือน',
  `message` text NOT NULL COMMENT 'ข้อความแจ้งเตือน',
  `data` json DEFAULT NULL COMMENT 'ข้อมูลเพิ่มเติม (JSON format)',
  `is_read` tinyint(1) DEFAULT '0' COMMENT 'สถานะการอ่าน',
  `email_sent` tinyint(1) DEFAULT '0' COMMENT 'สถานะการส่งอีเมล',
  `email_sent_at` timestamp NULL DEFAULT NULL COMMENT 'เวลาที่ส่งอีเมล',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางการแจ้งเตือนภายในระบบ';

-- 10. Create project_groups table (depends on projects and users)
CREATE TABLE `project_groups` (
  `project_id` int NOT NULL COMMENT 'รหัสผลงาน (Primary Key, Foreign Key)',
  `user_id` int NOT NULL COMMENT 'รหัสผู้ใช้งานที่เป็นเจ้าของร่วมของผลงาน (Primary Key, Foreign Key)',
  `role` varchar(50) DEFAULT NULL COMMENT 'บทบาทของผู้ร่วมงาน เช่น owner, contributor, advisor',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่เพิ่มเข้ากลุ่ม',
  PRIMARY KEY (`project_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `project_groups_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  CONSTRAINT `project_groups_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บความสัมพันธ์ระหว่างผลงานกับนักศึกษาที่เป็นเจ้าของร่วม';

-- 11. Create project_reviews table (depends on projects and users)
CREATE TABLE `project_reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสการตรวจสอบ (Primary Key)',
  `project_id` int NOT NULL COMMENT 'รหัสผลงานที่ตรวจสอบ (Foreign Key)',
  `admin_id` int NOT NULL COMMENT 'รหัสผู้ดูแลระบบที่ทำการตรวจสอบ (Foreign Key)',
  `status` enum('pending','approved','rejected','updated') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'สถานะการตรวจสอบ: pending (รอตรวจสอบ), approved (อนุมัติแล้ว), rejected (ถูกปฏิเสธ)',
  `review_comment` text COMMENT 'ความคิดเห็นจากผู้ตรวจสอบ',
  `reviewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันเวลาที่ทำการตรวจสอบ',
  PRIMARY KEY (`review_id`),
  KEY `project_id` (`project_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `project_reviews_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  CONSTRAINT `project_reviews_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บประวัติการตรวจสอบและอนุมัติผลงาน';

-- 12. Create visitor_views table (depends on projects)
CREATE TABLE `visitor_views` (
  `view_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสการเข้าชม (Primary Key)',
  `project_id` int NOT NULL COMMENT 'รหัสผลงานที่เข้าชม (Foreign Key)',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'หมายเลข IP ของผู้เข้าชม',
  `user_agent` varchar(255) DEFAULT NULL COMMENT 'ข้อมูล User Agent ของเบราว์เซอร์ที่ใช้',
  `viewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันเวลาที่เข้าชม',
  PRIMARY KEY (`view_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `visitor_views_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1482 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางบันทึกการเข้าชมผลงานจากผู้เยี่ยมชม';

-- 13. Create project_changes table (NEW - บันทึกการเปลี่ยนแปลงโปรเจค)
CREATE TABLE `project_changes` (
  `change_id` int NOT NULL AUTO_INCREMENT COMMENT 'รหัสการเปลี่ยนแปลง (Primary Key)',
  `project_id` int NOT NULL COMMENT 'รหัสโปรเจค (Foreign Key)',
  `change_type` enum('created','updated','deleted','restored') NOT NULL COMMENT 'ประเภทการเปลี่ยนแปลง',
  `field_changed` varchar(100) DEFAULT NULL COMMENT 'ฟิลด์ที่เปลี่ยนแปลง',
  `old_value` text COMMENT 'ค่าเดิม (JSON format สำหรับข้อมูลที่ซับซ้อน)',
  `new_value` text COMMENT 'ค่าใหม่ (JSON format สำหรับข้อมูลที่ซับซ้อน)',
  `changed_by` int NOT NULL COMMENT 'ผู้ทำการเปลี่ยนแปลง (Foreign Key)',
  `reason` text COMMENT 'เหตุผลของการเปลี่ยนแปลง',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP Address ของผู้ทำการเปลี่ยนแปลง',
  `user_agent` varchar(255) DEFAULT NULL COMMENT 'User Agent ของผู้ทำการเปลี่ยนแปลง',
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันเวลาที่เปลี่ยนแปลง',
  PRIMARY KEY (`change_id`),
  KEY `project_id` (`project_id`),
  KEY `changed_by` (`changed_by`),
  KEY `idx_change_type` (`change_type`),
  KEY `idx_changed_at` (`changed_at`),
  CONSTRAINT `project_changes_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  CONSTRAINT `project_changes_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางบันทึกการเปลี่ยนแปลงโปรเจค (Audit Log)';

-- 14. Create upload_sessions table (depends on users and projects)
CREATE TABLE `upload_sessions` (
  `session_id` varchar(64) NOT NULL COMMENT 'รหัสเซสชันการอัปโหลด',
  `user_id` int NOT NULL COMMENT 'รหัสผู้ใช้ที่อัปโหลด',
  `project_id` int NOT NULL COMMENT 'รหัสโครงการ',
  `file_name` varchar(255) NOT NULL COMMENT 'ชื่อไฟล์ที่อัปโหลด',
  `file_size` int NOT NULL COMMENT 'ขนาดไฟล์ (หน่วย: ไบต์)',
  `progress` int DEFAULT '0' COMMENT 'ความคืบหน้าการอัปโหลด (0-100)',
  `status` enum('pending','uploading','validating','completed','failed','cancelled') DEFAULT 'pending' COMMENT 'สถานะการอัปโหลด',
  `error_message` text COMMENT 'ข้อความแสดงข้อผิดพลาด (ถ้ามี)',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'เวลาเริ่มต้นอัปโหลด',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'เวลาสิ้นสุดการอัปโหลด',
  PRIMARY KEY (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_id` (`project_id`),
  CONSTRAINT `fk_upload_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_upload_sessions_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลเซสชันการอัปโหลดไฟล์';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Optional: Create indexes for better performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_year ON projects(year);
CREATE INDEX idx_visitor_views_ip ON visitor_views(ip_address);
CREATE INDEX idx_login_logs_ip ON login_logs(ip_address);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);