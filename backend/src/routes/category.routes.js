const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateParams, schemas } = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

const prisma = new PrismaClient();

// Get all categories
router.get('/', asyncHandler(async (req, res) => {
  const { type } = req.query;
  
  const where = { isActive: true };
  if (type) where.type = type;

  const categories = await prisma.category.findMany({
    where,
    orderBy: [
      { type: 'asc' },
      { order: 'asc' }
    ],
    include: {
      parent: true,
      children: true,
      _count: {
        select: { sopCategories: true }
      }
    }
  });

  res.json({
    success: true,
    data: categories
  });
}));

// Get category by ID
router.get('/:id', 
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        parent: true,
        children: true,
        sopCategories: {
          include: {
            sop: {
              select: {
                id: true,
                sopNumber: true,
                title: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  })
);

// Create category
router.post('/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(schemas.createCategory),
  asyncHandler(async (req, res) => {
    const category = await prisma.category.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  })
);

// Update category
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  })
);

// Delete category
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    await prisma.category.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  })
);

module.exports = router;
