// src/services/appointment.service.js
import Appointment from '../models/appointment.model.js';
import Payment from '../models/payment.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import ApiErrors  from '../utils/ApiError.utils.js';
import logger from '../utils/logger.utils.js';
import { HTTP_STATUS, ERROR_CODES, APPOINTMENT_STATUS } from '../utils/constants.utils.js';

class AppointmentService {
  /**
   * Get appointments for a user
   */
  async getUserAppointments(userId, filters = {}) {
    try {
      const query = { patientId: userId, ...filters };

      const appointments = await Appointment.find(query)
        .populate('doctorId', 'name email phoneNumber specialization')
        .sort({ appointmentDate: -1 });

      logger.info('Fetched user appointments', { userId, count: appointments.length });

      return appointments;
    } catch (error) {
      logger.error('Failed to fetch appointments', { userId, error: error.message });
      throw new ApiErrors (
        'Failed to fetch appointments',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Check if time slot is available
   */
  async isTimeSlotAvailable(doctorId, appointmentDate) {
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED] },
    });

    return !existingAppointment;
  }

  /**
   * Validate appointment booking
   */
  async validateBooking(data) {
    const { doctorId, appointmentDate, patientId } = data;

    // Check if appointment is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime <= new Date()) {
      throw new ApiErrors (
        'Appointment date must be in the future',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ApiErrors (
        'Doctor not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ApiErrors (
        'Patient not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    // Check time slot availability
    const isAvailable = await this.isTimeSlotAvailable(doctorId, appointmentDateTime);
    if (!isAvailable) {
      throw new ApiErrors (
        'This time slot is already booked',
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.DUPLICATE_RESOURCE
      );
    }

    return { doctor, patient };
  }

  /**
   * Create appointment after payment confirmation
   */
  async createAppointment(data, paymentData) {
    try {
      const { doctorId, patientId, appointmentDate, reason, amount, currencyType } = data;

      // Create payment record
      const payment = new Payment({
        receiveUserId: doctorId,
        payerUserId: patientId,
        amount: paymentData.amount,
        currency: currencyType,
        paymentMethodId: paymentData.paymentMethod,
        paymentIntentId: paymentData.paymentIntentId,
        status: 'succeeded',
        description: `Payment for appointment`,
        paymentResponse: paymentData.paymentIntent,
      });
      await payment.save();

      // Create appointment
      const appointment = new Appointment({
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        reason,
        status: APPOINTMENT_STATUS.CONFIRMED,
        paymentStatus: 'paid',
        paymentDetails: {
          amount: paymentData.amount,
          currency: currencyType,
          paymentIntentId: paymentData.paymentIntentId,
          paymentId: payment._id,
        },
      });
      await appointment.save();

      logger.info('Appointment created', {
        appointmentId: appointment._id,
        paymentId: payment._id,
      });

      return { appointment, payment };
    } catch (error) {
      logger.error('Failed to create appointment', { error: error.message });
      throw new ApiErrors (
        'Failed to create appointment',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new AppointmentService();
