// src/controllers/profile.controller.js
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import ApiErrors from "../utils/ApiError.utils.js";
import catchAsync from "../utils/catchAsync.utils.js";
import { uploadToCloudinary, cloudinaryDeletePhoto } from "../utils/cloudinary.utils.js";

/**
 * @desc    Get complete user profile
 * @route   GET /api/v1/profile
 * @access  Private
 */
export const GetProfile = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Get user data
    const user = await User.findById(userId)
        .select('-password -refreshToken -otp -otpExpiry -passwordResetToken -passwordResetExpiry');

    if (!user) {
        throw new ApiErrors(404, "User not found");
    }

    // Get role-specific data
    let roleData = null;
    if (userRole === 'doctor') {
        roleData = await Doctor.findOne({ userId });
    } else if (userRole === 'patient') {
        roleData = await Patient.findOne({ userId });
    }

    res.status(200).json({
        success: true,
        data: {
            user,
            [userRole]: roleData,
        },
    });
});

/**
 * @desc    Update profile (text fields + optional image upload)
 * @route   PUT /api/v1/profile
 * @access  Private
 */
export const UpdateProfile = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;


    // Handle profile picture upload
    if (req.file) {
        const currentUser = await User.findById(userId).select('profilePicture');
        
        console.log("Uploading new profile picture:", req.file.path);
        const uploadResponse = await uploadToCloudinary(req.file.path);
        
        if (!uploadResponse) {
            throw new ApiErrors(500, "Failed to upload profile picture");
        }

        req.body.profilePicture = uploadResponse.secure_url;

        // Delete old picture (async, don't wait)
        if (currentUser.profilePicture) {
            const fileName = currentUser.profilePicture.split('/').pop().split('.')[0];
            cloudinaryDeletePhoto(`healthcare/profiles/${fileName}`).catch(console.error);
        }
    }

    // Remove protected fields
    const protectedFields = [
        'password',
        'email',
        'role',
        'refreshToken',
        'otp',
        'otpExpiry',
        'passwordResetToken',
        'passwordResetExpiry',
        'isVerified',
        'isBlocked',
        'isDeleted',
    ];
    
    protectedFields.forEach(field => delete req.body[field]);

    // Handle address if sent as nested object (from FormData with address[street] format)
    // Express body-parser should parse address[street] into req.body.address.street
    // But if it doesn't, we'll handle it manually
    if (req.body['address[street]'] || req.body['address[city]']) {
        req.body.address = {
            street: req.body['address[street]'] || '',
            city: req.body['address[city]'] || '',
            state: req.body['address[state]'] || '',
            country: req.body['address[country]'] || '',
            pincode: req.body['address[pincode]'] || '',
        };
        // Remove the bracket notation fields
        delete req.body['address[street]'];
        delete req.body['address[city]'];
        delete req.body['address[state]'];
        delete req.body['address[country]'];
        delete req.body['address[pincode]'];
    }

    // Update both User and Role models in parallel
    const RoleModel = userRole === 'doctor' ? Doctor : Patient;

    const [updatedUser, updatedRoleData] = await Promise.all([
        // Update User model
        User.findByIdAndUpdate(
            userId,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password -refreshToken -otp -otpExpiry -passwordResetToken -passwordResetExpiry'),
        
        // Update Doctor/Patient model
        RoleModel.findOneAndUpdate(
            { userId },
            { $set: req.body },
            { new: true, runValidators: true }
        )
    ]);

    if (!updatedUser) {
        throw new ApiErrors(404, "User not found");
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            user: updatedUser,
            [userRole]: updatedRoleData,
        },
    });
});
