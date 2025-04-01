// ===== controllers/authController.js =====

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// ฟังก์ชันสำหรับเข้าสู่ระบบ
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // ค้นหาผู้ใช้จากฐานข้อมูล
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE username = ?
    `, [username]);
    
    // ตรวจสอบว่ามีผู้ใช้หรือไม่
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials: User not found' });
    }
    
    const user = users[0];
    
    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials: Incorrect password' });
    }
    
    // สร้าง JWT token
    const token = jwt.sign(
      { id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // บันทึกประวัติการเข้าสู่ระบบ
    await pool.execute(`
      INSERT INTO login_logs (user_id, ip_address)
      VALUES (?, ?)
    `, [user.user_id, req.ip]);
    
    return res.json({
      message: 'Login successful',
      success: true,
      token,
      user: {
        id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        image: user.image
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันสำหรับตรวจสอบข้อมูลผู้ใช้ปัจจุบัน
export const getCurrentUser = async (req, res) => {
  try {
    // ข้อมูลผู้ใช้อยู่ใน req.user แล้วจาก middleware
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // ค้นหาข้อมูลผู้ใช้เพิ่มเติมจากฐานข้อมูล
    const [users] = await pool.execute(`
      SELECT user_id, username, full_name, email, image, role, created_at 
      FROM users 
      WHERE user_id = ?
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    return res.json({
      id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      image: user.image,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันสำหรับตรวจสอบความถูกต้องของ token
export const verifyToken = (req, res) => {
  // ถ้ามาถึงจุดนี้แสดงว่า token ถูกต้อง (เพราะผ่าน middleware authenticateToken มาแล้ว)
  return res.json({ 
    valid: true, 
    user: req.user 
  });
};

// ฟังก์ชันสำหรับออกจากระบบ (Logout)
export const logout = (req, res) => {
  // ในการใช้ JWT การออกจากระบบจะทำที่ฝั่ง client
  // โดยการลบ token ออกจาก localStorage หรือ sessionStorage
  // แต่เราสามารถเพิ่มฟังก์ชันนี้เพื่อให้ frontend เรียกใช้ได้
  
  return res.json({ message: 'Logout successful' });
};

// ฟังก์ชันสำหรับรีเซ็ตรหัสผ่าน (เริ่มต้นกระบวนการรีเซ็ต)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // ค้นหาผู้ใช้จากอีเมล
    const [users] = await pool.execute(`
      SELECT * FROM users WHERE email = ?
    `, [email]);
    
    if (users.length === 0) {
      // ไม่ควรเปิดเผยว่าอีเมลไม่มีในระบบเพื่อความปลอดภัย
      return res.json({ message: 'If your email is registered, you will receive password reset instructions.' });
    }
    
    const user = users[0];
    
    // สร้าง reset token ที่มีอายุ 1 ชั่วโมง
    const resetToken = jwt.sign(
      { id: user.user_id, action: 'reset_password' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // บันทึก reset token และเวลาหมดอายุลงในฐานข้อมูล
    // (ต้องสร้างตาราง password_resets ก่อน)
    await pool.execute(`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
    `, [user.user_id, resetToken]);
    
    // ในระบบจริงควรส่งอีเมลที่มี URL พร้อม token ไปให้ผู้ใช้
    // แต่ในที่นี้จะส่ง token กลับมาเลย (สำหรับการพัฒนา)
    
    return res.json({
      message: 'If your email is registered, you will receive password reset instructions.',
      resetToken: resetToken // ในระบบจริงไม่ควรส่งค่านี้กลับไป
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันสำหรับรีเซ็ตรหัสผ่าน (ตั้งรหัสผ่านใหม่)
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    // ตรวจสอบความถูกต้องของ token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // ตรวจสอบว่า token นี้ใช้เพื่อรีเซ็ตรหัสผ่านหรือไม่
      if (decoded.action !== 'reset_password') {
        return res.status(400).json({ message: 'Invalid token purpose' });
      }
      
      // ตรวจสอบว่า token ยังไม่หมดอายุในฐานข้อมูล
      const [resetRecords] = await pool.execute(`
        SELECT * FROM password_resets
        WHERE user_id = ? AND token = ? AND expires_at > NOW()
      `, [decoded.id, token]);
      
      if (resetRecords.length === 0) {
        return res.status(400).json({ message: 'Token is invalid or has expired' });
      }
      
      // เข้ารหัสรหัสผ่านใหม่
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // อัปเดตรหัสผ่านใหม่
      await pool.execute(`
        UPDATE users
        SET password_hash = ?
        WHERE user_id = ?
      `, [hashedPassword, decoded.id]);
      
      // ลบ token ที่ใช้แล้ว
      await pool.execute(`
        DELETE FROM password_resets
        WHERE user_id = ? AND token = ?
      `, [decoded.id, token]);
      
      return res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Token has expired' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(400).json({ message: 'Invalid token' });
      }
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};