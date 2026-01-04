// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import ApiErrors from './utils/ApiError.utils.js';
import { HTTP_STATUS } from './utils/constants.utils.js';

const app = express();

/* ======================
   Security Middleware
====================== */
app.use(helmet());

/* ======================
   CORS Configuration
====================== */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow health checks, curl, server-to-server
      if (!origin) return callback(null, true);

      // Allow all in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // Strict check in production
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* ======================
   Middleware
====================== */
app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ======================
   Rate Limiting
====================== */
app.use('/api/', apiLimiter);

/* ======================
   Routes
====================== */
app.use('/api/v1', routes);

/* ======================
   Root Health Check
====================== */
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'HealthConnect API',
    status: 'OK',
  });
});

/* ======================
   404 Handler
====================== */
app.all('*', (req, res, next) => {
  next(
    new ApiErrors(
      `Route ${req.originalUrl} not found`,
      HTTP_STATUS.NOT_FOUND
    )
  );
});

/* ======================
   Global Error Handler
====================== */
app.use(errorHandler);

export default app;
