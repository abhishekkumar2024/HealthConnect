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
            sparse: true, // Allows the field to be optional with uniqueness
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        role: {
            type: String,
            enum: ["patient", "doctor", "admin"],
            default: "patient",
        },
        refreshToken: {
            type: String,
            default: "",
        },
        accessToken: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            trim: true,
            default: "user"
        },
        dateofbirth: {
            type: Date,
            default: Date.now,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            // default: "Please select",
        },
        bloodgroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
            // default: "Unknown",
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
        address: {
            type: String,
            trim: true,
            address: "Unknown",
        },
        city: {
            type: String,
            trim: true,
            default: "Unknown",
        },
        state: {
            type: String,
            trim: true,
            default: "Unknown",
        },
        country: {
            type: String,
            trim: true,
            default: "Unknown",
        },
        pincode: {
            type: Number,
            default: 0,
        },
        profilepic: {
            type: String,
            default: "",
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
        bmi: {
            type: Number,
            default: 0,
        },
        healthid: {
            type: String,
            unique: true,
            default: "",
        },
    },
    { timestamps: true }
);

// Pre-save hook for hashing passwords
UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        try {
            const salt = await bcrypt.genSalt(SALT_ROUND);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Pre-update hook for hashing updated passwords
UserSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (update?.password) {
        try {
            const salt = await bcrypt.genSalt(SALT_ROUND);
            update.password = await bcrypt.hash(update.password, salt);
            this.setUpdate(update);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Instance method for password comparison
UserSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Instance method for token generation
UserSchema.methods.generateToken = function (type) {
    const payload = type === "access"
        ? { _id: this._id, email: this.email, phone: this.phone, role: this.role }
        : { _id: this._id };

    const secret = type === "access"
        ? process.env.ACCESS_WEBTOKEN_SECURE
        : process.env.REFRESH_WEBTOKEN_SECURE;

    const expiry = type === "access"
        ? process.env.ACCESS_WEBTOKEN_EXPIRY
        : process.env.REFRESH_WEBTOKEN_EXPIRY;

    const Token = jwt.sign(payload, secret, { expiresIn: expiry });
    // console.log(Token)
    return Token;
};

const User = mongoose.model("User", UserSchema);
export default User;
