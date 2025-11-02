// src/services/payment.service.js
import stripe from '../config/stripe.config.js';
import logger from '../utils/logger.utils.js';
import ApiErrors  from '../utils/ApiError.utils.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.utils.js';

class PaymentService {
  /**
   * Create payment intent
   */
  
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      if (!amount || amount <= 0) {
        throw new ApiErrors (
          'Invalid amount: must be greater than 0',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
        },
      });

      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      logger.error('Failed to create payment intent', { error: error.message });
      
      if (error instanceof ApiErrors ) throw error;
      
      throw new ApiErrors (
        `Payment service error: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.EXTERNAL_SERVICE_ERROR
      );
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentIntentId) {
    try {
      if (!paymentIntentId) {
        throw new ApiErrors (
          'Payment intent ID is required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      logger.info('Payment verified', {
        paymentIntentId,
        status: paymentIntent.status,
      });

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        paymentIntent,
      };
    } catch (error) {
      logger.error('Failed to verify payment', {
        paymentIntentId,
        error: error.message,
      });

      if (error instanceof ApiErrors ) throw error;

      throw new ApiErrors (
        `Payment verification failed: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.EXTERNAL_SERVICE_ERROR
      );
    }
  }

  /**
   * Process refund
   */
  async refundPayment(paymentIntentId, amount = null) {
    try {
      if (!paymentIntentId) {
        throw new ApiErrors (
          'Payment intent ID is required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount !== null && amount > 0) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      logger.info('Refund processed', {
        refundId: refund.id,
        paymentIntentId,
        amount: refund.amount / 100,
      });

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        refund,
      };
    } catch (error) {
      logger.error('Failed to process refund', {
        paymentIntentId,
        error: error.message,
      });

      if (error instanceof ApiErrors ) throw error;

      throw new ApiErrors (
        `Refund failed: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.REFUND_FAILED
      );
    }
  }
}

export default new PaymentService();
