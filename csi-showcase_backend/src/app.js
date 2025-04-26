// app.js - จุดเริ่มต้นแอปพลิเคชัน
import { createApp, startServer } from './config/app.js';
import { initEnv } from './config/env.js';
import logger from './config/logger.js';
import pool from './config/database.js';
import { setupSwagger } from './config/swagger.js'; // เพิ่มการนำเข้า Swagger
import authRoutes from './routes/user/authRoutes.js';
import userRoutes from './routes/user/userRoutes.js';
import projectRoutes from './routes/user/projectRoutes.js';
import searchRoutes from './routes/user/searchRoutes.js';
import adminAuthRoutes from './routes/admin/adminAuthRoutes.js';
import adminUserRoutes from './routes/admin/adminUserRoutes.js';
import adminProjectRoutes from './routes/admin/adminProjectRoutes.js';
import statisticsRoutes from './routes/admin/statisticsRoutes.js';
import logsRoutes from './routes/admin/logsRoutes.js';
import uploadRoutes from './routes/common/uploadRoutes.js';
import { API_ROUTES } from './constants/routes.js';




// เริ่มต้นตรวจสอบและตั้งค่าตัวแปรสภาพแวดล้อม
if (!initEnv()) {
  logger.error('Failed to initialize environment variables. Exiting...');
  process.exit(1);
}

// สร้าง Express application
const app = createApp();

// กำหนดการใช้งาน Swagger
setupSwagger(app);

// กำหนดเส้นทาง API
app.use(API_ROUTES.AUTH.BASE, authRoutes);
app.use(API_ROUTES.USER.BASE, userRoutes);
app.use(API_ROUTES.PROJECT.BASE, projectRoutes);
app.use(API_ROUTES.SEARCH.BASE, searchRoutes);
app.use(API_ROUTES.ADMIN.AUTH.BASE, adminAuthRoutes);
app.use(API_ROUTES.ADMIN.USER.BASE, adminUserRoutes);
app.use(API_ROUTES.ADMIN.PROJECT.BASE, adminProjectRoutes);
app.use(API_ROUTES.ADMIN.STATISTICS.BASE, statisticsRoutes);
app.use(API_ROUTES.ADMIN.LOGS.BASE, logsRoutes);
app.use(API_ROUTES.UPLOAD.BASE, uploadRoutes);


// จัดการเส้นทางที่ไม่มีอยู่
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Endpoint not found'
  });
});

// ตรวจสอบการเชื่อมต่อฐานข้อมูลก่อนเริ่มเซิร์ฟเวอร์
pool.query('SELECT 1')
  .then(() => {
    // เริ่มต้นเซิร์ฟเวอร์
    const PORT = process.env.PORT || 5000;
    const server = startServer(app, PORT);

    // บันทึกข้อมูลการเริ่มเซิร์ฟเวอร์
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);

    // จัดการการปิดแอปพลิเคชันอย่างสง่างาม
    process.on('SIGTERM', gracefulShutdown(server));
    process.on('SIGINT', gracefulShutdown(server));
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
      
      // ปิดการเชื่อมต่อฐานข้อมูล
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
    
    // ตั้งเวลาการปิดเซิร์ฟเวอร์แบบบังคับหากไม่สามารถปิดได้ภายในเวลาที่กำหนด
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
}

export default app;