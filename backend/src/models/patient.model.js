
import mongoose from 'mongoose';
import User from './user.model.js';

const PatientSchema = new mongoose.Schema({
    id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    bloodgroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    weight: {
        type: Number,
        min: 0,
        default: 0
    },
    height: {
        type: Number,
        min: 0,
        default: 0
    },
    bmi: {
        type: Number,
        default: 0,
    },
    healthid: {
        type: String,
        // unique: true,
        default: "",
    },
    emergencyContact: {
        name: String,
        relation: String,
        phone: String,
    },
    medicalHistory: {
        conditions: [{
            condition: String,
            diagnosedDate: Date,
            notes: String,
        }],
        allergies: [{
            allergen: String,
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
            },
            notes: String,
        }],
        medications: [{
            name: String,
            dosage: String,
            frequency: String,
            startDate: Date,
            endDate: Date,
        }],
    },
    primaryDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

const Patient = User.discriminator('Patient', PatientSchema);

export { Patient };

