import { Router } from 'express';
import { getDoctorsController } from '../controllers/getdoctor.controller.js';  

/**
 * @route   GET /api/v1/doctors
 * @desc    Get list of doctors with pagination
 * @access  Public
 */
const router = Router();

router.get('/', getDoctorsController);

export default router;
