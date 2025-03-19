import mysql from 'mysql2';  // ใช้ mysql2 แทน mysql
import dotenv from 'dotenv';

// โหลดค่าจากไฟล์ .env
dotenv.config();

// สร้าง connection pool แทนการใช้ createConnection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',  // ใช้ localhost หรือ IP ที่ถูกต้อง
  user: process.env.DB_USER || 'root',      // ผู้ใช้ฐานข้อมูลที่ถูกต้อง
  password: process.env.DB_PASSWORD || 'yourPassword',  // รหัสผ่านที่ถูกต้อง
  database: process.env.DB_DATABASE || 'csi_showcase', // ชื่อฐานข้อมูลที่ต้องการเชื่อมต่อ
  port: process.env.DB_PORT || 3306         // ตรวจสอบว่าใช้พอร์ต 3306 หรือไม่
});

export default pool.promise();  // ใช้ .promise() เพื่อให้สามารถใช้ .execute ได้
