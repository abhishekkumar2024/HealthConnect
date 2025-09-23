import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    dateTime: {
        type: Date,
        required: false,
    },
    slot: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'in-progress'],
        default: 'in-progress',
    },
    type: {
        type: String,
        enum: ['initial', 'follow-up', 'consultation'],
        required: true,
    },
    fee: {
        amount: Number,
        status: {
            type: String,
            enum: ['paid', 'refunded'],
            default: 'paid',
        },
    }
}, {
    timestamps: true,
});

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);