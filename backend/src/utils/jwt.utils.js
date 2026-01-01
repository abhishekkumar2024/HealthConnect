// src/utils/generateTokens.utils.js
import User from "../models/user.model.js";
import ApiErrors from "./ApiError.utils.js";

export const generateTokens = async (user_id) => {
    try {
        const user = await User.findById(user_id);
        
        if (!user) {
            throw new ApiErrors(404, "User not found");
        }

        // ✅ Call BOTH methods separately (they each return a string)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        // ✅ Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiErrors(500, "Failed to generate tokens");
    }
};
