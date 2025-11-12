const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// Get audit logs with filters
router.get('/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, action, entityType, userId, sopId, startDate, endDate } = req.query;

    const where = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (sopId) where.sopId = sopId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const total = await prisma.auditLog.count({ where });

    const logs = await prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        sop: {
          select: {
            id: true,
            sopNumber: true,
            title: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

// Get audit log for specific entity
router.get('/entity/:entityType/:entityId',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json({
      success: true,
      data: logs
    });
  })
);

module.exports = router;
