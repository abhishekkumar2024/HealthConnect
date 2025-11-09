// src/routes/profile.routes.js
import { Router } from 'express';
import {
  GetProfile,
  UpdateProfile,
} from '../controllers/profile.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

/**
 * @route   GET /api/v1/profile/:id
 * @desc    Get logged-in user's profile
 * @access  Private
 */
router.get('/:username', authenticateUser, GetProfile);

/**
 * @route   PUT /api/v1/profile
 * @desc    Update logged-in user's profile (handles text fields AND file upload)
 * @access  Private
 */
router.put('/:username', authenticateUser, upload.single('profilePicture'), UpdateProfile);

export default router;
