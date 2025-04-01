// ===== server.js =====

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import searchRoutes from './routes/searchRoutes.js'; // ถ้ามี searchRoutes
import { checkSecretKey } from './middleware/secretKeyMiddleware.js'; // นำเข้า secret key middleware

// Initialize .env configuration
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// __dirname setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// กำหนด CORS
const corsOptions = {
  origin: 'http://localhost:5173',  // กำหนดให้อนุญาตให้แอปที่รันที่ localhost:5173 สามารถเข้าถึง
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',  // กำหนด HTTP methods ที่อนุญาต
  allowedHeaders: 'Content-Type,Authorization,secret_key', // เพิ่ม 'secret_key' ให้สามารถถูกส่งได้ใน headers
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));  // ใช้ CORS options ที่กำหนด
app.use(bodyParser.json());  // ใช้ body-parser สำหรับ JSON
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set trust proxy to get correct IP addresses
app.set('trust proxy', true);

// ใช้ middleware ตรวจสอบ secret_key ทั่วทั้งแอป
app.use(checkSecretKey);  // ใช้ middleware นี้กับทุก route

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes); // ถ้ามี searchRoutes

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to CSI Showcase API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});