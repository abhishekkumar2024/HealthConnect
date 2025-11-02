// src/controllers/refund.controller.js
import Appointment from '../models/appointment.model.js';
import Payment from '../models/payment.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import paymentService from '../services/payment.service.js';
import notificationService from '../services/notification.service.js';
import refundService from '../services/refund.service.js';
import catchAsync from '../utils/catchAsync.utils.js';
import ApiErrors  from '../utils/ApiError.utils.js';
import { HTTP_STATUS, APPOINTMENT_STATUS, REFUND_STATUS } from '../utils/constants.utils.js';

/**
 * Cancel appointment with refund
 */
export const cancelAppointment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const { cancellationReason } = req.body;
  const userId = req.user._id;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiErrors ('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }

  // Authorization
  const isAuthorized =
    appointment.patientId.toString() === userId.toString() ||
    appointment.doctorId.toString() === userId.toString();

  if (!isAuthorized) {
    throw new ApiErrors ('Not authorized', HTTP_STATUS.FORBIDDEN);
  }

  // Status validation
  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new ApiErrors ('Appointment already cancelled', HTTP_STATUS.BAD_REQUEST);
  }

  if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
    throw new ApiErrors ('Cannot cancel completed appointment', HTTP_STATUS.BAD_REQUEST);
  }

  // Calculate refund
  const hoursUntilAppointment = refundService.getHoursUntilAppointment(
    appointment.appointmentDate
  );
  const refundPolicy = refundService.calculateRefundAmount(
    appointment.paymentDetails.amount,
    hoursUntilAppointment
  );

  const payment = await Payment.findById(appointment.paymentDetails.paymentId);

  if (!payment) {
    throw new ApiErrors ('Payment record not found', HTTP_STATUS.NOT_FOUND);
  }

  // Process refund if eligible
  if (refundPolicy.refundAmount > 0) {
    const refund = await paymentService.refundPayment(
      payment.paymentIntentId,
      refundPolicy.refundAmount
    );

    payment.refundId = refund.refundId;
    payment.refundAmount = refund.amount;
    payment.refundStatus = refund.status;
    payment.refundedAt = new Date();
    await payment.save();

    appointment.refundStatus = REFUND_STATUS.PROCESSED;
  } else {
    appointment.refundStatus = REFUND_STATUS.NOT_APPLICABLE;
  }

  // Update appointment
  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancellationReason = cancellationReason || 'Cancelled by user';
  appointment.cancelledBy = userId;
  appointment.cancelledAt = new Date();
  appointment.refundAmount = refundPolicy.refundAmount;
  appointment.refundPercentage = refundPolicy.refundPercentage;
  await appointment.save();

  // Send notifications
  const [doctor, patient] = await Promise.all([
    Doctor.findById(appointment.doctorId).select('name email phoneNumber'),
    Patient.findById(appointment.patientId).select('name email phoneNumber'),
  ]);

  const formattedDate = new Date(appointment.appointmentDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

  // Notify both parties
  notificationService.sendNotification({
    email: doctor.email,
    phoneNumber: doctor.phoneNumber,
    name: doctor.name,
    emailSubject: `Appointment Cancelled - ${patient.name}`,
    emailBody: `Appointment with ${patient.name} on ${formattedDate} cancelled.\nReason: ${cancellationReason}`,
    smsBody: `Appointment with ${patient.name} cancelled.`,
  }).catch(err => console.error('Notification error:', err));

  notificationService.sendNotification({
    email: patient.email,
    phoneNumber: patient.phoneNumber,
    name: patient.name,
    emailSubject: `Appointment Cancelled - Dr. ${doctor.name}`,
    emailBody: `Appointment with Dr. ${doctor.name} on ${formattedDate} cancelled.\nRefund: $${refundPolicy.refundAmount} (${refundPolicy.refundPercentage})`,
    smsBody: `Appointment cancelled. Refund: $${refundPolicy.refundAmount}`,
  }).catch(err => console.error('Notification error:', err));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: {
      appointment: {
        id: appointment._id,
        status: appointment.status,
        cancelledAt: appointment.cancelledAt,
      },
      refund: {
        eligible: refundPolicy.refundAmount > 0,
        originalAmount: appointment.paymentDetails.amount,
        refundAmount: refundPolicy.refundAmount,
        refundPercentage: refundPolicy.refundPercentage,
        message: refundPolicy.message,
        estimatedDays: refundPolicy.refundAmount > 0 ? '3-5 business days' : null,
      },
    },
  });
});
