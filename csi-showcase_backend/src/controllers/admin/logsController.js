// controllers/admin/logsController.js
import pool from '../../config/database.js';
import logger from '../../config/logger.js';
import { handleServerError, successResponse } from '../../utils/responseFormatter.js';
import { getPaginationParams, getPaginationInfo } from '../../constants/pagination.js';
import { formatToISODate } from '../../utils/dateHelper.js';
import { asyncHandler } from '../../middleware/loggerMiddleware.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';

/**
 * ดึงข้อมูลการเข้าสู่ระบบทั้งหมด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllLoginLogs = asyncHandler(async (req, res) => {
  try {
    // ใช้ getPaginationParams จาก pagination helper
    const pagination = getPaginationParams(req);
    const { page, limit, offset } = pagination;
    
    const userId = req.query.userId || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT l.log_id, l.user_id, l.login_time, l.ip_address,
             u.username, u.full_name, u.role
      FROM login_logs l
      JOIN users u ON l.user_id = u.user_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // เพิ่มการค้นหาตาม userId ถ้ามี
    if (userId) {
      query += ` AND l.user_id = ?`;
      queryParams.push(userId);
    }
    
    // เพิ่มการค้นหาตามช่วงเวลา
    if (startDate) {
      query += ` AND l.login_time >= ?`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND l.login_time <= ?`;
      queryParams.push(endDate);
    }
    
    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    
    // ใช้ getPaginationInfo เพื่อรับข้อมูลการแบ่งหน้าที่สมบูรณ์
    const paginationInfo = getPaginationInfo(totalItems, page, limit);
    
    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY l.login_time DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // ดึงข้อมูลการเข้าสู่ระบบ
    const [logs] = await pool.execute(query, queryParams);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedLogs = logs.map(log => ({
      id: log.log_id,
      userId: log.user_id,
      username: log.username,
      fullName: log.full_name,
      role: log.role,
      loginTime: log.login_time,
      ipAddress: log.ip_address
    }));
    
    // ใช้ successResponse helper function พร้อม status code
    return res.status(STATUS_CODES.OK).json(successResponse({
      logs: formattedLogs,
      pagination: paginationInfo
    }, 'Login logs retrieved successfully', STATUS_CODES.OK));
    
  } catch (error) {
    logger.error('Error fetching login logs:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลการเข้าชมโครงการจากบริษัท
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCompanyViews = asyncHandler(async (req, res) => {
  try {
    // ใช้ getPaginationParams จาก pagination helper
    const pagination = getPaginationParams(req);
    const { page, limit, offset } = pagination;
    
    const projectId = req.query.projectId || '';
    const search = req.query.search || '';
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT cv.view_id, cv.company_name, cv.contact_email, cv.project_id, cv.viewed_at,
             p.title as project_title
      FROM company_views cv
      JOIN projects p ON cv.project_id = p.project_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // เพิ่มการค้นหาตาม projectId ถ้ามี
    if (projectId) {
      query += ` AND cv.project_id = ?`;
      queryParams.push(projectId);
    }
    
    // เพิ่มการค้นหาจากข้อความถ้ามี
    if (search) {
      query += ` AND (cv.company_name LIKE ? OR cv.contact_email LIKE ? OR p.title LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    
    // ใช้ getPaginationInfo เพื่อรับข้อมูลการแบ่งหน้าที่สมบูรณ์
    const paginationInfo = getPaginationInfo(totalItems, page, limit);
    
    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY cv.viewed_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // ดึงข้อมูลการเข้าชมจากบริษัท
    const [views] = await pool.execute(query, queryParams);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedViews = views.map(view => ({
      id: view.view_id,
      companyName: view.company_name,
      contactEmail: view.contact_email,
      projectId: view.project_id,
      projectTitle: view.project_title,
      viewedAt: view.viewed_at
    }));
    
    // ใช้ successResponse helper function พร้อม status code
    return res.status(STATUS_CODES.OK).json(successResponse({
      views: formattedViews,
      pagination: paginationInfo
    }, 'Company views retrieved successfully', STATUS_CODES.OK));
    
  } catch (error) {
    logger.error('Error fetching company views:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลการเข้าชมโครงการจากผู้เยี่ยมชม
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getVisitorViews = asyncHandler(async (req, res) => {
  try {
    // ใช้ getPaginationParams จาก pagination helper
    const pagination = getPaginationParams(req);
    const { page, limit, offset } = pagination;
    
    const projectId = req.query.projectId || '';
    const search = req.query.search || '';
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT vv.view_id, vv.project_id, vv.ip_address, vv.user_agent, vv.viewed_at,
             p.title as project_title
      FROM visitor_views vv
      JOIN projects p ON vv.project_id = p.project_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // เพิ่มการค้นหาตาม projectId ถ้ามี
    if (projectId) {
      query += ` AND vv.project_id = ?`;
      queryParams.push(projectId);
    }
    
    // เพิ่มการค้นหาจากข้อความถ้ามี
    if (search) {
      query += ` AND (vv.ip_address LIKE ? OR p.title LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    
    // ใช้ getPaginationInfo เพื่อรับข้อมูลการแบ่งหน้าที่สมบูรณ์
    const paginationInfo = getPaginationInfo(totalItems, page, limit);
    
    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY vv.viewed_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // ดึงข้อมูลการเข้าชมจากผู้เยี่ยมชม
    const [views] = await pool.execute(query, queryParams);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedViews = views.map(view => ({
      id: view.view_id,
      projectId: view.project_id,
      projectTitle: view.project_title,
      ipAddress: view.ip_address,
      userAgent: view.user_agent,
      viewedAt: view.viewed_at
    }));
    
    // ใช้ successResponse helper function พร้อม status code
    return res.status(STATUS_CODES.OK).json(successResponse({
      views: formattedViews,
      pagination: paginationInfo
    }, 'Visitor views retrieved successfully', STATUS_CODES.OK));
    
  } catch (error) {
    logger.error('Error fetching visitor views:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลประวัติการตรวจสอบโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectReviews = asyncHandler(async (req, res) => {
  try {
    // ใช้ getPaginationParams จาก pagination helper
    const pagination = getPaginationParams(req);
    const { page, limit, offset } = pagination;
    
    const projectId = req.query.projectId || '';
    const status = req.query.status || '';
    const adminId = req.query.adminId || '';
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT pr.review_id, pr.project_id, pr.admin_id, pr.status, pr.review_comment, pr.reviewed_at,
             p.title as project_title, p.type as project_type,
             u.username as admin_username, u.full_name as admin_full_name
      FROM project_reviews pr
      JOIN projects p ON pr.project_id = p.project_id
      JOIN users u ON pr.admin_id = u.user_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // เพิ่มการค้นหาตาม projectId ถ้ามี
    if (projectId) {
      query += ` AND pr.project_id = ?`;
      queryParams.push(projectId);
    }
    
    // เพิ่มการค้นหาตามสถานะ
    if (status) {
      query += ` AND pr.status = ?`;
      queryParams.push(status);
    }
    
    // เพิ่มการค้นหาตาม adminId
    if (adminId) {
      query += ` AND pr.admin_id = ?`;
      queryParams.push(adminId);
    }
    
    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    
    // ใช้ getPaginationInfo เพื่อรับข้อมูลการแบ่งหน้าที่สมบูรณ์
    const paginationInfo = getPaginationInfo(totalItems, page, limit);
    
    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY pr.reviewed_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // ดึงข้อมูลประวัติการตรวจสอบ
    const [reviews] = await pool.execute(query, queryParams);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedReviews = reviews.map(review => ({
      id: review.review_id,
      projectId: review.project_id,
      projectTitle: review.project_title,
      projectType: review.project_type,
      admin: {
        id: review.admin_id,
        username: review.admin_username,
        fullName: review.admin_full_name
      },
      status: review.status,
      comment: review.review_comment,
      reviewedAt: review.reviewed_at
    }));
    
    // ใช้ successResponse helper function พร้อม status code
    return res.status(STATUS_CODES.OK).json(successResponse({
      reviews: formattedReviews,
      pagination: paginationInfo
    }, 'Project reviews retrieved successfully', STATUS_CODES.OK));
    
  } catch (error) {
    logger.error('Error fetching project reviews:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลสถิติการใช้งานระบบทั้งหมด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSystemStats = asyncHandler(async (req, res) => {
  try {
    // จำนวนการเข้าสู่ระบบทั้งหมด
    const [totalLogins] = await pool.execute(`
      SELECT COUNT(*) as count FROM login_logs
    `);
    
    // จำนวนการเข้าสู่ระบบในแต่ละวัน (30 วันล่าสุด)
    const [loginsByDay] = await pool.execute(`
      SELECT 
        DATE(login_time) as date, 
        COUNT(*) as count 
      FROM login_logs 
      WHERE login_time > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY date 
      ORDER BY date
    `);
    
    // ใช้ formatToISODate เพื่อจัดรูปแบบวันที่
    const formattedLoginsByDay = loginsByDay.map(item => ({
      date: formatToISODate(item.date),
      count: item.count
    }));
    
    // จำนวนการเข้าชมผลงานทั้งหมด
    const [totalViews] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM visitor_views) + 
        (SELECT COUNT(*) FROM company_views) as count
    `);
    
    // จำนวนการเข้าชมผลงานในแต่ละวัน (30 วันล่าสุด)
    const [visitorViewsByDay] = await pool.execute(`
      SELECT 
        DATE(viewed_at) as date, 
        COUNT(*) as count 
      FROM visitor_views 
      WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY date 
      ORDER BY date
    `);
    
    const [companyViewsByDay] = await pool.execute(`
      SELECT 
        DATE(viewed_at) as date, 
        COUNT(*) as count 
      FROM company_views 
      WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY date 
      ORDER BY date
    `);
    
    // รวมข้อมูลการเข้าชมจากทั้ง visitor และ company
    const viewsByDay = [];
    const allDates = new Set();
    
    visitorViewsByDay.forEach(item => allDates.add(formatToISODate(item.date)));
    companyViewsByDay.forEach(item => allDates.add(formatToISODate(item.date)));
    
    Array.from(allDates).forEach(date => {
      const visitorCount = visitorViewsByDay.find(item => formatToISODate(item.date) === date)?.count || 0;
      const companyCount = companyViewsByDay.find(item => formatToISODate(item.date) === date)?.count || 0;
      
      viewsByDay.push({
        date,
        visitorCount,
        companyCount,
        totalCount: visitorCount + companyCount
      });
    });
    
    // เรียงลำดับตามวันที่
    viewsByDay.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // จำนวนโครงการที่อัปโหลดในแต่ละวัน (30 วันล่าสุด)
    const [projectsByDay] = await pool.execute(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count 
      FROM projects 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY date 
      ORDER BY date
    `);
    
    const formattedProjectsByDay = projectsByDay.map(item => ({
      date: formatToISODate(item.date),
      count: item.count
    }));
    
    // จำนวนผู้ใช้ที่สมัครในแต่ละวัน (30 วันล่าสุด)
    const [usersByDay] = await pool.execute(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count 
      FROM users 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY date 
      ORDER BY date
    `);
    
    const formattedUsersByDay = usersByDay.map(item => ({
      date: formatToISODate(item.date),
      count: item.count
    }));
    
    // จำนวนการตรวจสอบโครงการในแต่ละวัน (30 วันล่าสุด)
    const [reviewsByDay] = await pool.execute(`
      SELECT 
        DATE(reviewed_at) as date, 
        COUNT(*) as count,
        status
      FROM project_reviews 
      WHERE reviewed_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY date, status
      ORDER BY date
    `);
    
    const formattedReviewsByDay = reviewsByDay.map(item => ({
      date: formatToISODate(item.date),
      count: item.count,
      status: item.status
    }));
    
    // จำนวนการตรวจสอบแยกตามสถานะ
    const [reviewsByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM project_reviews
      GROUP BY status
    `);
    
    // ใช้ successResponse helper function พร้อม status code
    return res.status(STATUS_CODES.OK).json(successResponse({
      totalLogins: totalLogins[0].count,
      loginsByDay: formattedLoginsByDay,
      totalViews: totalViews[0].count,
      viewsByDay,
      projectsByDay: formattedProjectsByDay,
      usersByDay: formattedUsersByDay,
      reviewsByDay: formattedReviewsByDay,
      reviewsByStatus
    }, 'System statistics retrieved successfully', STATUS_CODES.OK));
    
  } catch (error) {
    logger.error('Error fetching system stats:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลของวันนี้และเปรียบเทียบกับค่าเฉลี่ยของ 7 วันที่ผ่านมา
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDailyStats = asyncHandler(async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // จำนวนการเข้าสู่ระบบวันนี้
    const [loginsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM login_logs
      WHERE login_time >= ?
    `, [today]);
    const loginsToday = loginsTodayResult[0].count;
    
    // จำนวนการเข้าสู่ระบบเฉลี่ย 7 วันที่ผ่านมา
    const [loginsAvgResult] = await pool.execute(`
      SELECT AVG(daily_count) as avg_count
      FROM (
        SELECT DATE(login_time) as login_date, COUNT(*) as daily_count
        FROM login_logs
        WHERE login_time BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ?
        GROUP BY login_date
      ) as daily_counts
    `, [today, today]);
    const loginsAvg = loginsAvgResult[0].avg_count || 0;
    
    // จำนวนการเข้าชมผลงานวันนี้
    const [visitorViewsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM visitor_views
      WHERE viewed_at >= ?
    `, [today]);
    const visitorViewsToday = visitorViewsTodayResult[0].count;
    
    const [companyViewsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM company_views
      WHERE viewed_at >= ?
    `, [today]);
    const companyViewsToday = companyViewsTodayResult[0].count;
    const viewsToday = visitorViewsToday + companyViewsToday;
    
    // จำนวนการเข้าชมผลงานเฉลี่ย 7 วันที่ผ่านมา
    const [viewsAvgResult] = await pool.execute(`
      SELECT AVG(daily_count) as avg_count
      FROM (
        SELECT DATE(viewed_at) as view_date, COUNT(*) as daily_count
        FROM (
          SELECT viewed_at FROM visitor_views WHERE viewed_at BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ?
          UNION ALL
          SELECT viewed_at FROM company_views WHERE viewed_at BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ?
        ) as all_views
        GROUP BY view_date
      ) as daily_counts
    `, [today, today, today, today]);
    const viewsAvg = viewsAvgResult[0].avg_count || 0;
    
    // จำนวนโครงการที่อัปโหลดวันนี้
    const [projectsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM projects
      WHERE created_at >= ?
    `, [today]);
    const projectsToday = projectsTodayResult[0].count;
    
    // จำนวนโครงการที่อัปโหลดเฉลี่ย 7 วันที่ผ่านมา
    const [projectsAvgResult] = await pool.execute(`
      SELECT AVG(daily_count) as avg_count
      FROM (
        SELECT DATE(created_at) as create_date, COUNT(*) as daily_count
        FROM projects
        WHERE created_at BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ?
        GROUP BY create_date
      ) as daily_counts
    `, [today, today]);
    const projectsAvg = projectsAvgResult[0].avg_count || 0;
    
    // จำนวนผู้ใช้ที่สมัครวันนี้
    const [usersTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= ?
    `, [today]);
    const usersToday = usersTodayResult[0].count;
    
    // จำนวนผู้ใช้ที่สมัครเฉลี่ย 7 วันที่ผ่านมา
    const [usersAvgResult] = await pool.execute(`
      SELECT AVG(daily_count) as avg_count
      FROM (
        SELECT DATE(created_at) as create_date, COUNT(*) as daily_count
        FROM users
        WHERE created_at BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ?
        GROUP BY create_date
      ) as daily_counts
    `, [today, today]);
    const usersAvg = usersAvgResult[0].avg_count || 0;
    
    // จำนวนการตรวจสอบโครงการวันนี้
    const [reviewsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count, status
      FROM project_reviews
      WHERE reviewed_at >= ?
      GROUP BY status
    `, [today]);
    
    const approvedToday = reviewsTodayResult.find(row => row.status === 'approved')?.count || 0;
    const rejectedToday = reviewsTodayResult.find(row => row.status === 'rejected')?.count || 0;
    const reviewsToday = approvedToday + rejectedToday;
    
    // จำนวนการตรวจสอบโครงการเฉลี่ย 7 วันที่ผ่านมา
    const [reviewsAvgResult] = await pool.execute(`
      SELECT AVG(daily_count) as avg_count
      FROM (
        SELECT DATE(reviewed_at) as review_date, COUNT(*) as daily_count
        FROM project_reviews
        WHERE reviewed_at BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ?
        GROUP BY review_date
      ) as daily_counts
    `, [today, today]);
    const reviewsAvg = reviewsAvgResult[0].avg_count || 0;
    
    // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
    const calculatePercentChange = (current, average) => {
      return average > 0 ? Math.round((current - average) / average * 100) : 100;
    };
    
    // ใช้ successResponse helper function พร้อม status code
    return res.status(STATUS_CODES.OK).json(successResponse({
      logins: {
        today: loginsToday,
        average: Math.round(loginsAvg * 10) / 10,
        percentChange: calculatePercentChange(loginsToday, loginsAvg)
      },
      views: {
        today: viewsToday,
        visitor: visitorViewsToday,
        company: companyViewsToday,
        average: Math.round(viewsAvg * 10) / 10,
        percentChange: calculatePercentChange(viewsToday, viewsAvg)
      },
      projects: {
        today: projectsToday,
        average: Math.round(projectsAvg * 10) / 10,
        percentChange: calculatePercentChange(projectsToday, projectsAvg)
      },
      users: {
        today: usersToday,
        average: Math.round(usersAvg * 10) / 10,
        percentChange: calculatePercentChange(usersToday, usersAvg)
      },
      reviews: {
        today: reviewsToday,
        approved: approvedToday,
        rejected: rejectedToday,
        average: Math.round(reviewsAvg * 10) / 10,
        percentChange: calculatePercentChange(reviewsToday, reviewsAvg)
      }
    }, 'Daily statistics retrieved successfully', STATUS_CODES.OK));
    
  } catch (error) {
    logger.error('Error fetching daily stats:', error);
    return handleServerError(res, error);
  }
});