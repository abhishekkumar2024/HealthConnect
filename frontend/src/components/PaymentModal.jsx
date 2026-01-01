import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// Initialize Stripe - you'll need to add your Stripe publishable key to .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PaymentForm = ({ amount, clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        toast.error('Card information is required');
        setProcessing(false);
        return;
      }
      
      console.log("PaymentForm - clientSecret:", clientSecret);
      console.log("PaymentForm - amount:", amount);
      console.log("PaymentForm - stripe:", stripe);
      console.log("PaymentForm - elements:", cardElement);
      // Use confirmCardPayment for payment intents
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add billing details here if needed
          },
        },
      });
      console.log("PaymentForm - paymentIntent:", paymentIntent);
      
      if (error) {
        console.error('Stripe payment error:', error);
        // Provide more specific error messages
        let errorMessage = error.message || 'Payment failed';
        if (error.code === 'card_declined') {
          errorMessage = 'Your card was declined. Please try a different payment method.';
        } else if (error.code === 'expired_card') {
          errorMessage = 'Your card has expired. Please use a different card.';
        } else if (error.code === 'insufficient_funds') {
          errorMessage = 'Insufficient funds. Please use a different payment method.';
        }
        toast.error(errorMessage);
        setProcessing(false);
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          toast.success('Payment successful!');
          onSuccess(paymentIntent);
        } else if (paymentIntent.status === 'requires_action') {
          // Handle 3D Secure or other actions
          toast.info('Please complete the additional authentication step.');
          setProcessing(false);
        } else {
          console.warn('Payment intent status:', paymentIntent.status);
          toast.error(`Payment status: ${paymentIntent.status}. Please try again.`);
          setProcessing(false);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-primary-600">₹{amount}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 btn-primary flex items-center justify-center space-x-2"
        >
          {processing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay ₹{amount}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, amount, clientSecret, onSuccess, title = 'Complete Payment' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {clientSecret ? (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  amount={amount}
                  clientSecret={clientSecret}
                  onSuccess={onSuccess}
                  onCancel={onClose}
                />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
                <p className="text-gray-600">Loading payment form...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

