import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Configure Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,       // your Gmail address
    pass: process.env.GMAIL_APP_PASS    // your Gmail App Password
  }
});

// Configure Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const getNotifications = (req, res) => {
    // Logic to fetch notifications for the user
    
}

export const markNotificationsAsRead = (req, res) => {
    const notificationId = req.params.id;
    // Logic to mark the notification as read
}

export const sendMessageController = async (req, res) => {
  const { email, emailSubject, emailBody, phoneNumber, smsBody } = req.body;

  try {
    // Send Email
    if (email) {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: emailSubject,
        text: emailBody,
      });
    }

    // Send SMS
    if (phoneNumber) {
      await twilioClient.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE_NUMBER,  // your Twilio phone number
        to: phoneNumber,
      });
    }

    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};