// ===== controllers/common/uploadController.js =====

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// กำหนดโฟลเดอร์สำหรับเก็บไฟล์แต่ละประเภท
const UPLOAD_PATHS = {
  profiles: 'uploads/profiles/',
  images: 'uploads/images/',
  videos: 'uploads/videos/',
  documents: 'uploads/documents/',
  others: 'uploads/others/'
};

// ตรวจสอบและสร้างโฟลเดอร์ถ้าไม่มี
Object.values(UPLOAD_PATHS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// กำหนดขนาดไฟล์สูงสุดสำหรับแต่ละประเภท (หน่วย: bytes)
const MAX_FILE_SIZES = {
  profiles: 5 * 1024 * 1024, // 5MB
  images: 10 * 1024 * 1024,  // 10MB
  videos: 50 * 1024 * 1024,  // 50MB
  documents: 20 * 1024 * 1024, // 20MB
  others: 10 * 1024 * 1024    // 10MB
};

// กำหนดประเภทไฟล์ที่อนุญาตสำหรับแต่ละหมวดหมู่
const ALLOWED_MIMETYPES = {
  profiles: ['image/jpeg', 'image/png', 'image/gif'],
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  others: ['application/zip', 'application/x-rar-compressed', 'application/octet-stream']
};

// กำหนด storage options สำหรับ multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ตัดสินใจว่าจะเก็บไฟล์ไว้ที่โฟลเดอร์ไหน
    let uploadPath = UPLOAD_PATHS.others; // default path
    
    // ตรวจสอบประเภทไฟล์
    if (file.mimetype.startsWith('image/')) {
      // ตรวจสอบว่าเป็นการอัปโหลดรูปโปรไฟล์หรือไม่
      if (req.uploadType === 'profile') {
        uploadPath = UPLOAD_PATHS.profiles;
      } else {
        uploadPath = UPLOAD_PATHS.images;
      }
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = UPLOAD_PATHS.videos;
    } else if (file.mimetype === 'application/pdf' || file.mimetype.includes('word') || file.mimetype.includes('powerpoint')) {
      uploadPath = UPLOAD_PATHS.documents;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    let prefix = 'file';
    
    // กำหนด prefix ตามประเภทไฟล์
    if (file.mimetype.startsWith('image/')) {
      prefix = req.uploadType === 'profile' ? 'profile' : 'image';
    } else if (file.mimetype.startsWith('video/')) {
      prefix = 'video';
    } else if (file.mimetype === 'application/pdf') {
      prefix = 'document';
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// ตรวจสอบว่าไฟล์ที่อัปโหลดถูกต้องตามเงื่อนไขหรือไม่
const fileFilter = (req, file, cb) => {
  // กำหนดประเภทการอัปโหลดจาก request body หรือ query parameters
  const uploadType = req.body.uploadType || req.query.uploadType || 'others';
  req.uploadType = uploadType;
  
  // ตรวจสอบว่าประเภทไฟล์อยู่ในรายการที่อนุญาตหรือไม่
  const allowedTypes = ALLOWED_MIMETYPES[uploadType] || ALLOWED_MIMETYPES.others;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // อนุญาตให้อัปโหลด
  } else {
    cb(new Error(`ไม่อนุญาตให้อัปโหลดไฟล์ประเภท ${file.mimetype}`), false);
  }
};

// สร้าง multer middleware สำหรับแต่ละประเภทการอัปโหลด
const createUploader = (uploadType) => {
  return multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZES[uploadType] || MAX_FILE_SIZES.others },
    fileFilter: fileFilter
  });
};

// --------------------------------------------------------
// Middleware สำหรับอัปโหลดแต่ละประเภท
// --------------------------------------------------------

// สำหรับอัปโหลดรูปโปรไฟล์ (เฉพาะ 1 ไฟล์)
export const uploadProfileImage = createUploader('profiles').single('image');

// สำหรับอัปโหลดรูปภาพทั่วไป (สูงสุด 5 ไฟล์)
export const uploadImages = createUploader('images').array('images', 5);

// สำหรับอัปโหลดวิดีโอ (เฉพาะ 1 ไฟล์)
export const uploadVideo = createUploader('videos').single('video');

// สำหรับอัปโหลดเอกสาร (สูงสุด 3 ไฟล์)
export const uploadDocuments = createUploader('documents').array('documents', 3);

// สำหรับอัปโหลดไฟล์ทั่วไป (สูงสุด 5 ไฟล์)
export const uploadFiles = createUploader('others').array('files', 5);

// สำหรับอัปโหลดหลายประเภทในคราวเดียว
export const uploadMultiple = createUploader('others').fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 },
  { name: 'documents', maxCount: 3 }
]);

// --------------------------------------------------------
// Controller functions
// --------------------------------------------------------

// ฟังก์ชันอัปโหลดไฟล์ทั่วไป
export const handleFileUpload = async (req, res) => {
  try {
    // ตรวจสอบว่ามีไฟล์หรือไม่
    if (!req.file && !req.files) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // เตรียมข้อมูลสำหรับการตอบกลับ
    let response = { success: true, message: 'File uploaded successfully' };
    
    // กรณีอัปโหลดไฟล์เดียว
    if (req.file) {
      response.file = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }
    
    // กรณีอัปโหลดหลายไฟล์ (array)
    if (req.files && Array.isArray(req.files)) {
      response.files = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
    }
    
    // กรณีอัปโหลดหลายประเภท (fields)
    if (req.files && !Array.isArray(req.files)) {
      response.files = {};
      
      Object.keys(req.files).forEach(fieldname => {
        response.files[fieldname] = req.files[fieldname].map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        }));
      });
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
  }
};

// ฟังก์ชันลบไฟล์
export const deleteFile = async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ success: false, message: 'File path is required' });
    }
    
    // ตรวจสอบว่าเป็น path ที่อยู่ในโฟลเดอร์ uploads จริงหรือไม่
    if (!filePath.startsWith('uploads/')) {
      return res.status(400).json({ success: false, message: 'Invalid file path' });
    }
    
    // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    // ลบไฟล์
    fs.unlinkSync(filePath);
    
    return res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    return res.status(500).json({ success: false, message: 'File deletion failed', error: error.message });
  }
};

// ฟังก์ชันตรวจสอบสถานะพื้นที่จัดเก็บไฟล์
export const getStorageStatus = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden, only admin can access storage status' });
    }
    
    const storageStats = {};
    
    // คำนวณขนาดไฟล์ทั้งหมดในแต่ละโฟลเดอร์
    for (const [type, dir] of Object.entries(UPLOAD_PATHS)) {
      storageStats[type] = { totalSize: 0, fileCount: 0, files: [] };
      
      // ตรวจสอบว่าโฟลเดอร์มีอยู่จริงหรือไม่
      if (!fs.existsSync(dir)) {
        continue;
      }
      
      // อ่านรายการไฟล์ในโฟลเดอร์
      const files = fs.readdirSync(dir);
      
      // คำนวณขนาดไฟล์แต่ละไฟล์
      for (const file of files) {
        const filePath = path.join(dir, file);
        
        // ตรวจสอบว่าเป็นไฟล์จริงหรือไม่ (ไม่ใช่โฟลเดอร์)
        if (fs.statSync(filePath).isFile()) {
          const stats = fs.statSync(filePath);
          storageStats[type].totalSize += stats.size;
          storageStats[type].fileCount++;
          
          // เก็บข้อมูลของไฟล์
          storageStats[type].files.push({
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          });
        }
      }
      
      // แปลงขนาดให้อยู่ในรูปแบบที่อ่านง่าย (MB)
      storageStats[type].totalSizeMB = (storageStats[type].totalSize / (1024 * 1024)).toFixed(2);
    }
    
    // คำนวณขนาดไฟล์ทั้งหมด
    const totalSize = Object.values(storageStats).reduce((sum, { totalSize }) => sum + totalSize, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    const totalFileCount = Object.values(storageStats).reduce((sum, { fileCount }) => sum + fileCount, 0);
    
    return res.status(200).json({
      success: true,
      stats: {
        totalSize,
        totalSizeMB,
        totalFileCount,
        categories: storageStats
      }
    });
  } catch (error) {
    console.error('Storage status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get storage status', error: error.message });
  }
};

// ฟังก์ชันจัดการข้อผิดพลาดจาก multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large',
        error: `The uploaded file exceeds the maximum allowed size.`
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        message: 'Too many files',
        error: `You can upload a maximum of ${err.field} files.`
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  
  // กรณีเป็นข้อผิดพลาดอื่นๆ
  if (err) {
    return res.status(500).json({
      success: false,
      message: 'Unexpected error during file upload',
      error: err.message
    });
  }
  
  next();
};