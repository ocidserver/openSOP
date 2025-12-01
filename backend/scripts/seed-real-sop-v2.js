const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Path ke extracted SOP data
const EXTRACTED_DATA_PATH = path.join(__dirname, 'extracted-sop-data-v2.json');

// Baca data SOP yang sudah di-extract
const sopData = JSON.parse(fs.readFileSync(EXTRACTED_DATA_PATH, 'utf8'));

console.log(`Starting to seed ${sopData.length} SOP records...`);

async function seedSOPs() {
  const prisma = new PrismaClient();

  try {
    // Connect to database
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');

    // 1. Create/update categories first
    console.log('\n=== CREATING CATEGORIES ===');
    const categoriesMap = new Map();
    const uniqueCategories = [...new Map(sopData.map(sop => [sop.categoryCode, sop])).values()];

    for (const sop of uniqueCategories) {
      try {
        // Check if category already exists
        let category = await prisma.category.findUnique({
          where: { code: sop.categoryCode }
        });

        if (!category) {
          // Create new category
          category = await prisma.category.create({
            data: {
              code: sop.categoryCode,
              name: sop.categoryName,
              type: sop.categoryType,
              description: `Kategori ${sop.categoryName} untuk SOP yang terkait`,
              color: getCategoryColor(sop.categoryCode),
              icon: getCategoryIcon(sop.categoryCode),
              isActive: true,
              order: 0
            }
          });
          console.log(`  ✓ Created category: ${sop.categoryName} (${sop.categoryCode})`);
        } else {
          console.log(`  ✓ Category already exists: ${sop.categoryName} (${sop.categoryCode})`);
        }

        categoriesMap.set(sop.categoryCode, category.id);
      } catch (error) {
        console.error(`  ✗ Error creating category ${sop.categoryName}:`, error.message);
      }
    }

    // 2. Create/update departments
    console.log('\n=== CREATING DEPARTMENTS ===');
    const departmentsMap = new Map();
    const uniqueDepartments = [...new Map(sopData.map(sop => [sop.departmentId, sop])).values()];

    for (const sop of uniqueDepartments) {
      try {
        // Check if department already exists
        let department = await prisma.department.findUnique({
          where: { code: sop.departmentId }
        });

        if (!department) {
          // Create new department
          department = await prisma.department.create({
            data: {
              code: sop.departmentId,
              name: sop.departmentName,
              description: `Departemen ${sop.departmentName} di lingkungan BPS`,
              isActive: true
            }
          });
          console.log(`  ✓ Created department: ${sop.departmentName} (${sop.departmentId})`);
        } else {
          console.log(`  ✓ Department already exists: ${sop.departmentName} (${sop.departmentId})`);
        }

        departmentsMap.set(sop.departmentId, department.id);
      } catch (error) {
        console.error(`  ✗ Error creating department ${sop.departmentName}:`, error.message);
      }
    }

    // 3. Create/update SOP documents
    console.log('\n=== CREATING SOP DOCUMENTS ===');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sopData.length; i++) {
      const sop = sopData[i];

      try {
        // Check if SOP already exists by SOP number
        const existingSOP = await prisma.sOPDocument.findUnique({
          where: { sopNumber: sop.sopNumber }
        });

        if (existingSOP) {
          console.log(`  ⚠ Skipping duplicate SOP: ${sop.sopNumber} - ${sop.title}`);
          skipCount++;
          continue;
        }

        // Get category and department IDs
        const categoryId = categoriesMap.get(sop.categoryCode);
        const departmentId = departmentsMap.get(sop.departmentId);

        if (!categoryId || !departmentId) {
          console.log(`  ⚠ Skipping SOP ${sop.sopNumber} - missing category or department`);
          skipCount++;
          continue;
        }

        // Create SOP document
        const sopDocument = await prisma.sOPDocument.create({
          data: {
            sopNumber: sop.sopNumber,
            title: sop.title,
            description: sop.description,
            purpose: sop.purpose,
            scope: sop.scope,
            status: sop.status,
            complexity: sop.complexity,
            departmentId: departmentId,
            versionNumber: sop.versionNumber,
            effectiveDate: sop.effectiveDate,
            reviewDate: sop.reviewDate,
            expiryDate: sop.expiryDate,
            tags: sop.tags || [],
            keywords: sop.keywords || [],
            references: sop.references || [],
            involvedActorIds: sop.involvedActorIds || [],
            legalBasis: sop.legalBasis,
            executorQualification: sop.executorQualification,
            equipment: sop.equipment,
            warnings: sop.warnings,
            recordKeeping: sop.recordKeeping,
            viewCount: sop.viewCount || 0,
            downloadCount: sop.downloadCount || 0,

            // Set default createdById - use admin user if exists
            createdById: 'admin-user-id-placeholder', // Will be updated later

            createdAt: sop.originalCreatedDate || new Date(),
            updatedAt: sop.originalUpdatedDate || new Date()
          }
        });

        // Create category association
        await prisma.sOPCategory.create({
          data: {
            sopId: sopDocument.id,
            categoryId: categoryId
          }
        });

        // Create SOP version
        await prisma.sOPVersion.create({
          data: {
            sopId: sopDocument.id,
            versionNumber: sop.versionNumber,
            majorVersion: 1,
            minorVersion: 0,
            content: sop.description || '',
            changeLog: 'Initial version imported from SQLite database',
            changeReason: 'Import SOP from BPS SOP database',
            documentPath: sop.pdfFilePath,
            documentUrl: sop.pdfFilePath ? `/api/sop/${sopDocument.id}/download` : null,
            isPublished: sop.status === 'ACTIVE',
            publishedAt: sop.effectiveDate,
            createdById: 'admin-user-id-placeholder',
            createdAt: sop.originalCreatedDate || new Date()
          }
        });

        // Create attachment if PDF file exists
        if (sop.pdfFilePath && fs.existsSync(path.join(__dirname, '../../', sop.pdfFilePath))) {
          const fileStats = fs.statSync(path.join(__dirname, '../../', sop.pdfFilePath));

          await prisma.attachment.create({
            data: {
              sopId: sopDocument.id,
              type: 'DOCUMENT',
              fileName: sop.pdfFilePath.split('/').pop(),
              originalName: sop.originalFileName || sop.pdfFilePath.split('/').pop(),
              filePath: sop.pdfFilePath,
              fileSize: BigInt(fileStats.size),
              mimeType: 'application/pdf',
              description: `PDF dokumen SOP ${sop.title}`
            }
          });
        }

        console.log(`  ✓ Created SOP: ${sop.sopNumber} - ${sop.title}`);
        successCount++;

      } catch (error) {
        console.error(`  ✗ Error creating SOP ${sop.sopNumber}:`, error.message);
        errorCount++;
      }

      // Progress indicator
      if ((i + 1) % 50 === 0) {
        console.log(`  Progress: ${i + 1}/${sopData.length} SOPs processed`);
      }
    }

    // 4. Update createdById with actual admin user
    console.log('\n=== UPDATING CREATED BY IDs ===');
    try {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (adminUser) {
        await prisma.sOPDocument.updateMany({
          where: { createdById: 'admin-user-id-placeholder' },
          data: { createdById: adminUser.id }
        });

        await prisma.sOPVersion.updateMany({
          where: { createdById: 'admin-user-id-placeholder' },
          data: { createdById: adminUser.id }
        });

        console.log(`  ✓ Updated createdById to use admin user: ${adminUser.email}`);
      } else {
        console.log(`  ⚠ No admin user found - using placeholder createdById`);
      }
    } catch (error) {
      console.error(`  ⚠ Could not update createdById: ${error.message}`);
    }

    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`✅ Successfully created: ${successCount} SOPs`);
    console.log(`⚠ Skipped: ${skipCount} SOPs (duplicates or missing dependencies)`);
    console.log(`❌ Errors: ${errorCount} SOPs`);
    console.log(`📊 Total processed: ${successCount + skipCount + errorCount}/${sopData.length}`);

  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
function getCategoryColor(categoryCode) {
  const colors = {
    'CAT-STAT-001': '#3498db', // Blue for Statistics
    'CAT-PUR-001': '#e74c3c',  // Red for Procurement
    'CAT-ADM-001': '#95a5a6', // Gray for Administration
    'CAT-IT-001': '#9b59b6',   // Purple for IT
    'CAT-ARSIP-001': '#f39c12', // Orange for Archives
    'CAT-KEU-001': '#27ae60',  // Green for Finance
    'CAT-INV-001': '#e67e22',  // Dark Orange for Inventory
    'CAT-MONEV-001': '#8e44ad', // Violet for Monitoring
    'CAT-SDM-001': '#2ecc71',  // Emerald for HR
    'CAT-001': '#95a5a6'      // Default gray
  };
  return colors[categoryCode] || colors['CAT-001'];
}

function getCategoryIcon(categoryCode) {
  const icons = {
    'CAT-STAT-001': 'pi-chart-bar',
    'CAT-PUR-001': 'pi-shopping-cart',
    'CAT-ADM-001': 'pi-file',
    'CAT-IT-001': 'pi-desktop',
    'CAT-ARSIP-001': 'pi-folder',
    'CAT-KEU-001': 'pi-wallet',
    'CAT-INV-001': 'pi-box',
    'CAT-MONEV-001': 'pi-eye',
    'CAT-SDM-001': 'pi-users',
    'CAT-001': 'pi-file'
  };
  return icons[categoryCode] || icons['CAT-001'];
}

// Run the seeding
seedSOPs().catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});