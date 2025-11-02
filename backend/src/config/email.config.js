// src/config/email.config.js
import nodemailer from 'nodemailer';
import logger from '../utils/logger.utils.js';

const createEmailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    logger.warn('Email credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

export default createEmailTransporter();
