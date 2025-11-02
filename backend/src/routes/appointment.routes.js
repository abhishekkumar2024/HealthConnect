// src/routes/appointment.routes.js
import express from 'express';
import {
  getAppointments,
  initiateBooking,
  confirmBooking,
} from '../controllers/appointment.controller.js';
import { cancelAppointment } from '../controllers/refund.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  bookAppointmentSchema,
  confirmAppointmentSchema,
  cancelAppointmentSchema,
} from '../validators/appointment.validator.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getAppointments);
router.post('/book', validate(bookAppointmentSchema), initiateBooking);
router.post('/confirm', validate(confirmAppointmentSchema), confirmBooking);
router.post('/:appointmentId/cancel', validate(cancelAppointmentSchema), cancelAppointment);

export default router;
