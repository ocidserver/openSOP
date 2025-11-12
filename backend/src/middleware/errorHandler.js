const logger = require('../utils/logger');

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Prisma errors
  if (err.code) {
    return handlePrismaError(err, res);
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    return handleMulterError(err, res);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.details
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle Prisma Database Errors
 */
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
        field: err.meta?.target
      });
    
    case 'P2025':
      // Record not found
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    
    case 'P2003':
      // Foreign key constraint violation
      return res.status(400).json({
        success: false,
        message: 'Referenced record does not exist'
      });
    
    case 'P2014':
      // Invalid ID
      return res.status(400).json({
        success: false,
        message: 'Invalid ID provided'
      });
    
    default:
      logger.error('Unhandled Prisma error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred'
      });
  }
};

/**
 * Handle Multer Upload Errors
 */
const handleMulterError = (err, res) => {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum limit'
      });
    
    case 'LIMIT_FILE_COUNT':
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    
    case 'LIMIT_UNEXPECTED_FILE':
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    
    default:
      return res.status(400).json({
        success: false,
        message: 'File upload error'
      });
  }
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
};
