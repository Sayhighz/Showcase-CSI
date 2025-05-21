// controllers/admin/adminProjectController.js
import pool, { beginTransaction, commitTransaction, rollbackTransaction } from '../../config/database.js';
import logger from '../../config/logger.js';
import { successResponse, errorResponse, handleServerError, notFoundResponse, forbiddenResponse, validationErrorResponse } from '../../utils/responseFormatter.js';
import { PROJECT_STATUSES, PROJECT_TYPES, isValidStatus, isValidType } from '../../constants/projectStatuses.js';
import { getPaginationParams, getPaginationInfo } from '../../constants/pagination.js';
import { formatToISODateTime } from '../../utils/dateHelper.js';
import { ERROR_MESSAGES, getErrorMessage } from '../../constants/errorMessages.js';
import projectService from '../../services/projectService.js';
import notificationService from '../../services/notificationService.js';
import storageService from '../../services/storageService.js';
import { ROLES, hasPermission } from '../../constants/roles.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';

/**
 * ดึงข้อมูลโครงการทั้งหมดสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllProjects = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(STATUS_CODES.FORBIDDEN).json(
        errorResponse(getErrorMessage('AUTH.ADMIN_REQUIRED'), STATUS_CODES.FORBIDDEN)
      );
    }
    
    // รับพารามิเตอร์การแบ่งหน้าและตัวกรอง
    const pagination = getPaginationParams(req);
    const { status, type, year, search: searchTerm } = req.query;
    
    // สร้างตัวกรอง
    const filters = {
      status: status && isValidStatus(status) ? status : null,
      type: type && isValidType(type) ? type : null,
      year: year || null,
      search: searchTerm || null
    };
    
    // ดึงข้อมูลโครงการผ่าน service
    const result = await projectService.getAllProjects(filters, pagination);
    
    // ส่งข้อมูลกลับไปยัง client
    return res.status(STATUS_CODES.OK).json(successResponse(
      result,
      'Projects retrieved successfully',
      STATUS_CODES.OK
    ));
    
  } catch (error) {
    logger.error('Error getting all projects:', error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลโครงการที่รอการอนุมัติสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPendingProjects = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
    
    // รับพารามิเตอร์การแบ่งหน้า
    const pagination = getPaginationParams(req);
    
    // สร้างตัวกรอง
    const filters = {
      status: PROJECT_STATUSES.PENDING
    };
    
    // ดึงข้อมูลโครงการผ่าน service
    const result = await projectService.getAllProjects(filters, pagination);
    
    // ส่งข้อมูลกลับไปยัง client
    return res.status(STATUS_CODES.OK).json(successResponse(
      result,
      'Pending projects retrieved successfully',
      STATUS_CODES.OK
    ));
    
  } catch (error) {
    logger.error('Error getting pending projects:', error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงรายละเอียดโครงการที่ระบุสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
    
    // ตัวเลือกเพิ่มเติมสำหรับการดึงข้อมูล
    const options = {
      includeReviews: true
    };
    
    // ดึงข้อมูลโครงการผ่าน service
    const project = await projectService.getProjectById(projectId, options);
    
    if (!project) {
      return notFoundResponse(res, getErrorMessage('PROJECT.NOT_FOUND'));
    }
    
    // ส่งข้อมูลกลับไปยัง client
    return res.status(STATUS_CODES.OK).json(successResponse(
      project,
      'Project details retrieved successfully',
      STATUS_CODES.OK
    ));
    
  } catch (error) {
    logger.error(`Error getting project details for project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  }
};

// เพิ่ม retry mechanism ก่อน
const executeWithRetryInTransaction = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const result = await operation(connection);
      
      await connection.commit();
      return result;
      
    } catch (error) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        logger.error('Rollback error:', rollbackError);
      }
      
      if (error.code === 'ER_LOCK_WAIT_TIMEOUT' && attempt < maxRetries) {
        // Exponential backoff: 200ms, 400ms, 800ms
        const delay = 200 * Math.pow(2, attempt - 1);
        logger.warn(`Lock timeout attempt ${attempt}/${maxRetries}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    } finally {
      connection.release();
    }
  }
 };
 
 /**
 * อนุมัติหรือปฏิเสธโครงการสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 export const reviewProject = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
 
    const { projectId } = req.params;
    const { status, comment } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
 
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!projectId || !status) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse('Project ID and status are required', STATUS_CODES.BAD_REQUEST)
      );
    }
 
    // ตรวจสอบสถานะที่ถูกต้อง
    if (!isValidStatus(status)) {
      return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json(
        errorResponse(getErrorMessage('PROJECT.INVALID_STATUS'), STATUS_CODES.UNPROCESSABLE_ENTITY)
      );
    }
 
    // ตรวจสอบว่าโครงการมีอยู่จริงและดึงข้อมูลเบื้องต้น (ไม่ล็อก)
    const [currentProject] = await pool.execute(`
      SELECT p.*, u.user_id, u.username, u.full_name, u.email 
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.project_id = ?
    `, [projectId]);
 
    if (currentProject.length === 0) {
      return notFoundResponse(res, getErrorMessage('PROJECT.NOT_FOUND'));
    }
 
    const project = currentProject[0];
    const oldStatus = project.status;
 
    // ตรวจสอบว่าสถานะใหม่แตกต่างจากสถานะปัจจุบันหรือไม่
    if (oldStatus === status) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse(`Project is already ${status}`, STATUS_CODES.BAD_REQUEST)
      );
    }
 
    // Execute transaction with retry mechanism
    const transactionResult = await executeWithRetryInTransaction(async (connection) => {
      // อัปเดตสถานะโครงการ
      const [updateResult] = await connection.execute(`
        UPDATE projects 
        SET status = ?, updated_at = NOW() 
        WHERE project_id = ?
      `, [status, projectId]);
 
      if (updateResult.affectedRows === 0) {
        throw new Error('Failed to update project status');
      }
 
      // บันทึกประวัติการตรวจสอบ
      const [reviewResult] = await connection.execute(`
        INSERT INTO project_reviews (project_id, admin_id, status, review_comment, reviewed_at) 
        VALUES (?, ?, ?, ?, NOW())
      `, [projectId, req.user.id, status, comment || null]);
 
      return {
        reviewId: reviewResult.insertId,
        updatedRows: updateResult.affectedRows
      };
    });
 
    logger.info(`Project ${projectId} reviewed successfully: ${status}`);
 
    // ========== Post-transaction operations (ไม่กระทบ main flow) ==========
    
    // ใช้ setImmediate เพื่อให้ response ออกไปก่อน แล้วค่อยทำงานเหล่านี้
    setImmediate(() => {
      // 1. บันทึกการเปลี่ยนแปลงสถานะในประวัติ
      notificationService.logProjectChange(
        projectId,
        'updated',
        'status',
        oldStatus,
        status,
        req.user.id,
        `Admin review: ${comment || 'No comment provided'}`,
        ipAddress,
        userAgent
      ).catch(error => {
        logger.error('Error logging project change:', error);
      });
 
      // 2. แจ้งเตือนผู้ใช้เกี่ยวกับการตรวจสอบ
      notificationService.notifyProjectReview(
        project.user_id,
        projectId,
        project.title,
        status,
        comment || ''
      ).catch(error => {
        logger.error('Error sending notification:', error);
      });
 
      // 3. ถ้าโครงการได้รับการอนุมัติ ให้เพิ่มการนับจำนวนการดู
      if (status === PROJECT_STATUSES.APPROVED) {
        pool.execute(`
          UPDATE projects 
          SET views_count = COALESCE(views_count, 0)
          WHERE project_id = ?
        `, [projectId]).catch(error => {
          logger.warn('Error initializing view count:', error);
        });
      }
    });
 
    // ========== ดึงข้อมูลเพิ่มเติมสำหรับ response ==========
    
    let reviewData = null;
    try {
      const [newReview] = await pool.execute(`
        SELECT r.*, a.username as admin_username, a.full_name as admin_name
        FROM project_reviews r
        JOIN users a ON r.admin_id = a.user_id
        WHERE r.review_id = ?
      `, [transactionResult.reviewId]);
 
      reviewData = newReview.length > 0 ? newReview[0] : null;
    } catch (reviewFetchError) {
      logger.warn('Error fetching review data:', reviewFetchError);
    }
 
    // ========== ส่งการตอบกลับ ==========
    return res.json(successResponse({
      projectId: parseInt(projectId),
      oldStatus,
      newStatus: status,
      comment: comment || null,
      reviewedAt: formatToISODateTime(new Date()),
      reviewId: transactionResult.reviewId,
      reviewer: {
        id: req.user.id,
        username: req.user.username,
        fullName: req.user.fullName
      },
      project: {
        id: project.project_id,
        title: project.title,
        owner: {
          id: project.user_id,
          username: project.username,
          fullName: project.full_name
        }
      },
      review: reviewData
    }, `Project ${status === PROJECT_STATUSES.APPROVED ? 'approved' : status === PROJECT_STATUSES.REJECTED ? 'rejected' : 'status updated'} successfully`));
 
  } catch (error) {
    logger.error(`Error reviewing project ${req.params.projectId}:`, error);
    
    // ให้ error message ที่เข้าใจง่ายสำหรับ lock timeout
    if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      return res.status(429).json(
        errorResponse('The system is currently busy. Please try again in a moment.', 429)
      );
    }
    
    return handleServerError(res, error);
  }
 };

/**
 * ลบโครงการสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteProject = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }

    const { projectId } = req.params;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!projectId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse('Project ID is required', STATUS_CODES.BAD_REQUEST)
      );
    }

    // เริ่มการทำงานกับฐานข้อมูล
    const connection = await beginTransaction();

    try {
      // ดึงข้อมูลไฟล์ที่เกี่ยวข้องกับโครงการเพื่อลบจากระบบไฟล์
      const [files] = await connection.execute(
        `SELECT file_path FROM project_files WHERE project_id = ?`,
        [projectId]
      );

      // ลบข้อมูลที่เกี่ยวข้องในฐานข้อมูล (foreign key constraints จะจัดการลบข้อมูลที่เกี่ยวข้องอื่นๆ)
      const [result] = await connection.execute(
        `DELETE FROM projects WHERE project_id = ?`,
        [projectId]
      );

      // ตรวจสอบว่ามีการลบข้อมูลหรือไม่
      if (result.affectedRows === 0) {
        await rollbackTransaction(connection);
        return notFoundResponse(res, getErrorMessage('PROJECT.NOT_FOUND'));
      }

      // ยืนยัน transaction
      await commitTransaction(connection);

      // ลบไฟล์จากระบบไฟล์
      for (const file of files) {
        try {
          await storageService.deleteFile(file.file_path);
        } catch (fileDeleteError) {
          logger.error(`Error deleting file ${file.file_path}:`, fileDeleteError);
          // ไม่จำเป็นต้องล้มเหลวทั้งกระบวนการหากการลบไฟล์ล้มเหลว
        }
      }

      // ส่งการตอบกลับ
      return res.json(successResponse(
        { projectId },
        'Project deleted successfully'
      ));

    } catch (error) {
      // ยกเลิก transaction หากมีข้อผิดพลาด
      await rollbackTransaction(connection);
      throw error;
    }
  } catch (error) {
    logger.error(`Error deleting project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * อัปเดตโครงการสำหรับผู้ดูแลระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title, description, type, study_year, year, semester, visibility, status
    } = req.body;
    
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
    
    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [projects] = await pool.execute(`
      SELECT * FROM projects
      WHERE project_id = ?
    `, [projectId]);
    
    if (projects.length === 0) {
      return notFoundResponse(res, getErrorMessage('PROJECT.NOT_FOUND'));
    }
    
    const project = projects[0];
    
    // ตรวจสอบความถูกต้องของข้อมูล
    if (type && !isValidType(type)) {
      return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json(
        errorResponse(getErrorMessage('PROJECT.INVALID_TYPE'), STATUS_CODES.UNPROCESSABLE_ENTITY)
      );
    }

    if (status && !isValidStatus(status)) {
      return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json(
        errorResponse(getErrorMessage('PROJECT.INVALID_STATUS'), STATUS_CODES.UNPROCESSABLE_ENTITY)
      );
    }
    
    // เริ่ม transaction
    const connection = await beginTransaction();
    
    try {
      // อัปเดตข้อมูลหลักของโครงการ (ไม่รวม tags)
      await connection.execute(`
        UPDATE projects
        SET title = ?, description = ?, type = ?, study_year = ?, year = ?,
            semester = ?, visibility = ?, status = ?, updated_at = NOW()
        WHERE project_id = ?
      `, [
        title || project.title,
        description || project.description,
        type || project.type,
        study_year || project.study_year,
        year || project.year,
        semester || project.semester,
        visibility === undefined ? project.visibility : visibility,
        status || project.status,
        projectId
      ]);
      
      // บันทึกประวัติการแก้ไข
      await connection.execute(`
        INSERT INTO project_reviews (project_id, admin_id, status, review_comment)
        VALUES (?, ?, ?, ?)
      `, [projectId, req.user.id, 'updated', 'Project updated by admin']);
      
      // Commit transaction
      await commitTransaction(connection);
      
      return res.status(STATUS_CODES.OK).json(successResponse({
        projectId,
        title: title || project.title,
        updatedAt: formatToISODateTime(new Date())
      }, 'Project updated successfully', STATUS_CODES.OK));
    } catch (error) {
      // Rollback หากเกิดข้อผิดพลาด
      await rollbackTransaction(connection);
      throw error;
    }
  } catch (error) {
    logger.error(`Error updating project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลประวัติการตรวจสอบโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
    
    // ดึงข้อมูลประวัติการตรวจสอบ
    const [reviews] = await pool.execute(`
      SELECT r.*, a.username as admin_username, a.full_name as admin_name
      FROM project_reviews r
      LEFT JOIN users a ON r.admin_id = a.user_id
      WHERE r.project_id = ?
      ORDER BY r.reviewed_at DESC
    `, [projectId]);
    
    return res.status(STATUS_CODES.OK).json(successResponse(reviews, 'Project reviews retrieved successfully', STATUS_CODES.OK));
  } catch (error) {
    logger.error(`Error getting reviews for project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลสถิติการตรวจสอบโครงการของแอดมิน
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAdminReviewStats = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
    
    // ดึงข้อมูลสถิติการตรวจสอบโครงการทั้งหมด
    const [totalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_count
      FROM project_reviews
    `, [PROJECT_STATUSES.APPROVED, PROJECT_STATUSES.REJECTED, PROJECT_STATUSES.PENDING]);
    
    // ดึงข้อมูลสถิติการตรวจสอบโครงการของแอดมินแต่ละคน
    const [adminStats] = await pool.execute(`
      SELECT 
        a.user_id, a.username, a.full_name,
        COUNT(r.review_id) as review_count,
        SUM(CASE WHEN r.status = ? THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN r.status = ? THEN 1 ELSE 0 END) as rejected_count
      FROM users a
      LEFT JOIN project_reviews r ON a.user_id = r.admin_id
      WHERE a.role = ?
      GROUP BY a.user_id
      ORDER BY review_count DESC
    `, [PROJECT_STATUSES.APPROVED, PROJECT_STATUSES.REJECTED, ROLES.ADMIN]);
    
    // ดึงข้อมูลสถิติการตรวจสอบโครงการตามช่วงเวลา (ข้อมูล 6 เดือนล่าสุด)
    const [timeStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(reviewed_at, '%Y-%m') as month,
        COUNT(*) as review_count,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as rejected_count
      FROM project_reviews
      WHERE reviewed_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `, [PROJECT_STATUSES.APPROVED, PROJECT_STATUSES.REJECTED]);
    
    // รวมข้อมูลทั้งหมดและส่งกลับ
    return res.status(STATUS_CODES.OK).json(successResponse({
      overall: totalStats[0],
      admin_stats: adminStats,
      time_stats: timeStats
    }, 'Admin review statistics retrieved successfully', STATUS_CODES.OK));
  } catch (error) {
    logger.error('Error getting admin review stats:', error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลสถิติโครงการสำหรับแดชบอร์ด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectStats = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
    
    // ดึงจำนวนโครงการทั้งหมดแยกตามสถานะและประเภท
    const [projectCounts] = await pool.execute(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN type = ? THEN 1 ELSE 0 END) as academic_count,
        SUM(CASE WHEN type = ? THEN 1 ELSE 0 END) as coursework_count,
        SUM(CASE WHEN type = ? THEN 1 ELSE 0 END) as competition_count
      FROM projects
    `, [
      PROJECT_STATUSES.APPROVED, 
      PROJECT_STATUSES.PENDING, 
      PROJECT_STATUSES.REJECTED,
      PROJECT_TYPES.ACADEMIC,
      PROJECT_TYPES.COURSEWORK,
      PROJECT_TYPES.COMPETITION
    ]);
    
    // ดึงข้อมูลโครงการที่มีการเข้าชมมากที่สุด - ไม่มีการอ้างอิงถึง project_files
    const [topProjects] = await pool.execute(`
      SELECT 
        p.project_id, p.title, p.type, p.views_count,
        u.username, u.full_name
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = ?
      ORDER BY p.views_count DESC
      LIMIT 10
    `, [PROJECT_STATUSES.APPROVED]);
    
    // ดึงข้อมูลโครงการที่อัปโหลดล่าสุด
    const [recentProjects] = await pool.execute(`
      SELECT 
        p.project_id, p.title, p.type, p.created_at, p.status,
        u.username, u.full_name
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    
    // ดึงข้อมูลจำนวนโครงการที่อัปโหลดในแต่ละเดือน (ข้อมูล 12 เดือนล่าสุด)
    const [monthlyUploads] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as project_count,
        SUM(CASE WHEN type = ? THEN 1 ELSE 0 END) as academic_count,
        SUM(CASE WHEN type = ? THEN 1 ELSE 0 END) as coursework_count,
        SUM(CASE WHEN type = ? THEN 1 ELSE 0 END) as competition_count
      FROM projects
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `, [PROJECT_TYPES.ACADEMIC, PROJECT_TYPES.COURSEWORK, PROJECT_TYPES.COMPETITION]);
    
    // ดึงข้อมูลจำนวนการเข้าชมโครงการในแต่ละเดือน (ข้อมูล 12 เดือนล่าสุด) - เฉพาะจาก visitor_views
    const [monthlyViews] = await pool.execute(`
      SELECT 
        DATE_FORMAT(viewed_at, '%Y-%m') as month,
        COUNT(*) as view_count
      FROM visitor_views
      WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);
    
    // เพิ่ม default cover_image สำหรับโครงการที่มีการเข้าชมมากที่สุด
    const topProjectsWithImage = topProjects.map(project => ({
      ...project,
    }));
    
    // รวมข้อมูลและส่งกลับ
    return res.status(STATUS_CODES.OK).json(successResponse({
      project_counts: projectCounts[0],
      top_projects: topProjectsWithImage,
      recent_projects: recentProjects,
      monthly_uploads: monthlyUploads,
      monthly_views: monthlyViews
    }, 'Project statistics retrieved successfully', STATUS_CODES.OK));
  } catch (error) {
    logger.error('Error getting project stats:', error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลการตรวจสอบโครงการทั้งหมด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllProjectReviews = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }
    
    // รับพารามิเตอร์การแบ่งหน้า
    const { page, limit } = getPaginationParams(req);
    const offset = (page - 1) * limit;
    
    // ดึงข้อมูลการตรวจสอบโครงการทั้งหมด
    const [reviews] = await pool.execute(`
      SELECT 
        r.review_id, r.project_id, r.admin_id, r.status, r.review_comment, r.reviewed_at,
        p.title as project_title, p.type as project_type,
        a.username as admin_username, a.full_name as admin_name
      FROM project_reviews r
      JOIN projects p ON r.project_id = p.project_id
      JOIN users a ON r.admin_id = a.user_id
      ORDER BY r.reviewed_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    // ดึงจำนวนทั้งหมดของผลลัพธ์
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM project_reviews
    `);
    
    const totalItems = countResult[0].total;
    const paginationInfo = getPaginationInfo(totalItems, page, limit);
    
    return res.status(STATUS_CODES.OK).json(successResponse({
      reviews,
      pagination: paginationInfo
    }, 'Project reviews retrieved successfully', STATUS_CODES.OK));
  } catch (error) {
    logger.error('Error getting all project reviews:', error);
    return handleServerError(res, error);
  }
};