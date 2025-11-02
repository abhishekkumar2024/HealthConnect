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
    symptoms: [String],
    diagnosis: {
        type: String,
        default: '',
    },
    prescription: [{
        medicine: String,
        dosage: String,
        duration: String,
        notes: String,
    }],
    notes: String,
    fee: {
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
    }
}, {
    timestamps: true,
});

export const Appointment = mongoose.model('Appointment', AppointmentSchema);