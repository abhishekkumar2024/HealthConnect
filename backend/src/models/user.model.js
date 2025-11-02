// src/models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUND = 10;

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            unique: true,
            trim: true,
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
        },
        role: {
            type: String,
            enum: ["patient", "doctor", "admin"],
            default: "patient",
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            pincode: String,
            landMark: String,
        },
        refreshToken: {
            type: String,
            select: false,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        profilePicture: {
            type: String,
            default: "",
        },
        phoneNumber: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            select: false,
        },
        otpExpiry: {
            type: Date,
            select: false,
        },
        otpPurpose: {
            type: String,
            select: false,
        },
        lastLogin: {
            type: Date,
        },
        passwordChangedAt: {
            type: Date,
            select: false,
        },
        refreshToken: {
            type: String,
            select: false,
        },
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpiry: {
            type: Date,
            select: false,
        },
        passwordChangedAt: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
        discriminatorKey: 'userType',
    }
);

// ✅ Pre-save hook for hashing passwords
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, SALT_ROUND);
        
        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000;
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// ✅ Pre-update hook for hashing updated passwords
UserSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    
    if (update?.password || update?.$set?.password) {
        try {
            const password = update.password || update.$set.password;
            const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
            
            if (update.$set) {
                update.$set.password = hashedPassword;
                update.$set.passwordChangedAt = Date.now();
            } else {
                update.password = hashedPassword;
                update.passwordChangedAt = Date.now();
            }
            
            this.setUpdate(update);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// ✅ Instance method for password comparison
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ DEPRECATED - Keep for backward compatibility
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await this.comparePassword(password);
};

// ✅ Generate access token - FIXED payload to use _id
UserSchema.methods.generateAccessToken = function () {
    console.log('Generating access token for user ID:', this._id);
    return jwt.sign(
        {
            _id: this._id,      // ✅ Changed from 'id' to '_id'
            email: this.email,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,  // ✅ Match your auth middleware
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
        }
    );
};

// ✅ Generate refresh token - FIXED payload to use _id
UserSchema.methods.generateRefreshToken = function () {
    console.log('Generating refresh token for user ID:', this._id);
    return jwt.sign(
        {
            _id: this._id,      // ✅ Changed from 'id' to '_id'
        },
        process.env.REFRESH_TOKEN_SECRET,  // ✅ Use correct env variable
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
        }
    );
};

// ✅ Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ isBlocked: 1 });
UserSchema.index({ role: 1, isVerified: 1 });

// ✅ Text search index
UserSchema.index(
    { name: "text" },
    { weights: { name: 10 } }
);

const User = mongoose.model("User", UserSchema);
export default User;
