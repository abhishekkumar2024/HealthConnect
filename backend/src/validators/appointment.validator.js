// src/validators/appointment.validator.js
import Joi from 'joi';

export const bookAppointmentSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  appointmentDate: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Invalid appointment date format',
    'date.greater': 'Appointment date must be in the future',
    'any.required': 'Appointment date is required',
  }),
  reason: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Reason must be at least 5 characters',
    'string.max': 'Reason cannot exceed 500 characters',
    'any.required': 'Reason is required',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  currencyType: Joi.string().valid('usd', 'inr', 'eur').default('usd'),
});

export const confirmAppointmentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
  doctorId: Joi.string().required(),
  appointmentDate: Joi.date().iso().required(),
  reason: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currencyType: Joi.string().valid('usd', 'inr', 'eur').default('usd'),
});

export const cancelAppointmentSchema = Joi.object({
  cancellationReason: Joi.string().min(5).max(500).required(),
});
