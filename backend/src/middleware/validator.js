const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validation Middleware Factory
 * Creates middleware for validating request data
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown keys from the validated data
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

/**
 * Query Parameter Validation
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Params Validation
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors
      });
    }

    req.params = value;
    next();
  };
};

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

const schemas = {
  // UUID validation
  uuid: Joi.string().uuid({ version: 'uuidv4' }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // User validation
  createUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().required(),
    nip: Joi.string().length(18).optional(),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'REVIEWER', 'USER').default('USER'),
    departmentId: Joi.string().uuid().required(),
    phoneNumber: Joi.string().optional()
  }),

  updateUser: Joi.object({
    fullName: Joi.string(),
    nip: Joi.string().length(18),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'REVIEWER', 'USER'),
    departmentId: Joi.string().uuid(),
    phoneNumber: Joi.string(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED')
  }).min(1),

  // SOP validation
  createSOP: Joi.object({
    sopNumber: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    purpose: Joi.string().allow(''),
    scope: Joi.string().allow(''),
    complexity: Joi.string().valid('SIMPLE', 'MODERATE', 'COMPLEX').default('MODERATE'),
    departmentId: Joi.string().uuid().required(),
    effectiveDate: Joi.date().optional(),
    reviewDate: Joi.date().optional(),
    expiryDate: Joi.date().optional(),
    tags: Joi.array().items(Joi.string()).default([]),
    keywords: Joi.array().items(Joi.string()).default([]),
    categoryIds: Joi.array().items(Joi.string().uuid()).default([])
  }),

  updateSOP: Joi.object({
    title: Joi.string(),
    description: Joi.string().allow(''),
    purpose: Joi.string().allow(''),
    scope: Joi.string().allow(''),
    complexity: Joi.string().valid('SIMPLE', 'MODERATE', 'COMPLEX'),
    status: Joi.string().valid('DRAFT', 'IN_REVIEW', 'IN_APPROVAL', 'APPROVED', 'REJECTED', 'REVISION', 'ARCHIVED', 'OBSOLETE'),
    effectiveDate: Joi.date(),
    reviewDate: Joi.date(),
    expiryDate: Joi.date(),
    tags: Joi.array().items(Joi.string()),
    keywords: Joi.array().items(Joi.string()),
    categoryIds: Joi.array().items(Joi.string().uuid())
  }).min(1),

  // Category validation
  createCategory: Joi.object({
    type: Joi.string().valid('DEPARTMENT', 'PROCESS_TYPE', 'SURVEY_TYPE', 'COMPLEXITY', 'CUSTOM').required(),
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    color: Joi.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    icon: Joi.string().optional(),
    parentId: Joi.string().uuid().optional()
  }),

  // Login validation
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({ 'any.only': 'Passwords do not match' })
  })
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  schemas
};
