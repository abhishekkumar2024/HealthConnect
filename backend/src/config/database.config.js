// src/config/database.config.js
import mongoose from 'mongoose';
import logger from '../utils/logger.utils.js';

const connectDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      logger.warn('⚠️ MONGODB_URI not set, skipping database connection');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    // Don't exit process - let server start and retry connection
    // In production, Railway will handle health checks
    throw error;
  }
};

export default connectDatabase;
