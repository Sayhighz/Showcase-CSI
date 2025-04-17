// controllers/user/searchController.js
import pool from '../../config/database.js';
import logger from '../../config/logger.js';
import { successResponse, handleServerError, notFoundResponse } from '../../utils/responseFormatter.js';
import { getPaginationParams, getPaginationInfo } from '../../constants/pagination.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';
import { PROJECT_STATUSES } from '../../constants/projectStatuses.js';
import { isEmpty } from '../../utils/validationHelper.js';
import searchService from '../../services/searchService.js';
import { asyncHandler } from '../../middleware/loggerMiddleware.js';

export const searchProjects = asyncHandler(async (req, res) => {
  try {
    // แก้ไข: ตรวจสอบว่า keyword เป็น object หรือไม่ และดึงค่า keyword ที่แท้จริงออกมา
    let keyword = '';
    let page = 1;
    let limit = 10;
    
    if (typeof req.query.keyword === 'object' && req.query.keyword !== null) {
      // กรณีที่ keyword เป็น object
      keyword = req.query.keyword.keyword || '';
      page = parseInt(req.query.keyword.page) || 1;
      limit = parseInt(req.query.keyword.limit) || 10;
    } else {
      // กรณีปกติ
      keyword = req.query.keyword || '';
      page = parseInt(req.query.page) || 1;
      limit = parseInt(req.query.limit) || 10;
    }
    
    // สร้าง pagination object
    const pagination = {
      page,
      limit
    };
    
    // Ensure all filter values are properly formatted
    const filters = {
      type: req.query.type || null,
      year: req.query.year ? parseInt(req.query.year, 10) : null,
      studyYear: req.query.studyYear ? parseInt(req.query.studyYear, 10) : null,
      userId: req.user ? req.user.id : null
    };
    
    // Make sure none of the filters have invalid values (like NaN)
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && typeof filters[key] === 'number' && isNaN(filters[key])) {
        filters[key] = null;
      }
    });
    
    // Sanitize keyword to prevent SQL injection
    const sanitizedKeyword = keyword;
    
    // ส่งออกข้อมูลเพื่อ debug
    console.log("Search params:", {
      keyword: sanitizedKeyword,
      filters,
      pagination
    });
    
    // Pass sanitized data to the service
    const result = await searchService.searchProjects(sanitizedKeyword, filters, pagination);
    
    return res.status(STATUS_CODES.OK).json(successResponse(
      result,
      sanitizedKeyword ? `Search results for "${sanitizedKeyword}"` : 'All projects retrieved successfully'
    ));
  } catch (error) {
    logger.error('Error in searchProjects controller:', error);
    return handleServerError(res, error);
  }
});

/**
 * ค้นหานักศึกษาตามคำค้นหา
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchStudents = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const limit = parseInt(req.query.limit) || 10;
    
    if (isEmpty(keyword)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: 'Please provide a search keyword'
      });
    }
    
    // ตรวจสอบสิทธิ์ (ถ้าต้องการให้เฉพาะผู้ที่เข้าสู่ระบบเท่านั้นที่ค้นหานักศึกษาได้)
    if (req.query.requireAuth !== 'false' && !req.user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: 'Authentication required to search for students'
      });
    }
    
    // เรียกใช้เซอร์วิสสำหรับการค้นหานักศึกษา
    const students = await searchService.searchStudents(keyword, limit);
    
    return res.status(STATUS_CODES.OK).json(successResponse(
      students,
      `Found ${students.length} students matching "${keyword}"`
    ));
  } catch (error) {
    logger.error('Error in searchStudents controller:', error);
    return handleServerError(res, error);
  }
});

/**
 * ค้นหาโครงการจากป้ายกำกับ (tags)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchProjectsByTags = asyncHandler(async (req, res) => {
  try {
    const tag = req.query.tag || '';
    const pagination = getPaginationParams(req);
    
    if (isEmpty(tag)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: 'Please provide a tag'
      });
    }
    
    // เรียกใช้เซอร์วิสสำหรับการค้นหาโครงการตามแท็ก
    const result = await searchService.searchProjectsByTag(tag, pagination);
    
    if (result.projects.length === 0) {
      return res.status(STATUS_CODES.OK).json(successResponse(
        { tag, projects: [], pagination: result.pagination },
        `No projects found with tag "${tag}"`
      ));
    }
    
    return res.status(STATUS_CODES.OK).json(successResponse(
      result,
      `Found ${result.pagination.totalItems} projects with tag "${tag}"`
    ));
  } catch (error) {
    logger.error('Error in searchProjectsByTags controller:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลป้ายกำกับยอดนิยม (popular tags)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPopularTags = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // เรียกใช้เซอร์วิสสำหรับการดึงข้อมูลแท็กยอดนิยม
    const tags = await searchService.getPopularTags(limit);
    
    return res.status(STATUS_CODES.OK).json(successResponse(
      tags,
      `Retrieved ${tags.length} popular tags`
    ));
  } catch (error) {
    logger.error('Error in getPopularTags controller:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลคำค้นหายอดนิยม (popular searches)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPopularSearches = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // เรียกใช้เซอร์วิสสำหรับการดึงข้อมูลคำค้นหายอดนิยม
    const searches = await searchService.getPopularSearches(limit);
    
    return res.status(STATUS_CODES.OK).json(successResponse(
      searches,
      `Retrieved ${searches.length} popular searches`
    ));
  } catch (error) {
    logger.error('Error in getPopularSearches controller:', error);
    return handleServerError(res, error);
  }
});

/**
 * บันทึกคำค้นหาลงในประวัติ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logSearch = asyncHandler(async (req, res) => {
  try {
    const { keyword } = req.body;
    
    if (isEmpty(keyword)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: 'Please provide a search keyword'
      });
    }
    
    // บันทึกคำค้นหาลงในฐานข้อมูล
    await pool.execute(`
      INSERT INTO search_logs (keyword, user_id, search_count)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE search_count = search_count + 1, last_searched = NOW()
    `, [keyword.toLowerCase(), req.user ? req.user.id : null]);
    
    return res.status(STATUS_CODES.OK).json(successResponse(
      { keyword },
      'Search keyword logged successfully'
    ));
  } catch (error) {
    logger.error('Error in logSearch controller:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงประวัติการค้นหาของผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserSearchHistory = asyncHandler(async (req, res) => {
  try {
    // ตรวจสอบว่ามีการเข้าสู่ระบบหรือไม่
    if (!req.user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: 'Authentication required to access search history'
      });
    }
    
    const limit = parseInt(req.query.limit) || 10;
    
    // ดึงประวัติการค้นหาของผู้ใช้
    const [history] = await pool.execute(`
      SELECT keyword, search_count, last_searched 
      FROM search_logs 
      WHERE user_id = ? 
      ORDER BY last_searched DESC 
      LIMIT ?
    `, [req.user.id, limit]);
    
    return res.status(STATUS_CODES.OK).json(successResponse(
      history,
      `Retrieved ${history.length} search history items`
    ));
  } catch (error) {
    logger.error('Error in getUserSearchHistory controller:', error);
    return handleServerError(res, error);
  }
});

export default {
  searchProjects,
  searchStudents,
  searchProjectsByTags,
  getPopularTags,
  getPopularSearches,
  logSearch,
  getUserSearchHistory
};