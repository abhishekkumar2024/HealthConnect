import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    message: {
        type: String,
        required: false,
    },
    isReadPatient: {
        type: Boolean,
        default: false,
    },
    isReadDoctor: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
