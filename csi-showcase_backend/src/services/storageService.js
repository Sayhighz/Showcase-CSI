// services/storageService.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger.js');
const { ALLOWED_FILE_TYPES, sanitizeFileName } = require('../constants/fileTypes.js');

/**
 * กำหนดโฟลเดอร์หลักสำหรับการจัดเก็บไฟล์
 */
const UPLOAD_PATHS = {
  profiles: 'uploads/profiles',
  images: 'uploads/images',
  videos: 'uploads/videos',
  documents: 'uploads/documents',
  others: 'uploads/others'
};

/**
 * สร้างโฟลเดอร์สำหรับเก็บไฟล์ถ้ายังไม่มี
 */
const initializeStorageFolders = () => {
  Object.values(UPLOAD_PATHS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created storage directory: ${dir}`);
    }
  });
};

// สร้างโฟลเดอร์เมื่อเริ่มต้นระบบ
initializeStorageFolders();

/**
 * กำหนดพื้นที่จัดเก็บสำหรับ multer
 * @param {string} storageType - ประเภทการจัดเก็บ (profiles, images, videos, documents, others)
 * @returns {multer.StorageEngine} - multer Storage Engine
 */
const createStorage = (storageType) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // ตรวจสอบโฟลเดอร์ว่ามีอยู่หรือไม่
      const uploadPath = UPLOAD_PATHS[storageType] || UPLOAD_PATHS.others;
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน
      const safeFileName = sanitizeFileName(file.originalname);
      const uniqueFileName = `${storageType}-${uuidv4()}${path.extname(safeFileName)}`;
      cb(null, uniqueFileName);
    }
  });
};

/**
 * ตรวจสอบประเภทไฟล์
 * @param {string} storageType - ประเภทการจัดเก็บ
 * @returns {Function} - ฟังก์ชันสำหรับตรวจสอบไฟล์
 */
const fileFilter = (storageType) => (req, file, cb) => {
  let allowedTypes;
  let maxSize;
  
  switch (storageType) {
    case 'profiles':
      allowedTypes = ALLOWED_FILE_TYPES.PROFILE_IMAGE;
      break;
    case 'images':
      allowedTypes = ALLOWED_FILE_TYPES.IMAGE;
      break;
    case 'videos':
      allowedTypes = ALLOWED_FILE_TYPES.VIDEO;
      break;
    case 'documents':
      allowedTypes = ALLOWED_FILE_TYPES.DOCUMENT;
      break;
    default:
      allowedTypes = ALLOWED_FILE_TYPES.OTHER;
  }
  
  // ตรวจสอบประเภทไฟล์
  if (!allowedTypes.MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`ไฟล์ประเภท ${file.mimetype} ไม่ได้รับอนุญาต สำหรับการอัปโหลด ${storageType}`), false);
  }
  
  // ตรวจสอบนามสกุลไฟล์
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.EXTENSIONS.includes(ext)) {
    return cb(new Error(`นามสกุลไฟล์ ${ext} ไม่ได้รับอนุญาต สำหรับการอัปโหลด ${storageType}`), false);
  }
  
  cb(null, true);
};

/**
 * สร้าง multer instance สำหรับการอัปโหลดไฟล์
 * @param {string} storageType - ประเภทการจัดเก็บ
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {multer.Multer} - multer instance
 */
const createUploader = (storageType, options = {}) => {
  const maxFileSize = options.maxSize || (
    ALLOWED_FILE_TYPES[storageType === 'profiles' ? 'PROFILE_IMAGE' : 
      storageType === 'images' ? 'IMAGE' : 
      storageType === 'videos' ? 'VIDEO' : 
      storageType === 'documents' ? 'DOCUMENT' : 'OTHER'].MAX_SIZE
  );
  
  return multer({
    storage: createStorage(storageType),
    limits: { 
      fileSize: maxFileSize,
      ...options.limits
    },
    fileFilter: fileFilter(storageType)
  });
};

/**
 * อัปโหลดไฟล์
 * @param {Object} req - Express request object
 * @param {string} storageType - ประเภทการจัดเก็บ
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {Promise<Object>} - ข้อมูลไฟล์ที่อัปโหลด
 */
const uploadFile = (req, storageType, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploader = createUploader(storageType, options).single('file');
    
    uploader(req, {}, (err) => {
      if (err) {
        logger.error(`File upload error: ${err.message}`);
        return reject(err);
      }
      
      if (!req.file) {
        return reject(new Error('No file uploaded'));
      }
      
      logger.info(`File uploaded: ${req.file.originalname} -> ${req.file.filename}`);
      
      // เพิ่มข้อมูล URL สำหรับเรียกใช้ไฟล์
      const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
      
      resolve({
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      });
    });
  });
};

/**
 * อัปโหลดไฟล์หลายไฟล์
 * @param {Object} req - Express request object
 * @param {string} storageType - ประเภทการจัดเก็บ
 * @param {string} fieldName - ชื่อฟิลด์สำหรับไฟล์หลายไฟล์
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {Promise<Array>} - รายการข้อมูลไฟล์ที่อัปโหลด
 */
const uploadMultipleFiles = (req, storageType, fieldName, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploader = createUploader(storageType, options).array(fieldName, options.maxCount || 10);
    
    uploader(req, {}, (err) => {
      if (err) {
        logger.error(`Multiple files upload error: ${err.message}`);
        return reject(err);
      }
      
      if (!req.files || req.files.length === 0) {
        return reject(new Error('No files uploaded'));
      }
      
      logger.info(`${req.files.length} files uploaded`);
      
      // เพิ่มข้อมูล URL สำหรับเรียกใช้ไฟล์
      const filesInfo = req.files.map(file => {
        const fileUrl = `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`;
        return {
          originalname: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          url: fileUrl
        };
      });
      
      resolve(filesInfo);
    });
  });
};

/**
 * ลบไฟล์
 * @param {string} filePath - เส้นทางไฟล์ที่ต้องการลบ
 * @returns {Promise<boolean>} - ผลการลบไฟล์
 */
const deleteFile = async (filePath) => {
  try {
    // ตรวจสอบว่าเป็นเส้นทางไฟล์ที่อยู่ในโฟลเดอร์ uploads หรือไม่
    if (!filePath.startsWith('uploads/')) {
      logger.warn(`Attempted to delete file outside uploads directory: ${filePath}`);
      return false;
    }
    
    // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found for deletion: ${filePath}`);
      return false;
    }
    
    // ลบไฟล์
    fs.unlinkSync(filePath);
    logger.info(`File deleted: ${filePath}`);
    
    return true;
  } catch (error) {
    logger.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

/**
 * ดึงข้อมูลสถานะการใช้พื้นที่จัดเก็บ
 * @returns {Promise<Object>} - ข้อมูลสถานะการใช้พื้นที่จัดเก็บ
 */
const getStorageStatus = async () => {
  try {
    const storageStats = {};
    let totalSize = 0;
    let totalFileCount = 0;
    
    // วนลูปดึงข้อมูลแต่ละโฟลเดอร์
    for (const [type, dir] of Object.entries(UPLOAD_PATHS)) {
      storageStats[type] = { totalSize: 0, fileCount: 0, files: [] };
      
      // ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่
      if (!fs.existsSync(dir)) {
        continue;
      }
      
      // อ่านรายการไฟล์ในโฟลเดอร์
      const files = fs.readdirSync(dir);
      
      // วนลูปดึงข้อมูลแต่ละไฟล์
      for (const file of files) {
        const filePath = path.join(dir, file);
        
        // ตรวจสอบว่าเป็นไฟล์จริงๆ หรือไม่
        if (fs.statSync(filePath).isFile()) {
          const stats = fs.statSync(filePath);
          storageStats[type].totalSize += stats.size;
          storageStats[type].fileCount++;
          
          // เก็บข้อมูลไฟล์
          storageStats[type].files.push({
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          });
        }
      }
      
      // แปลงขนาดเป็น MB
      storageStats[type].totalSizeMB = (storageStats[type].totalSize / (1024 * 1024)).toFixed(2);
      
      // รวมขนาดทั้งหมด
      totalSize += storageStats[type].totalSize;
      totalFileCount += storageStats[type].fileCount;
    }
    
    // แปลงขนาดรวมเป็น MB
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    return {
      totalSize,
      totalSizeMB,
      totalFileCount,
      categories: storageStats
    };
  } catch (error) {
    logger.error('Error getting storage status:', error);
    throw error;
  }
};

/**
 * อ่านไฟล์
 * @param {string} filePath - เส้นทางไฟล์ที่ต้องการอ่าน
 * @returns {Promise<Buffer>} - ข้อมูลไฟล์
 */
const readFile = async (filePath) => {
  try {
    // ตรวจสอบว่าเป็นเส้นทางไฟล์ที่อยู่ในโฟลเดอร์ uploads หรือไม่
    if (!filePath.startsWith('uploads/')) {
      throw new Error('Cannot read file outside uploads directory');
    }
    
    // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    // อ่านไฟล์
    const data = await fs.promises.readFile(filePath);
    return data;
  } catch (error) {
    logger.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getStorageStatus,
  readFile,
  createUploader,
  UPLOAD_PATHS
};