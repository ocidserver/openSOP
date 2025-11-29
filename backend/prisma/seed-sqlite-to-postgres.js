// Seed all SOPs from sop_v3_hybrid.db (SQLite) to PostgreSQL via Prisma
const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const prisma = new PrismaClient();
const SQLITE_PATH = path.join(__dirname, '../../sop_v3_hybrid.db');

async function main() {
  console.log('🔄 Migrating SOPs from SQLite to PostgreSQL...');
  const db = new sqlite3.Database(SQLITE_PATH);

  // Get all SOP records
  const sopRows = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM sop', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  console.log(`Found ${sopRows.length} SOP records.`);


  // Get or create default department
  let firstDept = await prisma.department.findFirst();
  if (!firstDept) {
    firstDept = await prisma.department.create({
      data: {
        code: 'DEFAULT',
        name: 'Default Department',
        description: 'Automatically created for SOP import',
        isActive: true
      }
    });
    console.log('Created default department.');
  }

  // Get admin user for createdById
  const adminUser = await prisma.user.findFirst({ where: { username: 'admin' } });

  // Map and insert each SOP
  function parseValidDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  for (const sop of sopRows) {
    await prisma.sOPDocument.upsert({
      where: { sopNumber: sop.nomor_sop || '' },
      update: {
        title: sop.judul || '',
        description: sop.judul_tabel || '',
        purpose: sop.pencatatan_pendataan || '',
        scope: sop.keterkaitan || '',
        status: 'ACTIVE',
        complexity: 'MODERATE',
        departmentId: firstDept.id,
        effectiveDate: parseValidDate(sop.tanggal_efektif),
        reviewDate: parseValidDate(sop.tanggal_revisi),
        tags: [],
        keywords: [],
        versionNumber: 1,
        legalBasis: sop.dasar_hukum || '',
        executorQualification: sop.kualifikasi_pelaksana || '',
        equipment: sop.peralatan || '',
        warnings: sop.peringatan || '',
        recordKeeping: sop.pencatatan_pendataan || '',
        createdById: adminUser ? adminUser.id : undefined,
      },
      create: {
        sopNumber: sop.nomor_sop || '',
        title: sop.judul || '',
        description: sop.judul_tabel || '',
        purpose: sop.pencatatan_pendataan || '',
        scope: sop.keterkaitan || '',
        status: 'ACTIVE',
        complexity: 'MODERATE',
        departmentId: firstDept.id,
        effectiveDate: parseValidDate(sop.tanggal_efektif),
        reviewDate: parseValidDate(sop.tanggal_revisi),
        tags: [],
        keywords: [],
        versionNumber: 1,
        legalBasis: sop.dasar_hukum || '',
        executorQualification: sop.kualifikasi_pelaksana || '',
        equipment: sop.peralatan || '',
        warnings: sop.peringatan || '',
        recordKeeping: sop.pencatatan_pendataan || '',
        createdById: adminUser ? adminUser.id : undefined,
      }
    });
  }

  db.close();
  console.log('✅ Migration completed. All SOPs inserted.');
}

main()
  .catch((e) => {
    console.error('❌ Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
