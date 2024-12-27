import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUND = 10;

const UserSchema = new mongoose.Schema(
    {
        email: { 
            type: String, 
            lowercase: true
        },
        phone: { 
            type: String,
        },
        password: { type: String, required: true },
        role: { type: String, default: "patient" },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(SALT_ROUND);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Hash password before updating
UserSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (update && update.password) {
        try {
            const salt = await bcrypt.genSalt(SALT_ROUND);
            update.password = await bcrypt.hash(update.password, salt);
            this.setUpdate(update);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
