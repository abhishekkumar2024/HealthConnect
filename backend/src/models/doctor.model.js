import mongoose from 'mongoose';
import User from './user.model.js';

const DoctorSchema = new mongoose.Schema({
    id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    specialization: {
        type: String,
        required: true,
    },
    qualification: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        default: 0,
    },
    license: {
        type: String,
        required: true,
        unique: true,
    },
    consultationFee: {
        type: Number,
        required: true,
    },
    timeSlots: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        startTime: String,
        endTime: String,
        isAvailable: {
            type: Boolean,
            default: true,
        }
    }],
    ratings: [{
        rating: Number,
        review: String,
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
        default: 0,
    }
});

const Doctor = User.discriminator('Doctor', DoctorSchema);

export { Doctor };
