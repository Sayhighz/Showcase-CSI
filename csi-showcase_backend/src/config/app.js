// config/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { requestLogger, errorLogger } from '../middleware/loggerMiddleware.js';
import { errorMiddleware } from '../middleware/errorMiddleware.js';
import { checkSecretKey } from '../middleware/secretKeyMiddleware.js';
import logger from './logger.js';
import { API_ROUTES } from '../constants/routes.js';

// กำหนด __dirname ใน ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * กำหนดค่า Express application
 * @param {Object} options - ตัวเลือกการตั้งค่า
 * @returns {express.Application} - Express application
 */
export const createApp = (options = {}) => {
  const app = express();
  
  // ตั้งค่า middleware พื้นฐาน
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })); // ช่วยในการรักษาความปลอดภัย HTTP headers แต่อนุญาต cross-origin
  
  app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'secret_key', 'admin_secret_key'],
    credentials: true
  }));
  
  app.use(compression()); // บีบอัดข้อมูลเพื่อลดขนาดการส่งข้อมูล
  app.use(express.json({ limit: '10mb' })); // แปลง JSON request bodies
  app.use(express.urlencoded({ extended: true, limit: '10mb' })); // แปลง URL-encoded request bodies
  app.use(cookieParser()); // แปลง Cookie headers
  
  // ตั้งค่า rate limiter เพื่อป้องกัน brute force
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100, // จำกัด 100 requests ต่อ IP ภายใน 15 นาที
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many requests, please try again later.'
    }
  });
  
  // ใช้ rate limiter สำหรับเส้นทาง auth
  app.use(`${API_ROUTES.AUTH.BASE}/*`, limiter);
  app.use(`${API_ROUTES.ADMIN.AUTH.BASE}/*`, limiter);
  
  // ตั้งค่า logging ในโหมด development
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  
  // ใช้ middleware บันทึกข้อมูล request
  app.use(requestLogger);
  
  // ตรวจสอบ API secret key
  if (options.useSecretKey !== false) {
    app.use(checkSecretKey);
  }
  
  // กำหนดเส้นทางสำหรับไฟล์ static พร้อมกับเพิ่ม CORS headers
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  }, express.static(path.join(__dirname, '..', '..', 'uploads')));
  
  // กำหนดเส้นทางสำหรับ health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // จัดการข้อผิดพลาด
  app.use(errorLogger);
  app.use(errorMiddleware);
  
  return app;
};

/**
 * เริ่มต้น Express server
 * @param {express.Application} app - Express application
 * @param {number} port - หมายเลขพอร์ต
 * @returns {http.Server} - HTTP server
 */
export const startServer = (app, port = process.env.PORT || 5000) => {
  return app.listen(port, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  });
};

export default { createApp, startServer };