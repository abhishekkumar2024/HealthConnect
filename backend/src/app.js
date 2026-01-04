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
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(origin => origin)
  : ['http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:5173', 'http://127.0.0.1:4000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests, or Railway healthchecks)
      if (!origin) return callback(null, true);
      
      // In development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // In production, check against allowed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// Serve static files from frontend build
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
    }
  });
}

// 404 handler
app.all('*', (req, res, next) => {
  next(new ApiErrors (`Route ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND));
});

// Global error handler
app.use(errorHandler);

export default app;
