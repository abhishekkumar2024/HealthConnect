// paymentController.js
import { StripePaymentService } from '../class/payment.js';

const paymentService = new StripePaymentService();

/**
 * Create payment intent (internal function, not a route handler)
 * Used by other controllers to create payment intents
 */
export const createPaymentIntent = async (obj) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = obj;

    // Validate required fields
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount: must be greater than 0');
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      amount,
      currency,
      metadata
    );

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error; // Re-throw to let caller handle it
  }
};

/**
 * Verify payment intent status
 */
export const verifyPaymentIntent = async (paymentIntentId) => {
  try {
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required');
    }

    const verification = await paymentService.verifyPayment(paymentIntentId);
    return verification;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Refund payment
 */
export const refundPaymentIntent = async (paymentIntentId, amount = null) => {
  try {
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required');
    }

    const refund = await paymentService.refundPayment(paymentIntentId, amount);
    return refund;
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
};

export default paymentService;
