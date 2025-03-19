import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// ฟังก์ชัน login
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials: User not found' });
    }

    const user = rows[0];

    // เปรียบเทียบรหัสผ่านที่กรอกกับที่เก็บไว้ในฐานข้อมูล
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: Incorrect password' });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
        message: 'Login successful',
        success: true,
        token,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ฟังก์ชันสำหรับตรวจสอบข้อมูลผู้ใช้ (ถ้าต้องการใช้ในเส้นทางอื่นๆ)
export const getUser = (req, res) => {
  res.json({ user: req.user });
};
