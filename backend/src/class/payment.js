// paymentService.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Abstract base class for payment services
 */
class PaymentService {
  async createPaymentIntent(amount, currency, metadata) {
    throw new Error('createPaymentIntent method must be implemented');
  }

  async confirmPaymentIntent(paymentIntentId) {
    throw new Error('confirmPaymentIntent method must be implemented');
  }

  async verifyPayment(paymentIntentId) {
    throw new Error('verifyPayment method must be implemented');
  }

  async refundPayment(paymentIntentId, amount) {
    throw new Error('refundPayment method must be implemented');
  }
}

/**
 * Stripe implementation of payment service
 */
export class StripePaymentService extends PaymentService {
  /**
   * Create a payment intent (don't confirm yet - let frontend handle it)
   * @param {number} amount - Amount in dollars (will be converted to cents)
   * @param {string} currency - Currency code (default: 'usd')
   * @param {object} metadata - Additional metadata for the payment
   * @returns {Promise<object>} Payment intent with client secret
   */
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount: must be greater than 0');
      }

      // Convert amount to cents (Stripe's smallest currency unit)
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

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm payment intent (backend confirmation if needed)
   * @param {string} paymentIntentId - The payment intent ID
   * @param {string} paymentMethodId - Optional payment method ID
   * @returns {Promise<object>} Confirmed payment intent
   */
  async confirmPaymentIntent(paymentIntentId, paymentMethodId = null) {
    try {
      const confirmData = {};

      if (paymentMethodId) {
        confirmData.payment_method = paymentMethodId;
      }

      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmData
      );

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        paymentIntent,
      };
    } catch (error) {
      console.error('Stripe confirmPaymentIntent error:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Verify payment status
   * @param {string} paymentIntentId - The payment intent ID to verify
   * @returns {Promise<object>} Payment verification result
   */
  async verifyPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        paymentIntent,
      };
    } catch (error) {
      console.error('Stripe verifyPayment error:', error);
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   * @param {string} paymentIntentId - The payment intent ID to refund
   * @param {number} amount - Optional partial refund amount in dollars (null for full refund)
   * @returns {Promise<object>} Refund result
   */
  async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
      };

      // Partial refund if amount specified
      if (amount !== null && amount > 0) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        refund,
      };
    } catch (error) {
      console.error('Stripe refundPayment error:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Create a Stripe customer
   * @param {string} email - Customer email
   * @param {string} name - Customer name
   * @param {object} metadata - Additional customer metadata
   * @returns {Promise<object>} Created customer
   */
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });

      return {
        success: true,
        customerId: customer.id,
        customer,
      };
    } catch (error) {
      console.error('Stripe createCustomer error:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Retrieve customer payment methods
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<object>} List of payment methods
   */
  async getPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data,
      };
    } catch (error) {
      console.error('Stripe getPaymentMethods error:', error);
      throw new Error(`Failed to retrieve payment methods: ${error.message}`);
    }
  }
}

// Export singleton instance
const stripePaymentService = new StripePaymentService();
export default stripePaymentService;
