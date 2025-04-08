// adminUserController.js
import pool, { beginTransaction, commitTransaction, rollbackTransaction } from '../../config/database.js';
import { 
  handleServerError, 
  notFoundResponse, 
  successResponse, 
  forbiddenResponse, 
  validationErrorResponse 
} from '../../utils/responseFormatter.js';
import { deleteFile } from '../../utils/fileHelper.js';
import { sendWelcomeEmail } from '../../services/emailService.js';
import { hashPassword } from '../../utils/passwordHelper.js';
import { getPaginationParams, getPaginationInfo } from '../../constants/pagination.js';
import { isValidEmail, isValidUsername } from '../../utils/validationHelper.js';
import { ERROR_MESSAGES, getErrorMessage } from '../../constants/errorMessages.js';
import { isValidRole, ROLES } from '../../constants/roles.js';
import logger from '../../config/logger.js';
import { asyncHandler } from '../../middleware/loggerMiddleware.js';
import { uploadProfileImage } from '../common/uploadController.js';

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  let connection;

  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== ROLES.ADMIN) {
      return forbiddenResponse(res, getErrorMessage('AUTH.ADMIN_REQUIRED'));
    }

    // ใช้ utility function สำหรับการแบ่งหน้า
    const pagination = getPaginationParams(req);
    
    // Prepare query parameters
    const queryParams = [];
    const conditions = [];

    // Role filter
    const role = req.query.role ? String(req.query.role).trim() : null;
    if (role && isValidRole(role)) {
      conditions.push('role = ?');
      queryParams.push(role);
    }

    // Search filter
    const search = req.query.search ? String(req.query.search).trim() : null;
    if (search) {
      conditions.push('(username LIKE ? OR full_name LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Construct WHERE clause
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    // เริ่ม transaction
    connection = await beginTransaction();

    // นับจำนวนทั้งหมด
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM users 
      ${whereClause}
    `, queryParams);
    
    const totalItems = countResult[0].total;

    // ดึงข้อมูลผู้ใช้ตามการแบ่งหน้า - ใช้ค่า LIMIT และ OFFSET โดยตรงในคำสั่ง SQL
    const [users] = await connection.execute(`
      SELECT 
        user_id, 
        username, 
        full_name, 
        email, 
        role, 
        image, 
        created_at,
        (
          SELECT COUNT(*) 
          FROM projects 
          WHERE user_id = users.user_id
        ) as project_count
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${pagination.limit} OFFSET ${pagination.offset}
    `, queryParams);

    // Commit transaction
    await commitTransaction(connection);

    // จัดรูปแบบข้อมูลการแบ่งหน้า
    const paginationInfo = getPaginationInfo(totalItems, pagination.page, pagination.limit);

    // ส่งข้อมูลกลับ
    return res.json(successResponse({
      users: users.map(user => ({
        ...user,
        project_count: Number(user.project_count)
      })),
      pagination: paginationInfo
    }, 'Users retrieved successfully'));
    
  } catch (error) {
    // Rollback transaction ถ้ามีการเริ่มต้น
    if (connection) {
      await rollbackTransaction(connection);
    }

    logger.error('Error in getAllUsers:', error);
    return handleServerError(res, error);
  }
});

/**
 * สร้างผู้ใช้ใหม่
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createUser = asyncHandler(async (req, res) => {
  let connection = null;
  
  try {
    const { 
      username, 
      password, 
      full_name, 
      email, 
      role = ROLES.STUDENT 
    } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !full_name || !email) {
      return validationErrorResponse(res, 
        getErrorMessage('USER.REQUIRED_FIELDS_MISSING'),
        {
          username: username ? null : 'Username is required',
          password: password ? null : 'Password is required',
          full_name: full_name ? null : 'Full name is required',
          email: email ? null : 'Email is required'
        }
      );
    }
    
    // ตรวจสอบความซ้ำซ้อนของ username และ email โดยใช้ pool แทน connection
    const [existingUsers] = await pool.execute(`
      SELECT * FROM users 
      WHERE username = ? OR email = ?
    `, [username, email]);
    
    if (existingUsers.length > 0) {
      const isDuplicateUsername = existingUsers.some(user => user.username === username);
      const isDuplicateEmail = existingUsers.some(user => user.email === email);
      
      if (isDuplicateUsername && isDuplicateEmail) {
        return validationErrorResponse(res, getErrorMessage('AUTH.USERNAME_TAKEN') + ' and ' + getErrorMessage('AUTH.EMAIL_TAKEN'));
      } else if (isDuplicateUsername) {
        return validationErrorResponse(res, getErrorMessage('AUTH.USERNAME_TAKEN'));
      } else {
        return validationErrorResponse(res, getErrorMessage('AUTH.EMAIL_TAKEN'));
      }
    }
    
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await hashPassword(password);
    
    // ลองใช้ pool แทน connection เพื่อหลีกเลี่ยงปัญหา transaction
    // เพิ่มผู้ใช้ใหม่
    const [result] = await pool.execute(`
      INSERT INTO users 
      (username, password_hash, full_name, email, role) 
      VALUES (?, ?, ?, ?, ?)
    `, [username, hashedPassword, full_name, email, role]);
    
    const userId = result.insertId;
    
    // อัปโหลดรูปโปรไฟล์ (ถ้ามี)
    let profileImagePath = null;
    if (req.file) {
      // บันทึกเส้นทางของไฟล์
      profileImagePath = req.file.path;
      
      // อัปเดตเส้นทางรูปภาพในฐานข้อมูล
      await pool.execute(`
        UPDATE users SET image = ? WHERE user_id = ?
      `, [profileImagePath, userId]);
    }
    
    // ส่งอีเมลต้อนรับ
    try {
      await sendWelcomeEmail(email, username);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // ดำเนินการต่อถึงแม้จะส่งอีเมลไม่สำเร็จ
    }
    
    return res.status(201).json(successResponse({
      user: {
        id: userId,
        username,
        full_name,
        email,
        role,
        image: profileImagePath
      }
    }, 'User created successfully'));
    
  } catch (error) {
    logger.error('Error in createUser:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลผู้ใช้ตาม ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return validationErrorResponse(res, 'User ID is required');
    }
    
    // ดึงข้อมูลผู้ใช้
    const [users] = await pool.execute(`
      SELECT user_id, username, full_name, email, role, image, created_at
      FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }
    
    // ดึงข้อมูลโครงการของผู้ใช้
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.type, p.study_year, p.year, p.status, p.created_at,
            (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image_path
      FROM projects p
      WHERE p.user_id = ?
      OR EXISTS (SELECT 1 FROM project_groups pg WHERE pg.project_id = p.project_id AND pg.user_id = ?)
      ORDER BY p.created_at DESC
    `, [userId, userId]);
    
    // ดึงประวัติการเข้าสู่ระบบ - ใช้ค่า LIMIT โดยตรงในคำสั่ง SQL
    const [loginLogs] = await pool.execute(`
      SELECT log_id, login_time, ip_address
      FROM login_logs
      WHERE user_id = ?
      ORDER BY login_time DESC
      LIMIT 20
    `, [userId]);
    
    const userData = {
      ...users[0],
      projects: projects.map(project => ({
        id: project.project_id,
        title: project.title,
        category: project.type,
        level: `ปี ${project.study_year}`,
        year: project.year,
        status: project.status,
        createdAt: project.created_at,
        image: project.image_path || 'https://via.placeholder.com/150',
        projectLink: `/projects/${project.project_id}`
      })),
      loginHistory: loginLogs
    };
    
    return res.json(successResponse(userData, 'User retrieved successfully'));
    
  } catch (error) {
    logger.error('Error in getUserById:', error);
    return handleServerError(res, error);
  }
});

/**
 * อัปเดตข้อมูลผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUser = asyncHandler(async (req, res) => {
  let connection;
  
  try {
    const userId = req.params.userId;
    const { username, full_name, email, role } = req.body;
    
    if (!userId) {
      return validationErrorResponse(res, 'User ID is required');
    }
    
    // เริ่ม transaction
    connection = await beginTransaction();
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await connection.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      await rollbackTransaction(connection);
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }
    
    const currentUser = users[0];
    
    // ตรวจสอบความถูกต้องของข้อมูลที่จะอัปเดต
    const updateData = {};
    const validationErrors = {};
    
    if (username !== undefined) {
      if (!isValidUsername(username)) {
        validationErrors.username = getErrorMessage('USER.INVALID_USERNAME');
      } else {
        updateData.username = username;
      }
    }
    
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        validationErrors.email = getErrorMessage('USER.INVALID_EMAIL');
      } else {
        updateData.email = email;
      }
    }
    
    if (role !== undefined) {
      if (!isValidRole(role)) {
        validationErrors.role = getErrorMessage('USER.INVALID_ROLE');
      } else {
        updateData.role = role;
      }
    }
    
    if (full_name !== undefined) {
      updateData.full_name = full_name;
    }
    
    // ถ้ามีข้อผิดพลาดในการตรวจสอบ
    if (Object.keys(validationErrors).length > 0) {
      await rollbackTransaction(connection);
      return validationErrorResponse(res, 'Validation error', validationErrors);
    }
    
    // ตรวจสอบว่ามีผู้ใช้คนอื่นที่มี username หรือ email นี้อยู่แล้วหรือไม่
    if (updateData.username || updateData.email) {
      const [existingUsers] = await connection.execute(`
        SELECT * FROM users WHERE (username = ? OR email = ?) AND user_id != ?
      `, [
        updateData.username || currentUser.username,
        updateData.email || currentUser.email,
        userId
      ]);
      
      if (existingUsers.length > 0) {
        const isDuplicateUsername = existingUsers.some(user => user.username === (updateData.username || currentUser.username));
        const isDuplicateEmail = existingUsers.some(user => user.email === (updateData.email || currentUser.email));
        
        if (isDuplicateUsername && isDuplicateEmail) {
          await rollbackTransaction(connection);
          return validationErrorResponse(res, 'Username and email are already in use by another user');
        } else if (isDuplicateUsername) {
          await rollbackTransaction(connection);
          return validationErrorResponse(res, getErrorMessage('AUTH.USERNAME_TAKEN'));
        } else if (isDuplicateEmail) {
          await rollbackTransaction(connection);
          return validationErrorResponse(res, getErrorMessage('AUTH.EMAIL_TAKEN'));
        }
      }
    }
    
    // ถ้าไม่มีข้อมูลที่จะอัปเดต
    if (Object.keys(updateData).length === 0) {
      await rollbackTransaction(connection);
      return res.json(successResponse({
        user: {
          id: userId,
          username: currentUser.username,
          full_name: currentUser.full_name,
          email: currentUser.email,
          role: currentUser.role
        }
      }, 'No changes made to user'));
    }
    
    // สร้าง SQL query สำหรับอัปเดต
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updateData);
    
    // อัปเดตข้อมูลผู้ใช้
    await connection.execute(`
      UPDATE users
      SET ${updateFields}
      WHERE user_id = ?
    `, [...updateValues, userId]);
    
    // Commit transaction
    await commitTransaction(connection);
    
    return res.json(successResponse({
      user: {
        id: userId,
        username: updateData.username || currentUser.username,
        full_name: updateData.full_name || currentUser.full_name,
        email: updateData.email || currentUser.email,
        role: updateData.role || currentUser.role
      }
    }, 'User updated successfully'));
    
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    logger.error('Error in updateUser:', error);
    return handleServerError(res, error);
  }
});

/**
 * เปลี่ยนรหัสผ่านผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const changeUserPassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const { new_password } = req.body;
    
    if (!userId) {
      return validationErrorResponse(res, 'User ID is required');
    }
    
    if (!new_password) {
      return validationErrorResponse(res, 'New password is required', {
        new_password: 'Password is required'
      });
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }
    
    // ตรวจสอบความซับซ้อนของรหัสผ่าน
    if (new_password.length < 8) {
      return validationErrorResponse(res, getErrorMessage('USER.PASSWORD_TOO_SHORT'), {
        new_password: 'Password must be at least 8 characters long'
      });
    }
    
    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await hashPassword(new_password);
    
    // อัปเดตรหัสผ่าน
    await pool.execute(`
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `, [hashedPassword, userId]);
    
    return res.json(successResponse(null, 'Password changed successfully'));
    
  } catch (error) {
    logger.error('Error in changeUserPassword:', error);
    return handleServerError(res, error);
  }
});

/**
 * ลบผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteUser = asyncHandler(async (req, res) => {
  let connection;
  
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return validationErrorResponse(res, 'User ID is required');
    }
    
    // เริ่ม transaction
    connection = await beginTransaction();
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await connection.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      await rollbackTransaction(connection);
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }
    
    // ตรวจสอบว่าผู้ใช้ที่จะลบไม่ใช่ตนเอง
    if (req.user.id == userId) {
      await rollbackTransaction(connection);
      return forbiddenResponse(res, getErrorMessage('USER.DELETE_SELF_FORBIDDEN'));
    }
    
    const currentUser = users[0];
    
    // ลบรูปโปรไฟล์ถ้ามี
    if (currentUser.image && currentUser.image.startsWith('uploads/')) {
      try {
        deleteFile(currentUser.image);
      } catch (fileError) {
        logger.warn(`Failed to delete profile image: ${currentUser.image}`, fileError);
        // ดำเนินการต่อถึงแม้จะลบไฟล์ไม่สำเร็จ
      }
    }
    
    // ลบผู้ใช้
    await connection.execute(`
      DELETE FROM users WHERE user_id = ?
    `, [userId]);
    
    // Commit transaction
    await commitTransaction(connection);
    
    return res.json(successResponse(null, 'User deleted successfully'));
    
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    logger.error('Error in deleteUser:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลประวัติการเข้าสู่ระบบของผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserLoginHistory = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    if (!userId) {
      return validationErrorResponse(res, 'User ID is required');
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return notFoundResponse(res, getErrorMessage('USER.NOT_FOUND'));
    }
    
    // ดึงประวัติการเข้าสู่ระบบ - ใช้ค่า LIMIT โดยตรงในคำสั่ง SQL
    const [loginLogs] = await pool.execute(`
      SELECT log_id, login_time, ip_address
      FROM login_logs
      WHERE user_id = ?
      ORDER BY login_time DESC
      LIMIT ${limit}
    `, [userId]);
    
    return res.json(successResponse({
      userId,
      username: users[0].username,
      logs: loginLogs
    }, 'Login history retrieved successfully'));
    
  } catch (error) {
    logger.error('Error in getUserLoginHistory:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลสถิติผู้ใช้สำหรับ Dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserStats = asyncHandler(async (req, res) => {
  try {
    // จำนวนผู้ใช้ทั้งหมด
    const [totalUsers] = await pool.execute(`
      SELECT COUNT(*) as count FROM users
    `);
    
    // จำนวนผู้ใช้แยกตามบทบาท
    const [usersByRole] = await pool.execute(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `);
    
    // จำนวนผู้ใช้ที่สมัครในแต่ละเดือน (12 เดือนล่าสุด)
    const [usersByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COUNT(*) as count 
      FROM users 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month 
      ORDER BY month
    `);
    
    // ผู้ใช้ที่เข้าสู่ระบบล่าสุด 5 คน
    const [recentLogins] = await pool.execute(`
      SELECT u.user_id, u.username, u.full_name, u.role, l.login_time, l.ip_address
      FROM login_logs l
      JOIN users u ON l.user_id = u.user_id
      ORDER BY l.login_time DESC
      LIMIT 5
    `);
    
    // ผู้ใช้ที่มีโครงการมากที่สุด 5 คน
    const [topContributors] = await pool.execute(`
      SELECT u.user_id, u.username, u.full_name, COUNT(p.project_id) as project_count
      FROM users u
      JOIN projects p ON u.user_id = p.user_id
      GROUP BY u.user_id
      ORDER BY project_count DESC
      LIMIT 5
    `);
    
    return res.json(successResponse({
      totalUsers: totalUsers[0].count,
      usersByRole,
      usersByMonth,
      recentLogins: recentLogins.map(login => ({
        id: login.user_id,
        username: login.username,
        fullName: login.full_name,
        role: login.role,
        loginTime: login.login_time,
        ipAddress: login.ip_address
      })),
      topContributors: topContributors.map(user => ({
        id: user.user_id,
        username: user.username,
        fullName: user.full_name,
        projectCount: Number(user.project_count)
      }))
    }, 'User statistics retrieved successfully'));
    
  } catch (error) {
    logger.error('Error in getUserStats:', error);
    return handleServerError(res, error);
  }
});

export default {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  changeUserPassword,
  deleteUser,
  getUserLoginHistory,
  getUserStats
};