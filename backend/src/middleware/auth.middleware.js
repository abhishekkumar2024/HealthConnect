import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ApiErrors from "../utils/ApiError.utils.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    //Fixed: Proper check and immediate return after next()
    if (!accessToken) {
      return next(new ApiErrors(401, "Unauthorized request. Please log in first"));
    }
    // Decode and verify token
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    //Select correct model based on role
    const UserModel = decodedToken.role === 'doctor' ? Doctor : Patient;

    //Remove extra '?' - findById already returns null if not found
    const user = await UserModel.findOne({ userId: decodedToken._id }).select("-password -refreshToken");
    if (!user) {
      return next(new ApiErrors(401, "Invalid Access Token"));
    }

    //Attach user to request
    req.user = user;
    
    //Only one next() call at the end of successful authentication
    next();
    
  } catch (error) {
    //Handle JWT errors specifically
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiErrors(401, "Invalid token"));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiErrors(401, "Token expired. Please log in again"));
    }
    
    //Pass other errors to error handler
    return next(error);
  }
};
