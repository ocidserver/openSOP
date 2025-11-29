const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');
const sopManualController = require('../controllers/sopManual.controller');

const prisma = new PrismaClient();

/**
 * @route   GET /api/sop
 * @desc    Get all SOPs (with pagination, filters, and search)
 * @access  Public (read-only) or Private for management
 */
router.get('/',
  optionalAuth,
  validateQuery(schemas.pagination.keys({
    search: Joi.string(),
    status: Joi.string().valid('DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'REJECTED', 'REVISION', 'ARCHIVED', 'OBSOLETE'),
    departmentId: Joi.string().uuid(),
    complexity: Joi.string().valid('SIMPLE', 'MODERATE', 'COMPLEX'),
    categoryId: Joi.string().uuid(),
    tags: Joi.string()
  })),
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder, search, status, departmentId, complexity, categoryId, tags } = req.query;

    // Build where clause
    const where = {};
    
    // Non-authenticated users or regular users only see ACTIVE SOPs
    if (!req.user || req.user.role === 'USER') {
      where.status = 'ACTIVE';
    } else if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sopNumber: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (departmentId) where.departmentId = departmentId;
    if (complexity) where.complexity = complexity;
    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }
    if (categoryId) {
      where.categories = {
        some: { categoryId }
      };
    }

    // Get total count
    const total = await prisma.sOPDocument.count({ where });

    // Get SOPs
    const sops = await prisma.sOPDocument.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy || 'createdAt']: sortOrder },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        currentVersion: {
          select: {
            id: true,
            versionNumber: true,
            publishedAt: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            versions: true,
            attachments: true,
            comments: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        sops: sops,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * @route   GET /api/sop/:id
 * @desc    Get SOP by ID (supports Mode Manual/Basic with tabular steps)
 * @access  Public (for approved) / Private (for others)
 */
router.get('/:id',
  optionalAuth,
  sopManualController.getSOPById
);

/**
 * @route   GET /api/sop/:id/legacy
 * @desc    Get SOP by ID (legacy method)
 * @access  Public (for approved) / Private (for others)
 */
router.get('/:id/legacy',
  optionalAuth,
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const sop = await prisma.sOPDocument.findUnique({
      where: { id },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            createdBy: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        attachments: true,
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!sop) {
      return res.status(404).json({
        success: false,
        message: 'SOP not found'
      });
    }

    // Check permissions for non-approved SOPs
    if (sop.status !== 'APPROVED' && (!req.user || req.user.role === 'USER')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this SOP'
      });
    }

    // Increment view count
    await prisma.sOPDocument.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    // Create read receipt if user is authenticated
    if (req.user) {
      await prisma.readReceipt.upsert({
        where: {
          sopId_userId: {
            sopId: id,
            userId: req.user.id
          }
        },
        create: {
          sopId: id,
          userId: req.user.id
        },
        update: {
          readAt: new Date()
        }
      });
    }

    res.json({
      success: true,
      data: sop
    });
  })
);

/**
 * @route   POST /api/sop
 * @desc    Create new SOP with Mode Manual/Basic support
 * @access  Private (Supervisor, Manager, Admin)
 */
router.post('/',
  authenticate,
  authorize('ADMIN', 'SUPERVISOR', 'MANAGER'),
  sopManualController.createSOP
);

/**
 * @route   POST /api/sop/legacy
 * @desc    Create new SOP (legacy method without tabular steps)
 * @access  Private (Manager, Admin)
 */
router.post('/legacy',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(schemas.createSOP),
  asyncHandler(async (req, res) => {
    const { sopNumber, title, description, purpose, scope, complexity, departmentId, effectiveDate, reviewDate, expiryDate, tags, keywords, categoryIds } = req.body;

    // Create SOP with first version
    const sop = await prisma.$transaction(async (tx) => {
      // Create SOP document
      const newSOP = await tx.sOPDocument.create({
        data: {
          sopNumber,
          title,
          description,
          purpose,
          scope,
          status: 'DRAFT',
          complexity,
          departmentId,
          effectiveDate,
          reviewDate,
          expiryDate,
          tags,
          keywords,
          versionNumber: 1,
          createdById: req.user.id
        }
      });

      // Create initial version
      const version = await tx.sOPVersion.create({
        data: {
          sopId: newSOP.id,
          versionNumber: 1,
          majorVersion: 1,
          minorVersion: 0,
          changeLog: 'Initial version',
          changeReason: 'SOP creation',
          isPublished: false,
          createdById: req.user.id
        }
      });

      // Link current version
      await tx.sOPDocument.update({
        where: { id: newSOP.id },
        data: { currentVersionId: version.id }
      });

      // Add categories
      if (categoryIds && categoryIds.length > 0) {
        await tx.sOPCategory.createMany({
          data: categoryIds.map(categoryId => ({
            sopId: newSOP.id,
            categoryId
          }))
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'SOPDocument',
          entityId: newSOP.id,
          sopId: newSOP.id,
          userId: req.user.id,
          description: `Created new SOP: ${title}`,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return newSOP;
    });

    // Fetch complete SOP with relations
    const completeSOP = await prisma.sOPDocument.findUnique({
      where: { id: sop.id },
      include: {
        department: true,
        currentVersion: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'SOP created successfully',
      data: completeSOP
    });
  })
);

/**
 * @route   PUT /api/sop/:id
 * @desc    Update SOP (supports Mode Manual/Basic with tabular steps)
 * @access  Private (Manager, Admin, Supervisor, or Creator)
 */
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'SUPERVISOR', 'MANAGER'),
  sopManualController.updateSOP
);

/**
 * @route   PUT /api/sop/:id/legacy
 * @desc    Update SOP (legacy method without tabular steps)
 * @access  Private (Manager, Admin, or Creator)
 */
router.put('/:id/legacy',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  validate(schemas.updateSOP),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const sop = await prisma.sOPDocument.update({
      where: { id },
      data: {
        ...req.body,
        updatedById: req.user.id
      },
      include: {
        department: true,
        currentVersion: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    // Update categories if provided
    if (req.body.categoryIds) {
      // Delete existing categories
      await prisma.sOPCategory.deleteMany({
        where: { sopId: id }
      });

      // Add new categories
      await prisma.sOPCategory.createMany({
        data: req.body.categoryIds.map(categoryId => ({
          sopId: id,
          categoryId
        }))
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'SOPDocument',
        entityId: id,
        sopId: id,
        userId: req.user.id,
        description: `Updated SOP: ${sop.title}`,
        changes: JSON.stringify(req.body),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'SOP updated successfully',
      data: sop
    });
  })
);

/**
 * @route   DELETE /api/sop/:id
 * @desc    Delete SOP (soft delete - set to ARCHIVED)
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const sop = await prisma.sOPDocument.update({
      where: { id },
      data: { 
        status: 'ARCHIVED',
        updatedById: req.user.id
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'SOPDocument',
        entityId: id,
        sopId: id,
        userId: req.user.id,
        description: `Archived SOP: ${sop.title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'SOP archived successfully'
    });
  })
);

/**
 * @route   POST /api/sop/:id/comment
 * @desc    Add comment to SOP
 * @access  Private
 */
router.post('/:id/comment',
  authenticate,
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  validate(Joi.object({
    content: Joi.string().required(),
    parentId: Joi.string().uuid().optional()
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content, parentId } = req.body;

    const comment = await prisma.comment.create({
      data: {
        sopId: id,
        userId: req.user.id,
        content,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  })
);

module.exports = router;
