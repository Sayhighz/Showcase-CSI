// config/env.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// กำหนด __dirname ใน ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ตัวแปรสภาพแวดล้อมที่จำเป็น
 */
const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_DATABASE',
  'JWT_SECRET',
  'API_SECRET_KEY'
];

/**
 * ตัวแปรสภาพแวดล้อมที่ควรมีในการใช้งานจริง (production)
 */
const RECOMMENDED_PROD_ENV_VARS = [
  'JWT_ADMIN_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'CORS_ORIGIN'
];

/**
 * โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
 * @param {string} envPath - เส้นทางไฟล์ .env
 * @returns {Object} - ข้อมูลตัวแปรสภาพแวดล้อม
 */
export const loadEnv = (envPath = undefined) => {
  // กำหนดเส้นทางไฟล์ .env ตามสภาพแวดล้อม
  const defaultEnvPath = path.join(__dirname, '..','..', '.env');
  const envFilePath = envPath || defaultEnvPath;
  
  // ตรวจสอบว่าไฟล์ .env มีอยู่หรือไม่
  if (!fs.existsSync(envFilePath)) {
    console.warn(`Warning: ${envFilePath} file not found. Using environment variables.`);
  }
  
  // โหลดค่าจากไฟล์ .env
  const result = dotenv.config({ path: envFilePath });
  
  if (result.error) {
    console.warn(`Warning: Error loading .env file. Using environment variables. Error: ${result.error.message}`);
  }
  
  return process.env;
};

/**
 * ตรวจสอบตัวแปรสภาพแวดล้อมที่จำเป็น
 * @returns {Object} - ผลการตรวจสอบ
 */
export const validateEnv = () => {
  const missingVars = [];
  
  // ตรวจสอบตัวแปรที่จำเป็น
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  // ตรวจสอบตัวแปรที่แนะนำในโหมด production
  const recommendedMissingVars = [];
  if (process.env.NODE_ENV === 'production') {
    for (const envVar of RECOMMENDED_PROD_ENV_VARS) {
      if (!process.env[envVar]) {
        recommendedMissingVars.push(envVar);
      }
    }
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    recommendedMissingVars
  };
};

/**
 * ตั้งค่าตัวแปรสภาพแวดล้อมเริ่มต้น
 */
export const setDefaultEnv = () => {
  // กำหนดค่าเริ่มต้นสำหรับตัวแปรสภาพแวดล้อมที่ไม่ได้กำหนด
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || '5000';
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
};

/**
 * แสดงสถานะตัวแปรสภาพแวดล้อมในคอนโซล
 */
export const logEnvStatus = () => {
  const { isValid, missingVars, recommendedMissingVars } = validateEnv();
  
  if (!isValid) {
    console.error('Error: Missing required environment variables:');
    console.error(missingVars.join(', '));
    return false;
  }
  
  if (recommendedMissingVars.length > 0) {
    console.warn('Warning: Missing recommended environment variables for production:');
    console.warn(recommendedMissingVars.join(', '));
  }
  
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Server Port: ${process.env.PORT}`);
  
  return true;
};

/**
 * เริ่มต้นตรวจสอบและตั้งค่าตัวแปรสภาพแวดล้อม
 * @param {string} envPath - เส้นทางไฟล์ .env
 * @returns {boolean} - สถานะการเริ่มต้น
 */
export const initEnv = (envPath = undefined) => {
  loadEnv(envPath);
  setDefaultEnv();
  return logEnvStatus();
};

export default {
  loadEnv,
  validateEnv,
  setDefaultEnv,
  logEnvStatus,
  initEnv
};