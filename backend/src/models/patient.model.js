// src/models/patient.model.js
import mongoose from 'mongoose';


const PatientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // ✅ OPTIONAL - Can be added later
    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative'],
    },
    height: {
        type: Number,
        min: [0, 'Height cannot be negative'],
    },
    bmi: {
        type: Number,
        min: 0,
    },
    healthId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phoneNumber: String,
    },
    medicalHistory: {
        conditions: [{
            condition: String,
            diagnosedDate: Date,
            treatment: String,
            notes: String,
            isActive: {
                type: Boolean,
                default: true,
            },
        }],
        allergies: [{
            allergen: String,
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
                default: 'mild',
            },
            reaction: String,
            notes: String,
        }],
        medications: [{
            name: String,
            dosage: String,
            frequency: String,
            startDate: Date,
            endDate: Date,
            prescribedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Doctor',
            },
            isActive: {
                type: Boolean,
                default: true,
            },
        }],
        surgeries: [{
            name: String,
            date: Date,
            hospital: String,
            notes: String,
        }],
        vaccinations: [{
            name: String,
            date: Date,
            nextDueDate: Date,
        }],
        familyHistory: [{
            relation: String,
            condition: String,
            notes: String,
        }],
    },
    primaryDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    }],
    lastCheckup: Date,
    insuranceInfo: {
        provider: String,
        policyNumber: String,
        validUntil: Date,
    },
}, {
    timestamps: true,
});

// Pre-save hook to calculate BMI
PatientSchema.pre('save', function(next) {
    if (this.weight && this.height && this.height > 0) {
        const heightInMeters = this.height / 100;
        this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(2));
    }
    next();
});

// Helper methods
PatientSchema.methods.getActiveMedications = function() {
    return this.medicalHistory.medications.filter(med => med.isActive);
};

PatientSchema.methods.getActiveConditions = function() {
    return this.medicalHistory.conditions.filter(cond => cond.isActive);
};

PatientSchema.methods.getAllAllergies = function() {
    return this.medicalHistory.allergies.map(allergy => ({
        allergen: allergy.allergen,
        severity: allergy.severity,
        reaction: allergy.reaction,
    }));
};

// Indexes
PatientSchema.index({ bloodGroup: 1 });

const Patient = mongoose.model('Patient', PatientSchema);
export default Patient;
