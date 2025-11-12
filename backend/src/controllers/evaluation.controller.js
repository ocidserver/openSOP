const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * GET /api/evaluations
 * Get all SOP evaluations with optional filters
 */
exports.getAllEvaluations = async (req, res) => {
  try {
    const {
      search,
      department,
      category,
      minRating,
      page = 1,
      limit = 10,
      sortBy = 'evaluatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const where = {};
    
    if (search) {
      where.sop = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { sopNumber: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    
    if (department) {
      where.sop = {
        ...where.sop,
        departmentId: department
      };
    }
    
    if (minRating) {
      where.overallRating = {
        gte: parseFloat(minRating)
      };
    }

    // Count total
    const total = await prisma.sopEvaluation.count({ where });

    // Get evaluations
    const evaluations = await prisma.sopEvaluation.findMany({
      where,
      include: {
        sop: {
          select: {
            id: true,
            sopNumber: true,
            title: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        evaluator: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Calculate statistics
    const stats = {
      total: await prisma.sopEvaluation.count(),
      averageRating: await prisma.sopEvaluation.aggregate({
        _avg: { overallRating: true }
      }).then(r => r._avg.overallRating || 0),
      highRating: await prisma.sopEvaluation.count({
        where: { overallRating: { gte: 4.0 } }
      }),
      needsImprovement: await prisma.sopEvaluation.count({
        where: { overallRating: { lt: 3.0 } }
      })
    };

    res.json({
      success: true,
      data: {
        evaluations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        },
        statistics: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching evaluations:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_EVALUATIONS_ERROR',
        message: 'Gagal mengambil data penilaian',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/evaluations/:id
 * Get single evaluation by ID
 */
exports.getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await prisma.sopEvaluation.findUnique({
      where: { id },
      include: {
        sop: {
          select: {
            id: true,
            sopNumber: true,
            title: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        evaluator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVALUATION_NOT_FOUND',
          message: 'Penilaian tidak ditemukan'
        }
      });
    }

    res.json({
      success: true,
      data: { evaluation }
    });
  } catch (error) {
    logger.error('Error fetching evaluation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_EVALUATION_ERROR',
        message: 'Gagal mengambil data penilaian',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/evaluations/sop/:sopId
 * Get all evaluations for a specific SOP
 */
exports.getEvaluationsBySOP = async (req, res) => {
  try {
    const { sopId } = req.params;

    // Check if SOP exists
    const sop = await prisma.sopDocument.findUnique({
      where: { id: sopId },
      select: { id: true, title: true, sopNumber: true }
    });

    if (!sop) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SOP_NOT_FOUND',
          message: 'SOP tidak ditemukan'
        }
      });
    }

    const evaluations = await prisma.sopEvaluation.findMany({
      where: { sopId },
      include: {
        evaluator: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        evaluatedAt: 'desc'
      }
    });

    // Calculate average for this SOP
    const average = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length
      : 0;

    res.json({
      success: true,
      data: {
        sop,
        evaluations,
        summary: {
          total: evaluations.length,
          averageRating: average,
          latest: evaluations[0] || null
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching SOP evaluations:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_SOP_EVALUATIONS_ERROR',
        message: 'Gagal mengambil penilaian SOP',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/evaluations
 * Create new evaluation
 */
exports.createEvaluation = async (req, res) => {
  try {
    const {
      sopId,
      kelengkapanKonten,
      kejelasanProsedur,
      kemudahanImplementasi,
      relevansi,
      efektivitas,
      komentar,
      rekomendasi = 'BAIK'
    } = req.body;

    const evaluatorId = req.user.id;

    // Validate required fields
    if (!sopId || !kelengkapanKonten || !kejelasanProsedur || 
        !kemudahanImplementasi || !relevansi || !efektivitas) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Semua kriteria penilaian harus diisi (1-5)'
        }
      });
    }

    // Validate ratings (1-5)
    const ratings = [
      kelengkapanKonten, 
      kejelasanProsedur, 
      kemudahanImplementasi, 
      relevansi, 
      efektivitas
    ];
    
    const invalidRating = ratings.some(r => r < 1 || r > 5);
    if (invalidRating) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
          message: 'Nilai penilaian harus antara 1-5'
        }
      });
    }

    // Check if SOP exists
    const sop = await prisma.sopDocument.findUnique({
      where: { id: sopId }
    });

    if (!sop) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SOP_NOT_FOUND',
          message: 'SOP tidak ditemukan'
        }
      });
    }

    // Calculate overall rating (average)
    const overallRating = (
      kelengkapanKonten + 
      kejelasanProsedur + 
      kemudahanImplementasi + 
      relevansi + 
      efektivitas
    ) / 5;

    // Create evaluation
    const evaluation = await prisma.sopEvaluation.create({
      data: {
        sopId,
        evaluatorId,
        kelengkapanKonten,
        kejelasanProsedur,
        kemudahanImplementasi,
        relevansi,
        efektivitas,
        overallRating,
        komentar,
        rekomendasi
      },
      include: {
        sop: {
          select: {
            id: true,
            sopNumber: true,
            title: true
          }
        },
        evaluator: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    logger.info(`Evaluation created for SOP: ${sop.sopNumber} by ${req.user.fullName}`);

    res.status(201).json({
      success: true,
      data: { evaluation },
      message: 'Penilaian berhasil ditambahkan'
    });
  } catch (error) {
    logger.error('Error creating evaluation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_EVALUATION_ERROR',
        message: 'Gagal menambahkan penilaian',
        details: error.message
      }
    });
  }
};

/**
 * PUT /api/evaluations/:id
 * Update evaluation (can only update own evaluation)
 */
exports.updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      kelengkapanKonten,
      kejelasanProsedur,
      kemudahanImplementasi,
      relevansi,
      efektivitas,
      komentar,
      rekomendasi
    } = req.body;

    // Check if evaluation exists
    const existing = await prisma.sopEvaluation.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVALUATION_NOT_FOUND',
          message: 'Penilaian tidak ditemukan'
        }
      });
    }

    // Check if user owns this evaluation or is admin
    if (existing.evaluatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki akses untuk mengubah penilaian ini'
        }
      });
    }

    // Recalculate overall rating if any criteria changed
    let overallRating = existing.overallRating;
    const updatedRatings = {
      kelengkapanKonten: kelengkapanKonten || existing.kelengkapanKonten,
      kejelasanProsedur: kejelasanProsedur || existing.kejelasanProsedur,
      kemudahanImplementasi: kemudahanImplementasi || existing.kemudahanImplementasi,
      relevansi: relevansi || existing.relevansi,
      efektivitas: efektivitas || existing.efektivitas
    };

    if (kelengkapanKonten || kejelasanProsedur || kemudahanImplementasi || 
        relevansi || efektivitas) {
      overallRating = (
        updatedRatings.kelengkapanKonten +
        updatedRatings.kejelasanProsedur +
        updatedRatings.kemudahanImplementasi +
        updatedRatings.relevansi +
        updatedRatings.efektivitas
      ) / 5;
    }

    // Update evaluation
    const evaluation = await prisma.sopEvaluation.update({
      where: { id },
      data: {
        ...(kelengkapanKonten && { kelengkapanKonten }),
        ...(kejelasanProsedur && { kejelasanProsedur }),
        ...(kemudahanImplementasi && { kemudahanImplementasi }),
        ...(relevansi && { relevansi }),
        ...(efektivitas && { efektivitas }),
        overallRating,
        ...(komentar !== undefined && { komentar }),
        ...(rekomendasi && { rekomendasi })
      },
      include: {
        sop: {
          select: {
            id: true,
            sopNumber: true,
            title: true
          }
        },
        evaluator: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    logger.info(`Evaluation updated: ${id}`);

    res.json({
      success: true,
      data: { evaluation },
      message: 'Penilaian berhasil diupdate'
    });
  } catch (error) {
    logger.error('Error updating evaluation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_EVALUATION_ERROR',
        message: 'Gagal mengupdate penilaian',
        details: error.message
      }
    });
  }
};

/**
 * DELETE /api/evaluations/:id
 * Delete evaluation (admin or owner only)
 */
exports.deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if evaluation exists
    const evaluation = await prisma.sopEvaluation.findUnique({
      where: { id }
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVALUATION_NOT_FOUND',
          message: 'Penilaian tidak ditemukan'
        }
      });
    }

    // Check if user owns this evaluation or is admin
    if (evaluation.evaluatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki akses untuk menghapus penilaian ini'
        }
      });
    }

    // Delete evaluation
    await prisma.sopEvaluation.delete({
      where: { id }
    });

    logger.info(`Evaluation deleted: ${id}`);

    res.json({
      success: true,
      message: 'Penilaian berhasil dihapus'
    });
  } catch (error) {
    logger.error('Error deleting evaluation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_EVALUATION_ERROR',
        message: 'Gagal menghapus penilaian',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/evaluations/statistics
 * Get evaluation statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const total = await prisma.sopEvaluation.count();
    
    const avgResult = await prisma.sopEvaluation.aggregate({
      _avg: {
        overallRating: true,
        kelengkapanKonten: true,
        kejelasanProsedur: true,
        kemudahanImplementasi: true,
        relevansi: true,
        efektivitas: true
      }
    });

    const stats = {
      total,
      averageRating: avgResult._avg.overallRating || 0,
      highRating: await prisma.sopEvaluation.count({
        where: { overallRating: { gte: 4.0 } }
      }),
      needsImprovement: await prisma.sopEvaluation.count({
        where: { overallRating: { lt: 3.0 } }
      }),
      averageCriteria: {
        kelengkapanKonten: avgResult._avg.kelengkapanKonten || 0,
        kejelasanProsedur: avgResult._avg.kejelasanProsedur || 0,
        kemudahanImplementasi: avgResult._avg.kemudahanImplementasi || 0,
        relevansi: avgResult._avg.relevansi || 0,
        efektivitas: avgResult._avg.efektivitas || 0
      }
    };

    // Get recommendation distribution
    const recommendations = await prisma.sopEvaluation.groupBy({
      by: ['rekomendasi'],
      _count: true
    });

    res.json({
      success: true,
      data: {
        overall: stats,
        recommendations
      }
    });
  } catch (error) {
    logger.error('Error fetching evaluation statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STATISTICS_ERROR',
        message: 'Gagal mengambil statistik penilaian',
        details: error.message
      }
    });
  }
};
