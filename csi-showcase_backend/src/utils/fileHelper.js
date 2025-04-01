// utils/fileHelper.js
import fs from 'fs';
import path from 'path';

/**
 * สร้างโฟลเดอร์หากยังไม่มี
 * @param {string} dirPath - เส้นทางของโฟลเดอร์ที่ต้องการสร้าง
 * @returns {boolean} - ผลการสร้างโฟลเดอร์
 */
export const createDirectoryIfNotExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    return false;
  }
};

/**
 * ลบไฟล์จากระบบ
 * @param {string} filePath - เส้นทางของไฟล์ที่ต้องการลบ
 * @returns {boolean} - ผลการลบไฟล์
 */
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

/**
 * สร้างชื่อไฟล์ที่ไม่ซ้ำกันโดยใช้ timestamp และตัวเลขสุ่ม
 * @param {string} originalFilename - ชื่อไฟล์ต้นฉบับ
 * @param {string} prefix - คำนำหน้าชื่อไฟล์ (optional)
 * @returns {string} - ชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน
 */
export const generateUniqueFilename = (originalFilename, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = path.extname(originalFilename);
  return `${prefix}${timestamp}-${random}${ext}`;
};

/**
 * ตรวจสอบว่าไฟล์เป็นประเภทที่อนุญาตหรือไม่
 * @param {string} filename - ชื่อไฟล์ที่ต้องการตรวจสอบ
 * @param {string} mimetype - MIME type ของไฟล์
 * @param {RegExp} allowedTypes - Regular expression ของประเภทไฟล์ที่อนุญาต
 * @returns {boolean} - ผลการตรวจสอบ
 */
export const isAllowedFileType = (filename, mimetype, allowedTypes) => {
  const ext = path.extname(filename).toLowerCase();
  return allowedTypes.test(mimetype) && allowedTypes.test(ext);
};

/**
 * ตรวจสอบขนาดไฟล์ว่าไม่เกินขนาดที่กำหนด
 * @param {number} fileSize - ขนาดไฟล์ในหน่วย bytes
 * @param {number} maxSizeInMB - ขนาดไฟล์สูงสุดที่อนุญาตในหน่วย MB
 * @returns {boolean} - ผลการตรวจสอบ
 */
export const isFileSizeValid = (fileSize, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};