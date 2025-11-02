// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import ApiErrors  from './utils/ApiError.utils.js';
import { HTTP_STATUS } from './utils/constants.utils.js';
import cookieParser from "cookie-parser";

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);

app.use(cookieParser());

// Request logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/v1', routes);

// 404 handler
app.all('*', (req, res, next) => {
  next(new ApiErrors (`Route ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND));
});

// Global error handler
app.use(errorHandler);

export default app;
