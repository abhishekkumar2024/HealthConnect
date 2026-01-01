// src/routes/appointment.routes.js
import { Router } from 'express';
import {
  requestAppointment,
  confirmBookingFee,
  doctorRespond,
  completePayment,
  getAppointmentDetails,
  getUserAppointments,
  cancelAppointment,
} from '../controllers/appointment.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

// Patient actions
router.post('/request', authorizeRoles('patient'), requestAppointment);
router.post('/:id/confirm-booking-fee', authorizeRoles('patient'), confirmBookingFee);
router.post('/:id/pay', authorizeRoles('patient'), completePayment);

// Doctor actions
router.put('/:id/respond', authorizeRoles('doctor'), doctorRespond);

// Common actions
router.get('/:id', getAppointmentDetails);
router.get('/', getUserAppointments);
router.post('/:id/cancel', authorizeRoles('patient', 'doctor'), cancelAppointment);

export default router;
