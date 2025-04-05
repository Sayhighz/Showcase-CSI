// routes/user/userRoutes.js

import express from 'express';
import {
  register,
  getAllUsers,
  getUserById,
  updateUser,
  uploadProfileImage,
  changePassword,
  changeUserRole,
  deleteUser,
  getUserLoginHistory,
  getUserProjects,
  uploadProfile
} from '../../controllers/user/userController.js';
import { authenticateToken, isAdmin, isResourceOwner } from '../../middleware/authMiddleware.js';
import { API_ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

// Ensure all route paths are valid strings
router.post('/register', register);

router.get('/all', authenticateToken, isAdmin, getAllUsers);

router.get('/:userId', authenticateToken, getUserById);

router.put('/:userId', authenticateToken, updateUser);

router.post('/:userId/profile-image', 
  authenticateToken, 
  uploadProfile.single('image'), 
  uploadProfileImage
);

router.post('/:userId/change-password', authenticateToken, changePassword);

router.put('/:userId/role', authenticateToken, isAdmin, changeUserRole);

router.delete('/:userId', authenticateToken, isAdmin, deleteUser);

router.get('/:userId/login-history', authenticateToken, getUserLoginHistory);

router.get('/:userId/projects', 
  authenticateToken, 
  isResourceOwner, 
  getUserProjects
);

export default router;