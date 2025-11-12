const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actor.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/actors/statistics
 * @desc    Get actor statistics
 * @access  Private (ADMIN, SUPERVISOR)
 */
router.get('/statistics', 
  authorize(['ADMIN', 'SUPERVISOR']), 
  actorController.getStatistics
);

/**
 * @route   GET /api/actors
 * @desc    Get all actors with optional filters
 * @access  Private (All authenticated users can view)
 * @query   search, department, status, page, limit, sortBy, sortOrder
 */
router.get('/', 
  actorController.getAllActors
);

/**
 * @route   GET /api/actors/:id
 * @desc    Get single actor by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', 
  actorController.getActorById
);

/**
 * @route   POST /api/actors
 * @desc    Create new actor
 * @access  Private (ADMIN, SUPERVISOR only)
 * @body    code, name, position, description, departmentId, email, phone, isActive
 */
router.post('/', 
  authorize(['ADMIN', 'SUPERVISOR']), 
  actorController.createActor
);

/**
 * @route   PUT /api/actors/:id
 * @desc    Update actor
 * @access  Private (ADMIN, SUPERVISOR only)
 * @body    name, position, description, departmentId, email, phone, isActive
 */
router.put('/:id', 
  authorize(['ADMIN', 'SUPERVISOR']), 
  actorController.updateActor
);

/**
 * @route   DELETE /api/actors/:id
 * @desc    Delete actor
 * @access  Private (ADMIN, SUPERVISOR only)
 */
router.delete('/:id', 
  authorize(['ADMIN', 'SUPERVISOR']), 
  actorController.deleteActor
);

module.exports = router;
