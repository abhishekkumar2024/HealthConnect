// models/payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  receiveUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  payerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  paymentMethodId: String,
  paymentMethodType: String,
  paymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  description: String,
  paymentResponse: Object,
  
  // Refund fields
  refundId: String,
  refundAmount: Number,
  refundStatus: String,
  refundedAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);
