const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * GET /api/monitoring/dashboard
 * Get dashboard KPIs and charts data
 */
exports.getDashboard = async (req, res) => {
  try {
    const {
      periode = '30', // days
      department,
      category,
      status
    } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(periode));

    // Build where clause for filtered queries
    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (department) {
      where.departmentId = department;
    }

    if (status) {
      where.status = status;
    }

    // === KPI CARDS ===
    
    const totalSOPs = await prisma.sopDocument.count({ where });
    
    // Compliance Rate (percentage of ACTIVE SOPs)
    const activeSOPs = await prisma.sopDocument.count({
      where: { ...where, status: 'ACTIVE' }
    });
    const complianceRate = totalSOPs > 0 ? (activeSOPs / totalSOPs * 100).toFixed(1) : 0;
    
    // SOPs need review
    const needReview = await prisma.sopDocument.count({
      where: { ...where, status: 'REVIEW' }
    });
    
    // Average evaluation score
    const avgEvaluation = await prisma.sopEvaluation.aggregate({
      _avg: {
        overallRating: true
      }
    });
    const avgScore = avgEvaluation._avg.overallRating || 0;

    // === TREND CHART (Last 8 months) ===
    
    const trendData = [];
    for (let i = 7; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const count = await prisma.sopDocument.count({
        where: {
          ...where,
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      });
      
      trendData.push({
        month: monthStart.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        count
      });
    }

    // === STATUS DISTRIBUTION (Doughnut Chart) ===
    
    const statusDistribution = await prisma.sopDocument.groupBy({
      by: ['status'],
      _count: true,
      where: department || status ? where : undefined
    });

    const statusData = statusDistribution.map(item => ({
      status: item.status,
      count: item._count
    }));

    // === SOP PER CATEGORY (Bar Chart) ===
    
    const categoryCounts = await prisma.sopCategory.groupBy({
      by: ['categoryId'],
      _count: true
    });

    const categoryData = await Promise.all(
      categoryCounts.slice(0, 6).map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true, code: true }
        });
        return {
          category: category?.name || 'Unknown',
          code: category?.code || '-',
          count: item._count
        };
      })
    );

    // === SOP PER DEPARTMENT (Bar Chart) ===
    
    const departmentCounts = await prisma.sopDocument.groupBy({
      by: ['departmentId'],
      _count: true
    });

    const departmentData = await Promise.all(
      departmentCounts.map(async (item) => {
        const dept = await prisma.department.findUnique({
          where: { id: item.departmentId },
          select: { name: true, code: true }
        });
        return {
          department: dept?.name || 'Unknown',
          code: dept?.code || '-',
          count: item._count
        };
      })
    );

    // === PERFORMANCE TABLE ===
    
    const performanceData = await Promise.all(
      departmentCounts.slice(0, 10).map(async (item) => {
        const dept = await prisma.department.findUnique({
          where: { id: item.departmentId },
          select: { name: true, code: true }
        });
        
        const activeCount = await prisma.sopDocument.count({
          where: {
            departmentId: item.departmentId,
            status: 'ACTIVE'
          }
        });
        
        const avgEval = await prisma.sopEvaluation.aggregate({
          _avg: {
            overallRating: true
          },
          where: {
            sop: {
              departmentId: item.departmentId
            }
          }
        });
        
        const compliance = item._count > 0 ? (activeCount / item._count * 100).toFixed(1) : 0;
        
        return {
          department: dept?.name || 'Unknown',
          totalSOPs: item._count,
          activeSOPs: activeCount,
          compliance: parseFloat(compliance),
          averageRating: avgEval._avg.overallRating || 0
        };
      })
    );

    // === RECENT ACTIVITIES (Timeline) ===
    
    const recentActivities = await prisma.auditLog.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: {
          select: {
            fullName: true
          }
        },
        sop: {
          select: {
            sopNumber: true,
            title: true
          }
        }
      }
    });

    const activities = recentActivities.map(log => ({
      id: log.id,
      action: log.action,
      description: log.description,
      user: log.user.fullName,
      sop: log.sop ? `${log.sop.sopNumber} - ${log.sop.title}` : null,
      timestamp: log.timestamp
    }));

    // === RESPONSE ===
    
    res.json({
      success: true,
      data: {
        kpis: {
          totalSOPs,
          complianceRate: parseFloat(complianceRate),
          needReview,
          averageScore: parseFloat(avgScore.toFixed(2))
        },
        charts: {
          trend: trendData,
          statusDistribution: statusData,
          sopPerCategory: categoryData,
          sopPerDepartment: departmentData
        },
        performance: performanceData,
        activities
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_DASHBOARD_ERROR',
        message: 'Gagal mengambil data dashboard',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/monitoring/performance
 * Get detailed performance metrics
 */
exports.getPerformance = async (req, res) => {
  try {
    const { department, startDate, endDate } = req.query;

    const where = {};
    
    if (department) {
      where.departmentId = department;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Total SOPs
    const total = await prisma.sopDocument.count({ where });
    
    // SOPs by status
    const byStatus = await prisma.sopDocument.groupBy({
      by: ['status'],
      _count: true,
      where
    });

    // Average time to approval (mock calculation)
    // In production, calculate from approval workflow timestamps
    const avgTimeToApproval = 5.2; // days

    // Evaluation metrics
    const evalStats = await prisma.sopEvaluation.aggregate({
      _avg: {
        overallRating: true,
        kelengkapanKonten: true,
        kejelasanProsedur: true,
        kemudahanImplementasi: true,
        relevansi: true,
        efektivitas: true
      },
      _count: true,
      where: department ? {
        sop: {
          departmentId: department
        }
      } : undefined
    });

    // Compliance tracking
    const totalUsers = await prisma.user.count({
      where: department ? { departmentId: department } : undefined
    });

    const readReceipts = await prisma.readReceipt.count({
      where: {
        sop: where
      }
    });

    const complianceRate = total > 0 && totalUsers > 0 
      ? ((readReceipts / (total * totalUsers)) * 100).toFixed(2) 
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalSOPs: total,
          byStatus: byStatus.map(s => ({
            status: s.status,
            count: s._count
          })),
          avgTimeToApproval
        },
        evaluation: {
          totalEvaluations: evalStats._count,
          averageRatings: {
            overall: evalStats._avg.overallRating || 0,
            kelengkapanKonten: evalStats._avg.kelengkapanKonten || 0,
            kejelasanProsedur: evalStats._avg.kejelasanProsedur || 0,
            kemudahanImplementasi: evalStats._avg.kemudahanImplementasi || 0,
            relevansi: evalStats._avg.relevansi || 0,
            efektivitas: evalStats._avg.efektivitas || 0
          }
        },
        compliance: {
          totalUsers,
          totalReadReceipts: readReceipts,
          complianceRate: parseFloat(complianceRate)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PERFORMANCE_ERROR',
        message: 'Gagal mengambil data performa',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/monitoring/compliance
 * Get compliance tracking data
 */
exports.getCompliance = async (req, res) => {
  try {
    const { department, period = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const where = department ? { departmentId: department } : {};

    // Active SOPs
    const activeSOPs = await prisma.sopDocument.findMany({
      where: {
        ...where,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        sopNumber: true,
        title: true,
        effectiveDate: true,
        reviewDate: true
      }
    });

    // Calculate read rates for each SOP
    const complianceData = await Promise.all(
      activeSOPs.map(async (sop) => {
        const totalUsers = await prisma.user.count({ where });
        const readCount = await prisma.readReceipt.count({
          where: {
            sopId: sop.id,
            readAt: {
              gte: startDate
            }
          }
        });
        
        const acknowledgedCount = await prisma.readReceipt.count({
          where: {
            sopId: sop.id,
            acknowledged: true,
            readAt: {
              gte: startDate
            }
          }
        });

        return {
          sop: {
            id: sop.id,
            sopNumber: sop.sopNumber,
            title: sop.title
          },
          metrics: {
            totalUsers,
            readCount,
            acknowledgedCount,
            readRate: totalUsers > 0 ? ((readCount / totalUsers) * 100).toFixed(2) : 0,
            acknowledgeRate: totalUsers > 0 ? ((acknowledgedCount / totalUsers) * 100).toFixed(2) : 0
          },
          status: sop.reviewDate && new Date(sop.reviewDate) < new Date() ? 'NEED_REVIEW' : 'CURRENT'
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalSOPs: activeSOPs.length,
        compliance: complianceData,
        summary: {
          averageReadRate: complianceData.reduce((sum, item) => sum + parseFloat(item.metrics.readRate), 0) / complianceData.length || 0,
          averageAcknowledgeRate: complianceData.reduce((sum, item) => sum + parseFloat(item.metrics.acknowledgeRate), 0) / complianceData.length || 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching compliance data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_COMPLIANCE_ERROR',
        message: 'Gagal mengambil data kepatuhan',
        details: error.message
      }
    });
  }
};
