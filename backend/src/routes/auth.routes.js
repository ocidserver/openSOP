const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validate, schemas } = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public (or Admin only in production)
 */
router.post('/register', validate(schemas.createUser), asyncHandler(async (req, res) => {
  const { username, email, password, fullName, nip, role, departmentId, phoneNumber } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
        ...(nip ? [{ nip }] : [])
      ]
    }
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email, username, or NIP already exists'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      fullName,
      nip,
      role: role || 'USER',
      departmentId,
      phoneNumber,
      status: 'ACTIVE'
    },
    include: {
      department: true
    }
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
      description: `User ${user.fullName} registered`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: userWithoutPassword
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      department: true
    }
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message: 'Your account is not active. Please contact administrator.'
    });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: 'READ',
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
      description: `User ${user.fullName} logged in`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token
    }
  });
}));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const { authenticate } = require('../middleware/auth');

router.post('/change-password', 
  authenticate, 
  validate(schemas.changePassword), 
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        description: 'Password changed',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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
    data: user
  });
}));

module.exports = router;
