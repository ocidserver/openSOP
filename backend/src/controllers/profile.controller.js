const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * GET /api/profile
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        nip: true,
        role: true,
        status: true,
        profilePicture: true,
        phoneNumber: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Pengguna tidak ditemukan'
        }
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROFILE_ERROR',
        message: 'Gagal mengambil data profil',
        details: error.message
      }
    });
  }
};

/**
 * PUT /api/profile
 * Update current user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      email,
      phoneNumber,
      nip
    } = req.body;

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Pengguna tidak ditemukan'
        }
      });
    }

    // If email is being changed, check if new email already exists
    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email sudah digunakan pengguna lain'
          }
        });
      }
    }

    // If NIP is being changed, check if new NIP already exists
    if (nip && nip !== existing.nip) {
      const nipExists = await prisma.user.findUnique({
        where: { nip }
      });

      if (nipExists) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'NIP_EXISTS',
            message: 'NIP sudah digunakan pengguna lain'
          }
        });
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(nip !== undefined && { nip })
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        nip: true,
        role: true,
        profilePicture: true,
        phoneNumber: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    logger.info(`Profile updated for user: ${user.username}`);

    res.json({
      success: true,
      data: { user },
      message: 'Profil berhasil diupdate'
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROFILE_ERROR',
        message: 'Gagal mengupdate profil',
        details: error.message
      }
    });
  }
};

/**
 * PUT /api/profile/password
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Semua field password harus diisi'
        }
      });
    }

    // Validate new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'Password baru dan konfirmasi tidak cocok'
        }
      });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_TOO_SHORT',
          message: 'Password baru minimal 8 karakter'
        }
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Pengguna tidak ditemukan'
        }
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password lama tidak sesuai'
        }
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    logger.info(`Password changed for user: ${user.username}`);

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHANGE_PASSWORD_ERROR',
        message: 'Gagal mengubah password',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/profile/photo
 * Upload profile photo
 */
exports.uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'Tidak ada file yang diupload'
        }
      });
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan'
        }
      });
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Ukuran file maksimal 5MB'
        }
      });
    }

    // Build file path
    const filePath = `/uploads/profiles/${req.file.filename}`;

    // Update user profile picture
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: filePath
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePicture: true
      }
    });

    logger.info(`Profile photo uploaded for user: ${user.username}`);

    res.json({
      success: true,
      data: {
        user,
        filePath
      },
      message: 'Foto profil berhasil diupload'
    });
  } catch (error) {
    logger.error('Error uploading profile photo:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_PHOTO_ERROR',
        message: 'Gagal mengupload foto profil',
        details: error.message
      }
    });
  }
};

/**
 * DELETE /api/profile/photo
 * Delete profile photo
 */
exports.deletePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user profile picture to null
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: null
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePicture: true
      }
    });

    logger.info(`Profile photo deleted for user: ${user.username}`);

    res.json({
      success: true,
      data: { user },
      message: 'Foto profil berhasil dihapus'
    });
  } catch (error) {
    logger.error('Error deleting profile photo:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_PHOTO_ERROR',
        message: 'Gagal menghapus foto profil',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/profile/activity
 * Get user activity history
 */
exports.getActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const activities = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: {
        timestamp: 'desc'
      },
      take: parseInt(limit),
      include: {
        sop: {
          select: {
            sopNumber: true,
            title: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        activities: activities.map(log => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          description: log.description,
          sop: log.sop,
          timestamp: log.timestamp
        }))
      }
    });
  } catch (error) {
    logger.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ACTIVITY_ERROR',
        message: 'Gagal mengambil riwayat aktivitas',
        details: error.message
      }
    });
  }
};
