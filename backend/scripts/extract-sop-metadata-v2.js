const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path ke database SQLite
const DB_PATH = path.join(__dirname, '../../sop_v3_hybrid.db');
const OUTPUT_PATH = path.join(__dirname, 'extracted-sop-data.json');

console.log('Extracting SOP data from SQLite database...');
console.log('Database path:', DB_PATH);

// Buat koneksi ke database
const db = new sqlite3.Database(DB_PATH);

// Query untuk mendapatkan semua data SOP
const query = `
  SELECT
    id,
    sop_number,
    title,
    description,
    category,
    department,
    status,
    created_date,
    updated_date,
    effective_date,
    version_number,
    tags,
    keywords,
    purpose,
    scope,
    complexity,
    legal_basis,
    executor_qualification,
    equipment,
    warnings,
    record_keeping,
    involved_actors,
    view_count,
    download_count,
    file_path,
    file_size
  FROM sop
  ORDER BY sop_number
`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error extracting data:', err);
    process.exit(1);
  }

  console.log(`Found ${rows.length} SOP records`);

  // Process data untuk mapping ke field baru
  const processedSOPs = rows.map((sop, index) => {
    // Generate SOP number jika tidak ada
    let sopNumber = sop.sop_number;
    if (!sopNumber) {
      sopNumber = `SOP/BPS/2025/${String(index + 1).padStart(3, '0')}`;
    }

    // Clean and process tags
    let tags = [];
    if (sop.tags) {
      try {
        if (typeof sop.tags === 'string') {
          tags = sop.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else if (Array.isArray(sop.tags)) {
          tags = sop.tags;
        }
      } catch (e) {
        tags = [];
      }
    }

    // Clean keywords
    let keywords = [];
    if (sop.keywords) {
      try {
        if (typeof sop.keywords === 'string') {
          keywords = sop.keywords.split(',').map(kw => kw.trim()).filter(kw => kw);
        } else if (Array.isArray(sop.keywords)) {
          keywords = sop.keywords;
        }
      } catch (e) {
        keywords = [];
      }
    }

    // Determine complexity
    let complexity = 'MODERATE';
    if (sop.complexity) {
      const comp = sop.complexity.toUpperCase();
      if (['SIMPLE', 'MODERATE', 'COMPLEX'].includes(comp)) {
        complexity = comp;
      }
    }

    // Determine status
    let status = 'DRAFT';
    if (sop.status) {
      const st = sop.status.toUpperCase();
      if (['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'REJECTED', 'REVISION', 'ARCHIVED', 'OBSOLETE'].includes(st)) {
        status = st;
      } else if (st === 'APPROVE' || st === 'APPROVED') {
        status = 'ACTIVE';
      }
    }

    // Process involved actors
    let involvedActorIds = [];
    if (sop.involved_actors) {
      try {
        if (typeof sop.involved_actors === 'string') {
          involvedActorIds = sop.involved_actors.split(',').map(id => id.trim()).filter(id => id);
        } else if (Array.isArray(sop.involved_actors)) {
          involvedActorIds = sop.involved_actors;
        }
      } catch (e) {
        involvedActorIds = [];
      }
    }

    // Generate department ID and handle department
    let departmentId = null;
    let departmentName = sop.department || 'IPDS';

    // Map department names to IDs (sesuaikan dengan department di database PostgreSQL)
    const departmentMap = {
      'IPDS': 'dept-001',
      'INTEGRASI PENGOLAHAN DAN DISeminasi DATA (IPDS)': 'dept-001',
      'STATISTIK PRODUK DOMESTIK': 'dept-002',
      'STATISTIK DISTRIBUSI': 'dept-003',
      'STATISTIK KEMAHALAN KONSTRUKSI': 'dept-004',
      'STATISTIK HARGA': 'dept-005',
      'STATISTIK PERDAGANGAN BESAR': 'dept-006',
      'STATISTIK PERGUDANGAN': 'dept-007',
      'STATISTIK PERDAGANGAN ECERAN': 'dept-008',
      'STATISTIK USAHA NONPERTANIAN': 'dept-009',
      'STATISTIK USAHA JASA': 'dept-010',
      'STATISTIK USAHA PARIWISATA': 'dept-011',
      'STATISTIK PENGADAAN BARANG/JASA': 'dept-012',
      'STATISTIK PERTANIAN': 'dept-013',
      'STATISTIK KEHUTANAN': 'dept-014',
      'STATISTIK PETERNAKAN': 'dept-015',
      'STATISTIK PERIKANAN': 'dept-016',
      'STATISTIK INDUSTRI MANUFAKTUR': 'dept-017',
      'STATISTIK PERTAMBANGAN': 'dept-018',
      'STATISTIK KONSTRUKSI': 'dept-019',
      'STATISTIK AIR BERSIH': 'dept-020',
      'STATISTIK ENERGI': 'dept-021'
    };

    for (const [name, id] of Object.entries(departmentMap)) {
      if (departmentName.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(departmentName.toLowerCase())) {
        departmentId = id;
        departmentName = name;
        break;
      }
    }

    // Generate category based on title and description
    let categoryType = 'DEPARTMENT';
    let categoryName = 'Umum';
    let categoryCode = 'CAT-001';

    if (sop.title || sop.description) {
      const text = `${sop.title || ''} ${sop.description || ''}`.toLowerCase();

      if (text.includes('statistik') || text.includes('survey')) {
        categoryType = 'PROCESS_TYPE';
        categoryName = 'Statistik & Survei';
        categoryCode = 'CAT-STAT-001';
      } else if (text.includes('pengadaan') || text.includes('procurement')) {
        categoryType = 'PROCESS_TYPE';
        categoryName = 'Pengadaan';
        categoryCode = 'CAT-PUR-001';
      } else if (text.includes('administrasi') || text.includes('surat')) {
        categoryType = 'PROCESS_TYPE';
        categoryName = 'Administrasi';
        categoryCode = 'CAT-ADM-001';
      } else if (text.includes('it') || text.includes('komputer') || text.includes('sistem')) {
        categoryType = 'PROCESS_TYPE';
        categoryName = 'Teknologi Informasi';
        categoryCode = 'CAT-IT-001';
      } else if (text.includes('arsip') || text.includes('kearsipan')) {
        categoryType = 'PROCESS_TYPE';
        categoryName = 'Kearsipan';
        categoryCode = 'CAT-ARSIP-001';
      } else if (text.includes('keuangan') || text.includes('anggaran') || text.includes('pembayaran')) {
        categoryType = 'PROCESS_TYPE';
        categoryName = 'Keuangan';
        categoryCode = 'CAT-KEU-001';
      } else if (text.includes('sdm') || text.includes('pegawai') || text.includes('competency')) {
        categoryType = 'PROCESS_TYPE';
        categoryName = 'SDM';
        categoryCode = 'CAT-SDM-001';
      } else if (text.includes('monitoring') || text.includes('evaluasi')) {
        categoryType = 'PROCESS_TYPE';
        categoryName = 'Monitoring & Evaluasi';
        categoryCode = 'CAT-MONEV-001';
      }
    }

    // Get PDF file path if exists
    let pdfFilePath = null;
    const pdfFileName = `${String(index + 1).padStart(3, '0')}. SOP ${sop.title.replace(/[^a-zA-Z0-9\s]/g, '')}. signed.pdf`;
    const pdfPath = path.join(__dirname, '../../pdf-sop', pdfFileName);

    if (fs.existsSync(pdfPath)) {
      pdfFilePath = `pdf-sop/${pdfFileName}`;
    }

    return {
      // Basic SOP Info
      sopNumber: sopNumber,
      title: sop.title || `SOP ${sopNumber}`,
      description: sop.description || null,
      purpose: sop.purpose || null,
      scope: sop.scope || null,
      status: status,
      complexity: complexity,

      // Organization
      departmentId: departmentId,
      departmentName: departmentName,

      // Version Control
      versionNumber: sop.version_number || 1,

      // Dates
      effectiveDate: sop.effective_date ? new Date(sop.effective_date) : null,
      reviewDate: null, // Will be calculated based on effective date
      expiryDate: null, // Will be calculated based on effective date

      // Metadata
      tags: tags,
      keywords: keywords,
      references: [], // Will be populated later if needed
      involvedActorIds: involvedActorIds,

      // Additional Information
      legalBasis: sop.legal_basis || null,
      executorQualification: sop.executor_qualification || null,
      equipment: sop.equipment || null,
      warnings: sop.warnings || null,
      recordKeeping: sop.record_keeping || null,

      // File Path
      pdfFilePath: pdfFilePath,

      // Tracking
      viewCount: sop.view_count || 0,
      downloadCount: sop.download_count || 0,

      // Metadata for seeding
      originalId: sop.id,
      originalCategory: sop.category,
      originalCreatedDate: sop.created_date,
      originalUpdatedDate: sop.updated_date,

      // Category mapping
      categoryType: categoryType,
      categoryName: categoryName,
      categoryCode: categoryCode
    };
  });

  // Save extracted data
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedSOPs, null, 2), 'utf8');

  console.log(`Successfully extracted ${processedSOPs.length} SOP records`);
  console.log(`Data saved to: ${OUTPUT_PATH}`);

  // Create summary statistics
  const summary = {
    totalSOPs: processedSOPs.length,
    statusCounts: {},
    complexityCounts: {},
    categoryCounts: {},
    departmentCounts: {}
  };

  processedSOPs.forEach(sop => {
    // Count by status
    summary.statusCounts[sop.status] = (summary.statusCounts[sop.status] || 0) + 1;

    // Count by complexity
    summary.complexityCounts[sop.complexity] = (summary.complexityCounts[sop.complexity] || 0) + 1;

    // Count by category
    summary.categoryCounts[sop.categoryName] = (summary.categoryCounts[sop.categoryName] || 0) + 1;

    // Count by department
    summary.departmentCounts[sop.departmentName] = (summary.departmentCounts[sop.departmentName] || 0) + 1;
  });

  console.log('\n=== SOP DATA SUMMARY ===');
  console.log(`Total SOPs: ${summary.totalSOPs}`);
  console.log('\nStatus Distribution:');
  Object.entries(summary.statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  console.log('\nComplexity Distribution:');
  Object.entries(summary.complexityCounts).forEach(([complexity, count]) => {
    console.log(`  ${complexity}: ${count}`);
  });

  console.log('\nCategory Distribution:');
  Object.entries(summary.categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });

  // Save summary
  const summaryPath = path.join(__dirname, 'sop-extraction-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\nSummary saved to: ${summaryPath}`);

  db.close();
});