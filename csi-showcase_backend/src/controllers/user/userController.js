// controllers/user/userController.js
import pool from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/passwordHelper.js';
import { isValidEmail, isValidUsername } from '../../utils/validationHelper.js';
import { formatToISODateTime } from '../../utils/dateHelper.js';
import { generateUniqueFilename, createDirectoryIfNotExists, deleteFile } from '../../utils/fileHelper.js';
import { getFileTypeFromMimetype } from '../../utils/fileHelper.js';
import { uploadProfile, handleMulterError, isProfileOwner } from '../../middleware/userMiddleware.js';
import { 
  successResponse, 
  errorResponse, 
  handleServerError, 
  notFoundResponse, 
  forbiddenResponse,
  validationErrorResponse
} from '../../utils/responseFormatter.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';
import { ERROR_MESSAGES, getErrorMessage } from '../../constants/errorMessages.js';
import { ROLES, isValidRole } from '../../constants/roles.js';
import { sendWelcomeEmail } from '../../services/emailService.js';
import logger from '../../config/logger.js';
import { beginTransaction, commitTransaction, rollbackTransaction } from '../../config/database.js';

/**
 * ลงทะเบียนผู้ใช้ใหม่
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const register = async (req, res) => {
  try {
    const { username, password, full_name, email } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !full_name || !email) {
      return validationErrorResponse(res, getErrorMessage('USER.REQUIRED_FIELDS_MISSING'));
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    if (!isValidUsername(username)) {
      return validationErrorResponse(res, getErrorMessage('USER.INVALID_USERNAME'));
    }

    if (!isValidEmail(email)) {
      return validationErrorResponse(res, getErrorMessage('USER.INVALID_EMAIL'));
    }

    if (password.length < 8) {
      return validationErrorResponse(res, getErrorMessage('USER.PASSWORD_TOO_SHORT'));
    }

    // ตรวจสอบความซ้ำซ้อนของ username และ email
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      const isDuplicateUsername = existingUsers.some(user => user.username === username);
      const isDuplicateEmail = existingUsers.some(user => user.email === email);

      if (isDuplicateUsername && isDuplicateEmail) {
        return res.status(STATUS_CODES.CONFLICT).json(
          errorResponse('Username and email are already in use', STATUS_CODES.CONFLICT)
        );
      } else if (isDuplicateUsername) {
        return res.status(STATUS_CODES.CONFLICT).json(
          errorResponse(getErrorMessage('AUTH.USERNAME_TAKEN'), STATUS_CODES.CONFLICT)
        );
      } else {
        return res.status(STATUS_CODES.CONFLICT).json(
          errorResponse(getErrorMessage('AUTH.EMAIL_TAKEN'), STATUS_CODES.CONFLICT)
        );
      }
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await hashPassword(password);

    // เพิ่มผู้ใช้ใหม่ (บทบาทเป็น student เสมอ)
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name, email, ROLES.STUDENT]
    );

    // ส่งอีเมลต้อนรับ
    await sendWelcomeEmail(email, username);

    // บันทึกล็อก
    logger.info(`User registered successfully: ${username} (ID: ${result.insertId})`);

    return res.status(STATUS_CODES.CREATED).json(
      successResponse(
        {
          id: result.insertId,
          username,
          fullName: full_name,
          email,
          role: ROLES.STUDENT,
        },
        'User registered successfully',
        STATUS_CODES.CREATED
      )
    );
  } catch (error) {
    logger.error('Error in user registration:', error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมด (เฉพาะ admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsers = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, 'Only admin can access all users');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const role = req.query.role || '';
    const search = req.query.search || '';

    // สร้าง query พื้นฐาน
    let query = `
      SELECT user_id, username, full_name, email, role, image, created_at
      FROM users
      WHERE 1=1
    `;

    const queryParams = [];

    // เพิ่มเงื่อนไขการค้นหา
    if (search) {
      query += ` AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // เพิ่มเงื่อนไขการค้นหาตามบทบาท
    if (role && isValidRole(role)) {
      query += ` AND role = ?`;
      queryParams.push(role);
    }

    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // ดึงข้อมูลผู้ใช้
    const [users] = await pool.execute(query, queryParams);

    // จัดรูปแบบข้อมูลผู้ใช้
    const formattedUsers = users.map(user => ({
      id: user.user_id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: formatToISODateTime(user.created_at)
    }));

    return res.json(
      successResponse(
        {
          users: formattedUsers,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
        'Users retrieved successfully'
      )
    );
  } catch (error) {
    logger.error('Error getting all users:', error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลผู้ใช้ตาม ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ตรวจสอบว่าสามารถเข้าถึงข้อมูลของผู้ใช้ได้หรือไม่
    if (req.user.id != userId && req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, 'You can only view your own profile or you need admin privileges');
    }

    // ดึงข้อมูลผู้ใช้
    const [users] = await pool.execute(
      'SELECT user_id, username, full_name, email, role, image, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }

    const user = users[0];

    // ดึงข้อมูลโครงการที่ผู้ใช้เป็นเจ้าของหรือมีส่วนร่วม
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.type, p.study_year, p.year, p.status, p.created_at,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      WHERE p.user_id = ?
      OR EXISTS (SELECT 1 FROM project_groups pg WHERE pg.project_id = p.project_id AND pg.user_id = ?)
      ORDER BY p.created_at DESC
    `, [userId, userId]);

    // จัดรูปแบบข้อมูลโครงการ
    const formattedProjects = projects.map(project => ({
      id: project.project_id,
      title: project.title,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      status: project.status,
      image: project.image || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`,
      createdAt: formatToISODateTime(project.created_at)
    }));

    return res.json(
      successResponse(
        {
          id: user.user_id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          image: user.image,
          createdAt: formatToISODateTime(user.created_at),
          projects: formattedProjects,
        },
        'User retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting user by ID (${req.params.userId}):`, error);
    return handleServerError(res, error);
  }
};

/**
 * อัปเดตข้อมูลผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ตรวจสอบว่าสามารถแก้ไขข้อมูลของผู้ใช้ได้หรือไม่
    if (req.user.id != userId && req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, 'You can only update your own profile or you need admin privileges');
    }

    const { full_name, email } = req.body;

    // ตรวจสอบความถูกต้องของอีเมล
    if (email && !isValidEmail(email)) {
      return validationErrorResponse(res, getErrorMessage('USER.INVALID_EMAIL'));
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }

    const user = users[0];

    // ตรวจสอบความซ้ำซ้อนของ email (กรณีเปลี่ยน email)
    if (email && email !== user.email) {
      const [existingEmail] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND user_id != ?',
        [email, userId]
      );

      if (existingEmail.length > 0) {
        return res.status(STATUS_CODES.CONFLICT).json(
          errorResponse(getErrorMessage('AUTH.EMAIL_TAKEN'), STATUS_CODES.CONFLICT)
        );
      }
    }

    // อัปเดตข้อมูลผู้ใช้
    await pool.execute(
      'UPDATE users SET full_name = ?, email = ? WHERE user_id = ?',
      [full_name || user.full_name, email || user.email, userId]
    );

    // บันทึกล็อก
    logger.info(`User updated successfully: ID ${userId}`);

    return res.json(
      successResponse(
        {
          id: parseInt(userId),
          username: user.username,
          fullName: full_name || user.full_name,
          email: email || user.email,
          role: user.role,
        },
        'User updated successfully'
      )
    );
  } catch (error) {
    logger.error(`Error updating user (ID: ${req.params.userId}):`, error);
    return handleServerError(res, error);
  }
};

/**
 * อัปโหลดรูปโปรไฟล์
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ตรวจสอบว่าสามารถแก้ไขข้อมูลของผู้ใช้ได้หรือไม่
    if (req.user.id != userId && req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, 'You can only upload profile image for your own account or you need admin privileges');
    }

    // ตรวจสอบว่ามีไฟล์อัปโหลดหรือไม่
    if (!req.file) {
      return validationErrorResponse(res, getErrorMessage('FILE.REQUIRED'));
    }

    // ตรวจสอบประเภทไฟล์
    const fileType = getFileTypeFromMimetype(req.file.mimetype);
    if (fileType !== 'image') {
      // ลบไฟล์ที่ไม่ถูกต้อง
      deleteFile(req.file.path);
      return validationErrorResponse(res, getErrorMessage('FILE.INVALID_TYPE'));
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      // ลบไฟล์เนื่องจากไม่พบผู้ใช้
      deleteFile(req.file.path);
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }

    const user = users[0];

    // ลบรูปโปรไฟล์เดิม (ถ้ามี)
    if (user.image && user.image.startsWith('uploads/profiles/')) {
      deleteFile(user.image);
    }

    // อัปเดตรูปโปรไฟล์
    await pool.execute(
      'UPDATE users SET image = ? WHERE user_id = ?',
      [req.file.path, userId]
    );

    // บันทึกล็อก
    logger.info(`Profile image uploaded for user ID ${userId}: ${req.file.path}`);

    return res.json(
      successResponse(
        {
          id: parseInt(userId),
          image: req.file.path,
        },
        'Profile image uploaded successfully'
      )
    );
  } catch (error) {
    // ลบไฟล์ที่อัปโหลดหากเกิดข้อผิดพลาด
    if (req.file) {
      deleteFile(req.file.path);
    }

    logger.error(`Error uploading profile image for user ID ${req.params.userId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * เปลี่ยนรหัสผ่าน
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ตรวจสอบว่าสามารถแก้ไขข้อมูลของผู้ใช้ได้หรือไม่
    if (req.user.id != userId && req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, 'You can only change password for your own account or you need admin privileges');
    }

    const { currentPassword, newPassword } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!newPassword) {
      return validationErrorResponse(res, 'New password is required');
    }

    if (newPassword.length < 8) {
      return validationErrorResponse(res, getErrorMessage('USER.PASSWORD_TOO_SHORT'));
    }

    // กรณีผู้ใช้ทั่วไป (ไม่ใช่ admin) ต้องระบุรหัสผ่านปัจจุบัน
    if (req.user.id == userId && !currentPassword) {
      return validationErrorResponse(res, 'Current password is required');
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }

    const user = users[0];

    // กรณีผู้ใช้ทั่วไป (ไม่ใช่ admin) ต้องตรวจสอบรหัสผ่านปัจจุบัน
    if (req.user.id == userId) {
      const isMatch = await comparePassword(currentPassword, user.password_hash);

      if (!isMatch) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json(
          errorResponse(getErrorMessage('AUTH.CURRENT_PASSWORD_INCORRECT'), STATUS_CODES.UNAUTHORIZED)
        );
      }
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await hashPassword(newPassword);

    // อัปเดตรหัสผ่าน
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );

    // บันทึกล็อก
    logger.info(`Password changed for user ID ${userId}`);

    return res.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    logger.error(`Error changing password for user ID ${req.params.userId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * เปลี่ยนบทบาทของผู้ใช้ (เฉพาะ admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const changeUserRole = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, 'Only admin can change user roles');
    }

    const userId = req.params.userId;
    const { role } = req.body;

    // ตรวจสอบว่าบทบาทถูกต้องหรือไม่
    if (!role || !isValidRole(role)) {
      return validationErrorResponse(res, getErrorMessage('USER.INVALID_ROLE'));
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }

    // อัปเดตบทบาท
    await pool.execute(
      'UPDATE users SET role = ? WHERE user_id = ?',
      [role, userId]
    );

    // บันทึกล็อก
    logger.info(`Role changed for user ID ${userId} to ${role}`);

    return res.json(
      successResponse(
        {
          id: parseInt(userId),
          role,
        },
        'User role changed successfully'
      )
    );
  } catch (error) {
    logger.error(`Error changing role for user ID ${req.params.userId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * ลบผู้ใช้ (เฉพาะ admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteUser = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, 'Only admin can delete users');
    }

    const userId = req.params.userId;

    // ตรวจสอบว่าไม่ได้พยายามลบตัวเอง
    if (req.user.id == userId) {
      return validationErrorResponse(res, getErrorMessage('USER.DELETE_SELF_FORBIDDEN'));
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }

    const user = users[0];

    // เริ่มต้น transaction
    const connection = await beginTransaction();

    try {
      // ลบรูปโปรไฟล์ (ถ้ามี)
      if (user.image && user.image.startsWith('uploads/profiles/')) {
        deleteFile(user.image);
      }

      // ลบข้อมูลผู้ใช้จากตาราง project_groups
      await connection.execute(
        'DELETE FROM project_groups WHERE user_id = ?',
        [userId]
      );

      // ลบข้อมูลประวัติการเข้าสู่ระบบ
      await connection.execute(
        'DELETE FROM login_logs WHERE user_id = ?',
        [userId]
      );

      // ลบข้อมูลการแจ้งเตือน
      await connection.execute(
        'DELETE FROM notifications WHERE user_id = ?',
        [userId]
      );

      // ลบข้อมูลการตรวจสอบโครงการ
      await connection.execute(
        'DELETE FROM project_reviews WHERE admin_id = ?',
        [userId]
      );

      // ลบข้อมูลผู้ใช้
      await connection.execute(
        'DELETE FROM users WHERE user_id = ?',
        [userId]
      );

      // Commit transaction
      await commitTransaction(connection);

      // บันทึกล็อก
      logger.info(`User deleted: ${user.username} (ID: ${userId})`);

      return res.json(successResponse(null, 'User deleted successfully'));
    } catch (error) {
      // Rollback transaction หากเกิดข้อผิดพลาด
      await rollbackTransaction(connection);
      throw error;
    }
  } catch (error) {
    logger.error(`Error deleting user ID ${req.params.userId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงประวัติการเข้าสู่ระบบของผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserLoginHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ตรวจสอบว่าสามารถเข้าถึงข้อมูลของผู้ใช้ได้หรือไม่
    if (req.user.id != userId && req.user.role !== 'admin') {
      return forbiddenResponse(res, 'You can only view your own login history or you need admin privileges');
    }

    const limit = parseInt(req.query.limit) || 10;

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }

    // ดึงข้อมูลประวัติการเข้าสู่ระบบ
    const [logs] = await pool.execute(
      'SELECT * FROM login_logs WHERE user_id = ? ORDER BY login_time DESC LIMIT ?',
      [userId, limit]
    );

    const formattedLogs = logs.map(log => ({
      id: log.log_id,
      time: formatToISODateTime(log.login_time),
      ipAddress: log.ip_address,
      device: log.device_type,
      os: log.os,
      browser: log.browser,
      userAgent: log.user_agent
    }));

    return res.json(
      successResponse(
        formattedLogs,
        'Login history retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting login history for user ID ${req.params.userId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงโครงการที่ผู้ใช้มีส่วนร่วม
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ตรวจสอบว่าสามารถเข้าถึงข้อมูลของผู้ใช้ได้หรือไม่
    if (req.user.id != userId && req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, 'You can only view your own projects or you need admin privileges');
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }

    // ดึงข้อมูลโครงการที่ผู้ใช้เป็นเจ้าของ
    const [ownedProjects] = await pool.execute(`
      SELECT p.*, 
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    // ดึงข้อมูลโครงการที่ผู้ใช้มีส่วนร่วม (แต่ไม่ได้เป็นเจ้าของหลัก)
    const [contributedProjects] = await pool.execute(`
      SELECT p.*, 
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      JOIN project_groups pg ON p.project_id = pg.project_id
      WHERE pg.user_id = ? AND p.user_id != ?
      ORDER BY p.created_at DESC
    `, [userId, userId]);

    // จัดรูปแบบข้อมูลโครงการ
    const formatProject = project => ({
      id: project.project_id,
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      status: project.status,
      image: project.image || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`,
      createdAt: formatToISODateTime(project.created_at)
    });

    return res.json(
      successResponse(
        {
          ownedProjects: ownedProjects.map(formatProject),
          contributedProjects: contributedProjects.map(formatProject),
        },
        'User projects retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting projects for user ID ${req.params.userId}:`, error);
    return handleServerError(res, error);
  }
};

// Export the uploadProfile middleware from userMiddleware
export { uploadProfile };