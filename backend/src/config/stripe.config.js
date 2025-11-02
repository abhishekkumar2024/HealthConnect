// src/config/stripe.config.js
import Stripe from 'stripe';
import logger from '../utils/logger.utils.js';

if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 3,
  timeout: 30000, // 30 seconds
});

export default stripe;
