// src/routes/profile.routes.js
import { Router } from 'express';
import {
  GetProfile,
  UpdateProfile,
} from '../controllers/auth.controller.js';
import {
  PatientProfile,
  SavePatientData,
} from '../controllers/patient.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

/**
 * @route   GET /api/v1/profile
 * @desc    Get logged-in user's profile
 * @access  Private
 */
router.get('/', authenticateUser, PatientProfile);

/**
 * @route   PUT /api/v1/profile
 * @desc    Update logged-in user's profile data
 * @access  Private
 */
router.put('/', authenticateUser, SavePatientData);

/**
 * @route   POST /api/v1/profile/picture
 * @desc    Upload/update profile picture
 * @access  Private
 */
router.post('/picture', upload.single('profilepic'), authenticateUser, UpdateProfile);

/**
 * @route   GET /api/v1/profile/:id
 * @desc    Get any user's profile by ID (public info)
 * @access  Private
 */
router.get('/:id', authenticateUser, GetProfile);

/**
 * @route   PUT /api/v1/profile/:id
 * @desc    Update profile by ID (own profile only)
 * @access  Private
 */
router.put('/:id', upload.single('profilepic'), authenticateUser, UpdateProfile);

export default router;
