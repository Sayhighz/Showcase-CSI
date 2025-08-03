// routes/common/uploadRoutes.js

const express = require('express');
const { 
  uploadProfileImage,
  uploadImages,
  uploadVideo,
  uploadDocuments,
  uploadFiles,
  uploadMultiple,
  handleFileUpload,
  deleteFile,
  getStorageStatus,
  handleMulterError
} = require('../../controllers/common/uploadController.js');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware.js');
const { API_ROUTES } = require('../../constants/routes.js');

/**
 * Router for handling file upload and management operations
 * @module uploadRoutes
 * @description Provides endpoints for uploading and managing various types of files
 */
const router = express.Router();

// Middleware combination for admin-only routes
const adminAuth = [authenticateToken, isAdmin];

/**
 * @swagger
 * /api/upload/profile-image:
 *   post:
 *     summary: Upload a profile image
 *     description: Allows authenticated users to upload their profile image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post(API_ROUTES.UPLOAD.PROFILE_IMAGE, authenticateToken, uploadProfileImage, handleMulterError, handleFileUpload);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: Upload multiple images
 *     description: Allows authenticated users to upload multiple images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post(API_ROUTES.UPLOAD.IMAGES, authenticateToken, uploadImages, handleMulterError, handleFileUpload);

/**
 * @swagger
 * /api/upload/video:
 *   post:
 *     summary: Upload a single video
 *     description: Allows authenticated users to upload a video file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post(API_ROUTES.UPLOAD.VIDEO, authenticateToken, uploadVideo, handleMulterError, handleFileUpload);

/**
 * @swagger
 * /api/upload/documents:
 *   post:
 *     summary: Upload multiple documents
 *     description: Allows authenticated users to upload multiple document files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post(API_ROUTES.UPLOAD.DOCUMENTS, authenticateToken, uploadDocuments, handleMulterError, handleFileUpload);

/**
 * @swagger
 * /api/upload/files:
 *   post:
 *     summary: Upload multiple generic files
 *     description: Allows authenticated users to upload multiple files of various types
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post(API_ROUTES.UPLOAD.FILES, authenticateToken, uploadFiles, handleMulterError, handleFileUpload);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files of different types
 *     description: Allows authenticated users to upload multiple files of mixed types
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Multiple files uploaded successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post(API_ROUTES.UPLOAD.MULTIPLE, authenticateToken, uploadMultiple, handleMulterError, handleFileUpload);

/**
 * @swagger
 * /api/upload/delete:
 *   delete:
 *     summary: Delete a file
 *     description: Allows authenticated users to delete a file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: Path of the file to delete
 *               file_id:
 *                 type: number
 *                 description: Optional database file ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Invalid file path
 *       401:
 *         description: Unauthorized
 */
router.delete(API_ROUTES.UPLOAD.DELETE, authenticateToken, deleteFile);

/**
 * @swagger
 * /api/upload/storage-status:
 *   get:
 *     summary: Get storage status
 *     description: Retrieves storage status (admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage status retrieved successfully
 *       403:
 *         description: Admin access required
 *       401:
 *         description: Unauthorized
 */
router.get(API_ROUTES.UPLOAD.STORAGE_STATUS, getStorageStatus);

module.exports = router;