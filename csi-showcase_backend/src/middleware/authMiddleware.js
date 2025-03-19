import jwt from 'jsonwebtoken';

// ตรวจสอบ JWT
export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ใส่ข้อมูลผู้ใช้ใน req
    next(); // ต่อไปยัง middleware หรือ route
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid token.' });
  }
};
