// src/routes/auth.routes.js
import { Router } from 'express';
import {
  RegisterUser,
  LoginUser,
  LogoutUser,
  SentOTP,
  SendUserId,
  RefreshToken,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
} from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, validate(registerSchema), RegisterUser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', authLimiter, validate(loginSchema), LoginUser);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset link
 * @access  Public
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), ForgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset user password
 * @access  Public
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), ResetPassword);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authLimiter, validate(changePasswordSchema), ChangePassword);

// Protected routes
router.use(authenticateUser);
/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP for verification
 * @access  Public
 */
router.post('/send-otp', authLimiter, validate(otpSchema), SentOTP);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', RefreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', LogoutUser);

/**
 * @route   GET /api/v1/auth/verify
 * @desc    Verify JWT and get user info
 * @access  Private
 */
router.get('/verify', SendUserId);

export default router;
