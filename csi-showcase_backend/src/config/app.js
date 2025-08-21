// config/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { requestLogger, errorLogger } = require('../middleware/loggerMiddleware.js');
const { errorMiddleware } = require('../middleware/errorMiddleware.js');
const { checkSecretKey } = require('../middleware/secretKeyMiddleware.js');
const logger = require('./logger.js');
const { API_ROUTES } = require('../constants/routes.js');

/**
 * กำหนดค่า Express application สำหรับ cPanel
 * @param {Object} options - ตัวเลือกการตั้งค่า
 * @returns {express.Application} - Express application
 */
const createApp = (options = {}) => {
  const app = express();
  
  // Trust proxy สำหรับ cPanel/shared hosting
  app.set('trust proxy', true);
  
  // ตั้งค่า middleware พื้นฐาน - ปรับแต่งสำหรับ cPanel
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // ปิดเพราะอาจขัดแย้งกับ cPanel
    hsts: false, // cPanel จัดการ HTTPS เอง
    crossOriginEmbedderPolicy: false, // ปิดเพื่อความเข้ากันได้
    crossOriginOpenerPolicy: false
  }));
  
  // กำหนดค่า CORS ที่เหมาะสมกับ cPanel
  const isProd = process.env.NODE_ENV === 'production';
  const rawOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';
  const envOrigins = rawOrigins
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const allowedOrigins = isProd ? envOrigins : ['*', ...envOrigins];

  app.use(cors({
    origin: function(origin, callback) {
      // อนุญาต requests ที่ไม่มี origin (mobile apps, curl)
      if (!origin) return callback(null, true);

      // ใน development อนุญาตทั้งหมด
      if (!isProd) return callback(null, true);

      // ใน production ตรวจสอบ allowed origins
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // ใน cPanel ให้อนุญาตเพื่อหลีกเลี่ยงปัญหา CORS
        logger.warn(`CORS warning for origin: ${origin}`);
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'secret_key',
      'admin_secret_key',
      'Accept',
      'Origin',
      'Cache-Control'
    ],
    credentials: true,
    optionsSuccessStatus: 200
  }));
  
  // Handle preflight requests
  app.options('*', cors());
  
  app.use(compression());
  app.use(express.json({ 
    limit: '5mb', // ลดขนาดใน cPanel เพื่อประหยัด memory
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());
  
  // ตั้งค่า rate limiter ที่อ่อนโยนกว่าสำหรับ cPanel
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: isProd ? 300 : 1000, // เพิ่มขีดจำกัดใน production
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || 
             req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
             req.connection.remoteAddress ||
             'unknown';
    },
    skip: (req) => {
      // Skip สำหรับ health check และ static files
      return req.url === '/health' || 
             req.url.includes('/uploads/') ||
             req.url.includes('/health');
    }
  });
  
  // กำหนด base prefix
  const BASE_PREFIX = options.basePrefix || process.env.API_BASE_PREFIX || '/csie/backend2';

  // ใช้ rate limiter เฉพาะ auth routes
  app.use(`${BASE_PREFIX}${API_ROUTES.AUTH.BASE}`, limiter);
  if (API_ROUTES.ADMIN && API_ROUTES.ADMIN.AUTH) {
    app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.AUTH.BASE}`, limiter);
  }
  
  // ตั้งค่า logging - ลดความซับซ้อนใน cPanel
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      skip: (req, res) => {
        return req.url === '/health' || req.url.includes('/health');
      }
    }));
  }
  
  // ใช้ middleware บันทึกข้อมูล request
  app.use(requestLogger);
  
  // ตรวจสอบ API secret key
  if (options.useSecretKey !== false) {
    app.use(`${BASE_PREFIX}/api/admin/*`, checkSecretKey);
  }
  
  // Static file serving - ลบ image resize เพื่อประหยัด CPU
  app.use(`${BASE_PREFIX}/uploads`, (req, res, next) => {
    // เพิ่ม CORS headers สำหรับ static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    next();
  }, express.static(path.join(__dirname, '..', '..', 'uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      basePrefix: BASE_PREFIX
    });
  });
  
  // API info endpoint
  app.get(`${BASE_PREFIX}/info`, (req, res) => {
    res.json({
      name: 'CSIE Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      basePrefix: BASE_PREFIX,
      endpoints: {
        health: '/health',
        uploads: `${BASE_PREFIX}/uploads`
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // จัดการข้อผิดพลาด
  app.use(errorLogger);
  app.use(errorMiddleware);
  
  return app;
};

/**
 * เริ่มต้น Express server (ไม่ใช้ใน cPanel)
 */
const startServer = (app, port = process.env.PORT || 5000, basePrefix = '/csie/backend2') => {
  const host = process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';
  
  return app.listen(port, host, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`Listening on ${host}:${port}`);
    logger.info(`API base path: ${basePrefix}`);
  });
};

module.exports = { createApp, startServer };