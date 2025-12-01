require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import utilities
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const sopRoutes = require('./routes/sop.routes');
const categoryRoutes = require('./routes/category.routes');
const departmentRoutes = require('./routes/department.routes');
const approvalRoutes = require('./routes/approval.routes');
const auditRoutes = require('./routes/audit.routes');
const reportRoutes = require('./routes/report.routes');
const actorRoutes = require('./routes/actor.routes');
const evaluationRoutes = require('./routes/evaluation.routes');
const monitoringRoutes = require('./routes/monitoring.routes');
const profileRoutes = require('./routes/profile.routes');

// Import middleware
const corsMiddleware = require('./middleware/cors');

const app = express();

// ===========================================
// MIDDLEWARE CONFIGURATION
// ===========================================

// Security
app.use(helmet());

// CORS - Allow multiple origins for development
const allowedOrigins = [
  'http://localhost:3000',  // Frontend development server
  'http://localhost:5173',  // Vite default port
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Static files (PDF SOP folder)
app.use(process.env.PDF_SOP_URL || '/api/sop/documents', express.static(path.join(__dirname, '../static/sop/documents')));

// ===========================================
// ROUTES
// ===========================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: process.env.APP_NAME || 'SOP Management System',
    version: '1.0.0',
    description: 'SOP Management System API for BPS',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      sop: '/api/sop',
      categories: '/api/categories',
      departments: '/api/departments',
      approvals: '/api/approvals',
      audit: '/api/audit',
      reports: '/api/reports',
      actors: '/api/actors',
      evaluations: '/api/evaluations',
      monitoring: '/api/monitoring',
      profile: '/api/profile'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sop', sopRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ===========================================
// SERVER STARTUP
// ===========================================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`📡 API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
