// src/controllers/appointment.controller.js
import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import paymentService from '../services/payment.service.js';
import videoService from '../services/video.service.js';
import notificationService from '../services/notification.service.js';
import ApiErrors from '../utils/ApiError.utils.js';
import logger from '../utils/logger.utils.js';
import catchAsync from '../utils/catchAsync.utils.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.utils.js';

// ==========================================
// MAIN CONTROLLER FUNCTIONS
// ==========================================

/**
 * @desc    Step 1: Patient requests appointment with booking fee
 * @route   POST /api/v1/appointments/request
 * @access  Private (Patient)
 */
export const requestAppointment = catchAsync(async (req, res) => {
  const { doctorEmail, appointmentDate, reason } = req.body;

  // Validate inputs
  validateRequestInput({ doctorEmail, appointmentDate, reason });

  // Get patient
  const patient = await getPatient(req.user._id);

  // Get doctor details
  const doctor = await getDoctorByEmail(doctorEmail);

  // Calculate fees
  const fees = calculateFees(doctor.consultationFee);

  // Create booking fee payment intent
  const bookingPayment = await paymentService.createPaymentIntent(
    fees.bookingFee,
    'inr',
    {
      type: 'booking_fee',
      doctorId: doctor._id.toString(),
      patientId: patient._id.toString(),
      appointmentDate,
    }
  );

  // Create appointment
  const appointment = await Appointment.create({
    patientId: patient._id,
    doctorId: doctor._id,
    appointmentDate,
    reason,
    consultationFee: fees.consultationFee,
    platformFee: fees.platformFee,
    totalAmount: fees.totalAmount,
    doctorPayout: fees.doctorPayout,
    status: 'pending_doctor_approval',
    bookingFee: {
      amount: fees.bookingFee,
      clientSecret: bookingPayment.clientSecret,
      paymentIntentId: bookingPayment.paymentIntentId,
      paymentStatus: 'pending',
    },
  });

  logger.info('Appointment request created', {
    appointmentId: appointment._id,
    patientId: patient._id,
    doctorId: doctor._id,
  });

  // Notify patient about booking fee requirement
  await notificationService.notifyPatient(patient._id, {
    type: 'appointment_requested',
    appointmentId: appointment._id,
    bookingFeeAmount: fees.bookingFee,
    appointmentDate,
  }).catch(err => logger.error('Failed to notify patient:', err));

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Appointment request created. Please complete booking fee payment.',
    data: {
      appointmentId: appointment._id,
      bookingFee: {
        amount: fees.bookingFee,
        clientSecret: bookingPayment.clientSecret,
        paymentIntentId: bookingPayment.paymentIntentId,
      },
      appointmentDetails: {
        doctorName: doctor.userName,
        appointmentDate,
        consultationFee: fees.consultationFee,
        totalAmount: fees.totalAmount,
      },
    },
  });
});

/**
 * @desc    Step 1.5: Confirm booking fee payment
 * @route   POST /api/v1/appointments/:id/confirm-booking-fee
 * @access  Private (Patient)
 */
export const confirmBookingFee = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Get appointment
  const appointment = await getAppointment(id);

  // Validate booking fee status
  if (appointment.bookingFee.paymentStatus === 'paid') {
    throw new ApiErrors(
      'Booking fee already paid',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.PAYMENT_ALREADY_COMPLETED
    );
  }

  // Verify payment with Stripe
  await paymentService.verifyPayment(appointment.bookingFee.paymentIntentId);

  // Update booking fee status
  appointment.bookingFee.paymentStatus = 'paid';
  appointment.bookingFee.paidAt = new Date();
  await appointment.save();

  logger.info('Booking fee confirmed', {
    appointmentId: appointment._id,
    paymentIntentId: appointment.bookingFee.paymentIntentId,
  });

  // Notify both doctor and patient
  await Promise.all([
    notificationService.notifyDoctor(appointment.doctorId, {
      type: 'new_appointment_request',
      appointmentId: appointment._id,
      appointmentDate: appointment.appointmentDate,
      reason: appointment.reason,
    }),
    notificationService.notifyPatient(appointment.patientId, {
      type: 'booking_fee_confirmed',
      appointmentId: appointment._id,
      appointmentDate: appointment.appointmentDate,
    }),
  ]).catch(err => logger.error('Failed to send notifications:', err));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Booking fee paid. Request sent to doctor for approval.',
    data: { appointment },
  });
});

/**
 * @desc    Step 2: Doctor responds to appointment request
 * @route   PUT /api/v1/appointments/:id/respond
 * @access  Private (Doctor)
 */
export const doctorRespond = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { action, message } = req.body;

  // Validate action
  if (!['approve', 'reject'].includes(action)) {
    throw new ApiErrors(
      'Invalid action. Use "approve" or "reject"',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Get appointment
  const appointment = await getAppointment(id);

  // Verify doctor authorization
  await verifyDoctorAuthorization(req.user._id, appointment.doctorId);

  // Validate appointment state
  validateAppointmentState(appointment, 'pending_doctor_approval');

  // Validate booking fee
  if (appointment.bookingFee.paymentStatus !== 'paid') {
    throw new ApiErrors(
      'Booking fee not paid yet',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.PAYMENT_PENDING
    );
  }

  if (action === 'approve') {
    await handleDoctorApproval(appointment, message, res);
  } else {
    await handleDoctorRejection(appointment, message, res);
  }
});

/**
 * @desc    Step 3: Patient completes full payment
 * @route   POST /api/v1/appointments/:id/pay
 * @access  Private (Patient)
 */
export const completePayment = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Get appointment with populated data
  const appointment = await Appointment.findById(id)
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId');

  if (!appointment) {
    throw new ApiErrors(
      'Appointment not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  // Validate payment state
  validateAppointmentState(appointment, 'payment_pending');

  if (appointment.paymentStatus === 'paid') {
    throw new ApiErrors(
      'Payment already completed',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.PAYMENT_ALREADY_COMPLETED
    );
  }

  // Verify payment with Stripe
  await paymentService.verifyPayment(appointment.paymentIntentId);

  // Generate video session
  const videoSession = await videoService.createSession({
    appointmentId: appointment._id.toString(),
    doctorId: appointment.doctorId._id.toString(),
    patientId: appointment.patientId._id.toString(),
    scheduledTime: appointment.appointmentDate,
  });

  // Update appointment
  appointment.status = 'confirmed';
  appointment.paymentStatus = 'paid';
  appointment.paymentDate = new Date();
  appointment.videoSession = {
    sessionId: videoSession.sessionId,
    roomId: videoSession.roomId,
    patientLink: videoSession.patientLink,
    doctorLink: videoSession.doctorLink,
    status: 'not_started',
  };
  await appointment.save();

  logger.info('Payment completed and session created', {
    appointmentId: appointment._id,
    sessionId: videoSession.sessionId,
  });

  // Send notifications with video links
  await Promise.all([
    notificationService.notifyPatient(appointment.patientId._id, {
      type: 'payment_confirmed',
      videoLink: videoSession.patientLink,
    }),
    notificationService.notifyDoctor(appointment.doctorId._id, {
      type: 'appointment_confirmed',
      videoLink: videoSession.doctorLink,
    }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Payment successful! Video session links generated.',
    data: {
      appointment,
      videoSession: {
        patientLink: videoSession.patientLink,
        appointmentDate: appointment.appointmentDate,
      },
    },
  });
});

/**
 * @desc    Get appointment details
 * @route   GET /api/v1/appointments/:id
 * @access  Private
 */
export const getAppointmentDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id)
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId')
    .populate('patientId.userId', 'name email phone')
    .populate('doctorId.userId', 'name email phone');

  if (!appointment) {
    throw new ApiErrors(
      'Appointment not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { appointment },
  });
});

/**
 * @desc    Get user appointments
 * @route   GET /api/v1/appointments
 * @access  Private
 */
export const getUserAppointments = catchAsync(async (req, res) => {
  const { status, type = 'upcoming' } = req.query;
  const userRole = req.user.role;

  let appointments;

  if (userRole === 'patient') {
    const patient = await getPatient(req.user._id);
    appointments = await getPatientAppointments(patient._id, type, status);
  } else if (userRole === 'doctor') {
    const doctor = await getDoctor(req.user._id);
    appointments = await getDoctorAppointments(doctor._id, type, status);
  } else {
    throw new ApiErrors(
      'Invalid user role',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.FORBIDDEN
    );
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: appointments.length,
    data: { appointments },
  });
});

/**
 * @desc    Cancel appointment
 * @route   POST /api/v1/appointments/:id/cancel
 * @access  Private
 */
export const cancelAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const appointment = await getAppointment(id);

  // Verify authorization
  const patient = await Patient.findOne({ userId: req.user._id });
  const doctor = await Doctor.findOne({ userId: req.user._id });

  const isAuthorized =
    (patient && patient._id.toString() === appointment.patientId.toString()) ||
    (doctor && doctor._id.toString() === appointment.doctorId.toString());

  if (!isAuthorized) {
    throw new ApiErrors(
      'Not authorized',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.FORBIDDEN
    );
  }

  // Check if can cancel
  const { allowed, reason: notAllowedReason } = appointment.canCancel();
  if (!allowed) {
    throw new ApiErrors(notAllowedReason, HTTP_STATUS.BAD_REQUEST);
  }

  // Calculate refund
  const refund = appointment.calculateRefund();

  // Process refund if applicable
  let refundResult = null;
  if (refund.amount > 0 && appointment.paymentStatus === 'paid') {
    refundResult = await paymentService.refundPayment(
      appointment.paymentIntentId,
      refund.amount,
      'requested_by_customer'
    );
  }

  // Update appointment
  appointment.status = 'cancelled';
  appointment.cancelledBy = {
    userId: req.user._id,
    role: req.user.role,
  };
  appointment.cancellationReason = reason;
  appointment.cancelledAt = new Date();
  appointment.refundAmount = refund.amount;
  appointment.refundId = refundResult?.refundId;
  appointment.refundDate = refundResult ? new Date() : null;
  appointment.paymentStatus =
    refund.amount > 0 ? 'refunded' : appointment.paymentStatus;
  await appointment.save();

  logger.info('Appointment cancelled', {
    appointmentId: appointment._id,
    refundAmount: refund.amount,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: {
      appointment,
      refund: refundResult
        ? {
            amount: refundResult.amount,
            status: refundResult.status,
          }
        : null,
    },
  });
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Validate request input
 */
function validateRequestInput({ doctorEmail, appointmentDate, reason }) {
  if (!doctorEmail || !appointmentDate || !reason) {
    throw new ApiErrors(
      'Missing required fields: doctorEmail, appointmentDate, reason',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }
}

/**
 * Get patient by user ID
 */
async function getPatient(userId) {
  const patient = await Patient.findOne({ userId }).select('_id').lean();

  if (!patient) {
    throw new ApiErrors(
      'Patient profile not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  return patient;
}

/**
 * Get doctor by user ID
 */
async function getDoctor(userId) {
  const doctor = await Doctor.findOne({ userId }).select('_id').lean();

  if (!doctor) {
    throw new ApiErrors(
      'Doctor profile not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  return doctor;
}

/**
 * Get doctor by email
 */
async function getDoctorByEmail(email) {
  const [doctor] = await Doctor.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $match: {
        'user.email': email,
        'user.role': 'doctor',
      },
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        consultationFee: 1,
        userName: '$user.name',
        userEmail: '$user.email',
      },
    },
    { $limit: 1 },
  ]);

  if (!doctor) {
    throw new ApiErrors(
      'Doctor not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  return doctor;
}

/**
 * Calculate fees
 */
function calculateFees(consultationFee = 500) {
  const platformFee = Math.round(consultationFee * 0.1); // 10%
  const totalAmount = consultationFee + platformFee;
  const doctorPayout = consultationFee;
  const bookingFee = 100; // ₹100

  return {
    consultationFee,
    platformFee,
    totalAmount,
    doctorPayout,
    bookingFee,
  };
}

/**
 * Get appointment by ID
 */
async function getAppointment(id) {
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw new ApiErrors(
      'Appointment not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  return appointment;
}

/**
 * Verify doctor authorization
 */
async function verifyDoctorAuthorization(userId, doctorId) {
  const doctor = await Doctor.findOne({ userId });

  if (!doctor || doctor._id.toString() !== doctorId.toString()) {
    throw new ApiErrors(
      'Not authorized',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.FORBIDDEN
    );
  }
}

/**
 * Validate appointment state
 */
function validateAppointmentState(appointment, expectedStatus) {
  if (appointment.status !== expectedStatus) {
    throw new ApiErrors(
      `Invalid appointment status. Expected: ${expectedStatus}, Got: ${appointment.status}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_STATE
    );
  }
}

/**
 * Handle doctor approval
 */
async function handleDoctorApproval(appointment, message, res) {
  appointment.status = 'payment_pending';
  appointment.doctorResponse = {
    action: 'approved',
    message: message || 'Appointment approved',
    respondedAt: new Date(),
  };

  // Create full payment intent
  const fullPayment = await paymentService.createPaymentIntent(
    appointment.totalAmount,
    'inr',
    {
      type: 'full_consultation',
      appointmentId: appointment._id.toString(),
      doctorId: appointment.doctorId.toString(),
      patientId: appointment.patientId.toString(),
    }
  );

  appointment.paymentIntentId = fullPayment.paymentIntentId;
  appointment.paymentClientSecret = fullPayment.clientSecret; // Store clientSecret for later use
  await appointment.save();

  logger.info('Doctor approved appointment', {
    appointmentId: appointment._id,
    paymentIntentId: fullPayment.paymentIntentId,
  });

  // Notify patient
  await notificationService.notifyPatient(appointment.patientId, {
    type: 'appointment_approved',
    paymentLink: fullPayment.clientSecret,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Appointment approved. Payment link sent to patient.',
    data: {
      appointment,
      paymentLink: {
        clientSecret: fullPayment.clientSecret,
        amount: appointment.totalAmount,
      },
    },
  });
}

/**
 * Handle doctor rejection
 */
async function handleDoctorRejection(appointment, message, res) {
  // Validate appointment state - can only reject if pending approval
  if (appointment.status !== 'pending_doctor_approval') {
    throw new ApiErrors(
      `Cannot reject appointment. Current status: ${appointment.status}. Only appointments pending doctor approval can be rejected.`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_STATE
    );
  }

  // Validate booking fee is paid
  if (appointment.bookingFee.paymentStatus !== 'paid') {
    throw new ApiErrors(
      'Cannot reject appointment. Booking fee not paid yet.',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.PAYMENT_PENDING
    );
  }

  appointment.status = 'rejected';
  appointment.doctorResponse = {
    action: 'rejected',
    message: message || 'Doctor declined the appointment',
    respondedAt: new Date(),
  };
  await appointment.save();

  // Refund booking fee
  const refund = await paymentService.refundPayment(
    appointment.bookingFee.paymentIntentId,
    appointment.bookingFee.amount,
    'requested_by_customer'
  );

  appointment.bookingFee.paymentStatus = 'refunded';
  await appointment.save();

  logger.info('Doctor rejected appointment', {
    appointmentId: appointment._id,
    refundId: refund.refundId,
  });

  // Notify patient
  await notificationService.notifyPatient(appointment.patientId, {
    type: 'appointment_rejected',
    reason: message,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Appointment rejected. Booking fee refunded.',
    data: { appointment, refund },
  });
}

/**
 * Get patient appointments
 */
async function getPatientAppointments(patientId, type, status) {
  const filter = { patientId };

  if (type === 'upcoming') {
    filter.appointmentDate = { $gte: new Date() };
    filter.status = { $in: ['pending_doctor_approval', 'payment_pending', 'confirmed'] };
  } else {
    filter.appointmentDate = { $lt: new Date() };
  }

  if (status) {
    filter.status = status;
  }

  return Appointment.find(filter)
    .populate('doctorId', 'userId')
    .populate('doctorId.userId', 'name email')
    .sort('-appointmentDate')
    .lean();
}

/**
 * Get doctor appointments
 */
async function getDoctorAppointments(doctorId, type, status) {
  const filter = { doctorId };

  if (type === 'upcoming') {
    filter.appointmentDate = { $gte: new Date() };
    filter.status = { $nin: ['cancelled', 'rejected', 'completed'] };
  } else {
    filter.appointmentDate = { $lt: new Date() };
  }

  if (status) {
    filter.status = status;
  }

  return Appointment.find(filter)
    .populate('patientId', 'userId')
    .populate('patientId.userId', 'name email')
    .sort('-appointmentDate')
    .lean();
}
