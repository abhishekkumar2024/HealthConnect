// src/services/notification.service.js
import emailTransporter from '../config/email.config.js';
import twilioClient from '../config/sms.config.js';
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import logger from '../utils/logger.utils.js';

class NotificationService {
  /**
   * Send email notification
   */
  async sendEmail({ to, subject, text, html }) {
    if (!emailTransporter) {
      logger.warn('Email transporter not configured, skipping email');
      return { success: false, error: 'Email not configured' };
    }

    console.log('Preparing to send email to:', to);
    console.log('Email subject:', subject);

    try {
      const mailOptions = {
        from: `"HealthConnect" <${process.env.HEALTHCONNECT_GMAIL}>`,
        to,
        subject,
        text,
        html: html || this.generateEmailHTML(text),
      };

      const result = await emailTransporter.sendMail(mailOptions);

      logger.info('Email sent successfully', { to, subject });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error('Failed to send email', { to, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS({ to, body }) {
    if (!twilioClient) {
      logger.warn('Twilio client not configured, skipping SMS');
      return { success: false, error: 'SMS not configured' };
    }

    try {
      const result = await twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });

      logger.info('SMS sent successfully', { to });

      return {
        success: true,
        sid: result.sid,
      };
    } catch (error) {
      logger.error('Failed to send SMS', { to, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==========================================
  // APPOINTMENT-SPECIFIC NOTIFICATIONS
  // ==========================================
  /**
   * Notify doctor about new appointment request
   */
  async notifyDoctor(doctorId, data) {
    try {
      const doctor = await Doctor.findById(doctorId).populate('userId', 'name email phone');
      
      if (!doctor || !doctor.userId) {
        logger.warn('Doctor not found', { doctorId });
        return { success: false, error: 'Doctor not found' };
      }

      const doctorUser = doctor.userId;

      // Handle different notification types
      switch (data.type) {
        case 'new_appointment_request':
          return await this._notifyDoctorNewRequest(doctorUser, data);
        
        case 'appointment_cancelled':
          return await this._notifyDoctorCancellation(doctorUser, data);
        
        case 'appointment_confirmed':
          return await this._notifyDoctorConfirmation(doctorUser, data);
        
        default:
          logger.warn('Unknown notification type', { type: data.type });
          return { success: false, error: 'Unknown notification type' };
      }
    } catch (error) {
      logger.error('Failed to notify doctor', { doctorId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify patient
   */
  async notifyPatient(patientId, data) {
    try {
      const patient = await Patient.findById(patientId).populate('userId', 'name email phoneNumber');
      
      if (!patient || !patient.userId) {
        logger.warn('Patient not found', { patientId });
        return { success: false, error: 'Patient not found' };
      }
      const patientUser = patient.userId;

      // Handle different notification types
      switch (data.type) {
        case 'appointment_requested':
          return await this._notifyPatientRequested(patientUser, data);
        
        case 'booking_fee_confirmed':
          return await this._notifyPatientBookingFeeConfirmed(patientUser, data);
        
        case 'appointment_approved':
          return await this._notifyPatientApproved(patientUser, data);
        
        case 'appointment_rejected':
          return await this._notifyPatientRejected(patientUser, data);
        
        case 'payment_confirmed':
          return await this._notifyPatientPaymentConfirmed(patientUser, data);
        
        case 'appointment_reminder':
          return await this._notifyPatientReminder(patientUser, data);
        
        default:
          logger.warn('Unknown notification type', { type: data.type });
          return { success: false, error: 'Unknown notification type' };
      }
    } catch (error) {
      logger.error('Failed to notify patient', { patientId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // PRIVATE NOTIFICATION METHODS
  // ==========================================

  /**
   * Notify doctor about new appointment request
   * @private
   */
  async _notifyDoctorNewRequest(doctorUser, data) {
    const subject = '🩺 New Appointment Request';
    const text = `
Dear Dr. ${doctorUser.name},

You have received a new appointment request.

Appointment ID: ${data.appointmentId}
Date: ${new Date(data.appointmentDate).toLocaleString()}
Reason: ${data.reason || 'Not specified'}

Please log in to your dashboard to review and respond to this request.

Best regards,
HealthConnect Team
    `.trim();

    const smsBody = `New appointment request. Check your HealthConnect dashboard to respond.`;

    return await this.sendNotification({
      email: doctorUser.email,
      phoneNumber: doctorUser.phone,
      emailSubject: subject,
      emailBody: text,
      smsBody,
    });
  }

  /**
   * Notify doctor about cancellation
   * @private
   */
  async _notifyDoctorCancellation(doctorUser, data) {
    const subject = '❌ Appointment Cancelled';
    const text = `
Dear Dr. ${doctorUser.name},

An appointment has been cancelled.

Appointment ID: ${data.appointmentId}
Cancellation Reason: ${data.reason || 'Not specified'}

Best regards,
HealthConnect Team
    `.trim();

    return await this.sendEmail({
      to: doctorUser.email,
      subject,
      text,
    });
  }

  /**
   * Notify doctor about confirmed appointment
   * @private
   */
  async _notifyDoctorConfirmation(doctorUser, data) {
    const subject = '✅ Appointment Confirmed';
    const text = `
Dear Dr. ${doctorUser.name},

An appointment has been confirmed and paid.

Appointment ID: ${data.appointmentId}
Date: ${new Date(data.appointmentDate).toLocaleString()}

Video Call Link: ${data.videoLink}

Best regards,
HealthConnect Team
    `.trim();

    const smsBody = `Appointment confirmed. Video link: ${data.videoLink}`;

    return await this.sendNotification({
      email: doctorUser.email,
      phoneNumber: doctorUser.phone,
      emailSubject: subject,
      emailBody: text,
      smsBody,
    });
  }

  /**
   * Notify patient about appointment request created
   * @private
   */
  async _notifyPatientRequested(patientUser, data) {
    const subject = '📅 Appointment Request Created - Payment Required';
    const text = `
Dear ${patientUser.name},

Your appointment request has been created successfully.

Appointment ID: ${data.appointmentId}
Date: ${new Date(data.appointmentDate).toLocaleString()}
Booking Fee: ₹${data.bookingFeeAmount || 100}

Please complete the booking fee payment to send the request to the doctor for approval.

Best regards,
HealthConnect Team
    `.trim();

    const smsBody = `Appointment request created. Please pay booking fee ₹${data.bookingFeeAmount || 100} to proceed.`;

    return await this.sendNotification({
      email: patientUser.email,
      phoneNumber: patientUser.phoneNumber,
      emailSubject: subject,
      emailBody: text,
      smsBody,
    });
  }

  /**
   * Notify patient about booking fee confirmation
   * @private
   */
  async _notifyPatientBookingFeeConfirmed(patientUser, data) {
    const subject = '✅ Booking Fee Confirmed - Waiting for Doctor Approval';
    const text = `
Dear ${patientUser.name},

Your booking fee has been confirmed successfully!

Appointment ID: ${data.appointmentId}
Date: ${new Date(data.appointmentDate).toLocaleString()}

Your appointment request has been sent to the doctor for approval. You will be notified once the doctor responds.

Best regards,
HealthConnect Team
    `.trim();

    const smsBody = `Booking fee confirmed! Your appointment request is pending doctor approval.`;

    return await this.sendNotification({
      email: patientUser.email,
      phoneNumber: patientUser.phoneNumber,
      emailSubject: subject,
      emailBody: text,
      smsBody,
    });
  }

  /**
   * Notify patient about approved appointment
   * @private
   */
  async _notifyPatientApproved(patientUser, data) {
    const subject = '✅ Appointment Approved - Payment Required';
    const text = `
Dear ${patientUser.name},

Great news! Your appointment request has been approved.

Please complete the payment to confirm your appointment.

Payment Link: ${data.paymentLink || 'Check your dashboard'}
Amount: ₹${data.amount || 'TBD'}

Best regards,
HealthConnect Team
    `.trim();

    const smsBody = `Your appointment request was approved! Complete payment to confirm.`;

    return await this.sendNotification({
      email: patientUser.email,
      phoneNumber: patientUser.phone,
      emailSubject: subject,
      emailBody: text,
      smsBody,
    });
  }

  /**
   * Notify patient about rejected appointment
   * @private
   */
  async _notifyPatientRejected(patientUser, data) {
    const subject = '❌ Appointment Request Declined';
    const text = `
Dear ${patientUser.name},

Unfortunately, your appointment request has been declined.

Reason: ${data.reason || 'Not specified'}

Your booking fee will be refunded within 5-7 business days.

You can request another appointment at your convenience.

Best regards,
HealthConnect Team
    `.trim();

    return await this.sendEmail({
      to: patientUser.email,
      subject,
      text,
    });
  }

  /**
   * Notify patient about payment confirmation
   * @private
   */
  async _notifyPatientPaymentConfirmed(patientUser, data) {
    const subject = '🎉 Payment Confirmed - Appointment Booked!';
    const text = `
Dear ${patientUser.name},

Your payment has been confirmed and your appointment is now booked!

Appointment Details:
- Date: ${new Date(data.appointmentDate).toLocaleString()}
- Video Call Link: ${data.videoLink}

Please join the video call at the scheduled time.

Best regards,
HealthConnect Team
    `.trim();

    const smsBody = `Payment confirmed! Join video call: ${data.videoLink}`;

    return await this.sendNotification({
      email: patientUser.email,
      phoneNumber: patientUser.phone,
      emailSubject: subject,
      emailBody: text,
      smsBody,
    });
  }

  /**
   * Send appointment reminder
   * @private
   */
  async _notifyPatientReminder(patientUser, data) {
    const subject = '⏰ Appointment Reminder';
    const text = `
Dear ${patientUser.name},

This is a reminder about your upcoming appointment.

Date: ${new Date(data.appointmentDate).toLocaleString()}
Video Call Link: ${data.videoLink}

Please join at the scheduled time.

Best regards,
HealthConnect Team
    `.trim();

    const smsBody = `Reminder: Your appointment is at ${new Date(data.appointmentDate).toLocaleTimeString()}. Link: ${data.videoLink}`;

    return await this.sendNotification({
      email: patientUser.email,
      phoneNumber: patientUser.phoneNumber,
      emailSubject: subject,
      emailBody: text,
      smsBody,
    });
  }

  /**
   * Send both email and SMS
   */
  async sendNotification(data) {
    const { email, phoneNumber, emailSubject, emailBody, smsBody } = data;

    const results = {
      email: null,
      sms: null,
    };

    // Send email
    if (email && emailSubject && emailBody) {
      results.email = await this.sendEmail({
        to: email,
        subject: emailSubject,
        text: emailBody,
      });
    }

    // Send SMS
    if (phoneNumber && smsBody) {
      results.sms = await this.sendSMS({
        to: phoneNumber,
        body: smsBody,
      });
    }

    return results;
  }

  /**
   * Generate HTML email template
   */
  generateEmailHTML(text) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
            }
            .header { 
              background: #21808d; 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content { 
              padding: 30px 20px; 
              background: #f9f9f9; 
            }
            .content p {
              white-space: pre-line;
              margin: 0 0 15px 0;
            }
            .footer { 
              padding: 20px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              background: #f0f0f0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #21808d;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🩺 HealthConnect</h1>
            </div>
            <div class="content">
              ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>
            <div class="footer">
              <p>This is an automated message from HealthConnect.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default new NotificationService();
