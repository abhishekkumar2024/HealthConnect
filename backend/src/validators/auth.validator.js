// src/validators/auth.validator.js
import Joi from 'joi';

/**
 * Register user validation schema
 */
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),

  phoneNumber: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required',
    }),

  role: Joi.string()
    .valid('patient', 'doctor')
    .required()
    .messages({
      'any.only': 'Role must be either Patient or Doctor',
      'any.required': 'Role is required',
    }),

  dateOfBirth: Joi.date()
    .max('now')
    .min('1900-01-01')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future',
      'date.min': 'Please provide a valid date of birth',
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other')
    .optional()
    .messages({
      'any.only': 'Gender must be male, female, or other',
    }),

  // Doctor-specific fields (conditional)
  specialization: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Specialization is required for Doctors',
      'any.required': 'Specialization is required for Doctors',
    }),
    otherwise: Joi.forbidden(),
  }),

  licenseNumber: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().min(5).max(50).required().messages({
      'string.empty': 'License number is required for Doctors',
      'any.required': 'License number is required for Doctors',
    }),
    otherwise: Joi.forbidden(),
  }),

  experience: Joi.when('role', {
    is: 'doctor',
    then: Joi.number().min(0).max(60).optional(),
    otherwise: Joi.forbidden(),
  }),
}).options({ 
  stripUnknown: true,  // Remove unknown fields
  abortEarly: false,   // Return all errors, not just the first one
});

/**
 * Login validation schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),

  rememberMe: Joi.boolean().optional(),
}).options({ 
  stripUnknown: true,
  abortEarly: false,
});

/**
 * Send OTP validation schema
 */
export const sendOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  purpose: Joi.string()
    .valid('password-reset', 'email-verification', 'phone-verification')
    .default('email-verification')
    .messages({
      'any.only': 'Invalid OTP purpose',
    }),
}).options({ 
  stripUnknown: true,
  abortEarly: false,
});

/**
 * Verify OTP validation schema
 */
export const verifyOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required',
    }),

  purpose: Joi.string()
    .valid('password-reset', 'email-verification', 'phone-verification')
    .default('email-verification'),
}).options({ 
  stripUnknown: true,
  abortEarly: false,
});

/**
 * Change password validation schema (for logged-in users)
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .invalid(Joi.ref('currentPassword'))
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)',
      'any.invalid': 'New password must be different from current password',
      'any.required': 'New password is required',
    }),
}).options({ 
  stripUnknown: true,
  abortEarly: false,
});

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required',
    }),
}).options({ 
  stripUnknown: true,
  abortEarly: false,
});

/**
 * Update email validation schema
 */
export const updateEmailSchema = Joi.object({
  newEmail: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'New email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'New email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required for email change',
      'any.required': 'Password is required for email change',
    }),
}).options({ 
  stripUnknown: true,
  abortEarly: false,
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
}).options({
  stripUnknown: true,
  abortEarly: false,
});


export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)',
      'any.required': 'New password is required',
    })
}).options({
  stripUnknown: true,
  abortEarly: false,
});

export const otpSchema = Joi.object({
})
