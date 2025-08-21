const { createApp } = require('./src/config/app.js');
const { initEnv } = require('./src/config/env.js');
const logger = require('./src/config/logger.js');
const pool = require('./src/config/database.js');
const { setupSwagger } = require('./src/config/swagger.js');

// Routes
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

// Configuration
const BASE_PREFIX = process.env.API_BASE_PREFIX || '/csie/backend2';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ป้องกันการ initialize ซ้ำใน cPanel/Passenger
if (global.__CSIE_SERVER_STARTED__) {
  logger.warn('Server already initialized, skipping...');
  module.exports = global.__CSIE_APP_INSTANCE__;
  return;
}

// เริ่มต้นตรวจสอบและตั้งค่าตัวแปรสภาพแวดล้อม
try {
  if (!initEnv()) {
    console.error('Failed to initialize environment variables');
    if (!IS_PRODUCTION) {
      process.exit(1);
    }
  }
} catch (error) {
  console.error('Environment initialization error:', error);
  if (!IS_PRODUCTION) {
    process.exit(1);
  }
}

// สร้าง Express application
const app = createApp({ basePrefix: BASE_PREFIX });

// Trust proxy
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

// ======= Root Routes =======
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CSI Showcase API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    baseApiPath: BASE_PREFIX,
    availableEndpoints: {
      api: BASE_PREFIX,
      health: ['/health', `${BASE_PREFIX}/health`]
    },
    timestamp: new Date().toISOString()
  });
});

// Base prefix root
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
    health: ['/health', `${BASE_PREFIX}/health`]
  });
});

// Redirects
app.get('/api', (req, res) => {
  res.redirect(301, BASE_PREFIX);
});

app.get(`${BASE_PREFIX}/api`, (req, res) => {
  res.redirect(301, BASE_PREFIX);
});

// Legacy route redirect
app.use(`${BASE_PREFIX}/api/project`, (req, res) => {
  const from = req.originalUrl;
  const to = from.replace(`${BASE_PREFIX}/api/project`, `${BASE_PREFIX}/api/projects`);
  logger.warn(`Redirecting legacy path ${from} -> ${to}`);
  return res.redirect(301, to);
});

// ======= Health Check Endpoints =======
app.get('/health', healthCheckResponse);
app.get(`${BASE_PREFIX}/health`, healthCheckResponse);
app.get(`${BASE_PREFIX}/api/health`, healthCheckResponse);

// ======= Setup Swagger (ถ้ามี) =======
try {
  if (setupSwagger && typeof setupSwagger === 'function') {
    setupSwagger(app, BASE_PREFIX);
  }
} catch (error) {
  logger.warn('Swagger setup failed:', error.message);
}

// ======= Test Endpoints =======
app.get(`${BASE_PREFIX}/api/test-bypass`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bypass test endpoint is reachable',
    timestamp: new Date().toISOString(),
    basePrefix: BASE_PREFIX,
    path: req.originalUrl
  });
});

// Database test endpoint
app.get(`${BASE_PREFIX}/api/test-db`, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute('SELECT 1 as test, NOW() as server_time');
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      data: {
        query_result: result[0],
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Database test failed:', error);
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        logger.error('Error releasing connection:', releaseError);
      }
    }
  }
});

// ======= API Routes =======
app.use(`${BASE_PREFIX}${API_ROUTES.AUTH.BASE}`, authRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.PROJECT.BASE}`, projectRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.SEARCH.BASE}`, searchRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.AUTH.BASE}`, adminAuthRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.USER.BASE}`, adminUserRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.PROJECT.BASE}`, adminProjectRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.STATISTICS.BASE}`, statisticsRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.ADMIN.LOGS.BASE}`, logsRoutes);
app.use(`${BASE_PREFIX}${API_ROUTES.UPLOAD.BASE}`, uploadRoutes);

// ======= 404 Handler =======
app.use('*', (req, res) => {
  const isApiRequest = req.originalUrl.startsWith(BASE_PREFIX);
  const isHealthRequest = req.originalUrl === '/health' || req.originalUrl === `${BASE_PREFIX}/health`;
  
  if (isHealthRequest) {
    return healthCheckResponse(req, res);
  }
  
  if (isApiRequest) {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: 'API endpoint not found',
      path: req.originalUrl,
      suggestion: `Available API endpoints start with: ${BASE_PREFIX}`,
      availableRoutes: {
        root: BASE_PREFIX,
        health: `${BASE_PREFIX}/health`
      }
    });
  } else {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: 'Page not found',
      path: req.originalUrl,
      availableEndpoints: {
        root: '/',
        api: BASE_PREFIX,
        health: ['/health', `${BASE_PREFIX}/health`]
      }
    });
  }
});

// ======= Database Connection & Server Initialization =======

// ตั้ง flag ป้องกันการ initialize ซ้ำ
global.__CSIE_SERVER_STARTED__ = true;
global.__CSIE_APP_INSTANCE__ = app;

// ตรวจสอบ database connection (async, non-blocking)
pool.query('SELECT 1')
  .then(() => {
    logger.info(`Successfully connected to database: ${process.env.DB_DATABASE || 'unknown'}`);
    
    // ตรวจสอบว่าอยู่ใน Passenger/cPanel environment
    const isPassenger = typeof(PhusionPassenger) !== 'undefined' ||
                       process.env.PASSENGER_APP_ENV ||
                       process.env.IN_PASSENGER ||
                       process.env.NODE_ENV === 'production';
    
    if (isPassenger) {
      logger.info('Running in Passenger/cPanel environment');
      if (typeof(PhusionPassenger) !== 'undefined') {
        PhusionPassenger.configure({ autoInstall: false });
      }
    } else {
      // Start server เฉพาะเมื่อไม่ได้อยู่ใน Passenger
      const PORT = process.env.PORT || 5000;
      const { startServer } = require('./src/config/app.js');
      
      try {
        const server = startServer(app, PORT, BASE_PREFIX);
        
        logger.info(`Server running on port ${PORT}`);
        logger.info(`API base path: ${BASE_PREFIX}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        
        // Graceful shutdown
        process.on('SIGTERM', gracefulShutdown(server));
        process.on('SIGINT', gracefulShutdown(server));
      } catch (error) {
        logger.error('Failed to start server:', error);
      }
    }
  })
  .catch(error => {
    logger.error('Database connection error:', error);
    // ไม่ exit ใน production
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
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

// Error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;