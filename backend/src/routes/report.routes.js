const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// Dashboard statistics
router.get('/dashboard',
  authenticate,
  asyncHandler(async (req, res) => {
    const [
      totalSOPs,
      sopsByStatus,
      recentSOPs,
      sopsByDepartment,
      sopsByComplexity,
      totalUsers,
      recentActivities
    ] = await Promise.all([
      // Total SOPs
      prisma.sOPDocument.count(),
      
      // SOPs by status
      prisma.sOPDocument.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // Recent SOPs
      prisma.sOPDocument.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          department: true,
          createdBy: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      }),
      
      // SOPs by department
      prisma.sOPDocument.groupBy({
        by: ['departmentId'],
        _count: true,
        orderBy: {
          _count: {
            departmentId: 'desc'
          }
        },
        take: 10
      }),
      
      // SOPs by complexity
      prisma.sOPDocument.groupBy({
        by: ['complexity'],
        _count: true
      }),
      
      // Total users
      prisma.user.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Recent activities
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true
            }
          },
          sop: {
            select: {
              id: true,
              sopNumber: true,
              title: true
            }
          }
        }
      })
    ]);

    // Get department names
    const departmentIds = sopsByDepartment.map(d => d.departmentId);
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true, code: true }
    });

    const sopsByDepartmentWithNames = sopsByDepartment.map(item => {
      const dept = departments.find(d => d.id === item.departmentId);
      return {
        ...item,
        department: dept
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalSOPs,
          totalUsers,
          approvedSOPs: sopsByStatus.find(s => s.status === 'APPROVED')?._count || 0,
          draftSOPs: sopsByStatus.find(s => s.status === 'DRAFT')?._count || 0
        },
        sopsByStatus,
        sopsByDepartment: sopsByDepartmentWithNames,
        sopsByComplexity,
        recentSOPs,
        recentActivities
      }
    });
  })
);

// SOP inventory report
router.get('/inventory',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const sops = await prisma.sOPDocument.findMany({
      include: {
        department: true,
        currentVersion: true,
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            versions: true
          }
        }
      },
      orderBy: { sopNumber: 'asc' }
    });

    res.json({
      success: true,
      data: sops
    });
  })
);

// Compliance report
router.get('/compliance',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const { departmentId, startDate, endDate } = req.query;

    const where = {
      status: 'APPROVED'
    };
    if (departmentId) where.departmentId = departmentId;

    const sops = await prisma.sOPDocument.findMany({
      where,
      include: {
        department: true,
        readReceipts: {
          where: {
            ...(startDate && { readAt: { gte: new Date(startDate) } }),
            ...(endDate && { readAt: { lte: new Date(endDate) } })
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                department: true
              }
            }
          }
        },
        _count: {
          select: {
            readReceipts: true
          }
        }
      }
    });

    // Calculate compliance rates
    const totalUsers = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        ...(departmentId && { departmentId })
      }
    });

    const complianceData = sops.map(sop => ({
      sop: {
        id: sop.id,
        sopNumber: sop.sopNumber,
        title: sop.title
      },
      department: sop.department,
      totalReads: sop._count.readReceipts,
      totalUsers,
      complianceRate: totalUsers > 0 ? (sop._count.readReceipts / totalUsers * 100).toFixed(2) : 0,
      readReceipts: sop.readReceipts
    }));

    res.json({
      success: true,
      data: complianceData
    });
  })
);

module.exports = router;
