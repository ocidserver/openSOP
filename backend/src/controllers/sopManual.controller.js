/**
 * SOP Controller - Mode Manual/Basic
 * Handles tabular steps and flowchart data
 * 
 * File: backend/src/controllers/sop.controller.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   POST /api/sop
 * @desc    Create new SOP with tabular steps and flowchart data
 * @access  Private (SUPERVISOR, ADMIN)
 */
const createSOP = async (req, res) => {
  try {
    const {
      title,
      description,
      purpose,
      scope,
      departmentId,
      categoryIds = [],
      involvedActors = [],   // Aktor yang terlibat
      tabularSteps = [],
      flowchartData = null,
      tags = [],
      keywords = [],
      references = [],
      effectiveDate,
      // Field tambahan
      legalBasis,           // Dasar Hukum
      executorQualification, // Kualifikasi Pelaksana
      equipment,            // Peralatan/Perlengkapan
      warnings,             // Peringatan
      recordKeeping,        // Pencatatan dan Pendataan
    } = req.body;

    const userId = req.user.id;

    // ============================================
    // 1. VALIDATION - Tabular Steps
    // ============================================
    
    if (!Array.isArray(tabularSteps) || tabularSteps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tabular steps are required (minimum 1 step)',
      });
    }

    // Validate each step structure
    const stepValidation = validateTabularSteps(tabularSteps);
    if (!stepValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tabular steps',
        errors: stepValidation.errors,
      });
    }

    // ============================================
    // 2. VALIDATION - Flowchart Data (Optional)
    // ============================================
    
    if (flowchartData) {
      const flowchartValidation = validateFlowchartData(flowchartData);
      if (!flowchartValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid flowchart data',
          errors: flowchartValidation.errors,
        });
      }
    }

    // ============================================
    // 3. GENERATE SOP NUMBER
    // ============================================
    
    const sopNumber = await generateSOPNumber(departmentId);

    // ============================================
    // 4. CREATE SOP DOCUMENT (with JSONB fields)
    // ============================================
    
    const sop = await prisma.sOPDocument.create({
      data: {
        sopNumber,
        title,
        description,
        purpose,
        scope,
        status: 'DRAFT',
        departmentId,
        
        // Mode Manual/Basic: Store as JSONB
        tabularSteps: tabularSteps,           // PostgreSQL JSONB
        flowchartData: flowchartData,         // PostgreSQL JSONB
        
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        keywords: Array.isArray(keywords) ? keywords : (keywords ? [keywords] : []),
        references: Array.isArray(references) ? references : (references ? [references] : []),
        involvedActorIds: involvedActors,     // Array of actor IDs
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        
        // Field tambahan
        legalBasis: legalBasis || null,
        executorQualification: executorQualification || null,
        equipment: equipment || null,
        warnings: warnings || null,
        recordKeeping: recordKeeping || null,
        
        createdById: userId,
        updatedById: userId,
        
        // Create categories relationship
        categories: categoryIds.length > 0 ? {
          create: categoryIds.map(categoryId => ({
            categoryId,
          }))
        } : undefined,
      },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        categories: {
          include: {
            category: true,
          }
        }
      }
    });

    // ============================================
    // 5. CREATE INITIAL VERSION (Optional)
    // ============================================
    
    const version = await prisma.sOPVersion.create({
      data: {
        sopId: sop.id,
        versionNumber: 1,
        majorVersion: 1,
        minorVersion: 0,
        
        // Store version-specific data as JSONB
        tabularSteps: tabularSteps,
        flowchartData: flowchartData,
        
        content: JSON.stringify({
          title,
          description,
          purpose,
          scope,
        }),
        
        changeLog: 'Initial version',
        isPublished: false,
        createdById: userId,
      }
    });

    // Link version to SOP
    await prisma.sOPDocument.update({
      where: { id: sop.id },
      data: { currentVersionId: version.id }
    });

    // ============================================
    // 6. AUDIT LOG
    // ============================================
    
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'SOP',
        entityId: sop.id,
        sopId: sop.id,
        userId,
        description: `Created SOP: ${title}`,
        changes: JSON.stringify({
          sopNumber,
          title,
          stepsCount: tabularSteps.length,
          hasFlowchart: !!flowchartData,
        })
      }
    });

    // ============================================
    // 7. RESPONSE
    // ============================================
    
    return res.status(201).json({
      success: true,
      message: 'SOP created successfully',
      data: {
        ...sop,
        currentVersion: version,
      }
    });

  } catch (error) {
    console.error('Error creating SOP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create SOP',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/sop/:id
 * @desc    Update existing SOP
 * @access  Private (SUPERVISOR, ADMIN, Owner)
 */
const updateSOP = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      purpose,
      scope,
      tabularSteps,
      flowchartData,
      tags,
      keywords,
      references,
      changeLog,
      changeReason,
    } = req.body;

    const userId = req.user.id;

    // ============================================
    // 1. CHECK PERMISSION
    // ============================================
    
    const existingSOP = await prisma.sOPDocument.findUnique({
      where: { id },
      include: { currentVersion: true }
    });

    if (!existingSOP) {
      return res.status(404).json({
        success: false,
        message: 'SOP not found',
      });
    }

    // Check if user can edit (owner, supervisor, or admin)
    const canEdit = 
      req.user.role === 'ADMIN' ||
      req.user.role === 'SUPERVISOR' ||
      existingSOP.createdById === userId;

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this SOP',
      });
    }

    // ============================================
    // 2. VALIDATE TABULAR STEPS (if provided)
    // ============================================
    
    if (tabularSteps) {
      const stepValidation = validateTabularSteps(tabularSteps);
      if (!stepValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tabular steps',
          errors: stepValidation.errors,
        });
      }
    }

    // ============================================
    // 3. UPDATE SOP DOCUMENT
    // ============================================
    
    const updateData = {
      updatedById: userId,
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (scope !== undefined) updateData.scope = scope;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    if (keywords) updateData.keywords = Array.isArray(keywords) ? keywords : (keywords ? [keywords] : []);
    if (references) updateData.references = Array.isArray(references) ? references : (references ? [references] : []);
    
    // Update JSONB fields (Mode Manual/Basic)
    if (tabularSteps) updateData.tabularSteps = tabularSteps;
    if (flowchartData !== undefined) updateData.flowchartData = flowchartData;

    const updatedSOP = await prisma.sOPDocument.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        createdBy: {
          select: { id: true, fullName: true, email: true }
        },
        currentVersion: true,
        categories: {
          include: { category: true }
        }
      }
    });

    // ============================================
    // 4. CREATE NEW VERSION (if significant changes)
    // ============================================
    
    const shouldCreateVersion = tabularSteps || flowchartData || changeLog;
    
    if (shouldCreateVersion) {
      const currentVersion = existingSOP.currentVersion;
      const newVersionNumber = currentVersion ? currentVersion.versionNumber + 1 : 1;
      
      const newVersion = await prisma.sOPVersion.create({
        data: {
          sopId: id,
          versionNumber: newVersionNumber,
          majorVersion: currentVersion ? currentVersion.majorVersion : 1,
          minorVersion: currentVersion ? currentVersion.minorVersion + 1 : 0,
          
          // Store updated data as JSONB
          tabularSteps: tabularSteps || existingSOP.tabularSteps,
          flowchartData: flowchartData !== undefined ? flowchartData : existingSOP.flowchartData,
          
          content: JSON.stringify({
            title: title || existingSOP.title,
            description: description !== undefined ? description : existingSOP.description,
            purpose: purpose !== undefined ? purpose : existingSOP.purpose,
            scope: scope !== undefined ? scope : existingSOP.scope,
          }),
          
          changeLog: changeLog || 'Updated via manual mode',
          changeReason: changeReason || undefined,
          isPublished: false,
          createdById: userId,
        }
      });
      
      // Update currentVersionId
      await prisma.sOPDocument.update({
        where: { id },
        data: { currentVersionId: newVersion.id }
      });
    }

    // ============================================
    // 5. AUDIT LOG
    // ============================================
    
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'SOP',
        entityId: id,
        sopId: id,
        userId,
        description: `Updated SOP: ${updatedSOP.title}`,
        changes: JSON.stringify({
          fields: Object.keys(updateData),
          hasNewVersion: shouldCreateVersion,
        })
      }
    });

    // ============================================
    // 6. RESPONSE
    // ============================================
    
    return res.json({
      success: true,
      message: 'SOP updated successfully',
      data: updatedSOP,
    });

  } catch (error) {
    console.error('Error updating SOP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update SOP',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/sop/:id
 * @desc    Get SOP by ID (including tabular steps and flowchart)
 * @access  Public (for ACTIVE SOPs) or Private
 */
const getSOPById = async (req, res) => {
  try {
    const { id } = req.params;

    const sop = await prisma.sOPDocument.findUnique({
      where: { id },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          }
        },
        updatedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 5,
          select: {
            id: true,
            versionNumber: true,
            majorVersion: true,
            minorVersion: true,
            changeLog: true,
            publishedAt: true,
            createdAt: true,
          }
        },
        categories: {
          include: {
            category: true,
          }
        },
        _count: {
          select: {
            comments: true,
            evaluations: true,
          }
        }
      }
    });

    if (!sop) {
      return res.status(404).json({
        success: false,
        message: 'SOP not found',
      });
    }

    // Check access permission
    const isPublic = sop.status === 'ACTIVE';
    const isOwner = req.user && (req.user.id === sop.createdById);
    const isAdmin = req.user && ['ADMIN', 'SUPERVISOR'].includes(req.user.role);

    if (!isPublic && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this SOP',
      });
    }

    // ============================================
    // INCREMENT VIEW COUNT
    // ============================================
    
    await prisma.sOPDocument.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    // ============================================
    // PARSE JSONB FIELDS
    // ============================================
    
    // tabularSteps and flowchartData are already parsed by Prisma
    // Just return as-is

    return res.json({
      success: true,
      data: sop,
    });

  } catch (error) {
    console.error('Error getting SOP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get SOP',
      error: error.message,
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate tabular steps structure
 */
function validateTabularSteps(steps) {
  const errors = [];

  if (!Array.isArray(steps)) {
    return {
      isValid: false,
      errors: ['Tabular steps must be an array']
    };
  }

  steps.forEach((step, index) => {
    if (!step.step_id || typeof step.step_id !== 'number') {
      errors.push(`Step ${index}: step_id is required and must be a number`);
    }
    
    if (!step.activity || typeof step.activity !== 'string' || step.activity.trim() === '') {
      errors.push(`Step ${index}: activity is required`);
    }
    
    if (!step.actor || typeof step.actor !== 'string' || step.actor.trim() === '') {
      errors.push(`Step ${index}: actor is required`);
    }
    
    // Optional fields validation
    if (step.mutu_waktu && typeof step.mutu_waktu !== 'string') {
      errors.push(`Step ${index}: mutu_waktu must be a string`);
    }
    
    if (step.mutu_output && typeof step.mutu_output !== 'string') {
      errors.push(`Step ${index}: mutu_output must be a string`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate flowchart data structure
 */
function validateFlowchartData(flowchart) {
  const errors = [];

  if (!flowchart || typeof flowchart !== 'object') {
    return {
      isValid: false,
      errors: ['Flowchart data must be an object']
    };
  }

  if (!flowchart.version) {
    errors.push('Flowchart version is required');
  }

  if (!Array.isArray(flowchart.nodes)) {
    errors.push('Flowchart nodes must be an array');
  } else {
    flowchart.nodes.forEach((node, index) => {
      if (!node.id || !node.type) {
        errors.push(`Node ${index}: id and type are required`);
      }
      
      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push(`Node ${index}: position with x,y coordinates is required`);
      }
    });
  }

  if (!Array.isArray(flowchart.connections)) {
    errors.push('Flowchart connections must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate SOP number
 */
async function generateSOPNumber(departmentId) {
  const year = new Date().getFullYear();
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { code: true }
  });
  
  const deptCode = department?.code || 'BPS';
  
  // Count existing SOPs for this year
  const count = await prisma.sOPDocument.count({
    where: {
      sopNumber: {
        startsWith: `SOP/${deptCode}/${year}/`
      }
    }
  });
  
  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `SOP/${deptCode}/${year}/${nextNumber}`;
}

module.exports = {
  createSOP,
  updateSOP,
  getSOPById,
  validateTabularSteps,
  validateFlowchartData,
};
