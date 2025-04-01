// ===== controllers/userController.js =====

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/database.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// ตั้งค่า multer สำหรับอัปโหลดรูปโปรไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profiles/';
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// สร้าง multer middleware
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
  fileFilter: (req, file, cb) => {
    // ตรวจสอบประเภทไฟล์ที่อนุญาต (เฉพาะรูปภาพ)
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(ext);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('เฉพาะไฟล์รูปภาพเท่านั้นที่อนุญาต'));
  }
});

// ดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับ Admin)
export const getAllUsers = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can view all users' });
    }
    
    const [users] = await pool.execute(`
      SELECT user_id, username, full_name, email, role, image, created_at 
      FROM users
      ORDER BY created_at DESC
    `);
    
    return res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ดึงข้อมูลผู้ใช้ตาม ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ดูข้อมูลหรือไม่ (เฉพาะข้อมูลตัวเองหรือ admin)
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, you can only view your own profile' });
    }
    
    const [users] = await pool.execute(`
      SELECT user_id, username, full_name, email, role, image, created_at 
      FROM users 
      WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ลงทะเบียนผู้ใช้ใหม่
export const register = async (req, res) => {
  try {
    const { username, password, full_name, email, role = 'student' } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !full_name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // ตรวจสอบว่า username หรือ email ซ้ำหรือไม่
    const [existingUsers] = await pool.execute(`
      SELECT * FROM users WHERE username = ? OR email = ?
    `, [username, email]);
    
    if (existingUsers.length > 0) {
      // ตรวจสอบว่าซ้ำเพราะ username หรือ email
      const isDuplicateUsername = existingUsers.some(user => user.username === username);
      const isDuplicateEmail = existingUsers.some(user => user.email === email);
      
      if (isDuplicateUsername && isDuplicateEmail) {
        return res.status(409).json({ message: 'Username and email are already in use' });
      } else if (isDuplicateUsername) {
        return res.status(409).json({ message: 'Username is already in use' });
      } else {
        return res.status(409).json({ message: 'Email is already in use' });
      }
    }
    
    // ตรวจสอบว่า role ถูกต้องหรือไม่
    const validRoles = ['student', 'admin', 'visitor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Role must be student, admin, or visitor' });
    }
    
    // เข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // เพิ่มผู้ใช้ใหม่ลงในฐานข้อมูล
    const [result] = await pool.execute(`
      INSERT INTO users (username, password_hash, full_name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `, [username, hashedPassword, full_name, email, role]);
    
    // สร้าง JWT token
    const token = jwt.sign(
      { id: result.insertId, username, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        username,
        full_name,
        email,
        role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// อัปเดตข้อมูลผู้ใช้
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { full_name, email } = req.body;
    
    // ตรวจสอบว่า userId ที่ส่งมาตรงกับ user_id ใน token หรือไม่
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, you can only update your own profile' });
    }
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!full_name && !email) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // ตรวจสอบว่า email ซ้ำหรือไม่ (ถ้ามีการเปลี่ยน email)
    if (email) {
      const [existingUsers] = await pool.execute(`
        SELECT * FROM users WHERE email = ? AND user_id != ?
      `, [email, userId]);
      
      if (existingUsers.length > 0) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
    }
    
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = users[0];
    
    // อัปเดตข้อมูลผู้ใช้
    await pool.execute(`
      UPDATE users
      SET full_name = ?, email = ?
      WHERE user_id = ?
    `, [
      full_name || currentUser.full_name,
      email || currentUser.email,
      userId
    ]);
    
    return res.json({ 
      message: 'User updated successfully',
      user: {
        id: userId,
        username: currentUser.username,
        full_name: full_name || currentUser.full_name,
        email: email || currentUser.email,
        role: currentUser.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// อัปโหลดรูปโปรไฟล์
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const userId = req.params.userId;
    
    // ตรวจสอบว่า userId ที่ส่งมาตรงกับ user_id ใน token หรือไม่
    if (req.user.id != userId && req.user.role !== 'admin') {
      // ลบไฟล์ที่อัปโหลดแล้วถ้าไม่มีสิทธิ์
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Forbidden, you can only upload image for your own profile' });
    }
    
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      // ลบไฟล์ที่อัปโหลดแล้วถ้าผู้ใช้ไม่มีอยู่จริง
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = users[0];
    
    // ลบรูปโปรไฟล์เดิมถ้ามี
    if (currentUser.image && fs.existsSync(currentUser.image)) {
      fs.unlinkSync(currentUser.image);
    }
    
    // อัปเดตรูปโปรไฟล์
    await pool.execute(`
      UPDATE users
      SET image = ?
      WHERE user_id = ?
    `, [req.file.path, userId]);
    
    return res.json({ 
      message: 'Profile image uploaded successfully',
      image_path: req.file.path
    });
  } catch (error) {
    console.error(error);
    // ลบไฟล์ที่อัปโหลดแล้วถ้าเกิดข้อผิดพลาด
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// เปลี่ยนรหัสผ่าน
export const changePassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { current_password, new_password } = req.body;
    
    // ตรวจสอบว่า userId ที่ส่งมาตรงกับ user_id ใน token หรือไม่
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, you can only change your own password' });
    }
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = users[0];
    
    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isMatch = await bcrypt.compare(current_password, currentUser.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
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
    
    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// เปลี่ยนบทบาทของผู้ใช้ (สำหรับ Admin)
export const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { role } = req.body;
    
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can change user roles' });
    }
    
    // ตรวจสอบว่าบทบาทที่ส่งมาถูกต้องหรือไม่
    const validRoles = ['student', 'admin', 'visitor'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Role must be student, admin, or visitor' });
    }
    
    // ตรวจสอบว่าผู้ใช้ที่จะเปลี่ยนบทบาทมีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ไม่อนุญาตให้เปลี่ยนบทบาทตัวเอง
    if (req.user.id == userId) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    // เปลี่ยนบทบาทผู้ใช้
    await pool.execute(`
      UPDATE users
      SET role = ?
      WHERE user_id = ?
    `, [role, userId]);
    
    return res.json({ 
      message: 'User role changed successfully',
      user: {
        id: userId,
        username: users[0].username,
        role: role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ลบผู้ใช้ (สำหรับ Admin)
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can delete users' });
    }
    
    // ตรวจสอบว่าผู้ใช้ที่จะลบมีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ไม่อนุญาตให้ลบตัวเอง
    if (req.user.id == userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const currentUser = users[0];
    
    // ลบรูปโปรไฟล์ถ้ามี
    if (currentUser.image && fs.existsSync(currentUser.image)) {
      fs.unlinkSync(currentUser.image);
    }
    
    // ลบผู้ใช้
    await pool.execute(`
      DELETE FROM users WHERE user_id = ?
    `, [userId]);
    
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ดึงประวัติการเข้าสู่ระบบของผู้ใช้
export const getUserLoginHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ดูข้อมูลหรือไม่ (เฉพาะข้อมูลตัวเองหรือ admin)
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, you can only view your own login history' });
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ดึงประวัติการเข้าสู่ระบบ
    const [loginLogs] = await pool.execute(`
      SELECT log_id, login_time, ip_address
      FROM login_logs
      WHERE user_id = ?
      ORDER BY login_time DESC
      LIMIT 50
    `, [userId]);
    
    return res.json(loginLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ดึงโครงการที่ผู้ใช้มีส่วนร่วม
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ดูข้อมูลหรือไม่ (เฉพาะข้อมูลตัวเองหรือ admin)
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, you can only view your own projects' });
    }
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE user_id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ดึงโครงการที่ผู้ใช้เป็นเจ้าของหรือมีส่วนร่วม
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.type, p.description, p.study_year, p.year, p.semester, p.status, p.created_at,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image_path
      FROM projects p
      JOIN project_groups pg ON p.project_id = pg.project_id
      WHERE pg.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedProjects = projects.map(project => ({
      id: project.project_id,
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      semester: project.semester,
      status: project.status,
      createdAt: project.created_at,
      image: project.image_path || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`
    }));
    
    return res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};