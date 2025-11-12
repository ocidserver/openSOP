const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * GET /api/actors
 * Get all actors with optional filters
 */
exports.getAllActors = async (req, res) => {
  try {
    const {
      search,
      department,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (department) {
      where.departmentId = department;
    }
    
    if (status) {
      where.isActive = status === 'ACTIVE';
    }

    // Count total
    const total = await prisma.actor.count({ where });

    // Get actors
    const actors = await prisma.actor.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
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
      total: await prisma.actor.count(),
      active: await prisma.actor.count({ where: { isActive: true } }),
      inactive: await prisma.actor.count({ where: { isActive: false } })
    };

    // Get department counts
    const departmentCounts = await prisma.actor.groupBy({
      by: ['departmentId'],
      _count: true
    });

    res.json({
      success: true,
      data: {
        actors,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        },
        statistics: {
          ...stats,
          byDepartment: departmentCounts.length
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching actors:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ACTORS_ERROR',
        message: 'Gagal mengambil data aktor',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/actors/:id
 * Get single actor by ID
 */
exports.getActorById = async (req, res) => {
  try {
    const { id } = req.params;

    const actor = await prisma.actor.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTOR_NOT_FOUND',
          message: 'Aktor tidak ditemukan'
        }
      });
    }

    res.json({
      success: true,
      data: { actor }
    });
  } catch (error) {
    logger.error('Error fetching actor:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ACTOR_ERROR',
        message: 'Gagal mengambil data aktor',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/actors
 * Create new actor
 */
exports.createActor = async (req, res) => {
  try {
    const {
      code,
      name,
      position,
      description,
      departmentId,
      email,
      phone,
      isActive = true
    } = req.body;

    // Validate required fields
    if (!code || !name || !departmentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Kode, nama, dan departemen harus diisi'
        }
      });
    }

    // Check if code already exists
    const existing = await prisma.actor.findUnique({
      where: { code }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_CODE',
          message: `Kode aktor ${code} sudah digunakan`
        }
      });
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Departemen tidak ditemukan'
        }
      });
    }

    // Create actor
    const actor = await prisma.actor.create({
      data: {
        code,
        name,
        position,
        description,
        departmentId,
        email,
        phone,
        isActive
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    logger.info(`Actor created: ${actor.code} - ${actor.name}`);

    res.status(201).json({
      success: true,
      data: { actor },
      message: 'Aktor berhasil ditambahkan'
    });
  } catch (error) {
    logger.error('Error creating actor:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ACTOR_ERROR',
        message: 'Gagal menambahkan aktor',
        details: error.message
      }
    });
  }
};

/**
 * PUT /api/actors/:id
 * Update actor
 */
exports.updateActor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      position,
      description,
      departmentId,
      email,
      phone,
      isActive
    } = req.body;

    // Check if actor exists
    const existing = await prisma.actor.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTOR_NOT_FOUND',
          message: 'Aktor tidak ditemukan'
        }
      });
    }

    // If departmentId is being changed, check if new department exists
    if (departmentId && departmentId !== existing.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DEPARTMENT_NOT_FOUND',
            message: 'Departemen tidak ditemukan'
          }
        });
      }
    }

    // Update actor
    const actor = await prisma.actor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(position !== undefined && { position }),
        ...(description !== undefined && { description }),
        ...(departmentId && { departmentId }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    logger.info(`Actor updated: ${actor.code} - ${actor.name}`);

    res.json({
      success: true,
      data: { actor },
      message: 'Aktor berhasil diupdate'
    });
  } catch (error) {
    logger.error('Error updating actor:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ACTOR_ERROR',
        message: 'Gagal mengupdate aktor',
        details: error.message
      }
    });
  }
};

/**
 * DELETE /api/actors/:id
 * Delete actor (with protection check)
 */
exports.deleteActor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if actor exists
    const actor = await prisma.actor.findUnique({
      where: { id }
    });

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTOR_NOT_FOUND',
          message: 'Aktor tidak ditemukan'
        }
      });
    }

    // TODO: Check if actor is used in any SOPs
    // This would require checking SOPDocument content/JSON for actor references
    // For now, we'll allow deletion
    // In production, implement proper checking in SOP content

    // Delete actor
    await prisma.actor.delete({
      where: { id }
    });

    logger.info(`Actor deleted: ${actor.code} - ${actor.name}`);

    res.json({
      success: true,
      message: 'Aktor berhasil dihapus'
    });
  } catch (error) {
    logger.error('Error deleting actor:', error);
    
    // Check if it's a foreign key constraint error
    if (error.code === 'P2003') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ACTOR_IN_USE',
          message: 'Tidak dapat menghapus aktor yang masih digunakan di SOP'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ACTOR_ERROR',
        message: 'Gagal menghapus aktor',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/actors/statistics
 * Get actor statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const stats = {
      total: await prisma.actor.count(),
      active: await prisma.actor.count({ where: { isActive: true } }),
      inactive: await prisma.actor.count({ where: { isActive: false } })
    };

    // Get counts by department
    const byDepartment = await prisma.actor.groupBy({
      by: ['departmentId'],
      _count: true,
      orderBy: {
        _count: {
          departmentId: 'desc'
        }
      }
    });

    // Enhance with department names
    const departmentStats = await Promise.all(
      byDepartment.map(async (item) => {
        const department = await prisma.department.findUnique({
          where: { id: item.departmentId },
          select: { id: true, name: true, code: true }
        });
        return {
          department,
          count: item._count
        };
      })
    );

    res.json({
      success: true,
      data: {
        overall: stats,
        byDepartment: departmentStats
      }
    });
  } catch (error) {
    logger.error('Error fetching actor statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STATISTICS_ERROR',
        message: 'Gagal mengambil statistik aktor',
        details: error.message
      }
    });
  }
};
