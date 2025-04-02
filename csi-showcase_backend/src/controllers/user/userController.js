// controllers/user/userController.js
import bcrypt from "bcryptjs";
import pool from "../../config/database.js";
import {
  handleServerError,
  notFoundResponse,
  successResponse,
} from "../../utils/responseFormatter.js";
import { deleteFile } from "../../utils/fileHelper.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendWelcomeEmail } from "../../services/emailService.js";

// กำหนดการตั้งค่าการอัปโหลดรูปโปรไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/profiles/";

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// กำหนด multer สำหรับอัปโหลดรูปโปรไฟล์
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

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
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Username, password, full name, and email are required",
      });
    }

    // ตรวจสอบความซ้ำซ้อนของ username และ email
    const [existingUsers] = await pool.execute(
      `
      SELECT * FROM users WHERE username = ? OR email = ?
    `,
      [username, email]
    );

    if (existingUsers.length > 0) {
      const isDuplicateUsername = existingUsers.some(
        (user) => user.username === username
      );
      const isDuplicateEmail = existingUsers.some(
        (user) => user.email === email
      );

      if (isDuplicateUsername && isDuplicateEmail) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: "Username and email are already in use",
        });
      } else if (isDuplicateUsername) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: "Username is already in use",
        });
      } else {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: "Email is already in use",
        });
      }
    }

    // เข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // เพิ่มผู้ใช้ใหม่ (บทบาทเป็น student เสมอ)
    const [result] = await pool.execute(
      `
      INSERT INTO users (username, password_hash, full_name, email, role)
      VALUES (?, ?, ?, ?, 'student')
    `,
      [username, hashedPassword, full_name, email]
    );

    // ส่งอีเมลต้อนรับ
    sendWelcomeEmail(email, username);

    return res.status(201).json(
      successResponse(
        {
          id: result.insertId,
          username,
          fullName: full_name,
          email,
          role: "student",
        },
        "User registered successfully"
      )
    );
  } catch (error) {
    return handleServerError(res, error);
  }
};

/* ดึงข้อมูลผู้ใช้ทั้งหมด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

export const getAllUsers = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only admin can access all users",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const role = req.query.role || "";

    // สร้าง query พื้นฐาน
    let query = `
      SELECT user_id, username, full_name, email, role, image, created_at
      FROM users
      WHERE 1=1
    `;

    const queryParams = [];

    // เพิ่มเงื่อนไขการค้นหาตามบทบาท
    if (role) {
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

    return res.json(
      successResponse(
        {
          users: users.map((user) => ({
            id: user.user_id,
            username: user.username,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            image: user.image,
            createdAt: user.created_at,
          })),
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
        "Users retrieved successfully"
      )
    );
  } catch (error) {
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
    if (req.user.id != userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message:
          "You can only view your own profile or you need admin privileges",
      });
    }

    // ดึงข้อมูลผู้ใช้
    const [users] = await pool.execute(
      `
      SELECT user_id, username, full_name, email, role, image, created_at
      FROM users
      WHERE user_id = ?
    `,
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, "User not found");
    }

    const user = users[0];

    // ดึงข้อมูลโครงการของผู้ใช้
    const [projects] = await pool.execute(
      `
      SELECT p.project_id, p.title, p.type, p.study_year, p.year, p.status, p.created_at,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      WHERE p.user_id = ?
      OR EXISTS (SELECT 1 FROM project_groups pg WHERE pg.project_id = p.project_id AND pg.user_id = ?)
      ORDER BY p.created_at DESC
    `,
      [userId, userId]
    );

    return res.json(
      successResponse(
        {
          id: user.user_id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          image: user.image,
          createdAt: user.created_at,
          projects: projects.map((project) => ({
            id: project.project_id,
            title: project.title,
            category: project.type,
            level: `ปี ${project.study_year}`,
            year: project.year,
            status: project.status,
            image: project.image || "https://via.placeholder.com/150",
            projectLink: `/projects/${project.project_id}`,
          })),
        },
        "User retrieved successfully"
      )
    );
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

    // ตรวจสอบว่าสามารถแก้ไขข้อมูลของผู้ใช้ได้หรือไม่
    if (req.user.id != userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message:
          "You can only update your own profile or you need admin privileges",
      });
    }

    const { full_name, email } = req.body;

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      `
      SELECT * FROM users WHERE user_id = ?
    `,
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, "User not found");
    }

    const user = users[0];

    // ตรวจสอบความซ้ำซ้อนของ email (กรณีเปลี่ยน email)
    if (email && email !== user.email) {
      const [existingEmail] = await pool.execute(
        `
        SELECT * FROM users WHERE email = ? AND user_id != ?
      `,
        [email, userId]
      );

      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: "Email is already in use",
        });
      }
    }

    // อัปเดตข้อมูลผู้ใช้
    await pool.execute(
      `
      UPDATE users
      SET full_name = ?, email = ?
      WHERE user_id = ?
    `,
      [full_name || user.full_name, email || user.email, userId]
    );

    return res.json(
      successResponse(
        {
          id: userId,
          username: user.username,
          fullName: full_name || user.full_name,
          email: email || user.email,
          role: user.role,
        },
        "User updated successfully"
      )
    );
  } catch (error) {
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
    if (req.user.id != userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message:
          "You can only upload profile image for your own account or you need admin privileges",
      });
    }

    // ตรวจสอบว่ามีไฟล์อัปโหลดหรือไม่
    if (!req.file) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "No file uploaded",
      });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      `
      SELECT * FROM users WHERE user_id = ?
    `,
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, "User not found");
    }

    const user = users[0];

    // ลบรูปโปรไฟล์เดิม (ถ้ามี)
    if (user.image && user.image.startsWith("uploads/profiles/")) {
      deleteFile(user.image);
    }

    // อัปเดตรูปโปรไฟล์
    await pool.execute(
      `
      UPDATE users
      SET image = ?
      WHERE user_id = ?
    `,
      [req.file.path, userId]
    );

    return res.json(
      successResponse(
        {
          id: userId,
          image: req.file.path,
        },
        "Profile image uploaded successfully"
      )
    );
  } catch (error) {
    // ลบไฟล์ที่อัปโหลดหากเกิดข้อผิดพลาด
    if (req.file) {
      deleteFile(req.file.path);
    }

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
    if (req.user.id != userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message:
          "You can only change password for your own account or you need admin privileges",
      });
    }

    const { currentPassword, newPassword } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "New password is required",
      });
    }

    // กรณีผู้ใช้ทั่วไป (ไม่ใช่ admin) ต้องระบุรหัสผ่านปัจจุบัน
    if (req.user.id == userId && !currentPassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Current password is required",
      });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      `
      SELECT * FROM users WHERE user_id = ?
    `,
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, "User not found");
    }

    const user = users[0];

    // กรณีผู้ใช้ทั่วไป (ไม่ใช่ admin) ต้องตรวจสอบรหัสผ่านปัจจุบัน
    if (req.user.id == userId) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "Current password is incorrect",
        });
      }
    }

    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // อัปเดตรหัสผ่าน
    await pool.execute(
      `
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `,
      [hashedPassword, userId]
    );

    return res.json(successResponse(null, "Password changed successfully"));
  } catch (error) {
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
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only admin can change user roles",
      });
    }

    const userId = req.params.userId;
    const { role } = req.body;

    // ตรวจสอบว่าบทบาทถูกต้องหรือไม่
    if (!role || !["student", "admin", "visitor"].includes(role)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Role must be either "student", "admin", or "visitor"',
      });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      `
      SELECT * FROM users WHERE user_id = ?
    `,
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, "User not found");
    }

    // อัปเดตบทบาท
    await pool.execute(
      `
      UPDATE users
      SET role = ?
      WHERE user_id = ?
    `,
      [role, userId]
    );

    return res.json(
      successResponse(
        {
          id: userId,
          role,
        },
        "User role changed successfully"
      )
    );
  } catch (error) {
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
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only admin can delete users",
      });
    }

    const userId = req.params.userId;

    // ตรวจสอบว่าไม่ได้พยายามลบตัวเอง
    if (req.user.id == userId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "You cannot delete your own account",
      });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      `
      SELECT * FROM users WHERE user_id = ?
    `,
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, "User not found");
    }

    const user = users[0];

    // ลบรูปโปรไฟล์ (ถ้ามี)
    if (user.image && user.image.startsWith("uploads/profiles/")) {
      deleteFile(user.image);
    }

    // เริ่มต้น transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // ดึงข้อมูลโครงการของผู้ใช้ทั้งหมด
      const [projects] = await connection.execute(
        `
        SELECT * FROM projects WHERE user_id = ?
      `,
        [userId]
      );

      // ลบข้อมูลผู้ใช้จากตาราง project_groups
      await connection.execute(
        `
        DELETE FROM project_groups WHERE user_id = ?
      `,
        [userId]
      );

      // ลบข้อมูลประวัติการเข้าสู่ระบบ
      await connection.execute(
        `
        DELETE FROM login_logs WHERE user_id = ?
      `,
        [userId]
      );

      // ลบข้อมูลการรีเซ็ตรหัสผ่าน
      await connection.execute(
        `
        DELETE FROM password_resets WHERE user_id = ?
      `,
        [userId]
      );

      // ลบข้อมูลผู้ใช้
      await connection.execute(
        `
        DELETE FROM users WHERE user_id = ?
      `,
        [userId]
      );

      // Commit the transaction
      await connection.commit();

      return res.json(successResponse(null, "User deleted successfully"));
    } catch (error) {
      // Rollback the transaction if there's an error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
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
    if (req.user.id != userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message:
          "You can only view your own login history or you need admin privileges",
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      `
      SELECT * FROM users WHERE user_id = ?
    `,
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, "User not found");
    }

    // ดึงข้อมูลประวัติการเข้าสู่ระบบ
    const [logs] = await pool.execute(
      `
      SELECT * FROM login_logs
      WHERE user_id = ?
      ORDER BY login_time DESC
      LIMIT ?
    `,
      [userId, limit]
    );

    return res.json(
      successResponse(
        logs.map((log) => ({
          id: log.log_id,
          time: log.login_time,
          ipAddress: log.ip_address,
        })),
        "Login history retrieved successfully"
      )
    );
  } catch (error) {
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
    if (req.user.id != userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message:
          "You can only view your own projects or you need admin privileges",
      });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(
      `
      SELECT * FROM users WHERE user_id = ?
    `,
      [userId]
    );

    if (users.length === 0) {
      return notFoundResponse(res, "User not found");
    }

    // ดึงข้อมูลโครงการที่ผู้ใช้เป็นเจ้าของ
    const [ownedProjects] = await pool.execute(
      `
      SELECT p.*, 
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `,
      [userId]
    );

    // ดึงข้อมูลโครงการที่ผู้ใช้มีส่วนร่วม (แต่ไม่ได้เป็นเจ้าของหลัก)
    const [contributedProjects] = await pool.execute(
      `
      SELECT p.*, 
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      JOIN project_groups pg ON p.project_id = pg.project_id
      WHERE pg.user_id = ? AND p.user_id != ?
      ORDER BY p.created_at DESC
    `,
      [userId, userId]
    );

    return res.json(
      successResponse(
        {
          ownedProjects: ownedProjects.map((project) => ({
            id: project.project_id,
            title: project.title,
            category: project.type,
            level: `ปี ${project.study_year}`,
            year: project.year,
            status: project.status,
            image: project.image || "https://via.placeholder.com/150",
            projectLink: `/projects/${project.project_id}`,
          })),
          contributedProjects: contributedProjects.map((project) => ({
            id: project.project_id,
            title: project.title,
            category: project.type,
            level: `ปี ${project.study_year}`,
            year: project.year,
            status: project.status,
            image: project.image || "https://via.placeholder.com/150",
            projectLink: `/projects/${project.project_id}`,
          })),
        },
        "User projects retrieved successfully"
      )
    );
  } catch (error) {
    return handleServerError(res, error);
  }
};
