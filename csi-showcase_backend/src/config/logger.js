// config/logger.js
import winston from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

// สร้างโฟลเดอร์ logs หากยังไม่มี
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// กำหนดรูปแบบของล็อก
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => {
    return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}${info.splat ? info.splat : ''}`;
  })
);

// กำหนดไฟล์ล็อกรายวัน
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// กำหนดไฟล์ล็อกข้อผิดพลาด
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error'
});

// สร้าง logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
      level: 'debug'
    }),
    dailyRotateFileTransport,
    errorFileTransport
  ]
});

// เพิ่มฟังก์ชันเพื่อล็อกข้อมูล HTTP request
logger.logHttpRequest = (req, res, responseTime) => {
  const { method, originalUrl, ip } = req;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const statusCode = res.statusCode;
  
  logger.info(
    `HTTP ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms - IP: ${ip} - ${userAgent}`
  );
};

// เพิ่มฟังก์ชันเพื่อล็อกคำสั่ง SQL
logger.logDbQuery = (query, params = [], duration = null) => {
  if (process.env.NODE_ENV === 'development') {
    const queryLog = `SQL Query: ${query.replace(/\s+/g, ' ').trim()}`;
    const paramsLog = params.length > 0 ? ` - Params: ${JSON.stringify(params)}` : '';
    const durationLog = duration !== null ? ` - Duration: ${duration}ms` : '';
    
    logger.debug(`${queryLog}${paramsLog}${durationLog}`);
  }
};

export default logger;