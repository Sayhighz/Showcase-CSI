// app.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import middleware
import { checkSecretKey, checkAdminSecretKey } from './middleware/secretKeyMiddleware.js';
import { handleMulterError } from './middleware/userMiddleware.js';

// Import routes - User Routes
import userAuthRoutes from './routes/user/authRoutes.js';
import userProjectRoutes from './routes/user/projectRoutes.js';
import userSearchRoutes from './routes/user/searchRoutes.js';
import userRoutes from './routes/user/userRoutes.js';

// Import routes - Admin Routes
import adminAuthRoutes from './routes/admin/adminAuthRoutes.js';
import adminProjectRoutes from './routes/admin/adminProjectRoutes.js';
import adminUserRoutes from './routes/admin/adminUserRoutes.js';
import statisticsRoutes from './routes/admin/statisticsRoutes.js';
import logsRoutes from './routes/admin/logsRoutes.js';

// Import routes - Common Routes
import uploadRoutes from './routes/common/uploadRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// __dirname setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-Origin Resource Sharing (CORS) settings
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',  // Frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',  // Allowed HTTP methods
  allowedHeaders: 'Content-Type,Authorization,secret_key,admin_secret_key', // Allowed headers
  credentials: true, // Allow cookies
};

// Apply middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Set trust proxy for correct IP addresses behind load balancers
app.set('trust proxy', true);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CSI Showcase API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Apply secret key middleware for all API routes
app.use('/api', checkSecretKey);

// Apply admin secret key middleware for admin routes
app.use('/api/admin', checkAdminSecretKey);

// Register User API routes
app.use('/api/auth', userAuthRoutes);
app.use('/api/projects', userProjectRoutes);
app.use('/api/search', userSearchRoutes);
app.use('/api/users', userRoutes);

// Register Admin API routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/projects', adminProjectRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/statistics', statisticsRoutes);
app.use('/api/admin/logs', logsRoutes);

// Register Common API routes
app.use('/api/upload', uploadRoutes);

// Apply Multer error handler
app.use(handleMulterError);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Not Found handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route '${req.originalUrl}' not found`
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API URL: http://localhost:${PORT}`);
  });
}

export default app;