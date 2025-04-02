// controllers/user/searchController.js
import pool from '../../config/database.js';
import { handleServerError, successResponse } from '../../utils/responseFormatter.js';

/**
 * ค้นหาโครงการตามคำค้นหา
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchProjects = async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    if (!keyword) {
      return res.json(successResponse([], 'Please provide a search keyword'));
    }
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
      AND (
        p.title LIKE ? OR 
        p.description LIKE ? OR 
        p.tags LIKE ? OR
        u.full_name LIKE ?
      )
    `;
    
    const searchPattern = `%${keyword}%`;
    const queryParams = [searchPattern, searchPattern, searchPattern, searchPattern];
    
    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    
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
    queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, limit, offset);
    
    // ดึงข้อมูลโครงการ
    const [projects] = await pool.execute(query, queryParams);
    
    return res.json(successResponse({
      keyword,
      projects: projects.map(project => ({
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
      })),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    }, 'Search results retrieved successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ค้นหานักศึกษาตามคำค้นหา
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchStudents = async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    
    if (!keyword) {
      return res.json(successResponse([], 'Please provide a search keyword'));
    }
    
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบหรือไม่
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication required to search for students'
      });
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
      LIMIT 10
    `;
    
    const searchPattern = `%${keyword}%`;
    const [students] = await pool.execute(query, [searchPattern, searchPattern, searchPattern]);
    
    return res.json(successResponse(
      students.map(student => ({
        user_id: student.user_id,
        username: student.username,
        full_name: student.full_name,
        email: student.email,
        image: student.image
      })),
      'Students search results retrieved successfully'
    ));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ค้นหาโครงการจากป้ายกำกับ (tags)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchProjectsByTags = async (req, res) => {
  try {
    const tag = req.query.tag || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    if (!tag) {
      return res.json(successResponse([], 'Please provide a tag'));
    }
    
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
    const totalPages = Math.ceil(totalItems / limit);
    
    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY p.views_count DESC, p.created_at DESC
               LIMIT ? OFFSET ?`;
    
    queryParams.push(limit, offset);
    
    // ดึงข้อมูลโครงการ
    const [projects] = await pool.execute(query, queryParams);
    
    return res.json(successResponse({
      tag,
      projects: projects.map(project => ({
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
      })),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    }, 'Tag search results retrieved successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลป้ายกำกับยอดนิยม (popular tags)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPopularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // คำสั่ง SQL นี้จะแยกแท็กจากฟิลด์ tags และนับจำนวนการใช้แต่ละแท็ก
    // คำสั่งนี้อาจจะแตกต่างกันตามระบบฐานข้อมูลที่ใช้
    // ตัวอย่างนี้ใช้สำหรับ MySQL โดยใช้ SUBSTRING_INDEX และ GROUP_CONCAT
    
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
    
    return res.json(successResponse(
      tags.map(tag => ({
        name: tag.tag_name,
        count: tag.count
      })),
      'Popular tags retrieved successfully'
    ));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลคำค้นหายอดนิยม (popular searches)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPopularSearches = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // ดึงคำค้นหายอดนิยมจากตาราง search_logs
    const query = `
      SELECT keyword, COUNT(*) as count
      FROM search_logs
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT ?
    `;
    
    const [searches] = await pool.execute(query, [limit]);
    
    return res.json(successResponse(
      searches.map(search => ({
        keyword: search.keyword,
        count: search.count
      })),
      'Popular searches retrieved successfully'
    ));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};