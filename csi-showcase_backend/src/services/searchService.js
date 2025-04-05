// services/searchService.js
import pool from '../config/database.js';
import logger from '../config/logger.js';
import { getPaginationInfo } from '../constants/pagination.js';

/**
 * ค้นหาโครงการตามคำค้นหา
 * @param {string} keyword - คำค้นหา
 * @param {Object} filters - ตัวกรอง (type, year, studyYear)
 * @param {Object} pagination - ข้อมูลการแบ่งหน้า (page, limit)
 * @returns {Promise<Object>} - ผลการค้นหา
 */
export const searchProjects = async (keyword = '', filters = {}, pagination = {}) => {
  try {
    // กำหนดค่าเริ่มต้นสำหรับการแบ่งหน้า
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
    `;
    
    const queryParams = [];
    
    // เพิ่มเงื่อนไขการค้นหา
    if (keyword) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ? OR u.full_name LIKE ?)`;
      const searchPattern = `%${keyword}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    // เพิ่มเงื่อนไขการกรอง
    if (filters.type) {
      query += ` AND p.type = ?`;
      queryParams.push(filters.type);
    }
    
    if (filters.year) {
      query += ` AND p.year = ?`;
      queryParams.push(filters.year);
    }
    
    if (filters.studyYear) {
      query += ` AND p.study_year = ?`;
      queryParams.push(filters.studyYear);
    }
    
    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    
    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY 
      CASE 
        WHEN p.title LIKE ? THEN 1
        WHEN p.tags LIKE ? THEN 2
        WHEN p.description LIKE ? THEN 3
        WHEN u.full_name LIKE ? THEN 4
        ELSE 5
      END,
      p.views_count DESC,
      p.created_at DESC
      LIMIT ? OFFSET ?`;
    
    // เพิ่ม parameters สำหรับการจัดลำดับความเกี่ยวข้อง
    if (keyword) {
      const searchPattern = `%${keyword}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    } else {
      queryParams.push('', '', '', '');
    }
    
    queryParams.push(limit, offset);
    
    // ดึงข้อมูลโครงการ
    const [projects] = await pool.execute(query, queryParams);
    
    // จัดรูปแบบข้อมูลสำหรับการส่งกลับ
    const formattedProjects = projects.map(project => ({
      id: project.project_id,
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image || 'https://via.placeholder.com/150',
      student: project.full_name,
      studentId: project.user_id,
      projectLink: `/projects/${project.project_id}`
    }));
    
    // ข้อมูลการแบ่งหน้า
    const paginationInfo = getPaginationInfo(totalItems, page, limit);
    
    // บันทึกคำค้นหาลงในฐานข้อมูลถ้ามีคำค้นหา
    if (keyword) {
      try {
        await pool.execute(`
          INSERT INTO search_logs (keyword, user_id, search_count)
          VALUES (?, ?, 1)
          ON DUPLICATE KEY UPDATE search_count = search_count + 1, last_searched = NOW()
        `, [keyword.toLowerCase(), filters.userId || null]);
      } catch (logError) {
        logger.error('Error logging search keyword:', logError);
      }
    }
    
    return {
      projects: formattedProjects,
      pagination: paginationInfo
    };
  } catch (error) {
    logger.error('Error searching projects:', error);
    throw error;
  }
};

/**
 * ค้นหานักศึกษาตามคำค้นหา
 * @param {string} keyword - คำค้นหา
 * @param {number} limit - จำนวนผลลัพธ์ที่ต้องการ
 * @returns {Promise<Array>} - ผลการค้นหา
 */
export const searchStudents = async (keyword = '', limit = 10) => {
  try {
    if (!keyword) {
      return [];
    }
    
    // ค้นหานักศึกษาที่มีชื่อหรือ username ตรงกับคำค้นหา
    const query = `
      SELECT user_id, username, full_name, email, image
      FROM users
      WHERE role = 'student' AND (
        username LIKE ? OR
        full_name LIKE ? OR
        email LIKE ?
      )
      LIMIT ?
    `;
    
    const searchPattern = `%${keyword}%`;
    const [students] = await pool.execute(query, [searchPattern, searchPattern, searchPattern, limit]);
    
    return students.map(student => ({
      user_id: student.user_id,
      username: student.username,
      full_name: student.full_name,
      email: student.email,
      image: student.image
    }));
  } catch (error) {
    logger.error('Error searching students:', error);
    throw error;
  }
};

/**
 * ค้นหาโครงการจากป้ายกำกับ (tags)
 * @param {string} tag - ป้ายกำกับที่ต้องการค้นหา
 * @param {Object} pagination - ข้อมูลการแบ่งหน้า (page, limit)
 * @returns {Promise<Object>} - ผลการค้นหา
 */
export const searchProjectsByTag = async (tag = '', pagination = {}) => {
  try {
    if (!tag) {
      return { projects: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
    
    // กำหนดค่าเริ่มต้นสำหรับการแบ่งหน้า
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
      AND p.tags LIKE ?
    `;
    
    const searchPattern = `%${tag}%`;
    const queryParams = [searchPattern];
    
    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    
    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY p.views_count DESC, p.created_at DESC LIMIT ? OFFSET ?`;
    
    queryParams.push(limit, offset);
    
    // ดึงข้อมูลโครงการ
    const [projects] = await pool.execute(query, queryParams);
    
    // จัดรูปแบบข้อมูลสำหรับการส่งกลับ
    const formattedProjects = projects.map(project => ({
      id: project.project_id,
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image || 'https://via.placeholder.com/150',
      student: project.full_name,
      studentId: project.user_id,
      projectLink: `/projects/${project.project_id}`
    }));
    
    // ข้อมูลการแบ่งหน้า
    const paginationInfo = getPaginationInfo(totalItems, page, limit);
    
    return {
      tag,
      projects: formattedProjects,
      pagination: paginationInfo
    };
  } catch (error) {
    logger.error('Error searching projects by tag:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลป้ายกำกับยอดนิยม
 * @param {number} limit - จำนวนป้ายกำกับที่ต้องการ
 * @returns {Promise<Array>} - รายการป้ายกำกับยอดนิยม
 */
export const getPopularTags = async (limit = 10) => {
  try {
    // คำสั่ง SQL สำหรับแยกแท็กและนับจำนวนการใช้
    const query = `
      WITH RECURSIVE tag_list AS (
        SELECT 
          project_id,
          SUBSTRING_INDEX(tags, ',', 1) AS tag,
          SUBSTRING(tags, LENGTH(SUBSTRING_INDEX(tags, ',', 1)) + 2) AS remaining_tags
        FROM projects
        WHERE tags != '' AND status = 'approved'
        
        UNION ALL
        
        SELECT 
          project_id,
          SUBSTRING_INDEX(remaining_tags, ',', 1) AS tag,
          SUBSTRING(remaining_tags, LENGTH(SUBSTRING_INDEX(remaining_tags, ',', 1)) + 2) AS remaining_tags
        FROM tag_list
        WHERE remaining_tags != ''
      )
      SELECT 
        TRIM(tag) AS tag_name,
        COUNT(*) AS count
      FROM tag_list
      WHERE tag != ''
      GROUP BY TRIM(tag)
      ORDER BY count DESC
      LIMIT ?
    `;
    
    const [tags] = await pool.execute(query, [limit]);
    
    return tags.map(tag => ({
      name: tag.tag_name,
      count: tag.count
    }));
  } catch (error) {
    logger.error('Error getting popular tags:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลคำค้นหายอดนิยม
 * @param {number} limit - จำนวนคำค้นหาที่ต้องการ
 * @returns {Promise<Array>} - รายการคำค้นหายอดนิยม
 */
export const getPopularSearches = async (limit = 10) => {
  try {
    // ดึงคำค้นหายอดนิยมจากตาราง search_logs
    const query = `
      SELECT keyword, SUM(search_count) as count
      FROM search_logs
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT ?
    `;
    
    const [searches] = await pool.execute(query, [limit]);
    
    return searches.map(search => ({
      keyword: search.keyword,
      count: search.count
    }));
  } catch (error) {
    logger.error('Error getting popular searches:', error);
    throw error;
  }
};

export default {
  searchProjects,
  searchStudents,
  searchProjectsByTag,
  getPopularTags,
  getPopularSearches
};