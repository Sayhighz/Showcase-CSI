import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import loginRoutes from './routes/loginRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import { checkSecretKey } from './middleware/Middleware.js'; // นำเข้า secret key middleware

const app = express();

// กำหนด CORS
const corsOptions = {
    origin: 'http://localhost:5173',  // กำหนดให้อนุญาตให้แอปที่รันที่ localhost:5173 สามารถเข้าถึง
    methods: 'GET,POST,OPTIONS',      // กำหนด HTTP methods ที่อนุญาต
    allowedHeaders: 'Content-Type,Authorization,secret_key', // เพิ่ม 'secret_key' ให้สามารถถูกส่งได้ใน headers
    credentials: true,
  };

// ใช้ CORS middleware
app.use(cors(corsOptions));

// ใช้ body-parser
app.use(bodyParser.json());

// ใช้ middleware ตรวจสอบ secret_key ทั่วทั้งแอป
app.use(checkSecretKey);  // ใช้ middleware นี้กับทุก route

// ใช้ routes สำหรับ login
app.use('/auth', loginRoutes);
app.use('/search', searchRoutes);
app.use('/projects', projectRoutes);

const port = 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
