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
        },
        role: {
            type: String,
            enum: ["Patient", "Doctor", "Admin"],
            default: "Patient",
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
        otp: {
            type: String,
            default: "",
        },
    },
    { 
        timestamps: true,
        discriminatorKey: 'userType' // This allows us to create different user types
    }
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
