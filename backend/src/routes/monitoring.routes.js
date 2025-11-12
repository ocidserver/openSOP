const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoring.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/monitoring/dashboard
 * @desc    Get dashboard KPIs and charts data
 * @access  Private (ADMIN, PIMPINAN, SUPERVISOR)
 * @query   periode, department, category, status
 */
router.get('/dashboard', 
  authorize(['ADMIN', 'SUPERVISOR', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA']), 
  monitoringController.getDashboard
);

/**
 * @route   GET /api/monitoring/performance
 * @desc    Get detailed performance metrics
 * @access  Private (ADMIN, PIMPINAN, SUPERVISOR)
 * @query   department, startDate, endDate
 */
router.get('/performance', 
  authorize(['ADMIN', 'SUPERVISOR', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA']), 
  monitoringController.getPerformance
);

/**
 * @route   GET /api/monitoring/compliance
 * @desc    Get compliance tracking data
 * @access  Private (ADMIN, PIMPINAN, SUPERVISOR)
 * @query   department, period
 */
router.get('/compliance', 
  authorize(['ADMIN', 'SUPERVISOR', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA']), 
  monitoringController.getCompliance
);

module.exports = router;
