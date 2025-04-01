// ===== middleware/authMiddleware.js =====

import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// Middleware ตรวจสอบ JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.error("No token provided in the Authorization header.");
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // ตรวจสอบว่าผู้ใช้มีอยู่จริงในฐานข้อมูลหรือไม่
      const [users] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [decoded.id]);
      
      if (users.length === 0) {
        return res.status(403).json({ message: 'User not found' });
      }
      
      // เก็บข้อมูลผู้ใช้ไว้ใน req object เพื่อใช้ในฟังก์ชันถัดไป
      req.user = {
        id: users[0].user_id,
        username: users[0].username,
        fullName: users[0].full_name,
        email: users[0].email,
        role: users[0].role
      };
      
      // บันทึกประวัติการเข้าสู่ระบบ (ตาม IP)
      await pool.execute(`
        INSERT INTO login_logs (user_id, ip_address)
        VALUES (?, ?)
      `, [decoded.id, req.ip]);
      
      next();
    } catch (err) {
      console.error('Error verifying token:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired. Please log in again.' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(400).json({ message: 'Invalid token. Please log in again.' });
      }
      return res.status(400).json({ message: 'Token verification failed. Please try again.' });
    }
  } catch (error) {
    console.error('Server error during authentication:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required' });
  }
  
  next();
};

// Middleware ตรวจสอบว่าผู้ใช้เป็น student หรือไม่
export const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student privileges required' });
  }
  
  next();
};

// Middleware ตรวจสอบว่าผู้ใช้เป็นเจ้าของทรัพยากร (โครงการ)
export const isResourceOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const resourceId = req.params.projectId;
    
    if (!resourceId) {
      return res.status(400).json({ message: 'Resource ID is required' });
    }
    
    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของโครงการหรือไม่
    const [owners] = await pool.execute(`
      SELECT user_id FROM project_groups WHERE project_id = ?
    `, [resourceId]);
    
    const isOwner = owners.some(owner => owner.user_id == req.user.id);
    
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You are not the owner of this resource' });
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};