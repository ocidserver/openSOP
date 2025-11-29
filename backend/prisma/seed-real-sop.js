/**
 * Real SOP Data Seed from sop_v3_hybrid.db
 * Total: 311 SOPs + 22 Diagram Alur
 * Extracted: November 13, 2025
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const extractedData = require('./extracted-data.json');

const prisma = new PrismaClient();

// Helper function to parse date strings
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle formats like "25 Juli 2022", "02 Juni 2025"
  const monthMap = {
    'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
    'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
    'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
  };
  
  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    const monthNum = monthMap[month] || '01';
    return new Date(`${year}-${monthNum}-${day.padStart(2, '0')}`);
  }
  
  return new Date(dateStr);
}

// Helper to parse JSON arrays from string
function parseJsonArray(str) {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper to clean text
function cleanText(text) {
  if (!text) return null;
  return text.trim().replace(/\s+/g, ' ');
}

async function main() {
  console.log('🌱 Seeding database with real SOP data...');
  console.log(`📊 Source: ${extractedData.tables.sop.count} SOPs extracted from PDF`);
  console.log('');

  // Create departments first (using existing IPDS)
  console.log('📋 Ensuring departments...');
  const departmentMap = {
    'IPDS': null,
    'SOSIAL': null,
    'PRODUKSI': null,
    'DISTRIBUSI': null,
    'NERWILIS': null
  };

  for (const code of Object.keys(departmentMap)) {
    const dept = await prisma.department.findUnique({ where: { code } });
    if (dept) {
      departmentMap[code] = dept.id;
      console.log(`   ✓ Found: ${code}`);
    }
  }

  // Ensure we have at least one department
  if (!departmentMap.IPDS) {
    console.error('❌ No departments found! Run basic seed first.');
    process.exit(1);
  }

  // Create categories for SOP types
  console.log('\n📂 Creating SOP categories...');
  
  const categoryMapping = {
    'Penatausahaan': { type: 'PROCESS_TYPE', color: '#2196F3', icon: 'mdi-file-document' },
    'Pengadaan': { type: 'PROCESS_TYPE', color: '#4CAF50', icon: 'mdi-cart' },
    'Keuangan': { type: 'PROCESS_TYPE', color: '#FF9800', icon: 'mdi-currency-usd' },
    'Kepegawaian': { type: 'PROCESS_TYPE', color: '#9C27B0', icon: 'mdi-account-group' },
    'Statistik': { type: 'SURVEY_TYPE', color: '#F44336', icon: 'mdi-chart-bar' },
    'Administrasi': { type: 'PROCESS_TYPE', color: '#607D8B', icon: 'mdi-file-cabinet' }
  };

  const categories = {};
  for (const [name, config] of Object.entries(categoryMapping)) {
    const category = await prisma.category.upsert({
      where: { code: `CAT_${name.toUpperCase()}` },
      update: {},
      create: {
        type: config.type,
        code: `CAT_${name.toUpperCase()}`,
        name,
        description: `Kategori SOP ${name}`,
        color: config.color,
        icon: config.icon,
        isActive: true,
        order: Object.keys(categories).length + 1
      }
    });
    categories[name] = category.id;
    console.log(`   ✓ ${name}`);
  }

  // Create admin user if not exists
  console.log('\n👤 Ensuring admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@bps.go.id',
      password: hashedPassword,
      fullName: 'Administrator System',
      nip: '199001012020121001',
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: departmentMap.IPDS,
      phoneNumber: '081234567890'
    }
  });
  console.log(`   ✓ Admin user ready: ${adminUser.email}`);

  // Process SOPs from extracted data
  console.log('\n📄 Processing SOPs...');
  const sops = extractedData.tables.sop.rows;
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const sopData of sops) {
    try {
      // Check if SOP already exists
      const existing = await prisma.sOPDocument.findFirst({
        where: { sopNumber: sopData.nomor_sop }
      });

      if (existing) {
        skipped++;
        if (skipped <= 3) {
          console.log(`   ⊙ Skipped (exists): ${sopData.nomor_sop}`);
        }
        continue;
      }

      // Determine category based on title keywords
      let categoryId = categories['Administrasi']; // default
      const title = sopData.judul.toLowerCase();
      if (title.includes('persediaan') || title.includes('penatausahaan')) {
        categoryId = categories['Penatausahaan'];
      } else if (title.includes('pengadaan')) {
        categoryId = categories['Pengadaan'];
      } else if (title.includes('keuangan')) {
        categoryId = categories['Keuangan'];
      } else if (title.includes('kepegawaian') || title.includes('sdm')) {
        categoryId = categories['Kepegawaian'];
      } else if (title.includes('statistik') || title.includes('survei')) {
        categoryId = categories['Statistik'];
      }

      // Parse dates
      const effectiveDate = parseDate(sopData.tanggal_efektif);
      const reviewDate = effectiveDate ? new Date(effectiveDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null; // +1 year

      // Create SOP
      const sop = await prisma.sOPDocument.create({
        data: {
          sopNumber: sopData.nomor_sop,
          title: cleanText(sopData.judul),
          description: cleanText(sopData.judul),
          purpose: null, // Could be extracted if available
          scope: null,
          status: sopData.is_fully_validated ? 'ACTIVE' : 'DRAFT',
          complexity: 'MODERATE',
          departmentId: departmentMap.IPDS,
          effectiveDate,
          reviewDate,
          tags: [],
          keywords: [],
          references: parseJsonArray(sopData.dasar_hukum),
          versionNumber: 1,
          createdById: adminUser.id,
          updatedById: adminUser.id
        }
      });

      // Create SOP Version
      await prisma.sOPVersion.create({
        data: {
          sopId: sop.id,
          versionNumber: 1,
          majorVersion: 1,
          minorVersion: 0,
          content: JSON.stringify({
            metadata: {
              nama_file: sopData.nama_file,
              pengesahan: sopData.pengesahan,
              extraction_method: sopData.extraction_method,
              format_type: sopData.format_type,
              quality_score: sopData.quality_score
            },
            dasar_hukum: parseJsonArray(sopData.dasar_hukum),
            kualifikasi_pelaksana: sopData.kualifikasi_pelaksana,
            keterkaitan: sopData.keterkaitan,
            peringatan: sopData.peringatan,
            peralatan: sopData.peralatan,
            pencatatan_pendataan: sopData.pencatatan_pendataan
          }),
          changeLog: 'Initial version from PDF extraction',
          changeReason: 'Imported from sop_v3_hybrid.db',
          isPublished: sopData.is_fully_validated === 1,
          publishedAt: sopData.is_fully_validated ? new Date(sopData.validated_at) : null,
          createdById: adminUser.id
        }
      });

      // Link to category
      await prisma.sOPCategory.create({
        data: {
          sopId: sop.id,
          categoryId
        }
      });

      created++;
      if (created <= 5) {
        console.log(`   ✓ Created: ${sopData.nomor_sop} - ${sopData.judul.substring(0, 50)}...`);
      } else if (created % 50 === 0) {
        console.log(`   ... ${created} SOPs created`);
      }

    } catch (error) {
      errors++;
      if (errors <= 3) {
        console.error(`   ✗ Error creating ${sopData.nomor_sop}:`, error.message);
      }
    }
  }

  console.log('');
  console.log('✅ Seeding complete!');
  console.log(`   Created: ${created} SOPs`);
  console.log(`   Skipped: ${skipped} (already exist)`);
  console.log(`   Errors: ${errors}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
