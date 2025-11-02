// src/controllers/user.controller.js
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';
import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.utils.js';
import ApiErrors from '../utils/ApiError.utils.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.utils.js';
import { generateTokens } from '../utils/jwt.utils.js';
import { uploadToCloudinary } from '../utils/cloudinary.utils.js';
import notificationService from '../services/notification.service.js';
import logger from '../utils/logger.utils.js';
import jwt from "jsonwebtoken";

import crypto from "crypto";
import NotificationService from '../services/notification.service.js';

/**
 * Register a new user (Doctor or Patient)
 * @route POST /api/v1/auth/register
 */
export const RegisterUser = catchAsync(async (req, res) => {
  const { role, email, password, phoneNumber,name, ...otherData } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiErrors (
      'User with this email already exists',
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.DUPLICATE_RESOURCE
    );
  }

  // Create user in User collection first
  const user = await User.create({
    name,
    email,
    password,
    phoneNumber,
    role: role // Normalize to lowercase
  });

  // Create role-specific profile
  let profile;

  if (user.role === 'doctor') {
    profile = await Doctor.create({
      userId: user._id,
      ...otherData,
    });
  } else if (user.role === 'patient') {
    profile = await Patient.create({
      userId: user._id,
      ...otherData,
    });
  }

  // Send welcome email (non-blocking)
  notificationService.sendEmail({
    to: user.email,
    subject: 'Welcome to Healthcare App',
    text: `Welcome ${user.name}! Your account has been created successfully.`,
  }).catch(err => logger.error('Welcome email error:', err));

  logger.info('User registered successfully', { userId: user._id, role: user.role });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `${user.role} registered successfully`,
    data: {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
export const LoginUser = catchAsync(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiErrors (
      'Invalid email or password',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  // Check if account is blocked
  if (user.isBlocked) {
    throw new ApiErrors (
      'Your account has been blocked. Please contact support.',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiErrors (
      'Invalid email or password',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user._id);

  // Save refresh token to database
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Get user without sensitive fields
  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  // Cookie options
  const accessTokenOptions = {
    httpOnly: true,
    secure: process.env.env === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  };

  const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.env === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
    path: '/',
  };

  logger.info('User logged in successfully', { userId: user._id });

  res
    .status(HTTP_STATUS.OK)
    .cookie('accessToken', accessToken, accessTokenOptions)
    .cookie('refreshToken', refreshToken, refreshTokenOptions)
    .json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: loggedInUser,
        accessToken, // Also send in response body for mobile apps
      },
    });
});
/**
 * @desc    Request password reset - sends reset link to email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const ForgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal if user exists or not (security best practice)
        return res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent",
        });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash the token before saving to database
    const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Save hashed token and expiry to database
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // Create reset URL (frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const text = `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`;
    
    try {
        // Send email with reset link
        await NotificationService.sendEmail(user.email, user.name, text);

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        // If email fails, clear the reset token
        user.passwordResetToken = undefined;
        user.passwordResetExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiErrors(500, "Failed to send password reset email. Please try again");
    }
});

/**
 * @desc    Reset password using token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const ResetPassword = catchAsync(async (req, res) => {
    const { token, newPassword } = req.body;

    // Hash the incoming token to compare with database
    const resetTokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Find user with valid token and not expired
    const user = await User.findOne({
        passwordResetToken: resetTokenHash,
        passwordResetExpiry: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
        throw new ApiErrors(400, "Invalid or expired password reset token");
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.passwordChangedAt = Date.now();
    
    await user.save();

    // Generate new tokens
    const { accessToken, refreshToken } = await user.generateTokens();

    // Cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json({
            success: true,
            message: "Password reset successful. You are now logged in",
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
});

/**
 * @desc    Change password for logged in user
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const ChangePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
        throw new ApiErrors(404, "User not found");
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiErrors(401, "Current password is incorrect");
    }

    // Check if new password is same as old password
    const isSamePassword = await user.comparePassword(newPassword);
    
    if (isSamePassword) {
        throw new ApiErrors(400, "New password cannot be the same as current password");
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Generate new tokens (invalidate old sessions)
    const { accessToken, refreshToken } = await user.generateTokens();

    // Cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json({
            success: true,
            message: "Password changed successfully",
            data: {
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
});


/**
 * Logout user
 * @route POST /api/v1/auth/logout
 */
export const LogoutUser = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Clear refresh token from database
  await User.findByIdAndUpdate(userId, {
    $unset: { refreshToken: 1 },
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.env === 'production',
    sameSite: 'strict',
    path: '/',
  };

  logger.info('User logged out', { userId });

  res
    .status(HTTP_STATUS.OK)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});

/**
 * Send OTP for verification
 * @route POST /api/v1/auth/send-otp
 */
export const SentOTP = catchAsync(async (req, res) => {
  const { email, purpose = 'email-verification' } = req.body;

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiErrors (
      'No account found with this email',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save OTP to database with expiry (10 minutes)
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.otpPurpose = purpose;
  await user.save({ validateBeforeSave: false });

  // Send OTP via email
  try {
    await notificationService.sendEmail({
      to: user.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    });

    logger.info('OTP sent successfully', { userId: user._id, purpose });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: {
        expiresIn: '10 minutes',
      },
    });
  } catch (error) {
    logger.error('Failed to send OTP email', { userId: user._id, error: error.message });
    throw new ApiErrors (
      'Failed to send OTP. Please try again later.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.EXTERNAL_SERVICE_ERROR
    );
  }
});

/**
 * Verify OTP
 * @route POST /api/v1/auth/verify-otp
 */
export const VerifyOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiErrors (
      'User not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  // Check if OTP exists and is not expired
  if (!user.otp || !user.otpExpiry) {
    throw new ApiErrors (
      'No OTP found. Please request a new one.',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  if (user.otpExpiry < new Date()) {
    throw new ApiErrors (
      'OTP has expired. Please request a new one.',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  if (user.otp !== otp) {
    throw new ApiErrors (
      'Invalid OTP',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Mark as verified if purpose was email verification
  if (user.otpPurpose === 'email-verification') {
    user.isVerified = true;
  }

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpPurpose = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info('OTP verified successfully', { userId: user._id });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'OTP verified successfully',
  });
});

/**
 * Get current user info (from JWT)
 * @route GET /api/v1/auth/verify
 */
export const SendUserId = catchAsync(async (req, res) => {
  const user = req.user;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
    },
  });
});

/**
 * Get user profile by ID
 * @route GET /api/v1/profile/:id
 */
export const GetProfile = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Find user first to get role
  const user = await User.findById(id).select('role name email phoneNumber profilePicture');

  if (!user) {
    throw new ApiErrors (
      'User not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  let profile;

  if (user.role === 'doctor') {
    profile = await Doctor.findOne({ userId: id })
      .populate('userId', 'name email phoneNumber profilePicture')
      .populate('reviews');
  } else if (user.role === 'patient') {
    // Don't show sensitive medical history to others
    const isOwnProfile = req.user._id.toString() === id;
    
    profile = await Patient.findOne({ userId: id })
      .populate('userId', 'name email phoneNumber profilePicture')
      .select(isOwnProfile ? '' : '-medicalHistory -allergies -chronicConditions');
  }

  logger.info('Profile fetched', { userId: id });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      role: user.role,
      profile: profile || { userId: user },
    },
  });
});

/**
 * Update user profile
 * @route PUT /api/v1/profile/:id
 */
export const UpdateProfile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const currentUserId = req.user._id.toString();

  // Check if user is updating their own profile
  if (id !== currentUserId && req.user.role !== 'admin') {
    throw new ApiErrors (
      'You can only update your own profile',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  // Handle profile picture upload
  if (req.file) {
    try {
      const cloudinaryResult = await uploadToCloudinary(req.file.path, {
        folder: 'healthcare/profiles',
        public_id: `profile_${id}`,
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
        ],
      });

      // Update user's profile picture in User model
      await User.findByIdAndUpdate(id, {
        profilePicture: cloudinaryResult.secure_url,
      });

      updates.profilepic = cloudinaryResult.secure_url;
    } catch (error) {
      logger.error('Cloudinary upload error', { error: error.message });
      throw new ApiErrors (
        'Failed to upload profile picture',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.EXTERNAL_SERVICE_ERROR
      );
    }
  }

  // Remove fields that shouldn't be updated
  delete updates._id;
  delete updates.userId;
  delete updates.password;
  delete updates.refreshToken;
  delete updates.role;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiErrors (
      'User not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  let updatedProfile;

  if (user.role === 'doctor') {
    updatedProfile = await Doctor.findOneAndUpdate(
      { userId: id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phoneNumber profilePicture');
  } else if (user.role === 'patient') {
    updatedProfile = await Patient.findOneAndUpdate(
      { userId: id },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email phoneNumber profilePicture')
      .select('-password -refreshToken');
  }

  logger.info('Profile updated', { userId: id });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile,
  });
});

/**
 * Refresh access token
 * @route POST /api/v1/auth/refresh-token
 */
export const RefreshToken = catchAsync(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiErrors (
      'Refresh token not found',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  try {
    // Verify refresh token
    console.log('Verifying Refresh Token:', incomingRefreshToken);
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    // Find user
    console.log('Decoded Refresh Token:', decoded);
    const user = await User.findById(decoded._id).select('+refreshToken');
    console.log('User fetched for refresh token:', user);
    if (!user) {
      throw new ApiErrors (
        'Invalid refresh token',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Check if refresh token matches
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiErrors (
        'Refresh token is expired or invalid',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const accessTokenOptions = {
      httpOnly: true,
      secure: process.env.env === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: process.env.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    };

    logger.info('Tokens refreshed', { userId: user._id });

    res
      .status(HTTP_STATUS.OK)
      .cookie('accessToken', accessToken, accessTokenOptions)
      .cookie('refreshToken', refreshToken, refreshTokenOptions)
      .json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          accessToken,
        },
      });
  } catch (error) {
    throw new ApiErrors (
      'Invalid refresh token',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }
});

