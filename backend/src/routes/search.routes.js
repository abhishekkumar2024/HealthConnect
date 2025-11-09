// src/routes/search.routes.js
import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/v1/search?q=doctor&specialty=cardiology
 * @desc    Search for users (doctors/patients)
 * @access  Private
 */
router.get('/', authenticateUser, searchController);

export default router;
