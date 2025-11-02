// src/controllers/appointment.controller.js
import appointmentService from '../services/appointment.service.js';
import paymentService from '../services/payment.service.js';
import notificationService from '../services/notification.service.js';
import catchAsync from '../utils/catchAsync.utils.js';
import ApiErrors  from '../utils/ApiError.utils.js';
import { HTTP_STATUS } from '../utils/constants.utils.js';

/**
 * Get user appointments
 */
export const getAppointments = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { status } = req.query;

  const filters = status ? { status } : {};
  const appointments = await appointmentService.getUserAppointments(userId, filters);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

/**
 * Initiate appointment booking (create payment intent)
 */
export const initiateBooking = catchAsync(async (req, res) => {
  const { doctorId, appointmentDate, reason, amount, currencyType = 'usd' } = req.body;
  const patientId = req.user._id;

  // Validate booking
  const { doctor, patient } = await appointmentService.validateBooking({
    doctorId,
    appointmentDate,
    patientId,
  });

  // Create payment intent
  const paymentIntent = await paymentService.createPaymentIntent(amount, currencyType, {
    doctorId,
    patientId: patientId.toString(),
    appointmentDate,
    reason,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Payment intent created successfully',
    data: {
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      appointmentDetails: {
        doctorId,
        doctorName: doctor.name,
        appointmentDate,
        reason,
        amount,
        currency: currencyType,
      },
    },
  });
});

/**
 * Confirm appointment after payment
 */
export const confirmBooking = catchAsync(async (req, res) => {
  const {
    paymentIntentId,
    doctorId,
    appointmentDate,
    reason,
    amount,
    currencyType = 'usd',
  } = req.body;
  const patientId = req.user._id;

  // Verify payment
  const paymentVerification = await paymentService.verifyPayment(paymentIntentId);

  if (!paymentVerification.success || paymentVerification.status !== 'succeeded') {
    throw new ApiErrors (
      `Payment ${paymentVerification.status}. Please complete payment first.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Validate and create appointment
  const { doctor, patient } = await appointmentService.validateBooking({
    doctorId,
    appointmentDate,
    patientId,
  });

  const { appointment, payment } = await appointmentService.createAppointment(
    { doctorId, patientId, appointmentDate, reason, amount, currencyType },
    paymentVerification
  );

  // Send notifications (non-blocking)
  const formattedDate = new Date(appointmentDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

  notificationService.sendNotification({
    email: doctor.email,
    phoneNumber: doctor.phoneNumber,
    name: doctor.name,
    emailSubject: `New Appointment - ${patient.name}`,
    emailBody: `New appointment with ${patient.name} on ${formattedDate}.\nReason: ${reason}`,
    smsBody: `New appointment: ${patient.name} on ${formattedDate}`,
  }).catch(err => console.error('Doctor notification error:', err));

  notificationService.sendNotification({
    email: patient.email,
    phoneNumber: patient.phoneNumber,
    name: patient.name,
    emailSubject: `Appointment Confirmed - Dr. ${doctor.name}`,
    emailBody: `Your appointment with Dr. ${doctor.name} on ${formattedDate} is confirmed.\nReason: ${reason}`,
    smsBody: `Appointment confirmed with Dr. ${doctor.name} on ${formattedDate}`,
  }).catch(err => console.error('Patient notification error:', err));

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Appointment booked successfully',
    data: {
      appointment: {
        id: appointment._id,
        doctorName: doctor.name,
        appointmentDate: formattedDate,
        reason,
        status: appointment.status,
      },
      payment: {
        id: payment._id,
        amount: paymentVerification.amount,
        currency: currencyType,
        status: payment.status,
      },
    },
  });
});
