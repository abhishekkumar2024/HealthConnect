// models/appointment.model.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    // Core appointment details
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    // Appointment status flow
    status: {
      type: String,
      enum: [
        'pending_doctor_approval',  // Patient requested, waiting for doctor
        'approved',                 // Doctor approved, waiting for payment
        'rejected',                 // Doctor rejected
        'payment_pending',          // Doctor approved, payment link sent
        'confirmed',                // Payment completed, appointment confirmed
        'completed',                // Consultation completed
        'cancelled',                // Cancelled by patient/doctor
        'no_show',                  // Patient didn't show up
      ],
      default: 'pending_doctor_approval',
      index: true,
    },
    // Doctor response tracking
    doctorResponse: {
      action: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      message: {
        type: String,
        trim: true,
      },
      respondedAt: Date,
    },
    // Booking fee (upfront payment)
    bookingFee: {
      amount: {
        type: Number,
        default: 100,
        min: 0,
      },
      clientSecret: String,
      paymentIntentId: String,
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending',
      },
      paidAt: Date,
    },

    // Consultation fee structure
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },

    // Main payment tracking
    paymentIntentId: String,
    paymentClientSecret: String, // Store clientSecret for full payment
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'partially_refunded', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentDate: Date,
    paymentMethod: String,

    // Doctor payout tracking
    doctorPayout: {
      type: Number,
      min: 0,
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    payoutId: String,
    payoutDate: Date,

    // Video session (Jitsi Meet integration)
    videoSession: {
      sessionId: String,
      roomId: String,
      roomName: String,
      patientLink: String,
      doctorLink: String,
      patientJitsiUrl: String,
      doctorJitsiUrl: String,
      jitsiDomain: {
        type: String,
        default: 'meet.jit.si',
      },
      startTime: Date,
      endTime: Date,
      status: {
        type: String,
        enum: ['not_started', 'active', 'completed', 'expired'],
        default: 'not_started',
      },
    },

    // Cancellation tracking
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
      },
    },
    cancelledAt: Date,

    // Refund tracking
    refundStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'processed', 'failed'],
      default: 'not_applicable',
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    refundId: String,
    refundDate: Date,

    // Consultation notes
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    prescription: {
      type: String,
      trim: true,
    },

    // Additional metadata
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ 'videoSession.sessionId': 1 });

// ==========================================
// VIRTUALS
// ==========================================

// Check if appointment is in the past
appointmentSchema.virtual('isPast').get(function () {
  return this.appointmentDate < new Date();
});

// Check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function () {
  return this.appointmentDate > new Date() && this.status === 'confirmed';
});

// Calculate platform revenue
appointmentSchema.virtual('platformRevenue').get(function () {
  return this.paymentStatus === 'paid' && this.payoutStatus === 'paid'
    ? this.platformFee
    : 0;
});

// ==========================================
// MIDDLEWARE
// ==========================================

// Pre-save: Calculate totalAmount automatically
appointmentSchema.pre('save', function (next) {
  if (this.isModified('consultationFee') || this.isModified('platformFee')) {
    this.totalAmount = (this.consultationFee || 0) + (this.platformFee || 0);
  }

  // Calculate doctor payout
  if (this.isModified('consultationFee')) {
    this.doctorPayout = this.consultationFee;
  }

  next();
});

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Check if appointment can be cancelled
 */
appointmentSchema.methods.canCancel = function () {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return { allowed: false, reason: 'Appointment already finalized' };
  }

  const now = new Date();
  const appointmentTime = new Date(this.appointmentDate);
  const hoursUntil = (appointmentTime - now) / (1000 * 60 * 60);

  if (hoursUntil < 0) {
    return { allowed: false, reason: 'Appointment already passed' };
  }

  return { allowed: true, hoursUntil };
};

/**
 * Calculate refund amount based on cancellation time
 */
appointmentSchema.methods.calculateRefund = function () {
  const { allowed, hoursUntil } = this.canCancel();

  if (!allowed) {
    return { amount: 0, percentage: 0 };
  }

  let percentage = 0;

  // Refund policy
  if (hoursUntil >= 24) {
    percentage = 100; // Full refund
  } else if (hoursUntil >= 12) {
    percentage = 50; // 50% refund
  } else if (hoursUntil >= 6) {
    percentage = 25; // 25% refund
  }
  // else 0% refund

  const amount = (this.totalAmount * percentage) / 100;

  return {
    amount: Math.round(amount * 100) / 100,
    percentage,
  };
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Get upcoming appointments for user
 */
appointmentSchema.statics.getUpcomingAppointments = function (userId, role) {
  const filter = {
    appointmentDate: { $gte: new Date() },
    status: { $in: ['pending_doctor_approval', 'payment_pending', 'confirmed'] },
  };

  if (role === 'patient') {
    filter.patientId = userId;
  } else if (role === 'doctor') {
    filter.doctorId = userId;
  }

  return this.find(filter)
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId')
    .populate('patientId.userId', 'name email')
    .populate('doctorId.userId', 'name email')
    .sort('appointmentDate');
};

/**
 * Get past appointments
 */
appointmentSchema.statics.getPastAppointments = function (userId, role) {
  const filter = {
    appointmentDate: { $lt: new Date() },
    status: { $in: ['completed', 'cancelled', 'no_show'] },
  };

  if (role === 'patient') {
    filter.patientId = userId;
  } else if (role === 'doctor') {
    filter.doctorId = userId;
  }

  return this.find(filter)
    .populate('patientId', 'userId')
    .populate('doctorId', 'userId')
    .populate('patientId.userId', 'name email')
    .populate('doctorId.userId', 'name email')
    .sort('-appointmentDate');
};

/**
 * Get pending doctor approvals
 */
appointmentSchema.statics.getPendingApprovals = function (doctorId) {
  return this.find({
    doctorId,
    status: 'pending_doctor_approval',
    'bookingFee.paymentStatus': 'paid',
  })
    .populate('patientId', 'userId')
    .populate('patientId.userId', 'name email phone')
    .sort('appointmentDate');
};

/**
 * Calculate doctor earnings
 */
appointmentSchema.statics.getDoctorEarnings = async function (doctorId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        doctorId: new mongoose.Types.ObjectId(doctorId),
        status: 'completed',
        paymentStatus: 'paid',
        payoutStatus: 'paid',
        appointmentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$doctorPayout' },
        totalAppointments: { $sum: 1 },
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || { totalEarnings: 0, totalAppointments: 0 };
};

/**
 * Get pending payouts
 */
appointmentSchema.statics.getPendingPayouts = function () {
  return this.find({
    status: 'completed',
    paymentStatus: 'paid',
    payoutStatus: 'pending',
  })
    .populate('doctorId', 'userId stripeConnectedAccountId')
    .populate('doctorId.userId', 'name email')
    .sort('appointmentDate');
};

// Set virtuals to be included in JSON
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Appointment', appointmentSchema);
