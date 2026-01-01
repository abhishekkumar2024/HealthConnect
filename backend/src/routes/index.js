// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import searchRoutes from './search.routes.js';
import appointmentRoutes from './appointment.routes.js';
import getdoctorRoutes from './getdoctor.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount all routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/search', searchRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/doctors', getdoctorRoutes);

export default router;
