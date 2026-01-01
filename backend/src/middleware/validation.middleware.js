// src/middleware/validation.middleware.js
import ApiErrors from '../utils/ApiError.utils.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.utils.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      // ✅ ONLY CHANGE THIS LINE - Convert errors to JSON string
      throw new ApiErrors(
        `Validation failed: ${JSON.stringify(errors, null, 2)}`,  // ← Changed this
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    req.body = value;
    next();
  };
};
