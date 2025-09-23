import mongoose from 'mongoose';
import User from './user.model.js';

const DoctorSchema = new mongoose.Schema({
    baseUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    specialization: {
        type: String,
        required: false,
        trim: true
    },
    qualification: {
        type: String,
        required: false,
        trim: true
    },
    experience: {
        type: Number,
        default: 0,
        min: 0
    },
    license: {
        type: String,
        required: false,
        unique: true,
    },
    consultationFee: {
        type: Number,
        required: false,
        min: 0
    },
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
        }
    }],
    ratings: [{
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: false
        },
        review: {
            type: String,
            maxlength: 500
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }],
    averageRating: {
        type: Number,
        default: 5,
        min: 0,
        max: 5
    }
}, {
    timestamps: true
});

// Compound index for efficient searching
DoctorSchema.index({ specialization: 1, experience: 1, consultationFee: 1 });

const Doctor = mongoose.models.Doctor ||User.discriminator('Doctor', DoctorSchema);

export { Doctor };