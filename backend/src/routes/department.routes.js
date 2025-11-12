const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// Get all departments
router.get('/', asyncHandler(async (req, res) => {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          users: true,
          sopDocuments: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    data: departments
  });
}));

// Get department by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const department = await prisma.department.findUnique({
    where: { id: req.params.id },
    include: {
      parent: true,
      children: true,
      users: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      },
      sopDocuments: {
        where: { status: 'APPROVED' },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  res.json({
    success: true,
    data: department
  });
}));

// Create department
router.post('/',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const department = await prisma.department.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  })
);

// Update department
router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  })
);

module.exports = router;
