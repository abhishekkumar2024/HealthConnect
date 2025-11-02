// src/services/notification.service.js
import emailTransporter from '../config/email.config.js';
import twilioClient from '../config/sms.config.js';
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

    try {
      const mailOptions = {
        from: `"Healthcare App" <${process.env.GMAIL_USER}>`,
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

  /**
   * Send both email and SMS
   */
  async sendNotification(data) {
    const { email, phoneNumber, name, emailSubject, emailBody, smsBody } = data;

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
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #21808d; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f4f4f4; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Healthcare Appointment System</h1>
            </div>
            <div class="content">
              <p style="white-space: pre-line;">${text}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default new NotificationService();
