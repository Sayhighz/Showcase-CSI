import bcrypt from 'bcryptjs';
import pool from '../../config/database.js';
import { handleServerError, notFoundResponse, successResponse } from '../../utils/responseFormatter.js';
import { deleteFile } from '../../utils/fileHelper.js';
import { sendWelcomeEmail } from '../../services/emailService.js';

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsers = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        statusCode: 403, 
        message: 'Forbidden, only admin can access this resource' 
      });
    }

    // Validate and sanitize input parameters
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(parseInt(req.query.limit || '10', 10), 100));
    const offset = (page - 1) * limit;
    
    // Prepare query parameters
    const queryParams = [];
    const conditions = [];

    // Role filter
    const role = req.query.role ? String(req.query.role).trim() : null;
    if (role) {
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

    // Begin transaction
    await connection.beginTransaction();

    // Count total items
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM users 
      ${whereClause}
    `, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Prepare final query parameters (add limit and offset)
    const finalQueryParams = [
      ...queryParams,
      BigInt(limit),
      BigInt(offset)
    ];

    // Main query to fetch users
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
      LIMIT ? OFFSET ?
    `, finalQueryParams);

    // Commit transaction
    await connection.commit();

    // Return response
    return res.json(successResponse({
      users: users.map(user => ({
        ...user,
        project_count: Number(user.project_count)
      })),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    }, 'Users retrieved successfully'));
    
  } catch (error) {
    // Rollback transaction if it exists
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }

    console.error('Error in getAllUsers:', error);
    return handleServerError(res, error);
  } finally {
    // Always release the connection
    if (connection) connection.release();
  }
};

// Existing other functions remain the same...
// (createUser, getUserById, updateUser, etc.)
// ฟังก์ชันสำหรับสร้างผู้ใช้ใหม่
export const ecreateUser = async (req, res) => {
  try {
    const { 
      username, 
      password, 
      full_name, 
      email, 
      role = 'student' 
    } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !full_name || !email) {
      return res.status(400).json({ 
        success: false,
        statusCode: 400,
        message: 'Username, password, full name, and email are required' 
      });
    }
    
    // ตรวจสอบความถูกต้องของบทบาท
    const validRoles = ['student', 'admin', 'visitor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false,
        statusCode: 400,
        message: 'Invalid role. Role must be student, admin, or visitor' 
      });
    }
    
    // ตรวจสอบว่ามี username หรือ email ซ้ำหรือไม่
    const [existingUsers] = await pool.execute(`
      SELECT * FROM users 
      WHERE username = ? OR email = ?
    `, [username, email]);
    
    if (existingUsers.length > 0) {
      const isDuplicateUsername = existingUsers.some(user => user.username === username);
      const isDuplicateEmail = existingUsers.some(user => user.email === email);
      
      if (isDuplicateUsername && isDuplicateEmail) {
        return res.status(409).json({ 
          success: false,
          statusCode: 409,
          message: 'Username and email are already in use' 
        });
      } else if (isDuplicateUsername) {
        return res.status(409).json({ 
          success: false,
          statusCode: 409,
          message: 'Username is already in use' 
        });
      } else {
        return res.status(409).json({ 
          success: false,
          statusCode: 409,
          message: 'Email is already in use' 
        });
      }
    }
    
    // เข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // เพิ่มผู้ใช้ใหม่
    const [result] = await pool.execute(`
      INSERT INTO users 
      (username, password_hash, full_name, email, role) 
      VALUES (?, ?, ?, ?, ?)
    `, [username, hashedPassword, full_name, email, role]);
    
    // ส่งอีเมลต้อนรับ (ถ้าต้องการ)
    await sendWelcomeEmail(email, username);
    
    return res.status(201).json(successResponse({
      user: {
        id: result.insertId,
        username,
        full_name,
        email,
        role
      }
    }, 'User created successfully'));
    
  } catch (error) {
    console.error('Error in createUser:', error);
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
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'User ID is required'
      });
    }
    
    // ดึงข้อมูลผู้ใช้
    const [users] = await pool.execute(`
      SELECT user_id, username, full_name, email, role, image, created_at
      FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return notFoundResponse(res, 'User not found');
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
    
    // ดึงประวัติการเข้าสู่ระบบ
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
    const { username, full_name, email, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'User ID is required'
      });
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return notFoundResponse(res, 'User not found');
    }
    
    const currentUser = users[0];
    
    // ตรวจสอบความถูกต้องของบทบาทถ้ามีการเปลี่ยนแปลง
    if (role) {
      const validRoles = ['student', 'admin', 'visitor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Invalid role. Role must be student, admin, or visitor'
        });
      }
    }
    
    // ตรวจสอบว่ามีผู้ใช้คนอื่นที่มี username หรือ email นี้อยู่แล้วหรือไม่
    if (username || email) {
      const [existingUsers] = await pool.execute(`
        SELECT * FROM users WHERE (username = ? OR email = ?) AND user_id != ?
      `, [
        username || currentUser.username,
        email || currentUser.email,
        userId
      ]);
      
      if (existingUsers.length > 0) {
        const isDuplicateUsername = existingUsers.some(user => user.username === (username || currentUser.username));
        const isDuplicateEmail = existingUsers.some(user => user.email === (email || currentUser.email));
        
        if (isDuplicateUsername && isDuplicateEmail) {
          return res.status(409).json({
            success: false,
            statusCode: 409,
            message: 'Username and email are already in use by another user'
          });
        } else if (isDuplicateUsername) {
          return res.status(409).json({
            success: false,
            statusCode: 409,
            message: 'Username is already in use by another user'
          });
        } else {
          return res.status(409).json({
            success: false,
            statusCode: 409,
            message: 'Email is already in use by another user'
          });
        }
      }
    }
    
    // อัปเดตข้อมูลผู้ใช้
    await pool.execute(`
      UPDATE users
      SET username = ?, full_name = ?, email = ?, role = ?
      WHERE user_id = ?
    `, [
      username || currentUser.username,
      full_name || currentUser.full_name,
      email || currentUser.email,
      role || currentUser.role,
      userId
    ]);
    
    return res.json(successResponse({
      user: {
        id: userId,
        username: username || currentUser.username,
        full_name: full_name || currentUser.full_name,
        email: email || currentUser.email,
        role: role || currentUser.role
      }
    }, 'User updated successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * เปลี่ยนรหัสผ่านผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { new_password } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'User ID is required'
      });
    }
    
    if (!new_password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'New password is required'
      });
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return notFoundResponse(res, 'User not found');
    }
    
    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);
    
    // อัปเดตรหัสผ่าน
    await pool.execute(`
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `, [hashedPassword, userId]);
    
    return res.json(successResponse(null, 'Password changed successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ลบผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'User ID is required'
      });
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return notFoundResponse(res, 'User not found');
    }
    
    // ตรวจสอบว่าผู้ใช้ที่จะลบไม่ใช่ตนเอง
    if (req.user.id == userId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Cannot delete your own account'
      });
    }
    
    const currentUser = users[0];
    
    // ลบรูปโปรไฟล์ถ้ามี
    if (currentUser.image && currentUser.image.startsWith('uploads/')) {
      deleteFile(currentUser.image);
    }
    
    // ลบผู้ใช้
    await pool.execute(`
      DELETE FROM users WHERE user_id = ?
    `, [userId]);
    
    return res.json(successResponse(null, 'User deleted successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลประวัติการเข้าสู่ระบบของผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserLoginHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'User ID is required'
      });
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return notFoundResponse(res, 'User not found');
    }
    
    // ดึงประวัติการเข้าสู่ระบบ
    const [loginLogs] = await pool.execute(`
      SELECT log_id, login_time, ip_address
      FROM login_logs
      WHERE user_id = ?
      ORDER BY login_time DESC
      LIMIT ?
    `, [userId, limit]);
    
    return res.json(successResponse(loginLogs, 'Login history retrieved successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลสถิติผู้ใช้สำหรับ Dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserStats = async (req, res) => {
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
        projectCount: user.project_count
      }))
    }, 'User statistics retrieved successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};