// src/models/doctor.model.js
import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // ✅ REQUIRED during registration
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true,
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true,
        trim: true,
    },
    // ✅ OPTIONAL - Can be added later
    qualification: String,
    experience: {
        type: Number,
        default: 0,
        min: [0, 'Experience cannot be negative'],
        max: [60, 'Experience cannot exceed 60 years'],
    },
    consultationFee: {
        type: Number,
        min: [0, 'Fee cannot be negative'],
    },
    clinicAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
    },
    languages: [String],
    bio: {
        type: String,
        maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    education: [{
        degree: String,
        institution: String,
        year: Number,
    }],
    timeSlots: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            lowercase: true
        },
        startTime: {
            type: String,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        },
        endTime: {
            type: String,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    }],
    availability: {
        type: Boolean,
        default: true,
    },
    reviews: [{
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
        },
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        review: {
            type: String,
            maxlength: [500, 'Review cannot exceed 500 characters'],
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    totalAppointments: {
        type: Number,
        default: 0,
    },
    isVerifiedDoctor: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Calculate average rating
DoctorSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.averageRating = 0;
        this.totalReviews = 0;
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.averageRating = parseFloat((sum / this.reviews.length).toFixed(1));
        this.totalReviews = this.reviews.length;
    }
    return this.save();
};

// Indexes
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ averageRating: -1 });
DoctorSchema.index({ consultationFee: 1 });

const Doctor = mongoose.model('Doctor', DoctorSchema);
export default Doctor;
