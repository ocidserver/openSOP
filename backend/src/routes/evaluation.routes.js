const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluation.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/evaluations/statistics
 * @desc    Get evaluation statistics
 * @access  Private (ADMIN, SUPERVISOR)
 */
router.get('/statistics', 
  authorize(['ADMIN', 'SUPERVISOR']), 
  evaluationController.getStatistics
);

/**
 * @route   GET /api/evaluations/sop/:sopId
 * @desc    Get all evaluations for a specific SOP
 * @access  Private (All authenticated users)
 */
router.get('/sop/:sopId', 
  evaluationController.getEvaluationsBySOP
);

/**
 * @route   GET /api/evaluations
 * @desc    Get all evaluations with optional filters
 * @access  Private (ADMIN, SUPERVISOR)
 * @query   search, department, category, minRating, page, limit, sortBy, sortOrder
 */
router.get('/', 
  authorize(['ADMIN', 'SUPERVISOR']), 
  evaluationController.getAllEvaluations
);

/**
 * @route   GET /api/evaluations/:id
 * @desc    Get single evaluation by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', 
  evaluationController.getEvaluationById
);

/**
 * @route   POST /api/evaluations
 * @desc    Create new evaluation
 * @access  Private (ADMIN, SUPERVISOR, STAFF)
 * @body    sopId, kelengkapanKonten, kejelasanProsedur, kemudahanImplementasi, relevansi, efektivitas, komentar, rekomendasi
 */
router.post('/', 
  authorize(['ADMIN', 'SUPERVISOR', 'STAFF']), 
  evaluationController.createEvaluation
);

/**
 * @route   PUT /api/evaluations/:id
 * @desc    Update evaluation (own evaluation or admin)
 * @access  Private (Owner or ADMIN)
 * @body    kelengkapanKonten, kejelasanProsedur, kemudahanImplementasi, relevansi, efektivitas, komentar, rekomendasi
 */
router.put('/:id', 
  evaluationController.updateEvaluation
);

/**
 * @route   DELETE /api/evaluations/:id
 * @desc    Delete evaluation (own evaluation or admin)
 * @access  Private (Owner or ADMIN)
 */
router.delete('/:id', 
  evaluationController.deleteEvaluation
);

module.exports = router;
