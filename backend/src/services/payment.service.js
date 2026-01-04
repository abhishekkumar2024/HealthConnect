// src/services/payment.service.js
import stripe from '../config/stripe.config.js';
import logger from '../utils/logger.utils.js';
import ApiErrors from '../utils/ApiError.utils.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.utils.js';

class PaymentService {
  constructor() {
    this.stripe = stripe;
    this.PAYMENT_STATUS = {
      SUCCEEDED: 'succeeded',
      PROCESSING: 'processing',
      REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
      REQUIRES_CONFIRMATION: 'requires_confirmation',
      REQUIRES_ACTION: 'requires_action',
      REQUIRES_CAPTURE: 'requires_capture',
      CANCELED: 'canceled',
      FAILED: 'failed',
    };
  }

  /**
   * Check if Stripe is configured
   * @throws {ApiErrors} If Stripe is not configured
   */
  _checkStripeConfigured() {
    if (!this.stripe) {
      throw new ApiErrors(
        'Payment service is not configured. Please configure Stripe credentials.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Create payment intent
   * @param {Number} amount - Amount in rupees/dollars (not cents)
   * @param {String} currency - Currency code (inr, usd, etc.)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Payment intent details
   */
  async createPaymentIntent(amount, currency = 'inr', metadata = {}) {
    try {
      this._checkStripeConfigured();

      // Validate amount
      if (!amount || amount <= 0) {
        throw new ApiErrors(
          'Invalid amount: must be greater than 0',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      // Convert to cents
      const amountInCents = Math.round(amount * 100);

      logger.info('Creating payment intent', {
        amount,
        currency,
        amountInCents,
      });

      // Create payment intent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
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

      logger.info('Payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      logger.error('Failed to create payment intent', {
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof ApiErrors) throw error;

      throw new ApiErrors(
        `Payment service error: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.EXTERNAL_SERVICE_ERROR
      );
    }
  }

  /**
   * Verify payment intent status
   * @param {String} paymentIntentId - Stripe payment intent ID
   * @returns {Promise<Object>} Payment verification result
   */
  async verifyPayment(paymentIntentId) {
    try {
      this._checkStripeConfigured();

      // Validate input
      if (!paymentIntentId) {
        throw new ApiErrors(
          'Payment intent ID is required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      // Validate format
      if (!paymentIntentId.startsWith('pi_')) {
        throw new ApiErrors(
          'Invalid payment intent ID format',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      logger.info('Verifying payment', { paymentIntentId });

      // Retrieve from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      const { status } = paymentIntent;

      logger.info('Payment intent retrieved', {
        paymentIntentId,
        status,
      });

      // Check if payment succeeded
      if (status === this.PAYMENT_STATUS.SUCCEEDED) {
        logger.info('Payment verified successfully', { paymentIntentId });

        return {
          success: true,
          status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          paymentMethod: paymentIntent.payment_method,
          metadata: paymentIntent.metadata,
          paymentIntent: {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            created: paymentIntent.created,
          },
        };
      }

      // Handle other statuses
      return this._handlePaymentStatus(status, paymentIntentId);
    } catch (error) {
      logger.error('Payment verification error', {
        paymentIntentId,
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof ApiErrors) throw error;

      return this._handleStripeError(error);
    }
  }

  /**
   * Process refund
   * @param {String} paymentIntentId - Stripe payment intent ID
   * @param {Number|null} amount - Amount to refund (null for full refund)
   * @param {String} reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      this._checkStripeConfigured();

      if (!paymentIntentId) {
        throw new ApiErrors(
          'Payment intent ID is required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      logger.info('Processing refund', {
        paymentIntentId,
        amount,
        reason,
      });

      const refundData = {
        payment_intent: paymentIntentId,
        reason,
      };

      if (amount !== null && amount > 0) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);

      logger.info('Refund processed successfully', {
        refundId: refund.id,
        paymentIntentId,
        amount: refund.amount / 100,
        status: refund.status,
      });

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        refund: {
          id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
          created: refund.created,
        },
      };
    } catch (error) {
      logger.error('Refund processing error', {
        paymentIntentId,
        error: error.message,
      });

      if (error instanceof ApiErrors) throw error;

      throw new ApiErrors(
        `Refund failed: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.REFUND_FAILED
      );
    }
  }

  /**
   * Cancel payment intent
   * @param {String} paymentIntentId - Stripe payment intent ID
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelPaymentIntent(paymentIntentId) {
    try {
      this._checkStripeConfigured();

      if (!paymentIntentId) {
        throw new ApiErrors(
          'Payment intent ID is required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      logger.info('Canceling payment intent', { paymentIntentId });

      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

      logger.info('Payment intent canceled', {
        paymentIntentId,
        status: paymentIntent.status,
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      logger.error('Failed to cancel payment intent', {
        paymentIntentId,
        error: error.message,
      });

      if (error instanceof ApiErrors) throw error;

      throw new ApiErrors(
        `Failed to cancel payment: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.PAYMENT_CANCEL_FAILED
      );
    }
  }

  /**
   * Send payout to connected account (doctor)
   * @param {String} connectedAccountId - Stripe connected account ID
   * @param {Number} amount - Amount in rupees/dollars
   * @param {String} currency - Currency code
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Payout result
   */
  async sendPayout(connectedAccountId, amount, currency = 'inr', metadata = {}) {
    try {
      this._checkStripeConfigured();

      if (!connectedAccountId) {
        throw new ApiErrors(
          'Connected account ID is required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      if (!amount || amount <= 0) {
        throw new ApiErrors(
          'Invalid amount: must be greater than 0',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const amountInCents = Math.round(amount * 100);

      logger.info('Creating payout', {
        connectedAccountId,
        amount,
        currency,
      });

      const payout = await this.stripe.payouts.create(
        {
          amount: amountInCents,
          currency: currency.toLowerCase(),
          metadata: {
            ...metadata,
            createdAt: new Date().toISOString(),
          },
        },
        {
          stripeAccount: connectedAccountId,
        }
      );

      logger.info('Payout created successfully', {
        payoutId: payout.id,
        connectedAccountId,
        amount,
      });

      return {
        success: true,
        payoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        arrivalDate: payout.arrival_date,
      };
    } catch (error) {
      logger.error('Payout creation error', {
        connectedAccountId,
        error: error.message,
      });

      if (error instanceof ApiErrors) throw error;

      throw new ApiErrors(
        `Payout failed: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.PAYOUT_FAILED
      );
    }
  }

  /**
   * Transfer to connected account
   * @param {String} connectedAccountId - Stripe connected account ID
   * @param {Number} amount - Amount to transfer
   * @param {String} currency - Currency code
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Transfer result
   */
  async transferToConnectedAccount(
    connectedAccountId,
    amount,
    currency = 'inr',
    metadata = {}
  ) {
    try {
      this._checkStripeConfigured();

      if (!connectedAccountId || !amount || amount <= 0) {
        throw new ApiErrors(
          'Invalid parameters',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const amountInCents = Math.round(amount * 100);

      logger.info('Creating transfer', {
        connectedAccountId,
        amount,
      });

      const transfer = await this.stripe.transfers.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        destination: connectedAccountId,
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
        },
      });

      logger.info('Transfer created successfully', {
        transferId: transfer.id,
        destination: connectedAccountId,
        amount,
      });

      return {
        success: true,
        transferId: transfer.id,
        amount: transfer.amount / 100,
        currency: transfer.currency,
        destination: transfer.destination,
      };
    } catch (error) {
      logger.error('Transfer creation error', {
        connectedAccountId,
        error: error.message,
      });

      if (error instanceof ApiErrors) throw error;

      throw new ApiErrors(
        `Transfer failed: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.TRANSFER_FAILED
      );
    }
  }

  /**
   * Get payment intent details
   * @param {String} paymentIntentId - Stripe payment intent ID
   * @returns {Promise<Object>} Payment intent details
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      this._checkStripeConfigured();

      if (!paymentIntentId) {
        throw new ApiErrors(
          'Payment intent ID is required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethod: paymentIntent.payment_method,
        metadata: paymentIntent.metadata,
        created: paymentIntent.created,
      };
    } catch (error) {
      logger.error('Failed to retrieve payment intent', {
        paymentIntentId,
        error: error.message,
      });

      throw new ApiErrors(
        `Failed to retrieve payment: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.PAYMENT_RETRIEVAL_FAILED
      );
    }
  }

  /**
   * Private: Handle different payment statuses
   * @private
   */
  _handlePaymentStatus(status, paymentIntentId) {
    const statusMessages = {
      [this.PAYMENT_STATUS.PROCESSING]: {
        message: 'Payment is being processed. Please wait.',
        code: HTTP_STATUS.ACCEPTED,
      },
      [this.PAYMENT_STATUS.REQUIRES_ACTION]: {
        message: 'Payment requires additional authentication.',
        code: HTTP_STATUS.PAYMENT_REQUIRED,
      },
      [this.PAYMENT_STATUS.REQUIRES_PAYMENT_METHOD]: {
        message: 'Payment not completed. Please complete the payment.',
        code: HTTP_STATUS.PAYMENT_REQUIRED,
      },
      [this.PAYMENT_STATUS.REQUIRES_CONFIRMATION]: {
        message: 'Payment requires confirmation.',
        code: HTTP_STATUS.PAYMENT_REQUIRED,
      },
      [this.PAYMENT_STATUS.REQUIRES_CAPTURE]: {
        message: 'Payment authorized but not captured.',
        code: HTTP_STATUS.ACCEPTED,
      },
      [this.PAYMENT_STATUS.CANCELED]: {
        message: 'Payment was canceled.',
        code: HTTP_STATUS.BAD_REQUEST,
      },
      [this.PAYMENT_STATUS.FAILED]: {
        message: 'Payment failed. Please try again.',
        code: HTTP_STATUS.BAD_REQUEST,
      },
    };

    const statusInfo = statusMessages[status] || {
      message: `Unknown payment status: ${status}`,
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };

    logger.warn('Payment not succeeded', {
      paymentIntentId,
      status,
    });

    throw new ApiErrors(
      statusInfo.message,
      statusInfo.code,
      ERROR_CODES.PAYMENT_NOT_COMPLETED
    );
  }

  /**
   * Private: Handle Stripe-specific errors
   * @private
   */
  _handleStripeError(error) {
    const errorTypes = {
      StripeInvalidRequestError: {
        message: 'Invalid payment intent ID',
        code: HTTP_STATUS.BAD_REQUEST,
        errorCode: ERROR_CODES.INVALID_PAYMENT_INTENT,
      },
      StripeAPIError: {
        message: 'Payment service temporarily unavailable',
        code: HTTP_STATUS.SERVICE_UNAVAILABLE,
        errorCode: ERROR_CODES.STRIPE_API_ERROR,
      },
      StripeAuthenticationError: {
        message: 'Payment service authentication failed',
        code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        errorCode: ERROR_CODES.STRIPE_AUTH_ERROR,
      },
    };

    const errorInfo = errorTypes[error.type] || {
      message: `Stripe error: ${error.message}`,
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode: ERROR_CODES.STRIPE_ERROR,
    };

    throw new ApiErrors(errorInfo.message, errorInfo.code, errorInfo.errorCode);
  }
}

// Export singleton instance
export default new PaymentService();
