// config/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { requestLogger, errorLogger } = require('../middleware/loggerMiddleware.js');
const { errorMiddleware } = require('../middleware/errorMiddleware.js');
const { checkSecretKey } = require('../middleware/secretKeyMiddleware.js');
const logger = require('./logger.js');
const { API_ROUTES } = require('../constants/routes.js');

// __dirname มีอยู่แล้วใน CommonJS ไม่ต้องกำหนดเพิ่ม

/**
 * กำหนดค่า Express application
 * @param {Object} options - ตัวเลือกการตั้งค่า
 * @returns {express.Application} - Express application
 */
const createApp = (options = {}) => {
  const app = express();
  
  // Trust proxy เพราะอยู่หลัง Apache
  app.set('trust proxy', true);
  
  // ตั้งค่า middleware พื้นฐาน - ปรับแต่งสำหรับ Apache proxy
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // ปิดเพราะ Apache จัดการแล้ว
    hsts: false, // Apache จัดการ HTTPS แล้ว
  }));
  
  // กำหนดค่า CORS ที่ปรับแต่งสำหรับ production
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        // Production origins
        'https://sitspu.com',
        'https://www.sitspu.com',
      ]
    : [
        // Development origins
        '*',
        'https://sitspu.com',
        'https://www.sitspu.com',
      ];
  
  app.use(cors({
    origin: function(origin, callback) {
      // อนุญาต requests ที่ไม่มี origin (เช่น mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      // ใน development อนุญาตทุก origin
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // ใน production ตรวจสอบ allowed origins
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        // ใน production ควรจะ strict มากขึ้น
        callback(new Error(`CORS policy doesn't allow origin: ${origin}`));
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
      'Cache-Control',
      'X-Forwarded-For',
      'X-Real-IP'
    ],
    credentials: true, // สำคัญมาก! ต้องเปิดใช้เพื่อให้ส่ง cookies ข้าม domain ได้
    optionsSuccessStatus: 200 // สำหรับ legacy browser support
  }));
  
  // Handle preflight requests
  app.options('*', cors());
  
  app.use(compression()); // บีบอัดข้อมูลเพื่อลดขนาดการส่งข้อมูล
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf; // เก็บ raw body สำหรับการใช้งานพิเศษ
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser()); // แปลง Cookie headers
  
  // ตั้งค่า rate limiter เพื่อป้องกัน brute force - ปรับแต่งสำหรับ proxy
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // production เข้มงวดกว่า
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // ใช้ IP ที่แท้จริงจาก proxy headers
    keyGenerator: (req) => {
      return req.ip || 
             req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress ||
             'unknown';
    },
    skip: (req) => {
      // Skip rate limiting สำหรับ health check
      return req.url === '/health';
    }
  });
  
  // กำหนด base prefix
  const BASE_PREFIX = '/csie/backend';
  
  // ใช้ rate limiter สำหรับเส้นทาง auth เท่านั้น
  app.use(`${BASE_PREFIX}${API_ROUTES.AUTH.BASE}`, limiter);
  app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.AUTH.BASE}`, limiter);
  
  // ตั้งค่า logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      },
      skip: (req, res) => {
        // Skip logging สำหรับ health checks ใน production
        return req.url === '/health' && res.statusCode < 400;
      }
    }));
  }
  
  // Custom middleware สำหรับ log request details ใน development
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      logger.debug('Request details:', {
        method: req.method,
        url: req.url,
        origin: req.get('Origin'),
        userAgent: req.get('User-Agent'),
        realIP: req.get('X-Real-IP'),
        forwardedFor: req.get('X-Forwarded-For')
      });
      next();
    });
  }
  
  // ใช้ middleware บันทึกข้อมูล request
  app.use(requestLogger);
  
  // ตรวจสอบ API secret key (เฉพาะเส้นทางที่ต้องการ)
  if (options.useSecretKey !== false) {
    // ใช้ secret key middleware เฉพาะกับ API routes ที่มี prefix
    app.use(`${BASE_PREFIX}/*`, checkSecretKey);
  }
  
  // กำหนดเส้นทางสำหรับไฟล์ static พร้อมกับเพิ่ม CORS headers
  app.use(`${BASE_PREFIX}/uploads`, (req, res, next) => {
    // เพิ่ม CORS headers ให้ไฟล์ static
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // เพิ่ม cache headers สำหรับ static files
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    next();
  }, express.static(path.join(__dirname, '..', '..', 'uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
  
  // กำหนดเส้นทางสำหรับ health check (ไม่มี prefix)
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      basePrefix: BASE_PREFIX
    });
  });
  
  // เพิ่ม info endpoint สำหรับ API information
  app.get(`${BASE_PREFIX}/info`, (req, res) => {
    res.json({
      name: 'CSIE Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      basePrefix: BASE_PREFIX,
      endpoints: {
        swagger: `${BASE_PREFIX}/api-docs`,
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
 * เริ่มต้น Express server
 * @param {express.Application} app - Express application
 * @param {number} port - หมายเลขพอร์ต
 * @returns {http.Server} - HTTP server
 */
const startServer = (app, port = process.env.PORT || 5000) => {
  // Bind เฉพาะ localhost เพราะอยู่หลัง Apache proxy
  const host = process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';
  
  return app.listen(port, host, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`Listening on ${host}:${port}`);
    logger.info(`API base path: /csie/backend`);
    
    if (process.env.NODE_ENV === 'production') {
      logger.info('Server is running behind Apache proxy');
    }
  });
};

module.exports = { createApp, startServer };