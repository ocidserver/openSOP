const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

const prisma = new PrismaClient();

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination and filters)
 * @access  Private (Admin, Manager)
 */
router.get('/', 
  authenticate, 
  authorize('ADMIN', 'MANAGER'),
  validateQuery(schemas.pagination.keys({
    search: Joi.string(),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'REVIEWER', 'USER'),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED'),
    departmentId: Joi.string().uuid()
  })),
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder, search, role, status, departmentId } = req.query;

    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { nip: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy || 'createdAt']: sortOrder },
      include: {
        department: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        nip: true,
        role: true,
        status: true,
        departmentId: true,
        department: true,
        profilePicture: true,
        phoneNumber: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id',
  authenticate,
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin/manager
    if (req.user.id !== id && !['ADMIN', 'MANAGER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this profile'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        nip: true,
        role: true,
        status: true,
        departmentId: true,
        department: true,
        profilePicture: true,
        phoneNumber: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  })
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or Self)
 */
router.put('/:id',
  authenticate,
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  validate(schemas.updateUser),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Users can only update their own profile (except role/status) unless they're admin
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this profile'
      });
    }

    // Non-admins cannot change role or status
    if (req.user.role !== 'ADMIN' && (req.body.role || req.body.status)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change role or status'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: req.body,
      include: {
        department: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        nip: true,
        role: true,
        status: true,
        departmentId: true,
        department: true,
        profilePicture: true,
        phoneNumber: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        userId: req.user.id,
        description: `User ${user.fullName} updated`,
        changes: JSON.stringify(req.body),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  })
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete - set status to INACTIVE)
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Cannot delete self
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'User',
        entityId: id,
        userId: req.user.id,
        description: `User ${user.fullName} deactivated`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  })
);

module.exports = router;
