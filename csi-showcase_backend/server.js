const { createApp, startServer } = require('./src/config/app.js');
const { initEnv } = require('./src/config/env.js');
const logger = require('./src/config/logger.js');
const pool = require('./src/config/database.js');
const { setupSwagger } = require('./src/config/swagger.js');
const authRoutes = require('./src/routes/user/authRoutes.js');
const projectRoutes = require('./src/routes/user/projectRoutes.js');
const searchRoutes = require('./src/routes/user/searchRoutes.js');
const adminAuthRoutes = require('./src/routes/admin/adminAuthRoutes.js');
const adminUserRoutes = require('./src/routes/admin/adminUserRoutes.js');
const adminProjectRoutes = require('./src/routes/admin/adminProjectRoutes.js');
const statisticsRoutes = require('./src/routes/admin/statisticsRoutes.js');
const logsRoutes = require('./src/routes/admin/logsRoutes.js');
const uploadRoutes = require('./src/routes/common/uploadRoutes.js');
const { API_ROUTES } = require('./src/constants/routes.js');

// กำหนด configuration - แก้ไขให้ตรงกับที่คุณใช้
const BASE_PREFIX = '/csie/backend2';  // เปลี่ยนจาก /csie/backend เป็น /csie/backend2
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// เริ่มต้นตรวจสอบและตั้งค่าตัวแปรสภาพแวดล้อม
if (!initEnv()) {
  logger.error('Failed to initialize environment variables. Exiting...');
  process.exit(1);
}

// สร้าง Express application
const app = createApp();

// Trust proxy เพราะอยู่หลัง Apache
app.set('trust proxy', true);

// ======= Health Check Function =======
const healthCheckResponse = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    basePrefix: BASE_PREFIX,
    uptime: process.uptime(),
    path: req.originalUrl
  });
};

// ======= Routes สำหรับ Root Path =======

// Root path - Welcome page
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CSI Showcase API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    baseApiPath: BASE_PREFIX,
    availableEndpoints: {
      api: BASE_PREFIX,
      swagger: `${BASE_PREFIX}/api-docs`,
      health: ['/health', `${BASE_PREFIX}/health`]  // แสดงทั้งสองแบบ
    },
    timestamp: new Date().toISOString()
  });
});

// Base prefix root - API information
app.get(BASE_PREFIX, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CSI Showcase API Server',
    version: '1.0.0',
    endpoints: {
      auth: `${BASE_PREFIX}${API_ROUTES.AUTH.BASE}`,
      projects: `${BASE_PREFIX}${API_ROUTES.PROJECT.BASE}`,
      search: `${BASE_PREFIX}${API_ROUTES.SEARCH.BASE}`,
      upload: `${BASE_PREFIX}${API_ROUTES.UPLOAD.BASE}`,
      admin: {
        auth: `${BASE_PREFIX}${API_ROUTES.ADMIN.AUTH.BASE}`,
        users: `${BASE_PREFIX}${API_ROUTES.ADMIN.USER.BASE}`,
        projects: `${BASE_PREFIX}${API_ROUTES.ADMIN.PROJECT.BASE}`,
        statistics: `${BASE_PREFIX}${API_ROUTES.ADMIN.STATISTICS.BASE}`,
        logs: `${BASE_PREFIX}${API_ROUTES.ADMIN.LOGS.BASE}`
      }
    },
    documentation: `${BASE_PREFIX}/api-docs`,
    health: ['/health', `${BASE_PREFIX}/health`]
  });
});

// Redirect จาก /api ไป base prefix
app.get('/api', (req, res) => {
  res.redirect(301, BASE_PREFIX);
});

// ======= Health Check Endpoints (ทั้งสองแบบ) =======
// Health check endpoint แบบไม่มี prefix
app.get('/health', healthCheckResponse);

// Health check endpoint แบบมี prefix
app.get(`${BASE_PREFIX}/health`, healthCheckResponse);

// ======= Setup Swagger =======
setupSwagger(app, BASE_PREFIX);

// ======= API Routes พร้อม prefix =======
app.use(`${BASE_PREFIX}${API_ROUTES.AUTH.BASE}`, authRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.PROJECT.BASE}`, projectRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.SEARCH.BASE}`, searchRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.AUTH.BASE}`, adminAuthRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.USER.BASE}`, adminUserRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.PROJECT.BASE}`, adminProjectRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.STATISTICS.BASE}`, statisticsRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.LOGS.BASE}`, logsRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.UPLOAD.BASE}`, uploadRoutes);

// ======= 404 Handler ที่ปรับปรุงแล้ว =======
app.use('*', (req, res) => {
  const isApiRequest = req.originalUrl.startsWith(BASE_PREFIX);
  const isHealthRequest = req.originalUrl === '/health' || req.originalUrl === `${BASE_PREFIX}/health`;
  
  // ไม่ควรเข้าที่นี่หาก health endpoint ทำงานถูกต้อง
  if (isHealthRequest) {
    return healthCheckResponse(req, res);
  }
  
  if (isApiRequest) {
    // สำหรับ API requests ที่ไม่พบ
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: 'API endpoint not found',
      path: req.originalUrl,
      suggestion: `Available API endpoints start with: ${BASE_PREFIX}`,
      documentation: `${BASE_PREFIX}/api-docs`,
      availableRoutes: {
        root: BASE_PREFIX,
        health: `${BASE_PREFIX}/health`,
        swagger: `${BASE_PREFIX}/api-docs`
      }
    });
  } else {
    // สำหรับ requests อื่นๆ
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: 'Page not found',
      path: req.originalUrl,
      availableEndpoints: {
        root: '/',
        api: BASE_PREFIX,
        swagger: `${BASE_PREFIX}/api-docs`,
        health: ['/health', `${BASE_PREFIX}/health`]
      },
      suggestion: 'Try accessing the API endpoints with the correct base path'
    });
  }
});

// ======= Database Connection & Server Start =======
pool.query('SELECT 1')
  .then(() => {
    const PORT = process.env.PORT || 5000;
    const server = startServer(app, PORT);

    // บันทึกข้อมูลการเริ่มเซิร์ฟเวอร์
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Root path available at: /`);
    logger.info(`API base path: ${BASE_PREFIX}`);
    logger.info(`Swagger documentation: ${BASE_PREFIX}/api-docs`);
    logger.info(`Health check: /health and ${BASE_PREFIX}/health`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (IS_PRODUCTION) {
      logger.info('Running behind Apache proxy with .htaccess configuration');
    }

    // จัดการการปิดแอปพลิเคชันอย่างสง่างาม
    process.on('SIGTERM', gracefulShutdown(server));
    process.on('SIGINT', gracefulShutdown(server));
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown(server)();
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
  })
  .catch(error => {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  });

// ฟังก์ชันสำหรับการปิดแอปพลิเคชันอย่างสง่างาม
function gracefulShutdown(server) {
  return () => {
    logger.info('Received kill signal, shutting down gracefully...');
    
    server.close(() => {
      logger.info('HTTP server closed');
      
      pool.end()
        .then(() => {
          logger.info('Database connection closed');
          process.exit(0);
        })
        .catch(err => {
          logger.error('Error closing database connection:', err);
          process.exit(1);
        });
    });
    
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
}

module.exports = app;